import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ─── Physics ─────────────────────────────────────────────────────────────────
const DT = 0.001; // 1ms sim step
const NOMINAL_V = 12;

function clampVoltage(v) { return Math.max(-NOMINAL_V, Math.min(NOMINAL_V, v)); }
function clampCurrent(c, stallCurrent) { return Math.max(-stallCurrent, Math.min(stallCurrent, c)); }

function motorConstants(motor) {
    const freeSpeedRadS = (motor.freeSpeed * 2 * Math.PI) / 60;
    const Kt = motor.stallTorque / motor.stallCurrent;
    const R = NOMINAL_V / motor.stallCurrent;
    const Kv = freeSpeedRadS / (NOMINAL_V - motor.freeCurrent * R);
    return { Kt, R, Kv, freeSpeedRadS };
}

// ─── Trapezoid Profile Generator (with optional jerk limiting / S-curve) ─────
function generateTrapezoidProfile(distanceRad, maxVelRadS, maxAccelRadSS, maxJerkRadSSSS, durationS) {
    const steps = Math.ceil(durationS / DT);
    const sign = distanceRad >= 0 ? 1 : -1;
    const dist = Math.abs(distanceRad);

    if (dist < 0.0001) {
        const profile = [];
        for (let i = 0; i <= steps; i++) profile.push({ t: i * DT, position: 0, velocity: 0, acceleration: 0 });
        return profile;
    }

    const useJerk = maxJerkRadSSSS > 0;

    if (useJerk) {
        // S-curve profile: numerically integrate with jerk-limited acceleration
        const profile = [];
        let pos = 0, vel = 0, accel = 0;
        const targetVel = maxVelRadS;
        const ma = maxAccelRadSS;
        const mj = maxJerkRadSSSS;
        let phase = "accel"; // accel, cruise, decel, done

        for (let i = 0; i <= steps; i++) {
            const t = i * DT;
            const remaining = dist - pos;

            // Estimate stopping distance: current vel decelerating with jerk-limited profile
            const decelDist = vel > 0 ? (vel * vel) / (2 * ma) + vel * (ma / mj) * 0.5 : 0;

            if (phase === "accel") {
                if (remaining <= decelDist + 0.001 && vel > 0) {
                    phase = "decel";
                } else if (vel >= targetVel - 0.001) {
                    phase = "cruise";
                    accel = 0;
                } else {
                    // Ramp accel up with jerk, cap at maxAccel
                    const accelStopV = accel > 0 ? (accel * accel) / (2 * mj) : 0;
                    const remainV = targetVel - vel;
                    if (remainV <= accelStopV + 0.001) {
                        accel = Math.max(0, accel - mj * DT);
                    } else {
                        accel = Math.min(ma, accel + mj * DT);
                    }
                }
            }

            if (phase === "cruise") {
                accel = 0;
                if (remaining <= decelDist + 0.001) phase = "decel";
            }

            if (phase === "decel") {
                // Ramp accel negative to decelerate
                accel = Math.max(-ma, accel - mj * DT);
                if (vel <= 0.001 && remaining < 0.001) {
                    phase = "done";
                    vel = 0; accel = 0;
                }
            }

            if (phase === "done") { vel = 0; accel = 0; pos = dist; }

            profile.push({ t, position: sign * Math.min(pos, dist), velocity: sign * vel, acceleration: sign * accel });

            if (phase !== "done") {
                vel += accel * DT;
                if (vel < 0) vel = 0;
                if (vel > targetVel) vel = targetVel;
                pos += vel * DT;
                if (pos > dist) pos = dist;
            }
        }
        return profile;
    }

    // Pure trapezoidal (infinite jerk)
    const mv = maxVelRadS;
    const ma = maxAccelRadSS;
    const tAccel = mv / ma;
    const dAccel = 0.5 * ma * tAccel * tAccel;

    let tCruise, tTotal;
    if (2 * dAccel >= dist) {
        const tPeak = Math.sqrt(dist / ma);
        tCruise = 0;
        tTotal = 2 * tPeak;
    } else {
        const dCruise = dist - 2 * dAccel;
        tCruise = dCruise / mv;
        tTotal = 2 * tAccel + tCruise;
    }

    const tPeakActual = 2 * dAccel >= dist ? Math.sqrt(dist / ma) : tAccel;
    const peakVel = 2 * dAccel >= dist ? ma * tPeakActual : mv;
    const t1 = tPeakActual;
    const t2 = t1 + tCruise;
    const t3 = tTotal;

    const profile = [];
    for (let i = 0; i <= steps; i++) {
        const t = i * DT;
        let pos, vel, accel;

        if (t <= 0) { pos = 0; vel = 0; accel = 0; }
        else if (t >= t3) { pos = dist; vel = 0; accel = 0; }
        else if (t <= t1) { accel = ma; vel = ma * t; pos = 0.5 * ma * t * t; }
        else if (t <= t2) { accel = 0; vel = peakVel; pos = 0.5 * ma * t1 * t1 + peakVel * (t - t1); }
        else { const td = t - t2; accel = -ma; vel = peakVel - ma * td; pos = 0.5 * ma * t1 * t1 + peakVel * tCruise + peakVel * td - 0.5 * ma * td * td; }

        profile.push({ t, position: sign * pos, velocity: sign * vel, acceleration: sign * accel });
    }
    return profile;
}

// ─── Exponential Profile Generator ──────────────────────────────────────────
// Models a system with back-EMF: V = kS·sgn + kV·v + kA·a
// The solution is an exponential approach with time constant τ = kA/kV
// and max velocity Vmax = (Vnom - kS) / kV
function generateExponentialProfile(distanceRad, profileKv, profileKa, maxInput, durationS) {
    const steps = Math.ceil(durationS / DT);
    const sign = distanceRad >= 0 ? 1 : -1;
    const dist = Math.abs(distanceRad);

    if (profileKv <= 0 || profileKa <= 0) {
        // Degenerate: return straight line (no profile)
        const profile = [];
        for (let i = 0; i <= steps; i++) {
            const t = i * DT;
            profile.push({ t, position: sign * Math.min(dist, dist * t / Math.max(durationS, 0.001)), velocity: 0, acceleration: 0 });
        }
        return profile;
    }

    const tau = profileKa / profileKv; // time constant
    const vMax = (maxInput) / profileKv; // max achievable velocity (with kS already subtracted from maxInput)

    // Exponential profile has two phases:
    // Phase 1 (accel): v(t) = vMax * (1 - e^(-t/τ)), until we need to start decelerating
    // Phase 2 (decel): mirror of phase 1

    // We need to find the switch time where we start decelerating
    // We use numerical integration since the analytic solution for switch time is transcendental

    // Forward pass: accelerate exponentially, track when remaining distance requires decel
    const profile = [];
    let pos = 0, vel = 0;
    let phase = "accel";

    for (let i = 0; i <= steps; i++) {
        const t = i * DT;
        let accel;

        if (pos >= dist - 0.0001 && Math.abs(vel) < 0.01) {
            // Settled
            profile.push({ t, position: sign * dist, velocity: 0, acceleration: 0 });
            continue;
        }

        const remaining = dist - pos;

        if (phase === "accel") {
            // Exponential approach to vMax
            accel = (vMax - vel) / tau;
            // Check if we need to switch to decel
            // Estimate decel distance: vel * τ
            const decelDist = vel * tau;
            if (remaining <= decelDist && vel > 0.1) {
                phase = "decel";
            }
        }

        if (phase === "decel") {
            // Exponential decay toward zero velocity
            accel = -vel / tau;
            if (vel < 0.01) { vel = 0; accel = 0; }
        }

        profile.push({
            t,
            position: sign * pos,
            velocity: sign * vel,
            acceleration: sign * accel,
        });

        vel += accel * DT;
        if (vel < 0) vel = 0;
        pos += vel * DT;
        if (pos > dist) pos = dist;
    }

    return profile;
}

