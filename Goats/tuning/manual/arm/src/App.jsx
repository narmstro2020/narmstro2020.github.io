import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ─── Physics ─────────────────────────────────────────────────────────────────
const DT = 0.001; // 1ms sim step
const NOMINAL_V = 12;
const GRAVITY = 9.81; // m/s²

function clampVoltage(v) { return Math.max(-NOMINAL_V, Math.min(NOMINAL_V, v)); }
function clampCurrent(c, stallCurrent) { return Math.max(-stallCurrent, Math.min(stallCurrent, c)); }
function degToRad(deg) { return deg * Math.PI / 180; }
function radToDeg(rad) { return rad * 180 / Math.PI; }

function motorConstants(motor) {
    const freeSpeedRadS = (motor.freeSpeed * 2 * Math.PI) / 60;
    const Kt = motor.stallTorque / motor.stallCurrent;
    const R = NOMINAL_V / motor.stallCurrent;
    const Kv = freeSpeedRadS / (NOMINAL_V - motor.freeCurrent * R);
    return { Kt, R, Kv, freeSpeedRadS };
}

// ─── Trapezoid Profile Generator (with optional jerk limiting / S-curve) ─────
function generateTrapezoidProfile(distanceRad, maxVelRadS, maxAccelRadSS, maxJerkRadSSS, durationS) {
    const steps = Math.ceil(durationS / DT);
    const sign = distanceRad >= 0 ? 1 : -1;
    const dist = Math.abs(distanceRad);

    if (dist < 0.0001) {
        const profile = [];
        for (let i = 0; i <= steps; i++) profile.push({ t: i * DT, position: 0, velocity: 0, acceleration: 0 });
        return profile;
    }

    const useJerk = maxJerkRadSSS > 0;

    if (useJerk) {
        const profile = [];
        let pos = 0, vel = 0, accel = 0;
        const targetVel = maxVelRadS, ma = maxAccelRadSS, mj = maxJerkRadSSS;
        let phase = "accel";

        for (let i = 0; i <= steps; i++) {
            const t = i * DT;
            const remaining = dist - pos;
            const decelDist = vel > 0 ? (vel * vel) / (2 * ma) + vel * (ma / mj) * 0.5 : 0;

            if (phase === "accel") {
                if (remaining <= decelDist + 0.001 && vel > 0) { phase = "decel"; }
                else if (vel >= targetVel - 0.001) { phase = "cruise"; accel = 0; }
                else {
                    const accelStopV = accel > 0 ? (accel * accel) / (2 * mj) : 0;
                    const remainV = targetVel - vel;
                    if (remainV <= accelStopV + 0.001) accel = Math.max(0, accel - mj * DT);
                    else accel = Math.min(ma, accel + mj * DT);
                }
            }
            if (phase === "cruise") { accel = 0; if (remaining <= decelDist + 0.001) phase = "decel"; }
            if (phase === "decel") { accel = Math.max(-ma, accel - mj * DT); if (vel <= 0.001 && remaining < 0.001) { phase = "done"; vel = 0; accel = 0; } }
            if (phase === "done") { vel = 0; accel = 0; pos = dist; }

            profile.push({ t, position: sign * Math.min(pos, dist), velocity: sign * vel, acceleration: sign * accel });
            if (phase !== "done") { vel += accel * DT; if (vel < 0) vel = 0; if (vel > targetVel) vel = targetVel; pos += vel * DT; if (pos > dist) pos = dist; }
        }
        return profile;
    }

    // Pure trapezoidal
    const mv = maxVelRadS, ma = maxAccelRadSS;
    const tAccel = mv / ma, dAccel = 0.5 * ma * tAccel * tAccel;
    let tCruise, tTotal;
    if (2 * dAccel >= dist) { const tPeak = Math.sqrt(dist / ma); tCruise = 0; tTotal = 2 * tPeak; }
    else { const dCruise = dist - 2 * dAccel; tCruise = dCruise / mv; tTotal = 2 * tAccel + tCruise; }
    const tPeakActual = 2 * dAccel >= dist ? Math.sqrt(dist / ma) : tAccel;
    const peakVel = 2 * dAccel >= dist ? ma * tPeakActual : mv;
    const t1 = tPeakActual, t2 = t1 + tCruise, t3 = tTotal;

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
function generateExponentialProfile(distanceRad, profileKv, profileKa, maxInput, durationS) {
    const steps = Math.ceil(durationS / DT);
    const sign = distanceRad >= 0 ? 1 : -1;
    const dist = Math.abs(distanceRad);
    if (profileKv <= 0 || profileKa <= 0) {
        const profile = [];
        for (let i = 0; i <= steps; i++) profile.push({ t: i * DT, position: sign * Math.min(dist, dist * (i * DT) / Math.max(durationS, 0.001)), velocity: 0, acceleration: 0 });
        return profile;
    }
    const tau = profileKa / profileKv, vMax = maxInput / profileKv;
    const profile = [];
    let pos = 0, vel = 0, phase = "accel";
    for (let i = 0; i <= steps; i++) {
        const t = i * DT;
        let accel;
        if (pos >= dist || phase === "done") { profile.push({ t, position: sign * dist, velocity: 0, acceleration: 0 }); continue; }
        const decelDist = vel * tau;
        if (phase === "accel") { accel = (vMax - vel) / tau; if (dist - pos <= decelDist + 0.0001 && vel > 0.001) phase = "decel"; }
        if (phase === "decel") { accel = -vel / tau; if (vel < 0.001) { vel = 0; accel = 0; phase = "done"; } }
        profile.push({ t, position: sign * Math.min(pos, dist), velocity: sign * vel, acceleration: sign * accel });
        vel += accel * DT; if (vel < 0) vel = 0; pos += vel * DT; if (pos > dist) pos = dist;
    }
    return profile;
}

function simulateArm({
                         motor, numMotors, gearing, moi, armLength, armMass, cgRatio, ks, kv, ka, kg, kp, kd,
                         setpointDeg, controlMode, durationS = 5, startDeg = 0,
                         profileMode = "none", maxVelDegS = 360, maxAccelDegSS = 720, maxJerkDegSSS = 0,
                         profileKv = 0, profileKa = 0, ksSignSource = "error",
                         plantMode = "physical", plantKs = 0, plantKv = 0, plantKa = 0, viscousFriction = 0,
                         softLimitLowDeg = -90, softLimitHighDeg = 180
                     }) {
    const mc = motorConstants(motor);
    const setpointRad = degToRad(setpointDeg);
    const startRad = degToRad(startDeg);
    const softLimitLowRad = degToRad(softLimitLowDeg);
    const softLimitHighRad = degToRad(softLimitHighDeg);

    const cgDistance = armLength * cgRatio;
    let armMOI, totalKt, effectiveR, effectiveKv;

    if (plantMode === "physical") {
        armMOI = moi > 0 ? moi : armMass * cgDistance * cgDistance;
        totalKt = mc.Kt * numMotors * gearing;
        effectiveR = mc.R / numMotors;
        effectiveKv = mc.Kv;
    } else {
        armMOI = plantKv > 0 ? plantKa / plantKv : (moi > 0 ? moi : armMass * cgDistance * cgDistance);
        totalKt = mc.Kt * numMotors * gearing;
        effectiveR = mc.R / numMotors;
        effectiveKv = mc.Kv;
    }

    // Static friction torque from plantKs
    const staticFrictionTorque = controlMode === "voltage"
        ? (plantKs * totalKt) / (effectiveR * numMotors)
        : plantKs * totalKt / numMotors;

    const steps = Math.ceil(durationS / DT);
    const record = Math.max(1, Math.floor(steps / 2000));
    const history = [];

    // Generate motion profile if needed
    const moveDistRad = setpointRad - startRad;
    let profile = null;
    if (profileMode === "trapezoid") {
        const maxVelRadS = degToRad(maxVelDegS);
        const maxAccelRadSS = degToRad(maxAccelDegSS);
        const maxJerkRadSSS = degToRad(maxJerkDegSSS);
        profile = generateTrapezoidProfile(moveDistRad, maxVelRadS, maxAccelRadSS, maxJerkRadSSS, durationS);
    } else if (profileMode === "exponential") {
        const maxInput = controlMode === "voltage" ? NOMINAL_V : motor.stallCurrent * numMotors;
        const effMaxInput = Math.max(0.01, maxInput - Math.abs(ks) - Math.abs(kg));
        profile = generateExponentialProfile(moveDistRad, profileKv, profileKa, effMaxInput, durationS);
    }

    let theta = startRad, omega = 0, prevError = setpointRad - startRad;
    let appliedVolts = 0, appliedCurrent = 0, motorCurrent = 0;

    for (let i = 0; i <= steps; i++) {
        const t = i * DT;

        // Profile-based setpoint
        let currentSetpointRad, desiredVelRadS, desiredAccelRadSS;
        if (profile && i < profile.length) {
            currentSetpointRad = startRad + profile[i].position;
            desiredVelRadS = profile[i].velocity;
            desiredAccelRadSS = profile[i].acceleration;
        } else if (profile) {
            currentSetpointRad = setpointRad;
            desiredVelRadS = 0; desiredAccelRadSS = 0;
        } else {
            currentSetpointRad = setpointRad;
            desiredVelRadS = 0; desiredAccelRadSS = 0;
        }

        const error = currentSetpointRad - theta;

        // Gravity torque: τ_gravity = m * g * r_cg * cos(θ)
        const gravityTorque = armMass * GRAVITY * cgDistance * Math.cos(theta);

        // kS sign source
        let ksSign;
        if (ksSignSource === "velocity") {
            ksSign = omega === 0 ? 0 : Math.sign(omega);
        } else if (ksSignSource === "closedloop") {
            const tempFbP = kp * error;
            const tempFbD = kd * (-omega);
            const clOutput = tempFbP + tempFbD;
            ksSign = clOutput === 0 ? 0 : Math.sign(clOutput);
        } else {
            ksSign = error === 0 ? 0 : Math.sign(error);
        }

        // Feedforward
        const ffKs = ks * ksSign;
        const ffKg = kg * Math.cos(theta);
        const ffKv = kv * desiredVelRadS;
        const ffKa = ka * desiredAccelRadSS;

        // Feedback (derivative on measurement to avoid kick)
        const fbP = kp * error;
        const fbD = kd * (-omega);

        // Friction model
        let frictionTorque = 0;
        if (Math.abs(omega) < 0.01) {
            frictionTorque = staticFrictionTorque * (omega === 0 ? 0 : Math.sign(omega));
        } else {
            frictionTorque = staticFrictionTorque * Math.sign(omega) + viscousFriction * omega;
        }

        if (controlMode === "voltage") {
            const rawV = ffKs + ffKv + ffKa + ffKg + fbP + fbD;
            appliedVolts = clampVoltage(rawV);
            const backEmf = omega * gearing / effectiveKv;
            motorCurrent = numMotors > 0 ? (appliedVolts - backEmf) / effectiveR : 0;
            const motorTorque = totalKt * (motorCurrent / numMotors);
            const netTorque = motorTorque - gravityTorque - frictionTorque;
            const alpha = armMOI > 0 ? netTorque / armMOI : 0;
            omega += alpha * DT;
            theta += omega * DT;
            appliedCurrent = motorCurrent;
        } else {
            const rawI = ffKs + ffKv + ffKa + ffKg + fbP + fbD;
            appliedCurrent = clampCurrent(rawI, motor.stallCurrent * numMotors);
            motorCurrent = appliedCurrent;
            const motorTorque = totalKt * (motorCurrent / numMotors);
            const netTorque = motorTorque - gravityTorque - frictionTorque;
            const alpha = armMOI > 0 ? netTorque / armMOI : 0;
            omega += alpha * DT;
            theta += omega * DT;
            const backEmf = omega * gearing / effectiveKv;
            appliedVolts = backEmf + motorCurrent * effectiveR / numMotors;
        }

        // Soft limits with damped bounce
        if (theta < softLimitLowRad) { theta = softLimitLowRad; omega = Math.abs(omega) * 0.1; }
        if (theta > softLimitHighRad) { theta = softLimitHighRad; omega = -Math.abs(omega) * 0.1; }

        prevError = error;

        if (i % record === 0) {
            const profilePt = profile && i < profile.length ? profile[i] : null;
            history.push({
                t, theta, thetaDeg: radToDeg(theta), omega, omegaDegS: radToDeg(omega),
                setpointDeg, setpointRad,
                profilePositionDeg: profilePt ? radToDeg(startRad + profilePt.position) : setpointDeg,
                profileVelocityDegS: profilePt ? radToDeg(profilePt.velocity) : 0,
                profileAccelDegSS: profilePt ? radToDeg(profilePt.acceleration) : 0,
                voltage: appliedVolts, current: appliedCurrent,
                error, errorDeg: radToDeg(error), gravityTorque,
            });
        }
    }

    const finalDeg = history[history.length - 1].thetaDeg;
    const steadyStateError = Math.abs(setpointDeg - finalDeg);
    let riseTime = null, settleTime = null, overshoot = 0;
    let maxDeg = startDeg, minDeg = startDeg;
    const direction = setpointDeg >= startDeg ? 1 : -1;

    for (const pt of history) {
        if (pt.thetaDeg > maxDeg) maxDeg = pt.thetaDeg;
        if (pt.thetaDeg < minDeg) minDeg = pt.thetaDeg;
        if (riseTime === null) {
            const progress = direction > 0
                ? (pt.thetaDeg - startDeg) / (setpointDeg - startDeg)
                : (startDeg - pt.thetaDeg) / (startDeg - setpointDeg);
            if (progress >= 0.9 && setpointDeg !== startDeg) riseTime = pt.t;
        }
    }

    if (setpointDeg !== startDeg) {
        const range = Math.abs(setpointDeg - startDeg);
        const peak = direction > 0 ? maxDeg : minDeg;
        const overshootAmount = direction > 0 ? peak - setpointDeg : setpointDeg - peak;
        overshoot = range > 0 ? (overshootAmount / range) * 100 : 0;
        if (overshoot < 0) overshoot = 0;
    }

    for (let i = history.length - 1; i >= 0; i--) {
        const errorPct = Math.abs(history[i].thetaDeg - setpointDeg) / Math.max(Math.abs(setpointDeg - startDeg), 1);
        if (errorPct > 0.02) { settleTime = history[Math.min(i + 1, history.length - 1)].t; break; }
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
    { label: "Custom", value: null }, { label: "25:1", value: 25 }, { label: "36:1", value: 36 },
    { label: "49:1", value: 49 }, { label: "64:1", value: 64 }, { label: "81:1", value: 81 },
    { label: "100:1", value: 100 }, { label: "125:1", value: 125 }, { label: "144:1", value: 144 },
    { label: "196:1", value: 196 }, { label: "225:1", value: 225 }, { label: "256:1", value: 256 },
];

const ARM_PRESETS = [
    { id: "custom", label: "Custom", moi: 0, armLength: 0.5, armMass: 3, cgRatio: 0.5, motorId: "krakenX60FOC", numMotors: 1, gearing: 100 },
    { id: "lightIntake", label: "Light Intake Arm", moi: 0, armLength: 0.3, armMass: 1.5, cgRatio: 0.4, motorId: "neo550", numMotors: 1, gearing: 64 },
    { id: "mediumArm", label: "Medium Arm", moi: 0, armLength: 0.5, armMass: 3, cgRatio: 0.45, motorId: "krakenX60FOC", numMotors: 1, gearing: 100 },
    { id: "heavyArm", label: "Heavy Arm", moi: 0, armLength: 0.7, armMass: 5, cgRatio: 0.5, motorId: "krakenX60FOC", numMotors: 2, gearing: 144 },
    { id: "climberArm", label: "Climber Arm", moi: 0, armLength: 0.6, armMass: 8, cgRatio: 0.6, motorId: "falcon500FOC", numMotors: 2, gearing: 196 },
    { id: "wrist", label: "Wrist / End Effector", moi: 0, armLength: 0.15, armMass: 0.8, cgRatio: 0.5, motorId: "neo550", numMotors: 1, gearing: 36 },
];

const SETPOINT_PRESETS = [
    { label: "0°", value: 0 }, { label: "30°", value: 30 }, { label: "45°", value: 45 },
    { label: "60°", value: 60 }, { label: "90°", value: 90 }, { label: "120°", value: 120 },
];

const START_PRESETS = [
    { label: "-45°", value: -45 }, { label: "0°", value: 0 }, { label: "45°", value: 45 }, { label: "90°", value: 90 },
];

// ─── Shared constants & styles ───────────────────────────────────────────────
const MONO = "'JetBrains Mono', monospace";
const SANS = "'Space Grotesk', sans-serif";
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
    btn: (a) => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.04)", color: a ? "#22c55e" : "rgba(255,255,255,0.5)", border: a ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.06)", transition: "all 0.15s ease" }),
    btnColor: (a, color) => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? `${color}22` : "rgba(255,255,255,0.04)", color: a ? color : "rgba(255,255,255,0.5)", border: a ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.06)", transition: "all 0.15s ease" }),
};