// ─── Simulation ─────────────────────────────────────────────────────────────
function simulateTurret({
                            motor, numMotors, gearing, moi, ks, kv, ka, kp, kd,
                            setpointDeg, controlMode, durationS = 5, gravityTorque = 0,
                            enableWrap = false, softLimitLow = -180, softLimitHigh = 180,
                            profileMode = "none", maxVelDegS = 360, maxAccelDegSS = 720,
                            maxJerkDegSSS = 0,
                            profileKv = 0, profileKa = 0, ksSignSource = "error",
                            plantMode = "physical", plantKs = 0, plantKv = 0, plantKa = 0,
                            viscousFriction = 0
                        }) {
    const mc = motorConstants(motor);
    const setpointRad = (setpointDeg * Math.PI) / 180;

    // Plant model: either from physics or from feedforward constants
    let effectiveMOI, totalKt, effectiveR, effectiveKv;

    if (plantMode === "physical") {
        effectiveMOI = moi;
        totalKt = mc.Kt * numMotors * gearing;
        effectiveR = mc.R / numMotors;
        effectiveKv = mc.Kv;
    } else {
        // Feedforward constants mode: derive equivalent physical params
        // kA/kV ≈ J (effective MOI in the controller's frame)
        effectiveMOI = plantKv > 0 ? plantKa / plantKv : moi;
        totalKt = mc.Kt * numMotors * gearing;
        effectiveR = mc.R / numMotors;
        effectiveKv = mc.Kv;
    }

    // Static friction torque derived from plantKs
    // Voltage mode: kS [V] → I = kS/R → τ = Kt·N·G·(kS/R)
    // Current mode: kS [A] → τ = Kt·N·G·kS/N = Kt·G·kS
    const staticFrictionTorque = controlMode === "voltage"
        ? (plantKs * totalKt) / (effectiveR * numMotors)
        : plantKs * totalKt / numMotors;

    const steps = Math.ceil(durationS / DT);
    const record = Math.max(1, Math.floor(steps / 2000));
    const history = [];

    // Generate motion profile if needed
    let profile = null;
    if (profileMode === "trapezoid") {
        const maxVelRadS = (maxVelDegS * Math.PI) / 180;
        const maxAccelRadSS = (maxAccelDegSS * Math.PI) / 180;
        const maxJerkRadSSS = (maxJerkDegSSS * Math.PI) / 180;
        profile = generateTrapezoidProfile(setpointRad, maxVelRadS, maxAccelRadSS, maxJerkRadSSS, durationS);
    } else if (profileMode === "exponential") {
        const maxInput = controlMode === "voltage" ? NOMINAL_V : motor.stallCurrent * numMotors;
        const effMaxInput = Math.max(0.01, maxInput - Math.abs(ks)); // subtract kS from available input
        profile = generateExponentialProfile(setpointRad, profileKv, profileKa, effMaxInput, durationS);
    }

    let theta = 0;
    let omega = 0;
    let prevError = setpointRad;
    let appliedVolts = 0;
    let appliedCurrent = 0;
    let motorCurrent = 0;

    const softLowRad = (softLimitLow * Math.PI) / 180;
    const softHighRad = (softLimitHigh * Math.PI) / 180;

    for (let i = 0; i <= steps; i++) {
        const t = i * DT;

        // Determine current setpoint based on profile
        let currentSetpointRad, desiredVelRadS, desiredAccelRadSS;
        if (profile && i < profile.length) {
            currentSetpointRad = profile[i].position;
            desiredVelRadS = profile[i].velocity;
            desiredAccelRadSS = profile[i].acceleration;
        } else if (profile && i >= profile.length) {
            currentSetpointRad = setpointRad;
            desiredVelRadS = 0;
            desiredAccelRadSS = 0;
        } else {
            // No profile — step input
            currentSetpointRad = setpointRad;
            desiredVelRadS = 0;
            desiredAccelRadSS = 0;
        }

        const error = currentSetpointRad - theta;

        // kS sign source determination
        let ksSign;
        if (ksSignSource === "velocity") {
            // Use measured velocity sign (CTRE default for velocity mechanisms)
            ksSign = omega === 0 ? 0 : Math.sign(omega);
        } else if (ksSignSource === "closedloop") {
            // Use closed-loop output sign (kP*e + kD*ė)
            const tempFbP = kp * error;
            const tempFbD = kd * (i === 0 ? 0 : (error - prevError) / DT);
            const clOutput = tempFbP + tempFbD;
            ksSign = clOutput === 0 ? 0 : Math.sign(clOutput);
        } else {
            // "error" — use error sign (original behavior)
            ksSign = error === 0 ? 0 : Math.sign(error);
        }

        // Feedforward
        const ffKs = ks * ksSign;
        const ffKv = kv * desiredVelRadS;
        const ffKa = ka * desiredAccelRadSS;

        // Feedback
        const fbP = kp * error;
        const fbD = kd * (i === 0 ? 0 : (error - prevError) / DT);

        // Gravity compensation
        const gravTorqueNm = gravityTorque * Math.cos(theta);

        // Friction model: static + viscous
        let frictionTorque = 0;
        if (Math.abs(omega) < 0.01) {
            // Near zero velocity — static friction regime
            frictionTorque = staticFrictionTorque * (omega === 0 ? 0 : Math.sign(omega));
        } else {
            // Moving — Coulomb (constant) + viscous (proportional to velocity)
            frictionTorque = staticFrictionTorque * Math.sign(omega) + viscousFriction * omega;
        }

        if (controlMode === "voltage") {
            const rawV = ffKs + ffKv + ffKa + fbP + fbD;
            appliedVolts = clampVoltage(rawV);

            const backEmf = omega * gearing / effectiveKv;
            motorCurrent = numMotors > 0 ? (appliedVolts - backEmf) / effectiveR : 0;
            const motorTorque = totalKt * (motorCurrent / numMotors);
            const netTorque = motorTorque - gravTorqueNm - frictionTorque;
            const alpha = effectiveMOI > 0 ? netTorque / effectiveMOI : 0;
            omega += alpha * DT;
            theta += omega * DT;
            appliedCurrent = motorCurrent;
        } else {
            const rawI = ffKs + ffKv + ffKa + fbP + fbD;
            appliedCurrent = clampCurrent(rawI, motor.stallCurrent * numMotors);
            motorCurrent = appliedCurrent;

            const motorTorque = totalKt * (motorCurrent / numMotors);
            const netTorque = motorTorque - gravTorqueNm - frictionTorque;
            const alpha = effectiveMOI > 0 ? netTorque / effectiveMOI : 0;
            omega += alpha * DT;
            theta += omega * DT;
            const backEmf = omega * gearing / effectiveKv;
            appliedVolts = backEmf + motorCurrent * effectiveR / numMotors;
        }

        // soft limits
        if (theta < softLowRad) { theta = softLowRad; omega = Math.abs(omega) * 0.1; }
        if (theta > softHighRad) { theta = softHighRad; omega = -Math.abs(omega) * 0.1; }

        prevError = error;

        if (i % record === 0) {
            const profilePt = profile && i < profile.length ? profile[i] : null;
            history.push({
                t,
                theta,
                thetaDeg: (theta * 180) / Math.PI,
                omega,
                omegaDegS: (omega * 180) / Math.PI,
                setpointDeg,
                setpointRad,
                profilePositionDeg: profilePt ? (profilePt.position * 180) / Math.PI : setpointDeg,
                profileVelocityDegS: profilePt ? (profilePt.velocity * 180) / Math.PI : 0,
                profileAccelDegSS: profilePt ? (profilePt.acceleration * 180) / Math.PI : 0,
                voltage: appliedVolts,
                current: appliedCurrent,
                error,
                errorDeg: (error * 180) / Math.PI,
            });
        }
    }

    // Metrics
    const finalDeg = history[history.length - 1].thetaDeg;
    const steadyStateError = Math.abs(setpointDeg - finalDeg);
    let riseTime = null, settleTime = null, overshoot = 0;
    let maxDeg = -Infinity, minDeg = Infinity;

    for (const pt of history) {
        if (pt.thetaDeg > maxDeg) maxDeg = pt.thetaDeg;
        if (pt.thetaDeg < minDeg) minDeg = pt.thetaDeg;
        if (riseTime === null && setpointDeg > 0 && pt.thetaDeg >= setpointDeg * 0.9) riseTime = pt.t;
        if (riseTime === null && setpointDeg < 0 && pt.thetaDeg <= setpointDeg * 0.9) riseTime = pt.t;
    }

    if (setpointDeg > 0) {
        overshoot = ((maxDeg - setpointDeg) / setpointDeg) * 100;
        if (overshoot < 0) overshoot = 0;
    } else if (setpointDeg < 0) {
        overshoot = ((setpointDeg - minDeg) / Math.abs(setpointDeg)) * 100;
        if (overshoot < 0) overshoot = 0;
    }

    for (let i = history.length - 1; i >= 0; i--) {
        const band = Math.max(Math.abs(setpointDeg) * 0.02, 0.5);
        if (Math.abs(history[i].thetaDeg - setpointDeg) > band) {
            settleTime = history[Math.min(i + 1, history.length - 1)].t;
            break;
        }
    }

    return { history, riseTime, settleTime, overshoot, steadyStateError, finalDeg, maxDeg, minDeg };
}

// ─── DC Motor Database ──────────────────────────────────────────────────────
const DC_MOTORS = [
    { id: "krakenX60",    label: "Kraken X60",         stallTorque: 7.09,   freeSpeed: 6000, stallCurrent: 366,  freeCurrent: 2,    nominalVoltage: 12 },
    { id: "krakenX60FOC", label: "Kraken X60 (FOC)",   stallTorque: 9.37,   freeSpeed: 5800, stallCurrent: 483,  freeCurrent: 2,    nominalVoltage: 12 },
    { id: "krakenX44",    label: "Kraken X44",         stallTorque: 4.28,   freeSpeed: 7530, stallCurrent: 275,  freeCurrent: 1.4,  nominalVoltage: 12 },
    { id: "falcon500",    label: "Falcon 500",         stallTorque: 4.69,   freeSpeed: 6380, stallCurrent: 257,  freeCurrent: 1.5,  nominalVoltage: 12 },
    { id: "falcon500FOC", label: "Falcon 500 (FOC)",   stallTorque: 5.84,   freeSpeed: 6080, stallCurrent: 304,  freeCurrent: 1.5,  nominalVoltage: 12 },
    { id: "neoVortex",    label: "NEO Vortex",         stallTorque: 3.60,   freeSpeed: 6784, stallCurrent: 211,  freeCurrent: 3.6,  nominalVoltage: 12 },
    { id: "neo",          label: "NEO",                stallTorque: 2.6,    freeSpeed: 5676, stallCurrent: 105,  freeCurrent: 1.8,  nominalVoltage: 12 },
    { id: "neo550",       label: "NEO 550",            stallTorque: 0.97,   freeSpeed: 11000, stallCurrent: 100, freeCurrent: 1.4,  nominalVoltage: 12 },
    { id: "cim",          label: "CIM",                stallTorque: 2.41,   freeSpeed: 5330, stallCurrent: 131,  freeCurrent: 2.7,  nominalVoltage: 12 },
    { id: "miniCim",      label: "Mini CIM",           stallTorque: 1.41,   freeSpeed: 5840, stallCurrent: 89,   freeCurrent: 3,    nominalVoltage: 12 },
    { id: "bag",          label: "BAG",                stallTorque: 0.43,   freeSpeed: 13180, stallCurrent: 53,  freeCurrent: 1.8,  nominalVoltage: 12 },
    { id: "775pro",       label: "775pro",             stallTorque: 0.71,   freeSpeed: 18730, stallCurrent: 134, freeCurrent: 0.7,  nominalVoltage: 12 },
];

const COMMON_GEARINGS = [
    { label: "Custom", value: null }, { label: "10:1", value: 10 }, { label: "20:1", value: 20 }, { label: "25:1", value: 25 },
    { label: "36:1", value: 36 }, { label: "48:1", value: 48 }, { label: "50:1", value: 50 }, { label: "64:1", value: 64 },
    { label: "80:1", value: 80 }, { label: "100:1", value: 100 }, { label: "125:1", value: 125 }, { label: "150:1", value: 150 },
    { label: "200:1", value: 200 }, { label: "250:1", value: 250 },
];

const TURRET_PRESETS = [
    { id: "custom", label: "Custom", moi: 0.5, motorId: "krakenX60FOC", numMotors: 1, gearing: 100, gravityTorque: 0 },
    { id: "lightTurret", label: "Light Turret (Shooter)", moi: 0.3, motorId: "krakenX60FOC", numMotors: 1, gearing: 80, gravityTorque: 0 },
    { id: "heavyTurret", label: "Heavy Turret (Launcher)", moi: 1.2, motorId: "krakenX60FOC", numMotors: 1, gearing: 150, gravityTorque: 0 },
    { id: "wristJoint", label: "Wrist / Pivot Joint", moi: 0.15, motorId: "krakenX60FOC", numMotors: 1, gearing: 64, gravityTorque: 3.0 },
    { id: "armShoulder", label: "Arm Shoulder Joint", moi: 2.0, motorId: "krakenX60FOC", numMotors: 2, gearing: 200, gravityTorque: 15.0 },
    { id: "swerveSteer", label: "Swerve Steering Azimuth", moi: 0.004, motorId: "krakenX60FOC", numMotors: 1, gearing: 21.43, gravityTorque: 0 },
];

const SETPOINT_PRESETS = [
    { label: "45°", value: 45 }, { label: "90°", value: 90 }, { label: "135°", value: 135 },
    { label: "180°", value: 180 }, { label: "−90°", value: -90 }, { label: "−180°", value: -180 },
];

// ─── Shared constants & styles ───────────────────────────────────────────────
const MONO = "'IBM Plex Mono', monospace";
const SANS = "'DM Sans', sans-serif";
function fmt(v, d = 4) { if (v === undefined || v === null || isNaN(v)) return "—"; if (Math.abs(v) < 0.0001 && v !== 0) return v.toExponential(d); return parseFloat(v.toFixed(d)).toString(); }
const S = {
    cardSubtle: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 16 },
    label: { fontFamily: SANS, fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 },
    fieldLabel: { fontSize: 10, letterSpacing: "0.08em", opacity: 0.6, fontFamily: MONO, textTransform: "uppercase" },
    input: { background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "4px 8px", fontSize: 13, color: "#e2e8f0", fontFamily: MONO, outline: "none", width: 96 },
    inputSmall: { background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "2px 8px", fontSize: 13, color: "#e2e8f0", fontFamily: MONO, outline: "none", width: 56, textAlign: "center" },
    inputWide: { background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "4px 8px", fontSize: 13, color: "#e2e8f0", fontFamily: MONO, outline: "none", width: 120 },
    unit: { fontSize: 11, opacity: 0.4, fontFamily: MONO, marginLeft: 4 },
    select: { background: "transparent", color: "#e2e8f0", fontFamily: MONO, fontSize: 13, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "4px 8px", outline: "none", cursor: "pointer" },
    btn: (a) => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.04)", color: a ? "#38bdf8" : "rgba(255,255,255,0.5)", border: a ? "1px solid rgba(56,189,248,0.4)" : "1px solid rgba(255,255,255,0.06)", transition: "all 0.15s ease" }),
    btnColor: (a, color) => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? `${color}22` : "rgba(255,255,255,0.04)", color: a ? color : "rgba(255,255,255,0.5)", border: a ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.06)", transition: "all 0.15s ease" }),
};

function NumInput({ label, value, onChange, unit, inputStyle, step, min, max }) {
    return (<div style={{ display: "flex", flexDirection: label ? "column" : "row", gap: 4, alignItems: label ? "flex-start" : "center" }}>
        {label && <label style={S.fieldLabel}>{label}</label>}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={value} step={step} min={min} max={max} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }} style={{ ...S.input, ...inputStyle }} />{unit && <span style={S.unit}>{unit}</span>}</div>
    </div>);
}

function GainInput({ label, value, onChange, step = 0.001, color = "#38bdf8" }) {
    return (<div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <label style={{ ...S.fieldLabel, color, opacity: 0.8 }}>{label}</label>
        <input type="number" value={value} step={step} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }} style={{ ...S.inputWide, borderColor: `${color}33`, color }} />
    </div>);
}

function MotorSpecBar({ label, value, max, color, unit }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, opacity: 0.5, fontFamily: MONO, width: 80, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>{label}</span>
        <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s ease" }} /></div>
        <span style={{ fontSize: 11, fontFamily: MONO, color, minWidth: 64, textAlign: "right" }}>{fmt(value, 1)} {unit}</span>
    </div>);
}