function NumInput({ label, value, onChange, unit, inputStyle, step, min, max }) {
    return (<div style={{ display: "flex", flexDirection: label ? "column" : "row", gap: 4, alignItems: label ? "flex-start" : "center" }}>
        {label && <label style={S.fieldLabel}>{label}</label>}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={value} step={step} min={min} max={max} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }} style={{ ...S.input, ...inputStyle }} />{unit && <span style={S.unit}>{unit}</span>}</div>
    </div>);
}

function GainInput({ label, value, onChange, step = 0.001, color = "#22c55e" }) {
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
function PositionChart({ history, setpointDeg, startDeg, profileMode }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 280, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;

        const maxT = history[history.length - 1].t;
        let yMax = Math.max(setpointDeg, startDeg) + 20;
        let yMin = Math.min(setpointDeg, startDeg) - 20;
        for (const pt of history) {
            if (pt.thetaDeg > yMax - 10) yMax = pt.thetaDeg + 20;
            if (pt.thetaDeg < yMin + 10) yMin = pt.thetaDeg - 20;
        }

        drawGrid(ctx, pad, pw, ph, 5, 5);

        // setpoint line
        const spY = pad.t + ph * (1 - (setpointDeg - yMin) / (yMax - yMin));
        ctx.strokeStyle = "rgba(34,197,94,0.4)"; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(pad.l, spY); ctx.lineTo(pad.l + pw, spY); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(34,197,94,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "right";
        ctx.fillText(`Setpoint: ${setpointDeg}°`, pad.l + pw - 4, spY - 6);

        // 2% band
        const range = Math.abs(setpointDeg - startDeg) || 10;
        const bandHi = setpointDeg + range * 0.02, bandLo = setpointDeg - range * 0.02;
        const bhY = pad.t + ph * (1 - (bandHi - yMin) / (yMax - yMin));
        const blY = pad.t + ph * (1 - (bandLo - yMin) / (yMax - yMin));
        ctx.fillStyle = "rgba(34,197,94,0.04)"; ctx.fillRect(pad.l, bhY, pw, blY - bhY);

        // profile reference line
        if (profileMode !== "none" && history[0].profilePositionDeg !== undefined) {
            ctx.strokeStyle = "rgba(34,197,94,0.6)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath();
            history.forEach((pt, i) => {
                const x = pad.l + (pt.t / maxT) * pw;
                const y = pad.t + ph * (1 - (pt.profilePositionDeg - yMin) / (yMax - yMin));
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }); ctx.stroke(); ctx.setLineDash([]);
        }

        // position curve
        ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2.5; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.thetaDeg - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        // title + legend
        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("POSITION RESPONSE", pad.l, pad.t - 10);
        if (profileMode !== "none") { ctx.fillStyle = "rgba(34,197,94,0.6)"; ctx.font = `9px ${MONO}`; ctx.fillText("--- profile", pad.l + 170, pad.t - 10); }

        // axes
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(yMax - (i / 5) * (yMax - yMin), 0) + "°", pad.l - 8, pad.t + (i / 5) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Position (degrees)", 0, 0); ctx.restore();
    }, [history, setpointDeg, startDeg, profileMode]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Voltage / Current Chart ────────────────────────────────────────────────
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

        // zero line
        if (yMin < 0 && yMax > 0) {
            const zy = pad.t + ph * (1 - (0 - yMin) / (yMax - yMin));
            ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();
        }

        // effort curve
        const effortColor = isVoltage ? "#a855f7" : "#eab308";
        ctx.strokeStyle = effortColor; ctx.lineWidth = 2; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const val = isVoltage ? pt.voltage : pt.current;
            const y = pad.t + ph * (1 - (val - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        // axes
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

        ctx.strokeStyle = "#f43f5e"; ctx.lineWidth = 2; ctx.beginPath();
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

// ─── Velocity Chart ─────────────────────────────────────────────────────────
function VelocityChart({ history }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 200, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;

        const maxT = history[history.length - 1].t;
        let yMax = -Infinity, yMin = Infinity;
        for (const pt of history) { if (pt.omegaDegS > yMax) yMax = pt.omegaDegS; if (pt.omegaDegS < yMin) yMin = pt.omegaDegS; }
        const range = yMax - yMin;
        if (range < 10) { yMax += 10; yMin -= 10; } else { yMax += range * 0.1; yMin -= range * 0.1; }

        drawGrid(ctx, pad, pw, ph, 5, 4);

        if (yMin < 0 && yMax > 0) {
            const zy = pad.t + ph * (1 - (0 - yMin) / (yMax - yMin));
            ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();
        }

        ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 2; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.omegaDegS - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 4; i++) ctx.fillText(fmt(yMax - (i / 4) * (yMax - yMin), 0), pad.l - 8, pad.t + (i / 4) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Velocity (°/s)", 0, 0); ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("ARM VELOCITY", pad.l, pad.t - 10);
    }, [history]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Arm Visualization ──────────────────────────────────────────────────────
function ArmViz({ currentDeg, setpointDeg, armLength }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    const angleRef = useRef(degToRad(currentDeg));
    const animRef = useRef(null);
    const targetRef = useRef(degToRad(currentDeg));
    targetRef.current = degToRad(currentDeg);

    useEffect(() => {
        const c = canvasRef.current, ct = containerRef.current;
        if (!c || !ct) return;
        let lastTime = performance.now();

        function animate(now) {
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            // Smooth interpolation to target
            const diff = targetRef.current - angleRef.current;
            angleRef.current += diff * Math.min(1, dt * 10);

            const d = window.devicePixelRatio || 1;
            const w = ct.clientWidth, h = 200;
            c.width = w * d; c.height = h * d;
            c.style.width = w + "px"; c.style.height = h + "px";
            const ctx = c.getContext("2d");
            ctx.scale(d, d);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h - 30;
            const armPx = Math.min(120, (armLength / 0.7) * 100); // Scale arm length

            // Reference lines
            ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
            // Horizontal reference (0°)
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + armPx + 20, cy); ctx.stroke();
            // Vertical reference (90°)
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - armPx - 20); ctx.stroke();

            // Angle arc for reference
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.beginPath(); ctx.arc(cx, cy, 30, 0, -Math.PI / 2, true); ctx.stroke();

            // Setpoint ghost arm
            const spRad = -degToRad(setpointDeg); // Negative because canvas Y is inverted
            const spX = cx + armPx * Math.cos(spRad);
            const spY = cy + armPx * Math.sin(spRad);
            ctx.strokeStyle = "rgba(34,197,94,0.2)"; ctx.lineWidth = 8; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(spX, spY); ctx.stroke();

            // Current arm
            const armRad = -angleRef.current; // Negative because canvas Y is inverted
            const armX = cx + armPx * Math.cos(armRad);
            const armY = cy + armPx * Math.sin(armRad);

            // Arm shadow
            ctx.strokeStyle = "rgba(59,130,246,0.15)"; ctx.lineWidth = 12;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(armX, armY); ctx.stroke();

            // Main arm
            ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(armX, armY); ctx.stroke();

            // Pivot point
            ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#22c55e"; ctx.fill();
            ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#0c0e14"; ctx.fill();

            // End effector
            ctx.beginPath(); ctx.arc(armX, armY, 6, 0, Math.PI * 2);
            ctx.fillStyle = "#3b82f6"; ctx.fill();

            // Gravity indicator
            const gravArrowLen = 25;
            const gravX = armX;
            const gravY = armY + gravArrowLen;
            ctx.strokeStyle = "rgba(234,179,8,0.5)"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(armX, armY + 10); ctx.lineTo(gravX, gravY); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(gravX - 4, gravY - 6); ctx.lineTo(gravX, gravY); ctx.lineTo(gravX + 4, gravY - 6);
            ctx.stroke();

            // Text
            ctx.fillStyle = "#e2e8f0"; ctx.font = `bold 16px ${MONO}`; ctx.textAlign = "center"; ctx.lineCap = "butt";
            ctx.fillText(`${fmt(radToDeg(angleRef.current), 1)}°`, cx, 24);
            ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = `10px ${MONO}`;
            ctx.fillText(`target: ${setpointDeg}°`, cx, 40);

            // Labels
            ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = `9px ${MONO}`;
            ctx.textAlign = "left"; ctx.fillText("0°", cx + armPx + 8, cy + 4);
            ctx.textAlign = "center"; ctx.fillText("90°", cx, cy - armPx - 10);

            animRef.current = requestAnimationFrame(animate);
        }
        animRef.current = requestAnimationFrame(animate);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [setpointDeg, armLength]);

    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Metric Card ────────────────────────────────────────────────────────────
function MetricCard({ label, value, unit, color = "#e2e8f0", warn }) {
    return (
        <div style={{ padding: "10px 14px", background: warn ? "rgba(234,179,8,0.06)" : "rgba(255,255,255,0.02)", border: warn ? "1px solid rgba(234,179,8,0.15)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 6 }}>
            <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: MONO, color }}>{value}</span>
                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>{unit}</span>
            </div>
        </div>
    );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function ArmTunerApp() {
    const [presetId, setPresetId] = useState("mediumArm");
    const [motorId, setMotorId] = useState("krakenX60FOC");
    const [numMotors, setNumMotors] = useState(1);
    const [gearingPreset, setGearingPreset] = useState(100);
    const [gearing, setGearing] = useState(100);
    const [moi, setMoi] = useState(0);
    const [armLength, setArmLength] = useState(0.5);
    const [armMass, setArmMass] = useState(3);
    const [cgRatio, setCgRatio] = useState(0.45);
    const [controlMode, setControlMode] = useState("voltage");
    const [setpointDeg, setSetpointDeg] = useState(90);
    const [startDeg, setStartDeg] = useState(0);
    const [duration, setDuration] = useState(3);
    const [softLimitLowDeg, setSoftLimitLowDeg] = useState(-90);
    const [softLimitHighDeg, setSoftLimitHighDeg] = useState(180);

    // gains
    const [ks, setKs] = useState(0);
    const [kv, setKv] = useState(0);
    const [ka, setKa] = useState(0);
    const [kg, setKg] = useState(0);
    const [kp, setKp] = useState(0);
    const [kd, setKd] = useState(0);

    // Motion profile
    const [profileMode, setProfileMode] = useState("none");
    const [maxVelDegS, setMaxVelDegS] = useState(360);
    const [maxAccelDegSS, setMaxAccelDegSS] = useState(720);
    const [maxJerkDegSSS, setMaxJerkDegSSS] = useState(0);
    const [profileKv, setProfileKv] = useState(0.12);
    const [profileKa, setProfileKa] = useState(0.01);

    // kS sign source
    const [ksSignSource, setKsSignSource] = useState("error");

    // Plant model
    const [plantMode, setPlantMode] = useState("physical");
    const [plantKs, setPlantKs] = useState(0);
    const [plantKv, setPlantKv] = useState(0);
    const [plantKa, setPlantKa] = useState(0);
    const [viscousFriction, setViscousFriction] = useState(0);

    const [activeTab, setActiveTab] = useState("position");

    const motor = DC_MOTORS.find(m => m.id === motorId);
    const mc = useMemo(() => motorConstants(motor), [motor]);

    const applyPreset = useCallback((id) => {
        setPresetId(id);
        if (id !== "custom") {
            const p = ARM_PRESETS.find(pr => pr.id === id);
            if (p) {
                setMoi(p.moi);
                setArmLength(p.armLength);
                setArmMass(p.armMass);
                setCgRatio(p.cgRatio);
                setMotorId(p.motorId);
                setNumMotors(p.numMotors);
                setGearing(p.gearing);
                setGearingPreset(p.gearing);
            }
        }
    }, []);

    const setCustom = (setter) => (v) => { setter(v); setPresetId("custom"); };

    // Compute theoretical kG for gravity compensation
    // kG = (m * g * r_cg) / (Kt * N * G) for voltage mode
    // At θ=0 (horizontal), full gravity compensation needed
    const cgDistance = armLength * cgRatio;
    const effectiveMOI = moi > 0 ? moi : armMass * cgDistance * cgDistance;

    const theoreticalKg = useMemo(() => {
        const totalKt = mc.Kt * numMotors * gearing;
        if (totalKt === 0) return 0;
        // τ_gravity_max = m * g * r_cg (at horizontal)
        // V = τ / (Kt * N * G) * R... but simpler: we want V such that τ_motor = τ_gravity
        // For voltage mode: kG should output voltage that produces torque = m*g*r_cg at cos(θ)=1
        const maxGravityTorque = armMass * GRAVITY * cgDistance;
        const effectiveR = mc.R / numMotors;
        // I needed = τ / (Kt * N * G), then V = I * R (ignoring back-EMF at hold)
        const holdCurrent = maxGravityTorque / totalKt * numMotors;
        return holdCurrent * effectiveR;
    }, [mc, numMotors, gearing, armMass, cgDistance]);

    const theoreticalKs = useMemo(() => {
        return mc.R * motor.freeCurrent;
    }, [mc, motor]);

    const simResult = useMemo(() => {
        return simulateArm({
            motor, numMotors, gearing, moi, armLength, armMass, cgRatio,
            ks, kv, ka, kg, kp, kd, setpointDeg, controlMode, durationS: duration, startDeg,
            profileMode, maxVelDegS, maxAccelDegSS, maxJerkDegSSS,
            profileKv, profileKa, ksSignSource,
            plantMode, plantKs, plantKv, plantKa, viscousFriction,
            softLimitLowDeg, softLimitHighDeg,
        });
    }, [motor, numMotors, gearing, moi, armLength, armMass, cgRatio, ks, kv, ka, kg, kp, kd, setpointDeg, controlMode, duration, startDeg, profileMode, maxVelDegS, maxAccelDegSS, maxJerkDegSSS, profileKv, profileKa, ksSignSource, plantMode, plantKs, plantKv, plantKa, viscousFriction, softLimitLowDeg, softLimitHighDeg]);

    const finalDeg = simResult.history.length > 0 ? simResult.history[simResult.history.length - 1].thetaDeg : startDeg;

    // response quality
    const ssErr = simResult.steadyStateError;
    const range = Math.abs(setpointDeg - startDeg) || 1;
    const ssColor = ssErr < range * 0.01 ? "#10b981" : ssErr < range * 0.05 ? "#eab308" : "#f43f5e";
    const osColor = simResult.overshoot < 2 ? "#10b981" : simResult.overshoot < 10 ? "#eab308" : "#f43f5e";

    const motorOutput = useMemo(() => {
        const totalStallTorque = motor.stallTorque * numMotors * gearing;
        const outputFreeSpeed = motor.freeSpeed / gearing;
        const totalStallCurrent = motor.stallCurrent * numMotors;
        return { totalStallTorque, outputFreeSpeed, totalStallCurrent };
    }, [motor, numMotors, gearing]);

    const maxGravityTorque = armMass * GRAVITY * cgDistance;
    const torqueMargin = motorOutput.totalStallTorque > 0 ? (motorOutput.totalStallTorque / maxGravityTorque) : 0;
    const maxOutputDegPerSec = motorOutput.outputFreeSpeed * 6; // RPM to deg/s

    const TABS = [
        { id: "position", label: "Position" },
        { id: "velocity", label: "Velocity" },
        { id: "effort", label: controlMode === "voltage" ? "Voltage" : "Current" },
        { id: "error", label: "Error" },
    ];

    const autoTuneFF = useCallback(() => {
        setKs(parseFloat(theoreticalKs.toFixed(4)));
        setKg(parseFloat(theoreticalKg.toFixed(4)));
        setKv(0);
        setKa(0);
    }, [theoreticalKs, theoreticalKg]);

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0c0e14 0%, #111420 50%, #0c0e14 100%)", color: "#c8ced8", fontFamily: SANS }}>
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <header style={{ padding: "24px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}><h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: "#22c55e", margin: 0 }}>ArmTuner</h1><span style={{ fontSize: 12, opacity: 0.3, fontFamily: MONO }}>Position PID Simulator</span></div>
                <p style={{ fontSize: 12, opacity: 0.3, marginTop: 4 }}>FRC arm feedforward + feedback tuning sandbox with gravity compensation</p>
            </header>

            <div style={{ padding: "20px 24px" }}>
                {/* Preset & Control Mode */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Preset</span>
                        <select value={presetId} onChange={e => applyPreset(e.target.value)} style={S.select}>
                            {ARM_PRESETS.map(p => <option key={p.id} value={p.id} style={{ background: "#1a1d2e" }}>{p.label}</option>)}
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
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Gear Ratio</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><select value={gearingPreset === null ? "" : gearingPreset} onChange={e => { const v = e.target.value; if (v === "") setGearingPreset(null); else { setGearingPreset(parseFloat(v)); setGearing(parseFloat(v)); setPresetId("custom"); } }} style={{ ...S.select, width: 88 }}>{COMMON_GEARINGS.map(g => <option key={g.label} value={g.value === null ? "" : g.value} style={{ background: "#1a1d2e" }}>{g.label}</option>)}</select><input type="number" value={parseFloat(gearing.toFixed(2))} min={1} step={1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) { setGearing(v); setGearingPreset(null); setPresetId("custom"); } }} style={{ ...S.inputSmall, width: 64 }} /><span style={S.unit}>:1</span></div></div>
                    </div>

                    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>Per Motor</span>
                            <MotorSpecBar label="Stall τ" value={motor.stallTorque} max={10} color="#a855f7" unit="N·m" />
                            <MotorSpecBar label="Free Spd" value={motor.freeSpeed} max={20000} color="#3b82f6" unit="RPM" />
                            <MotorSpecBar label="Stall I" value={motor.stallCurrent} max={500} color="#eab308" unit="A" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>At Output ({numMotors}× {motor.label}, {fmt(gearing, 0)}:1)</span>
                            <MotorSpecBar label="Stall τ" value={motorOutput.totalStallTorque} max={Math.max(motorOutput.totalStallTorque * 1.2, 1)} color="#a855f7" unit="N·m" />
                            <MotorSpecBar label="Free Spd" value={motorOutput.outputFreeSpeed} max={Math.max(motorOutput.outputFreeSpeed * 1.5, 1)} color="#3b82f6" unit="RPM" />
                            <MotorSpecBar label="Stall I" value={motorOutput.totalStallCurrent} max={Math.max(motorOutput.totalStallCurrent * 1.2, 1)} color="#eab308" unit="A" />
                        </div>
                    </div>
                </div>

                {/* Arm Physical Properties */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Arm Physical Properties</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
                        <NumInput label="Arm Length" value={parseFloat(armLength.toFixed(3))} onChange={setCustom(setArmLength)} unit="m" step={0.05} inputStyle={{ width: 80 }} />
                        <NumInput label="Arm Mass" value={parseFloat(armMass.toFixed(2))} onChange={setCustom(setArmMass)} unit="kg" step={0.5} inputStyle={{ width: 80 }} />
                        <NumInput label="CG Ratio" value={parseFloat(cgRatio.toFixed(2))} onChange={setCustom(setCgRatio)} unit="(0-1)" step={0.05} min={0.1} max={1} inputStyle={{ width: 80 }} />
                        <NumInput label="Custom MOI" value={parseFloat(moi.toFixed(4))} onChange={setCustom(setMoi)} unit="kg·m²" step={0.001} inputStyle={{ width: 80 }} />
                    </div>
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 11, fontFamily: MONO }}>
                            <div><span style={{ opacity: 0.4 }}>CG Distance: </span><span style={{ color: "#e2e8f0" }}>{fmt(cgDistance, 3)} m</span></div>
                            <div><span style={{ opacity: 0.4 }}>Effective MOI: </span><span style={{ color: "#e2e8f0" }}>{fmt(effectiveMOI, 4)} kg·m²</span></div>
                            <div><span style={{ opacity: 0.4 }}>Max Gravity τ: </span><span style={{ color: "#eab308" }}>{fmt(maxGravityTorque, 2)} N·m</span></div>
                            <div><span style={{ opacity: 0.4 }}>Torque Margin: </span><span style={{ color: torqueMargin > 2 ? "#10b981" : torqueMargin > 1.2 ? "#eab308" : "#f43f5e" }}>{fmt(torqueMargin, 1)}×</span></div>
                        </div>
                    </div>
                </div>

                {/* Setpoint */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Setpoint & Simulation</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={S.fieldLabel}>Target Position</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input type="range" min={-90} max={180} step={5} value={setpointDeg} onChange={e => setSetpointDeg(parseFloat(e.target.value))} style={{ accentColor: "#22c55e", width: 180 }} />
                                <input type="number" value={setpointDeg} min={-90} max={180} step={5} onChange={e => { let v = parseFloat(e.target.value); if (!isNaN(v)) setSetpointDeg(Math.max(-90, Math.min(180, v))); }} style={S.inputSmall} />
                                <span style={S.unit}>°</span>
                            </div>
                            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                                {SETPOINT_PRESETS.map(p => (
                                    <button key={p.value} onClick={() => setSetpointDeg(p.value)} style={S.btn(setpointDeg === p.value)}>{p.label}</button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={S.fieldLabel}>Start Position</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input type="number" value={startDeg} min={-90} max={180} step={5} onChange={e => { let v = parseFloat(e.target.value); if (!isNaN(v)) setStartDeg(Math.max(-90, Math.min(180, v))); }} style={S.inputSmall} />
                                <span style={S.unit}>°</span>
                            </div>
                            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                                {START_PRESETS.map(p => (
                                    <button key={p.value} onClick={() => setStartDeg(p.value)} style={S.btn(startDeg === p.value)}>{p.label}</button>
                                ))}
                            </div>
                        </div>
                        <NumInput label="Duration" value={duration} onChange={v => setDuration(Math.max(0.5, Math.min(20, v)))} unit="s" step={0.5} inputStyle={{ width: 56 }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={S.fieldLabel}>Soft Limits</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="number" value={softLimitLowDeg} min={-360} max={softLimitHighDeg} step={5} onChange={e => { let v = parseFloat(e.target.value); if (!isNaN(v)) setSoftLimitLowDeg(Math.min(v, softLimitHighDeg)); }} style={{ ...S.inputSmall, width: 50 }} />
                                <span style={{ ...S.unit, marginLeft: 0 }}>° to</span>
                                <input type="number" value={softLimitHighDeg} min={softLimitLowDeg} max={360} step={5} onChange={e => { let v = parseFloat(e.target.value); if (!isNaN(v)) setSoftLimitHighDeg(Math.max(v, softLimitLowDeg)); }} style={{ ...S.inputSmall, width: 50 }} />
                                <span style={S.unit}>°</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ Motion Profile ═══ */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: profileMode !== "none" ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ ...S.label, marginBottom: 0 }}>Motion Profile</div>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[
                                { id: "none", label: "None (Step)", color: "rgba(255,255,255,0.5)" },
                                { id: "trapezoid", label: "Trapezoid", color: "#22c55e" },
                                { id: "exponential", label: "Exponential", color: "#f59e0b" },
                            ].map(m => (
                                <button key={m.id} onClick={() => setProfileMode(m.id)} style={S.btnColor(profileMode === m.id, m.color)}>{m.label}</button>
                            ))}
                        </div>
                    </div>
                    {profileMode === "none" && (
                        <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6, padding: "8px 0" }}>
                            Step input — full setpoint applied immediately. kV and kA feedforward have no effect without a profile.
                        </div>
                    )}
                    {profileMode === "trapezoid" && (
                        <div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
                                <NumInput label="Max Velocity" value={maxVelDegS} onChange={v => setMaxVelDegS(Math.max(1, v))} unit="°/s" step={10} inputStyle={{ width: 80 }} />
                                <NumInput label="Max Acceleration" value={maxAccelDegSS} onChange={v => setMaxAccelDegSS(Math.max(1, v))} unit="°/s²" step={10} inputStyle={{ width: 80 }} />
                                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    <label style={{ ...S.fieldLabel, color: "#22c55e", opacity: 0.7 }}>Max Jerk (0 = ∞)</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <input type="number" value={maxJerkDegSSS} min={0} step={100} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setMaxJerkDegSSS(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 80, borderColor: "rgba(34,197,94,0.3)", color: "#22c55e" }} />
                                        <span style={{ ...S.unit, color: "#22c55e" }}>°/s³</span>
                                    </div>
                                    <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>{maxJerkDegSSS > 0 ? "S-curve (jerk-limited)" : "Pure trapezoidal (infinite jerk)"}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                                {maxJerkDegSSS > 0
                                    ? "S-curve profile: smooth acceleration ramps. Reduces mechanical stress on arm joints and gearboxes."
                                    : "Pure trapezoidal velocity profile. Equivalent to WPILib TrapezoidProfile or CTRE MotionMagic."
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
                                Exponential profile models back-EMF limited acceleration. τ = kA/kV = {fmt(profileKa > 0 && profileKv > 0 ? profileKa / profileKv : 0, 4)}s,
                                {" "}vMax ≈ {fmt(profileKv > 0 ? ((controlMode === "voltage" ? 12 : motor.stallCurrent * numMotors) - Math.abs(ks) - Math.abs(kg)) / profileKv : 0, 1)} rad/s
                                ({fmt(profileKv > 0 ? ((controlMode === "voltage" ? 12 : motor.stallCurrent * numMotors) - Math.abs(ks) - Math.abs(kg)) / profileKv * 180 / Math.PI : 0, 0)} °/s)
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
                                { id: "error", label: "Sign(Error)", color: "#22c55e" },
                                { id: "velocity", label: "Sign(Velocity)", color: "#a78bfa" },
                                { id: "closedloop", label: "Sign(CL Output)", color: "#38bdf8" },
                            ].map(m => (
                                <button key={m.id} onClick={() => setKsSignSource(m.id)} style={S.btnColor(ksSignSource === m.id, m.color)}>{m.label}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.8 }}>
                        {ksSignSource === "error" && <>kS applied in the direction of position error: <span style={{ color: "#22c55e" }}>kS · sgn(error)</span>. Pushes toward setpoint.</>}
                        {ksSignSource === "velocity" && <>kS applied in the direction of measured velocity: <span style={{ color: "#a78bfa" }}>kS · sgn(ω)</span>. Zero at rest, prevents jitter near setpoint.</>}
                        {ksSignSource === "closedloop" && <>kS applied in the direction of closed-loop PID output: <span style={{ color: "#38bdf8" }}>kS · sgn(kP·e + kD·(-ω))</span>. CTRE UseClosedLoopSign option.</>}
                    </div>
                </div>

                {/* Gains */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={S.label}>Control Gains ({controlMode === "voltage" ? "Voltage" : "Current"} Mode)</div>
                        <button onClick={autoTuneFF} style={{ ...S.btn(false), fontSize: 10, padding: "3px 8px" }}>Auto kS/kG from model</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12 }}>
                        <GainInput label="kS (static)" value={ks} onChange={setKs} step={0.01} color="#10b981" />
                        <GainInput label="kG (gravity)" value={kg} onChange={setKg} step={0.01} color="#eab308" />
                        <GainInput label="kV (velocity)" value={kv} onChange={setKv} step={0.0001} color="#3b82f6" />
                        <GainInput label="kA (accel)" value={ka} onChange={setKa} step={0.0001} color="#a855f7" />
                        <GainInput label="kP (proportional)" value={kp} onChange={setKp} step={0.1} color="#22c55e" />
                        <GainInput label="kD (derivative)" value={kd} onChange={setKd} step={0.01} color="#f43f5e" />
                    </div>
                    {profileMode === "none" && (kv !== 0 || ka !== 0) && (
                        <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)", borderRadius: 6, fontSize: 11, fontFamily: MONO, color: "#eab308", lineHeight: 1.6 }}>
                            ⚠ kV and kA have no effect without a motion profile. Enable Trapezoid or Exponential profiling above.
                        </div>
                    )}
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Theoretical Values (from arm model)</div>
                        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>kS ≈</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#10b981" }}>{fmt(theoreticalKs, 4)} {controlMode === "voltage" ? "V" : "A"}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>kG ≈</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#eab308" }}>{fmt(theoreticalKg, 4)} {controlMode === "voltage" ? "V" : "A"}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>Hold voltage at 0° ≈</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#e2e8f0" }}>{fmt(theoreticalKg, 2)} V</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arm Viz + Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 20 }}>
                    <div style={{ ...S.cardSubtle, minWidth: 260 }}>
                        <ArmViz currentDeg={finalDeg} setpointDeg={setpointDeg} armLength={armLength} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, alignContent: "start" }}>
                        <MetricCard label="Rise Time (90%)" value={simResult.riseTime !== null ? fmt(simResult.riseTime, 3) : "—"} unit="s" color={simResult.riseTime !== null && simResult.riseTime < 1 ? "#10b981" : "#eab308"} />
                        <MetricCard label="Settle Time (2%)" value={simResult.settleTime !== null ? fmt(simResult.settleTime, 3) : "—"} unit="s" color={simResult.settleTime !== null && simResult.settleTime < 2 ? "#10b981" : "#eab308"} />
                        <MetricCard label="Overshoot" value={fmt(simResult.overshoot, 1)} unit="%" color={osColor} warn={simResult.overshoot > 10} />
                        <MetricCard label="SS Error" value={fmt(ssErr, 2)} unit="°" color={ssColor} warn={ssErr > range * 0.05} />
                        <MetricCard label="Final Position" value={fmt(finalDeg, 1)} unit="°" color="#e2e8f0" />
                        <MetricCard label="Peak Position" value={fmt(setpointDeg >= startDeg ? simResult.maxDeg : simResult.minDeg, 1)} unit="°" color="#3b82f6" />
                    </div>
                </div>

                {/* Charts */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
                        {TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={S.btn(activeTab === t.id)}>{t.label}</button>)}
                    </div>
                    {activeTab === "position" && <PositionChart history={simResult.history} setpointDeg={setpointDeg} startDeg={startDeg} profileMode={profileMode} />}
                    {activeTab === "velocity" && <VelocityChart history={simResult.history} />}
                    {activeTab === "effort" && <EffortChart history={simResult.history} controlMode={controlMode} />}
                    {activeTab === "error" && <ErrorChart history={simResult.history} />}
                </div>

                {/* Control Equation */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Control Law{profileMode !== "none" ? ` + ${profileMode === "trapezoid" ? "Trapezoid" : "Exponential"} Profile` : ""}</div>
                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 13, fontFamily: MONO, color: "#e2e8f0", lineHeight: 1.8 }}>
                            <span style={{ opacity: 0.5 }}>{controlMode === "voltage" ? "V" : "I"} = </span>
                            <span style={{ color: "#10b981" }}>kS·sgn({ksSignSource === "velocity" ? "ω" : ksSignSource === "closedloop" ? "CL" : "e"})</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#eab308" }}>kG·cos(θ)</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#3b82f6" }}>kV·ω_profile</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#a855f7" }}>kA·α_profile</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#22c55e" }}>kP·e</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#f43f5e" }}>kD·(-ω)</span>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                            θ = arm angle (rad) &nbsp;|&nbsp; e = θ_setpoint − θ &nbsp;|&nbsp; ω = angular velocity &nbsp;|&nbsp; kD uses -ω to avoid derivative kick
                        </div>
                    </div>
                </div>

                {/* Simulation Model Details */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={S.label}>Simulation Model Details</div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Arm Dynamics</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, color: "#e2e8f0", lineHeight: 2 }}>
                            <div><span style={{ opacity: 0.4 }}>Gravity torque: </span><span style={{ color: "#eab308" }}>τ_g = m·g·r_cg·cos(θ)</span></div>
                            <div><span style={{ opacity: 0.4 }}>Net torque: </span><span style={{ color: "#a855f7" }}>τ_net = τ_motor − τ_gravity − τ_friction</span></div>
                            <div><span style={{ opacity: 0.4 }}>Angular acceleration: </span><span style={{ color: "#3b82f6" }}>α = τ_net / J</span></div>
                            <div><span style={{ opacity: 0.4 }}>θ = 0° is horizontal, positive is CCW (up)</span></div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Motor Electrical Model</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, color: "#e2e8f0", lineHeight: 2 }}>
                            <div><span style={{ opacity: 0.4 }}>Resistance: </span><span style={{ color: "#a855f7" }}>R = V_nom / I_stall</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.R, 4)} Ω</span></div>
                            <div><span style={{ opacity: 0.4 }}>Torque constant: </span><span style={{ color: "#a855f7" }}>Kt = τ_stall / I_stall</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.Kt, 6)} N·m/A</span></div>
                            <div><span style={{ opacity: 0.4 }}>Back-EMF constant: </span><span style={{ color: "#a855f7" }}>Kv = ω_free / (V_nom − I_free·R)</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.Kv, 4)} rad/s/V</span></div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Physics Integration</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                            <div>Timestep: <span style={{ color: "#e2e8f0" }}>Δt = 1 ms</span> (1 kHz fixed-step Euler integration)</div>
                            <div>Velocity update: <span style={{ color: "#e2e8f0" }}>ω(t+Δt) = ω(t) + α·Δt</span></div>
                            <div>Position update: <span style={{ color: "#e2e8f0" }}>θ(t+Δt) = θ(t) + ω·Δt</span></div>
                            <div>Voltage clamp: <span style={{ color: "#e2e8f0" }}>[-12V, +12V]</span> &nbsp;|&nbsp; Current clamp: <span style={{ color: "#e2e8f0" }}>[-I_stall·N, +I_stall·N]</span></div>
                            <div>Soft limits: <span style={{ color: "#e2e8f0" }}>[{softLimitLowDeg}°, {softLimitHighDeg}°]</span> with damped bounce</div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Assumptions & Limitations</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                            <div>Point mass CG — real arms have distributed mass</div>
                            <div>Friction model: <span style={{ color: "#f43f5e" }}>static + viscous</span> — configurable via Plant Model below</div>
                            <div>No current limiting — real motor controllers enforce supply and stator limits</div>
                            <div>No sensor noise or quantization — real encoders have finite resolution</div>
                            <div>No control loop latency — real systems have 5–20 ms loop periods</div>
                            <div>Ideal gearbox — no backlash, compliance, or efficiency losses</div>
                        </div>
                    </div>
                </div>

                {/* Voltage Tuning Guide */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(34,197,94,0.15)" }}>
                    <div style={{ ...S.label, color: "#22c55e", opacity: 0.7 }}>Manual Voltage Tuning Guide</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Start with gravity compensation", color: "#eab308", lines: [
                                    "Set all gains to zero. Set kG = V needed to hold arm at horizontal.",
                                    `For your current config: kG ≈ ${fmt(theoreticalKg, 4)} V.`,
                                    "Move arm to 0° and verify it holds position without drifting."
                                ]},
                            { step: "2", title: "Verify kG at different angles", color: "#10b981", lines: [
                                    "Move arm to 45°, 90°, -45° — kG·cos(θ) should keep it stable.",
                                    "At 90° (vertical), kG contribution is zero (cos(90°) = 0).",
                                    "If it droops, increase kG. If it lifts, decrease kG."
                                ]},
                            { step: "3", title: "Add static friction compensation", color: "#3b82f6", lines: [
                                    "Set kS to overcome stiction. Start with I_free · R.",
                                    `For your current config: kS ≈ ${fmt(theoreticalKs, 4)} V.`,
                                    "This helps the arm start moving from rest."
                                ]},
                            { step: "4", title: "Add proportional feedback", color: "#22c55e", lines: [
                                    "Start kP small (try 1.0). Increase gradually.",
                                    "kP output is in volts-per-radian-error. Watch for oscillation.",
                                    "Stop increasing when you see oscillation, then back off 20%."
                                ]},
                            { step: "5", title: "Add derivative damping", color: "#f43f5e", lines: [
                                    "If overshoot is present, add kD. Start at ~5-10% of kP value.",
                                    "kD resists rapid motion — it damps oscillation but amplifies noise.",
                                    "This sim uses derivative-on-measurement (-ω) to avoid kick."
                                ]},
                            { step: "6", title: "Validate across the range", color: "#a855f7", lines: [
                                    "Test multiple setpoints: 0°, 45°, 90°, 120°.",
                                    "Test both directions: moving up vs moving down (gravity assists/resists).",
                                    "A good tune should work at all positions with consistent performance."
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
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(234,179,8,0.15)" }}>
                    <div style={{ ...S.label, color: "#eab308", opacity: 0.7 }}>Manual Current Tuning Guide</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Understand the difference", color: "#eab308", lines: [
                                    "In current mode, you command amps instead of volts. The motor controller handles voltage internally.",
                                    "Current is proportional to torque: τ = Kt · I. This gives direct torque control.",
                                    "Feedforward gains have different units: kG is now A·cos(θ), kS is now in amps."
                                ]},
                            { step: "2", title: "Set gravity feedforward kG", color: "#f97316", lines: [
                                    "kG in current mode = current needed to hold the arm at horizontal.",
                                    "Calculate: kG = (m · g · r_cg) / (Kt · N · G) where the denominator is torque per amp.",
                                    "This is more direct than voltage mode since current → torque is linear."
                                ]},
                            { step: "3", title: "Set kS for static friction", color: "#10b981", lines: [
                                    "kS in current mode represents the amps needed to overcome static friction.",
                                    "On a real robot, this is the current needed to just barely start the arm moving.",
                                    "Start small — in the ideal sim with no friction, kS can be zero."
                                ]},
                            { step: "4", title: "Tune kP more aggressively", color: "#22c55e", lines: [
                                    "Current mode is inherently more linear than voltage mode (no back-EMF nonlinearity).",
                                    "You can typically use larger kP values. Start with 0.5 and work up.",
                                    "kP output is in amps-per-radian-error. Watch for current clamp saturation."
                                ]},
                            { step: "5", title: "Use kA for acceleration feedforward", color: "#a855f7", lines: [
                                    "kA is more useful in current mode since τ = J·α and τ = Kt·I.",
                                    "Theoretical kA = J / (Kt · N · G) where J is the moment of inertia at the pivot.",
                                    "This makes the motor apply exactly the torque needed for the desired acceleration."
                                ]},
                            { step: "6", title: "Add kD and validate", color: "#f43f5e", lines: [
                                    "Current mode often produces less overshoot, so kD may not be needed.",
                                    "If you do add kD, start at ~5% of kP. It damps oscillation just like in voltage mode.",
                                    "Validate across positions — current mode typically generalizes better due to linearity."
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
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(59,130,246,0.15)" }}>
                    <div style={{ ...S.label, color: "#3b82f6", opacity: 0.7 }}>Motion Profiling Guide</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Why use motion profiling?", color: "#3b82f6", lines: [
                                    "A step setpoint demands infinite acceleration — physically impossible and stresses the arm and gearbox.",
                                    "Motion profiling generates a smooth trajectory the arm can follow.",
                                    "With profiling, kV and kA feedforward become effective since desired velocity/acceleration are known."
                                ]},
                            { step: "2", title: "Set max velocity", color: "#22c55e", lines: [
                                    "Max velocity limits peak angular speed during the move.",
                                    `Set to ~80% of free speed: ${fmt(maxOutputDegPerSec * 0.8, 0)} °/s for your setup.`,
                                    "Arms fighting gravity can't reach free speed going up — set constraints accordingly."
                                ]},
                            { step: "3", title: "Set max acceleration", color: "#eab308", lines: [
                                    "Limits how fast angular velocity changes (°/s²).",
                                    "Arms are asymmetric: gravity assists downward motion but resists upward motion.",
                                    "Set based on upward (worst case) to avoid saturation. Watch the effort chart."
                                ]},
                            { step: "4", title: "Optional: Add jerk limiting", color: "#a855f7", lines: [
                                    "Jerk = rate of acceleration change. 0 = infinite (pure trapezoidal).",
                                    "S-curve profiles reduce gearbox stress and vibration on heavy arms.",
                                    "Especially useful for multi-joint arms where vibration propagates."
                                ]},
                            { step: "5", title: "Tune kV and kA feedforward", color: "#3b82f6", lines: [
                                    "kV produces effort for the profiled velocity. kA produces effort for profiled acceleration.",
                                    "Note: kG still handles gravity separately — kV/kA handle the dynamic motion component.",
                                    "Good feedforward means kP can be lower for the same tracking performance."
                                ]},
                            { step: "6", title: "Validate tracking", color: "#22c55e", lines: [
                                    "Watch position chart — actual should follow the profile (green dashed).",
                                    "Test both upward and downward moves from different start positions.",
                                    "Gravity makes the response very asymmetric — a good tune handles both directions."
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
                    <div style={S.label}>Arm Physics Reference</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, fontSize: 12, opacity: 0.6, fontFamily: MONO }}>
                        <div>τ_gravity = m · g · r_cg · cos(θ)</div>
                        <div>J = m · r_cg² (point mass approximation)</div>
                        <div>τ_motor = Kt · I_motor · N · G</div>
                        <div>τ_friction = τ_static·sgn(ω) + β·ω</div>
                        <div>α = (τ_motor − τ_gravity − τ_friction) / J</div>
                        <div>kG compensates gravity: V = kG · cos(θ)</div>
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
                            ? "Plant dynamics from motor specs, gearing, arm mass, and MOI above. Friction parameters add realism."
                            : "Plant dynamics from feedforward constants (like from SysId). Derives effective MOI from kA/kV."
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
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Effort to overcome joint friction</div>
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
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Plant kV</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={plantKv} min={0} step={0.0001} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPlantKv(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V/(rad/s)" : "A/(rad/s)"}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Plant kA</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={plantKa} min={0} step={0.0001} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPlantKa(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V/(rad/s²)" : "A/(rad/s²)"}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Viscous Friction</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={viscousFriction} min={0} step={0.0001} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setViscousFriction(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>N·m/(rad/s)</span>
                                </div>
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
                <span style={{ fontSize: 12, opacity: 0.2, fontFamily: MONO }}>Arm Position Tuning Simulator — FRC Mechanism Control</span>
            </footer>
        </div>
    );
}