// ─── Canvas Helpers ─────────────────────────────────────────────────────────
function useChart(containerRef, canvasRef, h, draw, deps) {
    useEffect(() => { const c = canvasRef.current, ct = containerRef.current; if (!c || !ct) return; const d = window.devicePixelRatio || 1, w = ct.clientWidth; c.width = w * d; c.height = h * d; c.style.width = w + "px"; c.style.height = h + "px"; const x = c.getContext("2d"); x.scale(d, d); x.clearRect(0, 0, w, h); draw(x, w, h); }, deps);
}
function drawGrid(ctx, p, pw, ph, cols = 5, rows = 5) {
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) { const x = p.l + (i / cols) * pw; ctx.beginPath(); ctx.moveTo(x, p.t); ctx.lineTo(x, p.t + ph); ctx.stroke(); }
    for (let i = 0; i <= rows; i++) { const y = p.t + (i / rows) * ph; ctx.beginPath(); ctx.moveTo(p.l, y); ctx.lineTo(p.l + pw, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.beginPath(); ctx.moveTo(p.l, p.t); ctx.lineTo(p.l, p.t + ph); ctx.lineTo(p.l + pw, p.t + ph); ctx.stroke();
}

// ─── Position Chart ─────────────────────────────────────────────────────────
function PositionChart({ history, setpointDeg, profileMode }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 280, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;

        const maxT = history[history.length - 1].t;
        let yMax = Math.max(setpointDeg * 1.3, setpointDeg + 20);
        let yMin = Math.min(0, setpointDeg) - 10;
        for (const pt of history) {
            if (pt.thetaDeg > yMax) yMax = pt.thetaDeg + 10;
            if (pt.thetaDeg < yMin) yMin = pt.thetaDeg - 10;
            if (pt.profilePositionDeg > yMax) yMax = pt.profilePositionDeg + 10;
            if (pt.profilePositionDeg < yMin) yMin = pt.profilePositionDeg - 10;
        }
        if (yMax - yMin < 20) { yMax += 10; yMin -= 10; }

        drawGrid(ctx, pad, pw, ph, 5, 5);

        // setpoint line (final)
        const spY = pad.t + ph * (1 - (setpointDeg - yMin) / (yMax - yMin));
        ctx.strokeStyle = "rgba(56,189,248,0.4)"; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(pad.l, spY); ctx.lineTo(pad.l + pw, spY); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(56,189,248,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "right";
        ctx.fillText(`Setpoint: ${setpointDeg}°`, pad.l + pw - 4, spY - 6);

        // 2% band
        const band = Math.max(Math.abs(setpointDeg) * 0.02, 0.5);
        const bandHi = setpointDeg + band, bandLo = setpointDeg - band;
        const bhY = pad.t + ph * (1 - (bandHi - yMin) / (yMax - yMin));
        const blY = pad.t + ph * (1 - (bandLo - yMin) / (yMax - yMin));
        ctx.fillStyle = "rgba(56,189,248,0.04)";
        ctx.fillRect(pad.l, bhY, pw, blY - bhY);

        // zero line
        if (yMin < 0 && yMax > 0) {
            const zy = pad.t + ph * (1 - (0 - yMin) / (yMax - yMin));
            ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();
        }

        // Profile reference line (if profiled)
        if (profileMode !== "none") {
            ctx.strokeStyle = "rgba(16,185,129,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
            ctx.beginPath();
            history.forEach((pt, i) => {
                const x = pad.l + (pt.t / maxT) * pw;
                const y = pad.t + ph * (1 - (pt.profilePositionDeg - yMin) / (yMax - yMin));
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Position curve
        ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.5; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.thetaDeg - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        // axes labels
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(yMax - (i / 5) * (yMax - yMin), 1) + "°", pad.l - 8, pad.t + (i / 5) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Position (degrees)", 0, 0); ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("POSITION RESPONSE", pad.l, pad.t - 10);

        // Legend
        if (profileMode !== "none") {
            const lx = pad.l + pw - 180;
            const ly = pad.t + 14;
            ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(lx - 4, ly - 10, 184, 32);
            ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 20, ly); ctx.stroke();
            ctx.fillStyle = "#38bdf8"; ctx.font = `9px ${MONO}`; ctx.textAlign = "left"; ctx.fillText("Actual", lx + 24, ly + 3);
            ctx.strokeStyle = "rgba(16,185,129,0.7)"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(lx, ly + 16); ctx.lineTo(lx + 20, ly + 16); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = "rgba(16,185,129,0.7)"; ctx.fillText("Profile Ref", lx + 24, ly + 19);
        }
    }, [history, setpointDeg, profileMode]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Velocity Chart ─────────────────────────────────────────────────────────
function VelocityChart({ history, profileMode }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 200, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;

        const maxT = history[history.length - 1].t;
        const values = history.map(pt => pt.omegaDegS);
        const profileValues = profileMode !== "none" ? history.map(pt => pt.profileVelocityDegS) : [];
        let yMax = -Infinity, yMin = Infinity;
        for (const v of values) { if (v > yMax) yMax = v; if (v < yMin) yMin = v; }
        for (const v of profileValues) { if (v > yMax) yMax = v; if (v < yMin) yMin = v; }
        const range = yMax - yMin;
        if (range < 10) { yMax += 10; yMin -= 10; } else { yMax += range * 0.1; yMin -= range * 0.1; }

        drawGrid(ctx, pad, pw, ph, 5, 4);

        if (yMin < 0 && yMax > 0) {
            const zy = pad.t + ph * (1 - (0 - yMin) / (yMax - yMin));
            ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();
        }

        // Profile velocity reference
        if (profileMode !== "none") {
            ctx.strokeStyle = "rgba(16,185,129,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
            ctx.beginPath();
            history.forEach((pt, i) => {
                const x = pad.l + (pt.t / maxT) * pw;
                const y = pad.t + ph * (1 - (pt.profileVelocityDegS - yMin) / (yMax - yMin));
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke(); ctx.setLineDash([]);
        }

        ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 2; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.omegaDegS - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 4; i++) ctx.fillText(fmt(yMax - (i / 4) * (yMax - yMin), 0) + "°/s", pad.l - 8, pad.t + (i / 4) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Velocity (°/s)", 0, 0); ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("ANGULAR VELOCITY", pad.l, pad.t - 10);

        // Legend
        if (profileMode !== "none") {
            const lx = pad.l + pw - 180;
            const ly = pad.t + 14;
            ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(lx - 4, ly - 10, 184, 32);
            ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 20, ly); ctx.stroke();
            ctx.fillStyle = "#a78bfa"; ctx.font = `9px ${MONO}`; ctx.textAlign = "left"; ctx.fillText("Actual", lx + 24, ly + 3);
            ctx.strokeStyle = "rgba(16,185,129,0.7)"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(lx, ly + 16); ctx.lineTo(lx + 20, ly + 16); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = "rgba(16,185,129,0.7)"; ctx.fillText("Profile Ref", lx + 24, ly + 19);
        }
    }, [history, profileMode]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Effort Chart ──────────────────────────────────────────────────────────
function EffortChart({ history, controlMode }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    const isVoltage = controlMode === "voltage";
    useChart(containerRef, canvasRef, 200, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;

        const maxT = history[history.length - 1].t;
        const values = history.map(pt => isVoltage ? pt.voltage : pt.current);
        let yMax = -Infinity, yMin = Infinity;
        for (const v of values) { if (v > yMax) yMax = v; if (v < yMin) yMin = v; }
        const range = yMax - yMin;
        if (range < 0.1) { yMax += 1; yMin -= 1; } else { yMax += range * 0.1; yMin -= range * 0.1; }

        drawGrid(ctx, pad, pw, ph, 5, 4);

        if (yMin < 0 && yMax > 0) {
            const zy = pad.t + ph * (1 - (0 - yMin) / (yMax - yMin));
            ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();
        }

        const effortColor = isVoltage ? "#c084fc" : "#fbbf24";
        ctx.strokeStyle = effortColor; ctx.lineWidth = 2; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const val = isVoltage ? pt.voltage : pt.current;
            const y = pad.t + ph * (1 - (val - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 4; i++) ctx.fillText(fmt(yMax - (i / 4) * (yMax - yMin), 1), pad.l - 8, pad.t + (i / 4) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center";
        ctx.fillText(isVoltage ? "Voltage (V)" : "Current (A)", 0, 0); ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText(isVoltage ? "APPLIED VOLTAGE" : "APPLIED CURRENT", pad.l, pad.t - 10);
    }, [history, controlMode]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Error Chart ────────────────────────────────────────────────────────────
function ErrorChart({ history }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 200, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;

        const maxT = history[history.length - 1].t;
        let yMax = -Infinity, yMin = Infinity;
        for (const pt of history) { if (pt.errorDeg > yMax) yMax = pt.errorDeg; if (pt.errorDeg < yMin) yMin = pt.errorDeg; }
        const range = yMax - yMin;
        if (range < 10) { yMax += 10; yMin -= 10; } else { yMax += range * 0.1; yMin -= range * 0.1; }

        drawGrid(ctx, pad, pw, ph, 5, 4);

        if (yMin < 0 && yMax > 0) {
            const zy = pad.t + ph * (1 - (0 - yMin) / (yMax - yMin));
            ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();
        }

        ctx.strokeStyle = "#fb7185"; ctx.lineWidth = 2; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.errorDeg - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 4; i++) ctx.fillText(fmt(yMax - (i / 4) * (yMax - yMin), 1) + "°", pad.l - 8, pad.t + (i / 4) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Error (degrees)", 0, 0); ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("TRACKING ERROR", pad.l, pad.t - 10);
    }, [history]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Turret Visualization ──────────────────────────────────────────────────
function TurretViz({ currentDeg, setpointDeg, gravityTorque }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    const angleRef = useRef(0);
    const animRef = useRef(null);
    const degRef = useRef(currentDeg);
    degRef.current = currentDeg;

    useEffect(() => {
        const c = canvasRef.current, ct = containerRef.current;
        if (!c || !ct) return;

        function animate() {
            const target = degRef.current;
            angleRef.current += (target - angleRef.current) * 0.12;

            const d = window.devicePixelRatio || 1;
            const w = ct.clientWidth, h = 200;
            c.width = w * d; c.height = h * d;
            c.style.width = w + "px"; c.style.height = h + "px";
            const ctx = c.getContext("2d");
            ctx.scale(d, d);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2 + 5, r = 68;

            ctx.save();
            for (let deg = -180; deg <= 180; deg += 15) {
                const a = (deg - 90) * Math.PI / 180;
                const isMajor = deg % 45 === 0;
                const innerR = isMajor ? r - 12 : r - 7;
                ctx.strokeStyle = isMajor ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)";
                ctx.lineWidth = isMajor ? 1.5 : 1;
                ctx.beginPath();
                ctx.moveTo(cx + innerR * Math.cos(a), cy + innerR * Math.sin(a));
                ctx.lineTo(cx + (r + 2) * Math.cos(a), cy + (r + 2) * Math.sin(a));
                ctx.stroke();
                if (isMajor) {
                    ctx.fillStyle = "rgba(255,255,255,0.25)";
                    ctx.font = `9px ${MONO}`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    const labelR = r + 14;
                    ctx.fillText(`${deg}°`, cx + labelR * Math.cos(a), cy + labelR * Math.sin(a));
                }
            }
            ctx.restore();

            ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

            const spAngle = (setpointDeg - 90) * Math.PI / 180;
            ctx.strokeStyle = "rgba(56,189,248,0.2)"; ctx.lineWidth = 3; ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (r - 6) * Math.cos(spAngle), cy + (r - 6) * Math.sin(spAngle)); ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath(); ctx.arc(cx + (r - 6) * Math.cos(spAngle), cy + (r - 6) * Math.sin(spAngle), 4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(56,189,248,0.3)"; ctx.fill();

            if (gravityTorque > 0) {
                const gx = cx + r + 28, gy = cy - 20;
                ctx.strokeStyle = "rgba(251,191,36,0.4)"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + 20); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(gx - 4, gy + 16); ctx.lineTo(gx, gy + 22); ctx.lineTo(gx + 4, gy + 16); ctx.stroke();
                ctx.fillStyle = "rgba(251,191,36,0.5)"; ctx.font = `8px ${MONO}`; ctx.textAlign = "center";
                ctx.fillText("g", gx, gy - 4);
            }

            const armAngle = (angleRef.current - 90) * Math.PI / 180;
            ctx.strokeStyle = "rgba(56,189,248,0.1)"; ctx.lineWidth = 8; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (r - 10) * Math.cos(armAngle), cy + (r - 10) * Math.sin(armAngle)); ctx.stroke();
            ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 4; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (r - 10) * Math.cos(armAngle), cy + (r - 10) * Math.sin(armAngle)); ctx.stroke();
            ctx.lineCap = "butt";

            ctx.beginPath(); ctx.arc(cx + (r - 10) * Math.cos(armAngle), cy + (r - 10) * Math.sin(armAngle), 5, 0, Math.PI * 2);
            ctx.fillStyle = "#38bdf8"; ctx.fill();
            ctx.beginPath(); ctx.arc(cx + (r - 10) * Math.cos(armAngle), cy + (r - 10) * Math.sin(armAngle), 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#0c0e14"; ctx.fill();

            ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fillStyle = "rgba(56,189,248,0.15)"; ctx.fill();
            ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.strokeStyle = "rgba(56,189,248,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fillStyle = "#38bdf8"; ctx.fill();

            ctx.fillStyle = "#e2e8f0"; ctx.font = `bold 14px ${MONO}`; ctx.textAlign = "center";
            ctx.fillText(`${fmt(degRef.current, 1)}°`, cx, cy + r + 34);
            ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = `10px ${MONO}`;
            ctx.fillText(`target: ${setpointDeg}°`, cx, cy + r + 50);

            animRef.current = requestAnimationFrame(animate);
        }
        animRef.current = requestAnimationFrame(animate);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [setpointDeg, gravityTorque]);

    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Metric Card ────────────────────────────────────────────────────────────
function MetricCard({ label, value, unit, color = "#e2e8f0", warn }) {
    return (
        <div style={{ padding: "10px 14px", background: warn ? "rgba(251,191,36,0.06)" : "rgba(255,255,255,0.02)", border: warn ? "1px solid rgba(251,191,36,0.15)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 6 }}>
            <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: MONO, color }}>{value}</span>
                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>{unit}</span>
            </div>
        </div>
    );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function TurretTunerApp() {
    const [presetId, setPresetId] = useState("lightTurret");
    const [motorId, setMotorId] = useState("krakenX60FOC");
    const [numMotors, setNumMotors] = useState(1);
    const [gearingPreset, setGearingPreset] = useState(null);
    const [gearing, setGearing] = useState(80);
    const [moi, setMoi] = useState(0.3);
    const [gravityTorque, setGravityTorque] = useState(0);
    const [controlMode, setControlMode] = useState("voltage");
    const [setpointDeg, setSetpointDeg] = useState(90);
    const [duration, setDuration] = useState(3);
    const [softLimitLow, setSoftLimitLow] = useState(-180);
    const [softLimitHigh, setSoftLimitHigh] = useState(180);

    // gains
    const [ks, setKs] = useState(0);
    const [kv, setKv] = useState(0);
    const [ka, setKa] = useState(0);
    const [kp, setKp] = useState(0);
    const [kd, setKd] = useState(0);

    // Motion profile state
    const [profileMode, setProfileMode] = useState("none");
    const [maxVelDegS, setMaxVelDegS] = useState(360);
    const [maxAccelDegSS, setMaxAccelDegSS] = useState(720);
    const [maxJerkDegSSS, setMaxJerkDegSSS] = useState(0); // 0 = infinite (pure trapezoidal)
    const [profileKv, setProfileKv] = useState(0.12);
    const [profileKa, setProfileKa] = useState(0.01);

    // kS sign source
    const [ksSignSource, setKsSignSource] = useState("error");

    // Plant model
    const [plantMode, setPlantMode] = useState("physical"); // "physical" | "feedforward"
    const [plantKs, setPlantKs] = useState(0); // Static friction
    const [plantKv, setPlantKv] = useState(0); // For feedforward mode
    const [plantKa, setPlantKa] = useState(0); // For feedforward mode
    const [viscousFriction, setViscousFriction] = useState(0); // N·m/(rad/s)

    const [activeTab, setActiveTab] = useState("position");

    const motor = DC_MOTORS.find(m => m.id === motorId);
    const mc = useMemo(() => motorConstants(motor), [motor]);

    const applyPreset = useCallback((id) => {
        setPresetId(id);
        if (id !== "custom") {
            const p = TURRET_PRESETS.find(pr => pr.id === id);
            if (p) {
                setMoi(p.moi); setMotorId(p.motorId); setNumMotors(p.numMotors); setGearing(p.gearing);
                setGravityTorque(p.gravityTorque); setGearingPreset(null);
            }
        }
    }, []);

    const setMoiCustom = (v) => { setMoi(v); setPresetId("custom"); };

    const outputFreeSpeedRPM = useMemo(() => motor.freeSpeed / gearing, [motor, gearing]);
    const maxOutputDegPerSec = useMemo(() => (outputFreeSpeedRPM / 60) * 360, [outputFreeSpeedRPM]);

    const simResult = useMemo(() => {
        return simulateTurret({
            motor, numMotors, gearing, moi, ks, kv, ka, kp, kd,
            setpointDeg, controlMode, durationS: duration, gravityTorque,
            softLimitLow, softLimitHigh,
            profileMode, maxVelDegS, maxAccelDegSS, maxJerkDegSSS,
            profileKv, profileKa, ksSignSource,
            plantMode, plantKs, plantKv, plantKa, viscousFriction,
        });
    }, [motor, numMotors, gearing, moi, ks, kv, ka, kp, kd, setpointDeg, controlMode, duration, gravityTorque, softLimitLow, softLimitHigh, profileMode, maxVelDegS, maxAccelDegSS, maxJerkDegSSS, profileKv, profileKa, ksSignSource, plantMode, plantKs, plantKv, plantKa, viscousFriction]);

    const finalDeg = simResult.history.length > 0 ? simResult.history[simResult.history.length - 1].thetaDeg : 0;

    const ssErr = simResult.steadyStateError;
    const ssColor = ssErr < 1 ? "#10b981" : ssErr < 3 ? "#fbbf24" : "#fb7185";
    const osColor = simResult.overshoot < 2 ? "#10b981" : simResult.overshoot < 10 ? "#fbbf24" : "#fb7185";

    const motorOutput = useMemo(() => {
        const totalStallTorque = motor.stallTorque * numMotors * gearing;
        const outputFreeSpeed = motor.freeSpeed / gearing;
        const totalStallCurrent = motor.stallCurrent * numMotors;
        return { totalStallTorque, outputFreeSpeed, totalStallCurrent };
    }, [motor, numMotors, gearing]);

    const TABS = [
        { id: "position", label: "Position" },
        { id: "velocity", label: "Velocity" },
        { id: "effort", label: controlMode === "voltage" ? "Voltage" : "Current" },
        { id: "error", label: "Error" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a0c12 0%, #0f1219 50%, #0a0c12 100%)", color: "#c8ced8", fontFamily: SANS }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <header style={{ padding: "24px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}><h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: "#38bdf8", margin: 0 }}>TurretTuner</h1><span style={{ fontSize: 12, opacity: 0.3, fontFamily: MONO }}>Position PID Simulator</span></div>
                <p style={{ fontSize: 12, opacity: 0.3, marginTop: 4 }}>FRC turret / arm / azimuth position control tuning sandbox</p>
            </header>

            <div style={{ padding: "20px 24px" }}>
                {/* Preset & Control Mode */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Preset</span>
                        <select value={presetId} onChange={e => applyPreset(e.target.value)} style={S.select}>
                            {TURRET_PRESETS.map(p => <option key={p.id} value={p.id} style={{ background: "#1a1d2e" }}>{p.label}</option>)}
                        </select>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                        {["voltage", "current"].map(m => (
                            <button key={m} onClick={() => setControlMode(m)} style={S.btn(controlMode === m)}>
                                {m === "voltage" ? "Voltage" : "Current"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Motor & Gearing */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Motor & Gearing</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>DC Motor</label><select value={motorId} onChange={e => { setMotorId(e.target.value); setPresetId("custom"); }} style={S.select}>{DC_MOTORS.map(m => <option key={m.id} value={m.id} style={{ background: "#1a1d2e" }}>{m.label}</option>)}</select></div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Number of Motors</label><div style={{ display: "flex", gap: 4 }}>{[1, 2, 3, 4].map(n => <button key={n} onClick={() => { setNumMotors(n); setPresetId("custom"); }} style={{ ...S.btn(numMotors === n), width: 36, textAlign: "center", padding: "4px 0" }}>{n}</button>)}</div></div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Gear Ratio</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><select value={gearingPreset === null ? "" : gearingPreset} onChange={e => { const v = e.target.value; if (v === "") setGearingPreset(null); else { setGearingPreset(parseFloat(v)); setGearing(parseFloat(v)); setPresetId("custom"); } }} style={{ ...S.select, width: 88 }}>{COMMON_GEARINGS.map(g => <option key={g.label} value={g.value === null ? "" : g.value} style={{ background: "#1a1d2e" }}>{g.label}</option>)}</select><input type="number" value={parseFloat(gearing.toFixed(2))} min={0.1} step={1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) { setGearing(v); setGearingPreset(null); setPresetId("custom"); } }} style={{ ...S.inputSmall, width: 64 }} /><span style={S.unit}>:1</span></div></div>
                        <NumInput label="Moment of Inertia" value={parseFloat(moi.toFixed(6))} onChange={v => setMoiCustom(Math.max(0.0001, v))} unit="kg·m²" step={0.01} inputStyle={{ width: 110 }} />
                    </div>

                    <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                        <NumInput label="Gravity Torque (at horizontal)" value={parseFloat(gravityTorque.toFixed(2))} onChange={v => { setGravityTorque(Math.max(0, v)); setPresetId("custom"); }} unit="N·m" step={0.5} inputStyle={{ width: 80 }} />
                        <NumInput label="Soft Limit Low" value={softLimitLow} onChange={v => setSoftLimitLow(v)} unit="°" step={5} inputStyle={{ width: 64 }} />
                        <NumInput label="Soft Limit High" value={softLimitHigh} onChange={v => setSoftLimitHigh(v)} unit="°" step={5} inputStyle={{ width: 64 }} />
                    </div>

                    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>Per Motor</span>
                            <MotorSpecBar label="Stall τ" value={motor.stallTorque} max={10} color="#c084fc" unit="N·m" />
                            <MotorSpecBar label="Free Spd" value={motor.freeSpeed} max={20000} color="#38bdf8" unit="RPM" />
                            <MotorSpecBar label="Stall I" value={motor.stallCurrent} max={500} color="#fbbf24" unit="A" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>At Output ({numMotors}× {motor.label}, {fmt(gearing, 1)}:1)</span>
                            <MotorSpecBar label="Stall τ" value={motorOutput.totalStallTorque} max={Math.max(motorOutput.totalStallTorque * 1.2, 1)} color="#c084fc" unit="N·m" />
                            <MotorSpecBar label="Free Spd" value={motorOutput.outputFreeSpeed} max={Math.max(motorOutput.outputFreeSpeed * 1.5, 1)} color="#38bdf8" unit="RPM" />
                            <MotorSpecBar label="Stall I" value={motorOutput.totalStallCurrent} max={Math.max(motorOutput.totalStallCurrent * 1.2, 1)} color="#fbbf24" unit="A" />
                        </div>
                    </div>
                </div>

                {/* Setpoint */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Setpoint & Simulation</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={S.fieldLabel}>Position Setpoint</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input type="range" min={softLimitLow} max={softLimitHigh} step={1} value={setpointDeg} onChange={e => setSetpointDeg(parseFloat(e.target.value))} style={{ accentColor: "#38bdf8", width: 200 }} />
                                <input type="number" value={setpointDeg} min={softLimitLow} max={softLimitHigh} step={1} onChange={e => { let v = parseFloat(e.target.value); if (!isNaN(v)) setSetpointDeg(Math.max(softLimitLow, Math.min(softLimitHigh, v))); }} style={S.inputSmall} />
                                <span style={S.unit}>deg</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.25, fontFamily: MONO, width: 200 }}><span>{softLimitLow}°</span><span>{softLimitHigh}°</span></div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {SETPOINT_PRESETS.filter(p => p.value >= softLimitLow && p.value <= softLimitHigh).map(p => (
                                <button key={p.value} onClick={() => setSetpointDeg(p.value)} style={S.btn(setpointDeg === p.value)}>{p.label}</button>
                            ))}
                        </div>
                        <NumInput label="Duration" value={duration} onChange={v => setDuration(Math.max(0.5, Math.min(20, v)))} unit="s" step={0.5} inputStyle={{ width: 56 }} />
                    </div>
                    <div style={{ marginTop: 8, fontSize: 10, opacity: 0.3, fontFamily: MONO }}>
                        Max output speed: {fmt(maxOutputDegPerSec, 0)} °/s ({fmt(outputFreeSpeedRPM, 1)} RPM)
                        {gravityTorque > 0 && <span> &nbsp;|&nbsp; Gravity torque at output: {fmt(gravityTorque, 1)} N·m (cosine-weighted)</span>}
                    </div>
                </div>

                {/* ═══ Motion Profile ═══ */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: profileMode !== "none" ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ ...S.label, marginBottom: 0 }}>Motion Profile</div>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[
                                { id: "none", label: "None (Step)", color: "rgba(255,255,255,0.5)" },
                                { id: "trapezoid", label: "Trapezoid", color: "#10b981" },
                                { id: "exponential", label: "Exponential", color: "#f59e0b" },
                            ].map(m => (
                                <button key={m.id} onClick={() => setProfileMode(m.id)} style={S.btnColor(profileMode === m.id, m.color)}>
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {profileMode === "none" && (
                        <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6, padding: "8px 0" }}>
                            Step input — full setpoint applied immediately. kV and kA feedforward have no effect without a profile.
                            {" "}Motion profiles generate smooth velocity/acceleration trajectories, enabling kV and kA to do useful work.
                        </div>
                    )}

                    {profileMode === "trapezoid" && (
                        <div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
                                <NumInput label="Max Velocity" value={maxVelDegS} onChange={v => setMaxVelDegS(Math.max(1, v))} unit="°/s" step={10} inputStyle={{ width: 80 }} />
                                <NumInput label="Max Acceleration" value={maxAccelDegSS} onChange={v => setMaxAccelDegSS(Math.max(1, v))} unit="°/s²" step={10} inputStyle={{ width: 80 }} />
                                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    <label style={{ ...S.fieldLabel, color: "#10b981", opacity: 0.7 }}>Max Jerk (0 = ∞)</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <input type="number" value={maxJerkDegSSS} min={0} step={100} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setMaxJerkDegSSS(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 80, borderColor: "rgba(16,185,129,0.3)", color: "#10b981" }} />
                                        <span style={{ ...S.unit, color: "#10b981" }}>°/s³</span>
                                    </div>
                                    <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>{maxJerkDegSSS > 0 ? "S-curve (jerk-limited)" : "Pure trapezoidal (infinite jerk)"}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                                {maxJerkDegSSS > 0
                                    ? "S-curve profile: acceleration ramps smoothly (jerk-limited). Reduces mechanical stress, vibration, and current spikes. Equivalent to CTRE MotionMagic with jerk limiting."
                                    : "Pure trapezoidal: acceleration steps instantly (infinite jerk). Constrains velocity and acceleration. Equivalent to WPILib TrapezoidProfile or CTRE MotionMagic."
                                }
                            </div>
                            <div style={{ marginTop: 8, fontSize: 10, opacity: 0.25, fontFamily: MONO }}>
                                Hint: Set max vel to ~80% of output free speed ({fmt(maxOutputDegPerSec * 0.8, 0)} °/s) for realistic behavior.
                            </div>
                        </div>
                    )}

                    {profileMode === "exponential" && (
                        <div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
                                <GainInput label="Profile kV (V·s/rad or A·s/rad)" value={profileKv} onChange={setProfileKv} step={0.001} color="#f59e0b" />
                                <GainInput label="Profile kA (V·s²/rad or A·s²/rad)" value={profileKa} onChange={setProfileKa} step={0.0001} color="#f59e0b" />
                            </div>
                            <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                                Exponential profile models back-EMF limited acceleration. The velocity approaches vMax exponentially
                                with time constant τ = kA/kV. This matches WPILib ExponentialProfile behavior. Use characterized
                                kV and kA values from SysId. τ = {fmt(profileKa > 0 && profileKv > 0 ? profileKa / profileKv : 0, 4)}s,
                                {" "}vMax ≈ {fmt(profileKv > 0 ? ((controlMode === "voltage" ? 12 : motor.stallCurrent * numMotors) - Math.abs(ks)) / profileKv : 0, 1)} rad/s
                                ({fmt(profileKv > 0 ? (((controlMode === "voltage" ? 12 : motor.stallCurrent * numMotors) - Math.abs(ks)) / profileKv) * 180 / Math.PI : 0, 0)} °/s)
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ kS Sign Source ═══ */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ ...S.label, marginBottom: 0 }}>kS Static Feedforward Sign</div>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[
                                { id: "error", label: "Sign(Error)", color: "#10b981" },
                                { id: "velocity", label: "Sign(Velocity)", color: "#a78bfa" },
                                { id: "closedloop", label: "Sign(CL Output)", color: "#38bdf8" },
                            ].map(m => (
                                <button key={m.id} onClick={() => setKsSignSource(m.id)} style={S.btnColor(ksSignSource === m.id, m.color)}>
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.8 }}>
                        {ksSignSource === "error" && (
                            <>kS is applied in the direction of the position error: <span style={{ color: "#10b981" }}>kS · sgn(error)</span>. Simple and aggressive — always pushes toward setpoint. Can cause jitter near setpoint if kS is too large.</>
                        )}
                        {ksSignSource === "velocity" && (
                            <>kS is applied in the direction of measured velocity: <span style={{ color: "#a78bfa" }}>kS · sgn(ω_measured)</span>. This is what CTRE uses by default for velocity-based mechanisms. kS only activates once the system is moving, preventing jitter at rest. When velocity is zero, kS output is zero.</>
                        )}
                        {ksSignSource === "closedloop" && (
                            <>kS is applied in the direction of the closed-loop PID output: <span style={{ color: "#38bdf8" }}>kS · sgn(kP·e + kD·ė)</span>. This is the CTRE StaticFeedforwardSignValue.UseClosedLoopSign option. kS follows the combined feedback direction, which accounts for both error magnitude and derivative braking.</>
                        )}
                    </div>
                </div>

                {/* Gains */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={S.label}>Control Gains ({controlMode === "voltage" ? "Voltage" : "Current"} Mode)</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
                        <GainInput label="kS (static)" value={ks} onChange={setKs} step={0.01} color="#10b981" />
                        <GainInput label="kV (velocity FF)" value={kv} onChange={setKv} step={0.0001} color="#60a5fa" />
                        <GainInput label="kA (accel FF)" value={ka} onChange={setKa} step={0.0001} color="#c084fc" />
                        <GainInput label="kP (proportional)" value={kp} onChange={setKp} step={0.01} color="#38bdf8" />
                        <GainInput label="kD (derivative)" value={kd} onChange={setKd} step={0.001} color="#fbbf24" />
                    </div>
                    {profileMode === "none" && (kv !== 0 || ka !== 0) && (
                        <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 6, fontSize: 11, fontFamily: MONO, color: "#fbbf24", lineHeight: 1.6 }}>
                            ⚠ kV and kA have no effect without a motion profile. The desired velocity and acceleration are zero for a step input. Enable Trapezoid or Exponential profiling above.
                        </div>
                    )}
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Reference Values</div>
                        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>Output stall τ =</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#c084fc" }}>{fmt(motorOutput.totalStallTorque, 1)} N·m</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>Max ω =</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#38bdf8" }}>{fmt(maxOutputDegPerSec, 0)} °/s ({fmt(outputFreeSpeedRPM, 1)} RPM)</span>
                            </div>
                            {gravityTorque > 0 && <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>Gravity hold τ =</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#fbbf24" }}>{fmt(gravityTorque, 1)} N·m ({fmt((gravityTorque / motorOutput.totalStallTorque) * 100, 1)}% of stall)</span>
                            </div>}
                        </div>
                    </div>
                </div>

                {/* Turret Viz + Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 20 }}>
                    <div style={{ ...S.cardSubtle, minWidth: 240 }}>
                        <TurretViz currentDeg={finalDeg} setpointDeg={setpointDeg} gravityTorque={gravityTorque} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, alignContent: "start" }}>
                        <MetricCard label="Rise Time (90%)" value={simResult.riseTime !== null ? fmt(simResult.riseTime, 3) : "—"} unit="s" color={simResult.riseTime !== null && simResult.riseTime < 1 ? "#10b981" : "#fbbf24"} />
                        <MetricCard label="Settle Time (2%)" value={simResult.settleTime !== null ? fmt(simResult.settleTime, 3) : "—"} unit="s" color={simResult.settleTime !== null && simResult.settleTime < 2 ? "#10b981" : "#fbbf24"} />
                        <MetricCard label="Overshoot" value={fmt(simResult.overshoot, 1)} unit="%" color={osColor} warn={simResult.overshoot > 10} />
                        <MetricCard label="SS Error" value={fmt(ssErr, 2)} unit="deg" color={ssColor} warn={ssErr > 3} />
                        <MetricCard label="Final Position" value={fmt(finalDeg, 1)} unit="deg" color="#e2e8f0" />
                        <MetricCard label={setpointDeg >= 0 ? "Peak Position" : "Min Position"} value={fmt(setpointDeg >= 0 ? simResult.maxDeg : simResult.minDeg, 1)} unit="deg" color="#38bdf8" />
                    </div>
                </div>

                {/* Charts */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
                        {TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={S.btn(activeTab === t.id)}>{t.label}</button>)}
                    </div>
                    {activeTab === "position" && <PositionChart history={simResult.history} setpointDeg={setpointDeg} profileMode={profileMode} />}
                    {activeTab === "velocity" && <VelocityChart history={simResult.history} profileMode={profileMode} />}
                    {activeTab === "effort" && <EffortChart history={simResult.history} controlMode={controlMode} />}
                    {activeTab === "error" && <ErrorChart history={simResult.history} />}
                </div>

                {/* Control Equation */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Control Law — Position PID{profileMode !== "none" ? ` + ${profileMode === "trapezoid" ? "Trapezoid" : "Exponential"} Profile` : ""}</div>
                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 13, fontFamily: MONO, color: "#e2e8f0", lineHeight: 1.8 }}>
                            <span style={{ opacity: 0.5 }}>{controlMode === "voltage" ? "V" : "I"} = </span>
                            <span style={{ color: "#10b981" }}>kS·sgn({ksSignSource === "velocity" ? "ω" : ksSignSource === "closedloop" ? "CL" : "e"})</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#60a5fa" }}>kV·v_profile</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#c084fc" }}>kA·a_profile</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#38bdf8" }}>kP·e</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#fbbf24" }}>kD·ė</span>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                            e = θ_profile(t) − θ_measured &nbsp;|&nbsp; v_profile = profiled velocity (rad/s) &nbsp;|&nbsp; a_profile = profiled acceleration (rad/s²)
                        </div>
                        <div style={{ marginTop: 6, fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                            kS sign source: {ksSignSource === "error" ? "sgn(error) — pushes toward setpoint" : ksSignSource === "velocity" ? "sgn(measured velocity) — CTRE default, zero at rest" : "sgn(kP·e + kD·ė) — CTRE UseClosedLoopSign option"}
                        </div>
                        {profileMode === "none" && (
                            <div style={{ marginTop: 6, fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                                No profile active: v_profile = 0, a_profile = 0, e = θ_setpoint − θ_measured
                            </div>
                        )}
                    </div>
                </div>

                {/* Simulation Model Details */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={S.label}>Simulation Model Details</div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Motor Electrical Model</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, color: "#e2e8f0", lineHeight: 2 }}>
                            <div><span style={{ opacity: 0.4 }}>Resistance: </span><span style={{ color: "#c084fc" }}>R = V_nom / I_stall</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.R, 4)} Ω</span></div>
                            <div><span style={{ opacity: 0.4 }}>Torque constant: </span><span style={{ color: "#c084fc" }}>Kt = τ_stall / I_stall</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.Kt, 6)} N·m/A</span></div>
                            <div><span style={{ opacity: 0.4 }}>Back-EMF constant: </span><span style={{ color: "#c084fc" }}>Kv = ω_free / (V_nom − I_free·R)</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.Kv, 4)} rad/s/V</span></div>
                            <div><span style={{ opacity: 0.4 }}>Free speed (motor): </span><span style={{ color: "#38bdf8" }}>{fmt(motor.freeSpeed, 0)} RPM</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.freeSpeedRadS, 2)} rad/s</span></div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Physics Integration</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                            <div>Timestep: <span style={{ color: "#e2e8f0" }}>Δt = 1 ms</span> (1 kHz fixed-step Euler integration)</div>
                            <div>Position update: <span style={{ color: "#e2e8f0" }}>θ(t+Δt) = θ(t) + ω·Δt</span></div>
                            <div>Velocity update: <span style={{ color: "#e2e8f0" }}>ω(t+Δt) = ω(t) + α·Δt</span></div>
                            <div>Net torque: <span style={{ color: "#e2e8f0" }}>τ_net = τ_motor − τ_gravity·cos(θ) − τ_friction</span></div>
                            <div>Friction: <span style={{ color: "#f43f5e" }}>τ_f = τ_static·sgn(ω) + β·ω</span> (static + viscous, configurable below)</div>
                            <div>Gravity model: <span style={{ color: "#e2e8f0" }}>τ_g(θ) = τ_g_max · cos(θ)</span> — max at horizontal, zero at vertical</div>
                            <div>Soft limits: <span style={{ color: "#e2e8f0" }}>[{softLimitLow}°, {softLimitHigh}°]</span> with damped bounce</div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Assumptions & Limitations</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                            <div>Friction model: <span style={{ color: "#f43f5e" }}>static + viscous</span> — configurable via Plant Model section below</div>
                            <div>No current limiting — real motor controllers enforce supply and stator current limits</div>
                            <div>No sensor noise or quantization — real encoders have finite resolution and latency</div>
                            <div>No control loop latency — real systems have 5–20 ms loop periods, not continuous</div>
                            <div>No backlash — real gearboxes have backlash that causes limit cycles near setpoint</div>
                            <div>Gravity model is simplified — real arms have varying moment arms and payload changes</div>
                        </div>
                    </div>
                </div>

                {/* Voltage Tuning Guide */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(56,189,248,0.15)" }}>
                    <div style={{ ...S.label, color: "#38bdf8", opacity: 0.7 }}>Position PID Tuning Guide — Voltage Mode</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Start with kP only", color: "#38bdf8", lines: [
                                    "Set all gains to zero. Position control is primarily feedback-driven (unlike velocity control).",
                                    "kP output is in volts per radian of error. Start very small — try 0.5 for heavy turrets, 2.0 for light ones.",
                                    "Increase kP until the turret reaches the setpoint. It will likely oscillate — that's expected."
                                ]},
                            { step: "2", title: "Add kD to damp oscillation", color: "#fbbf24", lines: [
                                    "kD opposes velocity — it acts as a brake when approaching the setpoint.",
                                    "Start kD at ~5–10% of kP. Increase until oscillation disappears and the response is critically damped.",
                                    "Too much kD makes the system sluggish. Too little leaves overshoot and ringing."
                                ]},
                            { step: "3", title: "Add kS for static friction", color: "#10b981", lines: [
                                    "kS provides a constant voltage whenever there's a nonzero error, overcoming static friction.",
                                    "On a real turret this prevents the mechanism from 'sticking' just short of the setpoint.",
                                    "Start small — try 0.1–0.5V. Too much kS causes jittering around the setpoint."
                                ]},
                            { step: "4", title: "Handle gravity (if applicable)", color: "#c084fc", lines: [
                                    "For arms and pivots affected by gravity, you need a gravity feedforward term.",
                                    "This sim applies gravity as τ·cos(θ). In real code, add an ArmFeedforward or similar.",
                                    "Without gravity compensation, kP must work harder to hold position, causing steady-state error."
                                ]},
                            { step: "5", title: "Add motion profiling + kV/kA", color: "#60a5fa", lines: [
                                    "Simple PID sends full effort immediately, causing voltage saturation on large moves.",
                                    "Enable Trapezoid or Exponential profiling to constrain velocity and acceleration.",
                                    "With a profile active, set kV from SysId (V·s/rad) and kA (V·s²/rad) to feedforward the profile."
                                ]},
                            { step: "6", title: "Validate and iterate", color: "#10b981", lines: [
                                    "Target: rise time < 0.5s, overshoot < 5%, SS error < 1°, settle < 1s.",
                                    "Test multiple setpoints and both directions. Gravity-affected systems may behave asymmetrically.",
                                    "On real hardware, test with and without game pieces — payload changes affect MOI and gravity torque."
                                ]},
                        ].map(({ step, title, color, lines }) => (
                            <div key={step} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.015)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)", marginBottom: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 11, background: `${color}22`, color, fontSize: 11, fontWeight: 700, fontFamily: MONO, border: `1px solid ${color}44`, flexShrink: 0 }}>{step}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: SANS }}>{title}</span>
                                </div>
                                {lines.map((line, i) => <div key={i} style={{ fontSize: 11, opacity: 0.55, paddingLeft: 30 }}>{line}</div>)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Tuning Guide */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(251,191,36,0.15)" }}>
                    <div style={{ ...S.label, color: "#fbbf24", opacity: 0.7 }}>Position PID Tuning Guide — Current (Torque) Mode</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Understand the difference", color: "#fbbf24", lines: [
                                    "In current mode, you command amps (torque) instead of volts. The motor controller handles voltage internally.",
                                    "Current ∝ torque: τ = Kt · I. This gives direct torque control — very natural for position systems.",
                                    "Gains have different units: kP is now A/rad instead of V/rad. You can often be more aggressive."
                                ]},
                            { step: "2", title: "Start with kP", color: "#38bdf8", lines: [
                                    "Current mode position control is more linear than voltage mode (no back-EMF nonlinearity).",
                                    "Start kP at a higher value than you would in voltage mode — try 1.0–5.0 A/rad.",
                                    "Increase until oscillation appears, then reduce by 20–30%."
                                ]},
                            { step: "3", title: "Add kD for damping", color: "#fbbf24", lines: [
                                    "kD in current mode commands amps proportional to error rate — it resists motion.",
                                    "Start at ~5% of kP. Current mode often needs less kD because the response is more predictable.",
                                    "Watch the current chart for spikes — they indicate derivative kick on step changes."
                                ]},
                            { step: "4", title: "Gravity compensation in current mode", color: "#c084fc", lines: [
                                    "In current mode, gravity compensation is more direct: I_gravity = τ_gravity / (Kt · N · G).",
                                    "This is the current needed to exactly counterbalance gravity at any position.",
                                    "CTRE's TorqueCurrentFOC with ArmFeedforward handles this particularly well."
                                ]},
                            { step: "5", title: "Add kS and validate", color: "#10b981", lines: [
                                    "kS in current mode represents the amps needed to overcome static friction.",
                                    "Current mode often produces less overshoot, so the system may settle well with just kP + kD.",
                                    "Validate across setpoints and directions. Current mode generalizes better across operating points."
                                ]},
                        ].map(({ step, title, color, lines }) => (
                            <div key={step} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.015)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)", marginBottom: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 11, background: `${color}22`, color, fontSize: 11, fontWeight: 700, fontFamily: MONO, border: `1px solid ${color}44`, flexShrink: 0 }}>{step}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: SANS }}>{title}</span>
                                </div>
                                {lines.map((line, i) => <div key={i} style={{ fontSize: 11, opacity: 0.55, paddingLeft: 30 }}>{line}</div>)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Motion Profiling Guide */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(16,185,129,0.15)" }}>
                    <div style={{ ...S.label, color: "#10b981", opacity: 0.7 }}>Motion Profiling Guide</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Why use motion profiling?", color: "#10b981", lines: [
                                    "A step setpoint demands infinite acceleration — physically impossible and stresses the system.",
                                    "Motion profiling generates a smooth trajectory the mechanism can actually follow.",
                                    "With profiling, kV and kA feedforward become effective since the desired velocity and acceleration are known exactly."
                                ]},
                            { step: "2", title: "Set max velocity", color: "#3b82f6", lines: [
                                    "Max velocity limits the peak angular speed during the move.",
                                    `For your turret, set this to ~80% of free speed: ${fmt(maxOutputDegPerSec * 0.8, 0)} °/s.`,
                                    "Too high: the motor can't keep up, causing large tracking error. Too low: unnecessarily slow response."
                                ]},
                            { step: "3", title: "Set max acceleration", color: "#fbbf24", lines: [
                                    "This limits how fast angular velocity can change (°/s²).",
                                    "Start conservative (500–2000 °/s²) and increase based on available torque.",
                                    "Watch the effort chart — if voltage/current saturates during acceleration, the constraint is too aggressive."
                                ]},
                            { step: "4", title: "Optional: Add jerk limiting", color: "#a78bfa", lines: [
                                    "Jerk = rate of acceleration change. Jerk = 0 means infinite (pure trapezoidal).",
                                    "Adding jerk limiting creates an S-curve profile — smoother but slower.",
                                    "Good for reducing mechanical stress, vibration, and current spikes on heavy turrets."
                                ]},
                            { step: "5", title: "Tune kV and kA feedforward", color: "#60a5fa", lines: [
                                    "With profiling, the desired velocity and acceleration come directly from the profile.",
                                    "kV should produce the voltage/current to maintain the profiled velocity. kA produces the effort for the profiled acceleration.",
                                    "Good feedforward means kP can be lower — less aggressive feedback needed for the same tracking performance."
                                ]},
                            { step: "6", title: "Validate tracking performance", color: "#10b981", lines: [
                                    "Watch the position chart — actual should closely follow the profile (green dashed line).",
                                    "Large gaps mean feedforward is wrong or motion constraints are too aggressive.",
                                    "Small steady-state error is normal and corrected by kP feedback."
                                ]},
                        ].map(({ step, title, color, lines }) => (
                            <div key={step} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.015)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)", marginBottom: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 11, background: `${color}22`, color, fontSize: 11, fontWeight: 700, fontFamily: MONO, border: `1px solid ${color}44`, flexShrink: 0 }}>{step}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: SANS }}>{title}</span>
                                </div>
                                {lines.map((line, i) => <div key={i} style={{ fontSize: 11, opacity: 0.55, paddingLeft: 30 }}>{line}</div>)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Physics Reference */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={S.label}>Position Control Physics Reference</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, fontSize: 12, opacity: 0.6, fontFamily: MONO }}>
                        <div>τ_motor = Kt · I_motor · N · G</div>
                        <div>τ_net = τ_motor − τ_gravity · cos(θ) − τ_friction</div>
                        <div>τ_friction = τ_static·sgn(ω) + β·ω</div>
                        <div>α = τ_net / J (angular acceleration)</div>
                        <div>ω = ∫ α dt (angular velocity)</div>
                        <div>θ = ∫ ω dt (angular position)</div>
                        <div>V = I·R + ω/Kv (back-EMF model)</div>
                    </div>
                </div>

                {/* Simulated Plant Model */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(244,63,94,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ ...S.label, color: "#f43f5e", opacity: 0.8, marginBottom: 0 }}>Simulated Plant Model</div>
                        <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => setPlantMode("physical")} style={S.btnColor(plantMode === "physical", "#f43f5e")}>Physical</button>
                            <button onClick={() => setPlantMode("feedforward")} style={S.btnColor(plantMode === "feedforward", "#f43f5e")}>Feedforward Constants</button>
                        </div>
                    </div>

                    <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.5, marginBottom: 16, lineHeight: 1.6 }}>
                        {plantMode === "physical"
                            ? "Plant dynamics derived from motor specs, gearing, and MOI configured above. Friction parameters below add realism."
                            : "Plant dynamics defined by feedforward constants (like from SysId). Useful for testing gains against a characterized system."
                        }
                    </div>

                    {plantMode === "physical" ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Static Friction (plant kS)</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={plantKs} min={0} step={0.01} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPlantKs(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 80, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V" : "A"}</span>
                                </div>
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Effort needed to overcome static friction</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Viscous Friction</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={viscousFriction} min={0} step={0.0001} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setViscousFriction(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>N·m/(rad/s)</span>
                                </div>
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Friction proportional to velocity</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Plant kS</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={plantKs} min={0} step={0.01} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPlantKs(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 80, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V" : "A"}</span>
                                </div>
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Static friction constant</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Plant kV</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={plantKv} min={0} step={0.0001} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPlantKv(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V/(rad/s)" : "A/(rad/s)"}</span>
                                </div>
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Velocity constant (from SysId)</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Plant kA</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={plantKa} min={0} step={0.0001} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPlantKa(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V/(rad/s²)" : "A/(rad/s²)"}</span>
                                </div>
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Acceleration constant (from SysId)</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Viscous Friction</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={viscousFriction} min={0} step={0.0001} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setViscousFriction(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>N·m/(rad/s)</span>
                                </div>
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Additional viscous drag</div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(244,63,94,0.04)", borderRadius: 6, border: "1px solid rgba(244,63,94,0.1)" }}>
                        <div style={{ fontSize: 10, opacity: 0.5, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Friction Model</div>
                        <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.6, lineHeight: 1.8 }}>
                            <div>τ_friction = <span style={{ color: "#f43f5e" }}>τ_static·sgn(ω)</span> + <span style={{ color: "#f43f5e" }}>β·ω</span></div>
                            <div style={{ opacity: 0.5, marginTop: 4 }}>
                                τ_static derived from plant kS: {controlMode === "voltage" ? "τ = Kt·N·G·(kS/R)" : "τ = Kt·G·kS"} &nbsp;|&nbsp; β = viscous friction coefficient
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer style={{ padding: "16px 24px", textAlign: "center" }}>
                <span style={{ fontSize: 12, opacity: 0.2, fontFamily: MONO }}>Turret Position Tuning Simulator — FRC Mechanism Control</span>
            </footer>
        </div>
    );
}