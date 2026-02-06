import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ─── Physics ─────────────────────────────────────────────────────────────────
const DT = 0.001;
const NOMINAL_V = 12;
const GRAVITY = 9.81;

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
function generateTrapezoidProfile(distanceM, maxVelMS, maxAccelMSS, maxJerkMSSS, durationS) {
    const steps = Math.ceil(durationS / DT);
    const sign = distanceM >= 0 ? 1 : -1;
    const dist = Math.abs(distanceM);

    if (dist < 0.00001) {
        const profile = [];
        for (let i = 0; i <= steps; i++) profile.push({ t: i * DT, position: 0, velocity: 0, acceleration: 0 });
        return profile;
    }

    const useJerk = maxJerkMSSS > 0;

    if (useJerk) {
        const profile = [];
        let pos = 0, vel = 0, accel = 0;
        const targetVel = maxVelMS;
        const ma = maxAccelMSS;
        const mj = maxJerkMSSS;
        let phase = "accel";

        for (let i = 0; i <= steps; i++) {
            const t = i * DT;
            const remaining = dist - pos;
            const decelDist = vel > 0 ? (vel * vel) / (2 * ma) + vel * (ma / mj) * 0.5 : 0;

            if (phase === "accel") {
                if (remaining <= decelDist + 0.0001 && vel > 0) { phase = "decel"; }
                else if (vel >= targetVel - 0.0001) { phase = "cruise"; accel = 0; }
                else {
                    const accelStopV = accel > 0 ? (accel * accel) / (2 * mj) : 0;
                    const remainV = targetVel - vel;
                    if (remainV <= accelStopV + 0.0001) accel = Math.max(0, accel - mj * DT);
                    else accel = Math.min(ma, accel + mj * DT);
                }
            }
            if (phase === "cruise") { accel = 0; if (remaining <= decelDist + 0.0001) phase = "decel"; }
            if (phase === "decel") { accel = Math.max(-ma, accel - mj * DT); if (vel <= 0.0001 && remaining < 0.0001) { phase = "done"; vel = 0; accel = 0; } }
            if (phase === "done") { vel = 0; accel = 0; pos = dist; }

            profile.push({ t, position: sign * Math.min(pos, dist), velocity: sign * vel, acceleration: sign * accel });
            if (phase !== "done") { vel += accel * DT; if (vel < 0) vel = 0; if (vel > targetVel) vel = targetVel; pos += vel * DT; if (pos > dist) pos = dist; }
        }
        return profile;
    }

    // Pure trapezoidal
    const mv = maxVelMS, ma = maxAccelMSS;
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
function generateExponentialProfile(distanceM, profileKv, profileKa, maxInput, durationS) {
    const steps = Math.ceil(durationS / DT);
    const sign = distanceM >= 0 ? 1 : -1;
    const dist = Math.abs(distanceM);

    if (profileKv <= 0 || profileKa <= 0) {
        const profile = [];
        for (let i = 0; i <= steps; i++) profile.push({ t: i * DT, position: sign * Math.min(dist, dist * (i * DT) / Math.max(durationS, 0.001)), velocity: 0, acceleration: 0 });
        return profile;
    }

    const tau = profileKa / profileKv;
    const vMax = maxInput / profileKv;
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
        vel += accel * DT; if (vel < 0) vel = 0;
        pos += vel * DT; if (pos > dist) pos = dist;
    }
    return profile;
}

function simulateElevator({
                              motor, numMotors, gearing, drumRadius, carriageMass, ks, kv, ka, kp, kd, kg,
                              setpointM, controlMode, durationS = 5, softLimitLow = 0, softLimitHigh = 2,
                              profileMode = "none", maxVelCmS = 200, maxAccelCmSS = 500, maxJerkCmSSS = 0,
                              profileKv = 0, profileKa = 0, ksSignSource = "error",
                              plantMode = "physical", plantKs = 0, plantKv = 0, plantKa = 0, viscousFriction = 0
                          }) {
    const mc = motorConstants(motor);
    const setpointMeters = setpointM;

    // Plant model
    let effectiveMass, totalKt, effectiveR, effectiveKv;
    if (plantMode === "physical") {
        effectiveMass = carriageMass;
        totalKt = mc.Kt * numMotors * gearing;
        effectiveR = mc.R / numMotors;
        effectiveKv = mc.Kv;
    } else {
        effectiveMass = plantKv > 0 ? plantKa / plantKv : carriageMass;
        totalKt = mc.Kt * numMotors * gearing;
        effectiveR = mc.R / numMotors;
        effectiveKv = mc.Kv;
    }

    const gravityForce = effectiveMass * GRAVITY;

    // Static friction force from plantKs
    const staticFrictionForce = controlMode === "voltage"
        ? (plantKs * totalKt) / (effectiveR * numMotors * drumRadius)
        : plantKs * totalKt / (numMotors * drumRadius);

    const steps = Math.ceil(durationS / DT);
    const record = Math.max(1, Math.floor(steps / 2000));
    const history = [];

    // Generate motion profile if needed
    let profile = null;
    if (profileMode === "trapezoid") {
        const maxVelMS = maxVelCmS / 100;
        const maxAccelMSS = maxAccelCmSS / 100;
        const maxJerkMSSS = maxJerkCmSSS / 100;
        profile = generateTrapezoidProfile(setpointMeters, maxVelMS, maxAccelMSS, maxJerkMSSS, durationS);
    } else if (profileMode === "exponential") {
        const maxInput = controlMode === "voltage" ? NOMINAL_V : motor.stallCurrent * numMotors;
        const effMaxInput = Math.max(0.01, maxInput - Math.abs(ks) - Math.abs(kg));
        profile = generateExponentialProfile(setpointMeters, profileKv, profileKa, effMaxInput, durationS);
    }

    let position = 0, velocity = 0, prevError = setpointMeters;
    let appliedVolts = 0, appliedCurrent = 0, motorCurrent = 0;

    for (let i = 0; i <= steps; i++) {
        const t = i * DT;

        // Determine current setpoint based on profile
        let currentSetpoint, desiredVel, desiredAccel;
        if (profile && i < profile.length) {
            currentSetpoint = profile[i].position;
            desiredVel = profile[i].velocity;
            desiredAccel = profile[i].acceleration;
        } else if (profile) {
            currentSetpoint = setpointMeters;
            desiredVel = 0; desiredAccel = 0;
        } else {
            currentSetpoint = setpointMeters;
            desiredVel = 0; desiredAccel = 0;
        }

        const error = currentSetpoint - position;

        // kS sign source
        let ksSign;
        if (ksSignSource === "velocity") {
            ksSign = velocity === 0 ? 0 : Math.sign(velocity);
        } else if (ksSignSource === "closedloop") {
            const tempFbP = kp * error;
            const tempFbD = kd * (i === 0 ? 0 : (error - prevError) / DT);
            const clOutput = tempFbP + tempFbD;
            ksSign = clOutput === 0 ? 0 : Math.sign(clOutput);
        } else {
            ksSign = error === 0 ? 0 : Math.sign(error);
        }

        // Feedforward
        const ffKs = ks * ksSign;
        const ffKg = kg;
        const ffKv = kv * desiredVel;
        const ffKa = ka * desiredAccel;

        // Feedback
        const fbP = kp * error;
        const fbD = kd * (i === 0 ? 0 : (error - prevError) / DT);

        // Friction model: static + viscous (linear domain)
        let frictionForce = 0;
        if (Math.abs(velocity) < 0.001) {
            frictionForce = staticFrictionForce * (velocity === 0 ? 0 : Math.sign(velocity));
        } else {
            frictionForce = staticFrictionForce * Math.sign(velocity) + viscousFriction * velocity;
        }

        if (controlMode === "voltage") {
            const rawV = ffKs + ffKg + ffKv + ffKa + fbP + fbD;
            appliedVolts = clampVoltage(rawV);
            const motorOmega = (velocity / drumRadius) * gearing;
            const backEmf = motorOmega / effectiveKv;
            motorCurrent = numMotors > 0 ? (appliedVolts - backEmf) / effectiveR : 0;
            const motorTorque = totalKt * (motorCurrent / numMotors);
            const outputForce = motorTorque / drumRadius;
            const netForce = outputForce - gravityForce - frictionForce;
            const accel = effectiveMass > 0 ? netForce / effectiveMass : 0;
            velocity += accel * DT;
            position += velocity * DT;
            appliedCurrent = motorCurrent;
        } else {
            const rawI = ffKs + ffKg + ffKv + ffKa + fbP + fbD;
            appliedCurrent = clampCurrent(rawI, motor.stallCurrent * numMotors);
            motorCurrent = appliedCurrent;
            const motorTorque = totalKt * (motorCurrent / numMotors);
            const outputForce = motorTorque / drumRadius;
            const netForce = outputForce - gravityForce - frictionForce;
            const accel = effectiveMass > 0 ? netForce / effectiveMass : 0;
            velocity += accel * DT;
            position += velocity * DT;
            const motorOmega = (velocity / drumRadius) * gearing;
            const backEmf = motorOmega / effectiveKv;
            appliedVolts = backEmf + motorCurrent * effectiveR / numMotors;
        }

        if (position < softLimitLow) { position = softLimitLow; velocity = Math.abs(velocity) * 0.1; }
        if (position > softLimitHigh) { position = softLimitHigh; velocity = -Math.abs(velocity) * 0.1; }
        prevError = error;

        if (i % record === 0) {
            const profilePt = profile && i < profile.length ? profile[i] : null;
            history.push({
                t, position, positionCm: position * 100, velocity, velocityCmS: velocity * 100,
                setpointM, setpointCm: setpointM * 100,
                profilePositionCm: profilePt ? profilePt.position * 100 : setpointM * 100,
                profileVelocityCmS: profilePt ? profilePt.velocity * 100 : 0,
                profileAccelCmSS: profilePt ? profilePt.acceleration * 100 : 0,
                voltage: appliedVolts, current: appliedCurrent,
                error, errorCm: error * 100,
            });
        }
    }

    const finalM = history[history.length - 1].position;
    const steadyStateError = Math.abs(setpointM - finalM);
    let riseTime = null, settleTime = null, overshoot = 0;
    let maxM = -Infinity, minM = Infinity;

    for (const pt of history) {
        if (pt.position > maxM) maxM = pt.position;
        if (pt.position < minM) minM = pt.position;
        if (riseTime === null && setpointM > 0 && pt.position >= setpointM * 0.9) riseTime = pt.t;
        if (riseTime === null && setpointM < 0 && pt.position <= setpointM * 0.9) riseTime = pt.t;
    }

    if (setpointM > 0) { overshoot = ((maxM - setpointM) / setpointM) * 100; if (overshoot < 0) overshoot = 0; }
    else if (setpointM < 0) { overshoot = ((setpointM - minM) / Math.abs(setpointM)) * 100; if (overshoot < 0) overshoot = 0; }

    for (let i = history.length - 1; i >= 0; i--) {
        const band = Math.max(Math.abs(setpointM) * 0.02, 0.005);
        if (Math.abs(history[i].position - setpointM) > band) { settleTime = history[Math.min(i + 1, history.length - 1)].t; break; }
    }

    return { history, riseTime, settleTime, overshoot, steadyStateError, finalM, maxM, minM, gravityForce };
}

// ─── DC Motor Database ──────────────────────────────────────────────────────
const DC_MOTORS = [
    { id: "krakenX60", label: "Kraken X60", stallTorque: 7.09, freeSpeed: 6000, stallCurrent: 366, freeCurrent: 2, nominalVoltage: 12 },
    { id: "krakenX60FOC", label: "Kraken X60 (FOC)", stallTorque: 9.37, freeSpeed: 5800, stallCurrent: 483, freeCurrent: 2, nominalVoltage: 12 },
    { id: "krakenX44", label: "Kraken X44", stallTorque: 4.28, freeSpeed: 7530, stallCurrent: 275, freeCurrent: 1.4, nominalVoltage: 12 },
    { id: "falcon500", label: "Falcon 500", stallTorque: 4.69, freeSpeed: 6380, stallCurrent: 257, freeCurrent: 1.5, nominalVoltage: 12 },
    { id: "falcon500FOC", label: "Falcon 500 (FOC)", stallTorque: 5.84, freeSpeed: 6080, stallCurrent: 304, freeCurrent: 1.5, nominalVoltage: 12 },
    { id: "neoVortex", label: "NEO Vortex", stallTorque: 3.60, freeSpeed: 6784, stallCurrent: 211, freeCurrent: 3.6, nominalVoltage: 12 },
    { id: "neo", label: "NEO", stallTorque: 2.6, freeSpeed: 5676, stallCurrent: 105, freeCurrent: 1.8, nominalVoltage: 12 },
    { id: "neo550", label: "NEO 550", stallTorque: 0.97, freeSpeed: 11000, stallCurrent: 100, freeCurrent: 1.4, nominalVoltage: 12 },
    { id: "cim", label: "CIM", stallTorque: 2.41, freeSpeed: 5330, stallCurrent: 131, freeCurrent: 2.7, nominalVoltage: 12 },
    { id: "miniCim", label: "Mini CIM", stallTorque: 1.41, freeSpeed: 5840, stallCurrent: 89, freeCurrent: 3, nominalVoltage: 12 },
    { id: "bag", label: "BAG", stallTorque: 0.43, freeSpeed: 13180, stallCurrent: 53, freeCurrent: 1.8, nominalVoltage: 12 },
    { id: "775pro", label: "775pro", stallTorque: 0.71, freeSpeed: 18730, stallCurrent: 134, freeCurrent: 0.7, nominalVoltage: 12 },
];

const COMMON_GEARINGS = [
    { label: "Custom", value: null }, { label: "5:1", value: 5 }, { label: "9:1", value: 9 }, { label: "10:1", value: 10 },
    { label: "12:1", value: 12 }, { label: "15:1", value: 15 }, { label: "16:1", value: 16 }, { label: "20:1", value: 20 },
    { label: "25:1", value: 25 }, { label: "36:1", value: 36 }, { label: "48:1", value: 48 }, { label: "64:1", value: 64 },
];

const DRUM_PRESETS = [
    { label: "Custom", value: null },
    { label: '1" Drum (12.7mm)', value: 0.0127 },
    { label: '1.25" Drum (15.9mm)', value: 0.0159 },
    { label: '1.5" Drum (19.1mm)', value: 0.0191 },
    { label: '2" Drum (25.4mm)', value: 0.0254 },
    { label: '#25 18T Sprocket (36.3mm)', value: 0.0363 },
    { label: '#25 22T Sprocket (44.4mm)', value: 0.0444 },
    { label: 'GT2 36T Pulley (22.9mm)', value: 0.0229 },
    { label: 'GT2 48T Pulley (30.6mm)', value: 0.0306 },
    { label: 'HTD 24T Pulley (38.2mm)', value: 0.0382 },
];

const ELEVATOR_PRESETS = [
    { id: "custom", label: "Custom", carriageMass: 5, motorId: "krakenX60FOC", numMotors: 2, gearing: 12, drumRadius: 0.0191 },
    { id: "lightElevator", label: "Light Elevator (Note)", carriageMass: 3, motorId: "krakenX60FOC", numMotors: 1, gearing: 9, drumRadius: 0.0191 },
    { id: "heavyElevator", label: "Heavy Elevator (Cube)", carriageMass: 8, motorId: "krakenX60FOC", numMotors: 2, gearing: 16, drumRadius: 0.0254 },
    { id: "cascadeElevator", label: "Cascade Elevator (2-stage)", carriageMass: 6, motorId: "krakenX60FOC", numMotors: 2, gearing: 12, drumRadius: 0.0191 },
    { id: "continuousElevator", label: "Continuous Elevator", carriageMass: 4, motorId: "krakenX60FOC", numMotors: 1, gearing: 10, drumRadius: 0.0159 },
    { id: "climber", label: "Climber Winch", carriageMass: 70, motorId: "krakenX60FOC", numMotors: 2, gearing: 48, drumRadius: 0.0254 },
];

const SETPOINT_PRESETS = [
    { label: "25cm", value: 0.25 }, { label: "50cm", value: 0.5 }, { label: "75cm", value: 0.75 },
    { label: "1m", value: 1.0 }, { label: "1.25m", value: 1.25 }, { label: "1.5m", value: 1.5 },
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
    btn: (a) => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)", color: a ? "#10b981" : "rgba(255,255,255,0.5)", border: a ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.06)", transition: "all 0.15s ease" }),
    btnColor: (a, color) => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? `${color}22` : "rgba(255,255,255,0.04)", color: a ? color : "rgba(255,255,255,0.5)", border: a ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.06)", transition: "all 0.15s ease" }),
};

function NumInput({ label, value, onChange, unit, inputStyle, step, min, max }) {
    return (<div style={{ display: "flex", flexDirection: label ? "column" : "row", gap: 4, alignItems: label ? "flex-start" : "center" }}>
        {label && <label style={S.fieldLabel}>{label}</label>}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={value} step={step} min={min} max={max} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }} style={{ ...S.input, ...inputStyle }} />{unit && <span style={S.unit}>{unit}</span>}</div>
    </div>);
}

function GainInput({ label, value, onChange, step = 0.001, color = "#10b981" }) {
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
function PositionChart({ history, setpointM, profileMode }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    const setpointCm = setpointM * 100;
    useChart(containerRef, canvasRef, 280, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;

        const maxT = history[history.length - 1].t;
        let yMax = Math.max(setpointCm * 1.3, setpointCm + 10);
        let yMin = Math.min(0, setpointCm) - 5;
        for (const pt of history) {
            if (pt.positionCm > yMax) yMax = pt.positionCm + 5;
            if (pt.positionCm < yMin) yMin = pt.positionCm - 5;
        }
        if (yMax - yMin < 20) { yMax += 10; yMin -= 10; }

        drawGrid(ctx, pad, pw, ph, 5, 5);

        // setpoint line
        const spY = pad.t + ph * (1 - (setpointCm - yMin) / (yMax - yMin));
        ctx.strokeStyle = "rgba(16,185,129,0.4)"; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(pad.l, spY); ctx.lineTo(pad.l + pw, spY); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(16,185,129,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "right";
        ctx.fillText(`Setpoint: ${fmt(setpointCm, 1)}cm`, pad.l + pw - 4, spY - 6);

        // 2% band
        const band = Math.max(Math.abs(setpointCm) * 0.02, 0.5);
        const bandHi = setpointCm + band, bandLo = setpointCm - band;
        const bhY = pad.t + ph * (1 - (bandHi - yMin) / (yMax - yMin));
        const blY = pad.t + ph * (1 - (bandLo - yMin) / (yMax - yMin));
        ctx.fillStyle = "rgba(16,185,129,0.04)"; ctx.fillRect(pad.l, bhY, pw, blY - bhY);

        // zero line
        if (yMin < 0 && yMax > 0) {
            const zy = pad.t + ph * (1 - (0 - yMin) / (yMax - yMin));
            ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();
        }

        // profile reference line (green dashed)
        if (profileMode !== "none" && history[0].profilePositionCm !== undefined) {
            ctx.strokeStyle = "rgba(16,185,129,0.6)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath();
            history.forEach((pt, i) => {
                const x = pad.l + (pt.t / maxT) * pw;
                const y = pad.t + ph * (1 - (pt.profilePositionCm - yMin) / (yMax - yMin));
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }); ctx.stroke(); ctx.setLineDash([]);
        }

        // position curve
        ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2.5; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.positionCm - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        // legend
        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("POSITION RESPONSE", pad.l, pad.t - 10);
        if (profileMode !== "none") {
            ctx.fillStyle = "rgba(16,185,129,0.6)"; ctx.font = `9px ${MONO}`;
            ctx.fillText("--- profile", pad.l + 170, pad.t - 10);
        }

        // axes labels
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(yMax - (i / 5) * (yMax - yMin), 1) + "cm", pad.l - 8, pad.t + (i / 5) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Position (cm)", 0, 0); ctx.restore();
    }, [history, setpointM, profileMode]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Velocity Chart ─────────────────────────────────────────────────────────
function VelocityChart({ history }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 200, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;

        const maxT = history[history.length - 1].t;
        const values = history.map(pt => pt.velocityCmS);
        let yMax = -Infinity, yMin = Infinity;
        for (const v of values) { if (v > yMax) yMax = v; if (v < yMin) yMin = v; }
        const range = yMax - yMin;
        if (range < 10) { yMax += 10; yMin -= 10; } else { yMax += range * 0.1; yMin -= range * 0.1; }

        drawGrid(ctx, pad, pw, ph, 5, 4);

        if (yMin < 0 && yMax > 0) {
            const zy = pad.t + ph * (1 - (0 - yMin) / (yMax - yMin));
            ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();
        }

        ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 2; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.velocityCmS - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 4; i++) ctx.fillText(fmt(yMax - (i / 4) * (yMax - yMin), 0) + "cm/s", pad.l - 8, pad.t + (i / 4) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Velocity (cm/s)", 0, 0); ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("LINEAR VELOCITY", pad.l, pad.t - 10);
    }, [history]);
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
        for (const pt of history) { if (pt.errorCm > yMax) yMax = pt.errorCm; if (pt.errorCm < yMin) yMin = pt.errorCm; }
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
            const y = pad.t + ph * (1 - (pt.errorCm - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 4; i++) ctx.fillText(fmt(yMax - (i / 4) * (yMax - yMin), 1) + "cm", pad.l - 8, pad.t + (i / 4) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Error (cm)", 0, 0); ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("TRACKING ERROR", pad.l, pad.t - 10);
    }, [history]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Elevator Visualization ──────────────────────────────────────────────────
function ElevatorViz({ currentM, setpointM, softLimitHigh }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    const posRef = useRef(0);
    const animRef = useRef(null);
    const mRef = useRef(currentM);
    mRef.current = currentM;

    useEffect(() => {
        const c = canvasRef.current, ct = containerRef.current;
        if (!c || !ct) return;

        function animate() {
            const target = mRef.current;
            posRef.current += (target - posRef.current) * 0.12;

            const d = window.devicePixelRatio || 1;
            const w = ct.clientWidth, h = 200;
            c.width = w * d; c.height = h * d;
            c.style.width = w + "px"; c.style.height = h + "px";
            const ctx = c.getContext("2d");
            ctx.scale(d, d);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2;
            const trackTop = 30, trackBottom = h - 50;
            const trackHeight = trackBottom - trackTop;
            const trackWidth = 40;

            const maxHeight = softLimitHigh > 0 ? softLimitHigh : 2;
            const pctSetpoint = setpointM / maxHeight;
            const pctCurrent = Math.max(0, Math.min(1, posRef.current / maxHeight));

            // Draw frame/rails
            ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx - trackWidth / 2 - 8, trackTop - 10); ctx.lineTo(cx - trackWidth / 2 - 8, trackBottom + 10); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx + trackWidth / 2 + 8, trackTop - 10); ctx.lineTo(cx + trackWidth / 2 + 8, trackBottom + 10); ctx.stroke();

            // Height markers
            ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "right";
            for (let i = 0; i <= 4; i++) {
                const pct = i / 4;
                const y = trackBottom - pct * trackHeight;
                const heightVal = pct * maxHeight * 100;
                ctx.fillText(`${fmt(heightVal, 0)}cm`, cx - trackWidth / 2 - 14, y + 3);
                ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(cx - trackWidth / 2, y); ctx.lineTo(cx + trackWidth / 2, y); ctx.stroke();
            }

            // Setpoint indicator (ghost carriage)
            const spY = trackBottom - pctSetpoint * trackHeight;
            ctx.strokeStyle = "rgba(16,185,129,0.3)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
            ctx.strokeRect(cx - trackWidth / 2, spY - 15, trackWidth, 30);
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(16,185,129,0.4)"; ctx.font = `8px ${MONO}`; ctx.textAlign = "left";
            ctx.fillText("TARGET", cx + trackWidth / 2 + 12, spY + 3);

            // Current position carriage
            const carriageY = trackBottom - pctCurrent * trackHeight;
            ctx.fillStyle = "rgba(16,185,129,0.1)";
            ctx.fillRect(cx - trackWidth / 2 - 2, carriageY - 17, trackWidth + 4, 34);
            ctx.fillStyle = "#10b981";
            ctx.fillRect(cx - trackWidth / 2, carriageY - 15, trackWidth, 30);
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(cx - trackWidth / 2 + 4, carriageY - 11, trackWidth - 8, 22);
            ctx.fillStyle = "rgba(255,255,255,0.2)";
            ctx.fillRect(cx - trackWidth / 2 + 2, carriageY - 15, trackWidth - 4, 3);

            // Gravity arrow
            const gx = cx + trackWidth / 2 + 35, gy = carriageY - 10;
            ctx.strokeStyle = "rgba(251,191,36,0.5)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + 20); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(gx - 4, gy + 16); ctx.lineTo(gx, gy + 22); ctx.lineTo(gx + 4, gy + 16); ctx.stroke();
            ctx.fillStyle = "rgba(251,191,36,0.5)"; ctx.font = `8px ${MONO}`; ctx.textAlign = "center";
            ctx.fillText("mg", gx, gy - 4);

            // Text readout
            ctx.fillStyle = "#e2e8f0"; ctx.font = `bold 14px ${MONO}`; ctx.textAlign = "center";
            ctx.fillText(`${fmt(mRef.current * 100, 1)} cm`, cx, trackBottom + 28);
            ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = `10px ${MONO}`;
            ctx.fillText(`target: ${fmt(setpointM * 100, 1)} cm`, cx, trackBottom + 44);

            animRef.current = requestAnimationFrame(animate);
        }
        animRef.current = requestAnimationFrame(animate);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [setpointM, softLimitHigh]);

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
export default function ElevatorTunerApp() {
    const [presetId, setPresetId] = useState("lightElevator");
    const [motorId, setMotorId] = useState("krakenX60FOC");
    const [numMotors, setNumMotors] = useState(1);
    const [gearingPreset, setGearingPreset] = useState(null);
    const [gearing, setGearing] = useState(9);
    const [drumPreset, setDrumPreset] = useState(null);
    const [drumRadius, setDrumRadius] = useState(0.0191);
    const [carriageMass, setCarriageMass] = useState(3);
    const [controlMode, setControlMode] = useState("voltage");
    const [setpointM, setSetpointM] = useState(0.5);
    const [duration, setDuration] = useState(3);
    const [softLimitLow, setSoftLimitLow] = useState(0);
    const [softLimitHigh, setSoftLimitHigh] = useState(1.5);

    // gains
    const [ks, setKs] = useState(0);
    const [kv, setKv] = useState(0);
    const [ka, setKa] = useState(0);
    const [kp, setKp] = useState(0);
    const [kd, setKd] = useState(0);
    const [kg, setKg] = useState(0);

    // Motion profile
    const [profileMode, setProfileMode] = useState("none");
    const [maxVelCmS, setMaxVelCmS] = useState(200);
    const [maxAccelCmSS, setMaxAccelCmSS] = useState(500);
    const [maxJerkCmSSS, setMaxJerkCmSSS] = useState(0);
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
            const p = ELEVATOR_PRESETS.find(pr => pr.id === id);
            if (p) {
                setCarriageMass(p.carriageMass); setMotorId(p.motorId); setNumMotors(p.numMotors);
                setGearing(p.gearing); setDrumRadius(p.drumRadius);
                setGearingPreset(null); setDrumPreset(null);
            }
        }
    }, []);

    const setMassCustom = (v) => { setCarriageMass(v); setPresetId("custom"); };

    // Calculate output specs
    const motorFreeSpeedRadS = (motor.freeSpeed * 2 * Math.PI) / 60;
    const outputFreeSpeedRadS = motorFreeSpeedRadS / gearing;
    const linearFreeSpeedMS = outputFreeSpeedRadS * drumRadius;
    const linearFreeSpeedCmS = linearFreeSpeedMS * 100;
    const totalStallTorque = motor.stallTorque * numMotors * gearing;
    const maxLinearForce = totalStallTorque / drumRadius;

    // Gravity calculations
    const gravityForce = carriageMass * GRAVITY;
    const gravityHoldPct = (gravityForce / maxLinearForce) * 100;

    const simResult = useMemo(() => {
        return simulateElevator({
            motor, numMotors, gearing, drumRadius, carriageMass, ks, kv, ka, kp, kd, kg,
            setpointM, controlMode, durationS: duration, softLimitLow, softLimitHigh,
            profileMode, maxVelCmS, maxAccelCmSS, maxJerkCmSSS,
            profileKv, profileKa, ksSignSource,
            plantMode, plantKs, plantKv, plantKa, viscousFriction,
        });
    }, [motor, numMotors, gearing, drumRadius, carriageMass, ks, kv, ka, kp, kd, kg, setpointM, controlMode, duration, softLimitLow, softLimitHigh, profileMode, maxVelCmS, maxAccelCmSS, maxJerkCmSSS, profileKv, profileKa, ksSignSource, plantMode, plantKs, plantKv, plantKa, viscousFriction]);

    const finalM = simResult.history.length > 0 ? simResult.history[simResult.history.length - 1].position : 0;

    const ssErr = simResult.steadyStateError * 100;
    const ssColor = ssErr < 0.5 ? "#10b981" : ssErr < 2 ? "#fbbf24" : "#fb7185";
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
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}><h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: "#10b981", margin: 0 }}>ElevatorTuner</h1><span style={{ fontSize: 12, opacity: 0.3, fontFamily: MONO }}>Position PID Simulator</span></div>
                <p style={{ fontSize: 12, opacity: 0.3, marginTop: 4 }}>FRC elevator / lift / climber position control tuning sandbox</p>
            </header>

            <div style={{ padding: "20px 24px" }}>
                {/* Preset & Control Mode */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Preset</span>
                        <select value={presetId} onChange={e => applyPreset(e.target.value)} style={S.select}>
                            {ELEVATOR_PRESETS.map(p => <option key={p.id} value={p.id} style={{ background: "#1a1d2e" }}>{p.label}</option>)}
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
                    <div style={S.label}>Motor, Gearing & Mechanism</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>DC Motor</label><select value={motorId} onChange={e => { setMotorId(e.target.value); setPresetId("custom"); }} style={S.select}>{DC_MOTORS.map(m => <option key={m.id} value={m.id} style={{ background: "#1a1d2e" }}>{m.label}</option>)}</select></div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Number of Motors</label><div style={{ display: "flex", gap: 4 }}>{[1, 2, 3, 4].map(n => <button key={n} onClick={() => { setNumMotors(n); setPresetId("custom"); }} style={{ ...S.btn(numMotors === n), width: 36, textAlign: "center", padding: "4px 0" }}>{n}</button>)}</div></div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Gear Ratio</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><select value={gearingPreset === null ? "" : gearingPreset} onChange={e => { const v = e.target.value; if (v === "") setGearingPreset(null); else { setGearingPreset(parseFloat(v)); setGearing(parseFloat(v)); setPresetId("custom"); } }} style={{ ...S.select, width: 88 }}>{COMMON_GEARINGS.map(g => <option key={g.label} value={g.value === null ? "" : g.value} style={{ background: "#1a1d2e" }}>{g.label}</option>)}</select><input type="number" value={parseFloat(gearing.toFixed(2))} min={0.1} step={1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) { setGearing(v); setGearingPreset(null); setPresetId("custom"); } }} style={{ ...S.inputSmall, width: 64 }} /><span style={S.unit}>:1</span></div></div>
                    </div>

                    <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Drum / Sprocket Radius</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><select value={drumPreset === null ? "" : drumPreset} onChange={e => { const v = e.target.value; if (v === "") setDrumPreset(null); else { setDrumPreset(parseFloat(v)); setDrumRadius(parseFloat(v)); setPresetId("custom"); } }} style={{ ...S.select, width: 160 }}>{DRUM_PRESETS.map(g => <option key={g.label} value={g.value === null ? "" : g.value} style={{ background: "#1a1d2e" }}>{g.label}</option>)}</select><input type="number" value={parseFloat((drumRadius * 1000).toFixed(2))} min={1} step={1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) { setDrumRadius(v / 1000); setDrumPreset(null); setPresetId("custom"); } }} style={{ ...S.inputSmall, width: 56 }} /><span style={S.unit}>mm</span></div></div>
                        <NumInput label="Carriage Mass (with game piece)" value={parseFloat(carriageMass.toFixed(2))} onChange={v => setMassCustom(Math.max(0.1, v))} unit="kg" step={0.5} inputStyle={{ width: 80 }} />
                    </div>

                    <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
                        <NumInput label="Soft Limit Low" value={parseFloat((softLimitLow * 100).toFixed(1))} onChange={v => setSoftLimitLow(v / 100)} unit="cm" step={5} inputStyle={{ width: 64 }} />
                        <NumInput label="Soft Limit High" value={parseFloat((softLimitHigh * 100).toFixed(1))} onChange={v => setSoftLimitHigh(v / 100)} unit="cm" step={5} inputStyle={{ width: 64 }} />
                    </div>

                    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>Per Motor</span>
                            <MotorSpecBar label="Stall τ" value={motor.stallTorque} max={10} color="#c084fc" unit="N·m" />
                            <MotorSpecBar label="Free Spd" value={motor.freeSpeed} max={20000} color="#10b981" unit="RPM" />
                            <MotorSpecBar label="Stall I" value={motor.stallCurrent} max={500} color="#fbbf24" unit="A" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>At Output ({numMotors}× {motor.label}, {fmt(gearing, 1)}:1)</span>
                            <MotorSpecBar label="Max Force" value={maxLinearForce} max={Math.max(maxLinearForce * 1.2, 1)} color="#c084fc" unit="N" />
                            <MotorSpecBar label="Free Spd" value={linearFreeSpeedCmS} max={Math.max(linearFreeSpeedCmS * 1.5, 1)} color="#10b981" unit="cm/s" />
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
                                <input type="range" min={softLimitLow * 100} max={softLimitHigh * 100} step={1} value={setpointM * 100} onChange={e => setSetpointM(parseFloat(e.target.value) / 100)} style={{ accentColor: "#10b981", width: 200 }} />
                                <input type="number" value={parseFloat((setpointM * 100).toFixed(1))} min={softLimitLow * 100} max={softLimitHigh * 100} step={1} onChange={e => { let v = parseFloat(e.target.value); if (!isNaN(v)) setSetpointM(Math.max(softLimitLow, Math.min(softLimitHigh, v / 100))); }} style={S.inputSmall} />
                                <span style={S.unit}>cm</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.25, fontFamily: MONO, width: 200 }}><span>{fmt(softLimitLow * 100, 0)}cm</span><span>{fmt(softLimitHigh * 100, 0)}cm</span></div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {SETPOINT_PRESETS.filter(p => p.value >= softLimitLow && p.value <= softLimitHigh).map(p => (
                                <button key={p.value} onClick={() => setSetpointM(p.value)} style={S.btn(setpointM === p.value)}>{p.label}</button>
                            ))}
                        </div>
                        <NumInput label="Duration" value={duration} onChange={v => setDuration(Math.max(0.5, Math.min(20, v)))} unit="s" step={0.5} inputStyle={{ width: 56 }} />
                    </div>
                    <div style={{ marginTop: 8, fontSize: 10, opacity: 0.3, fontFamily: MONO }}>
                        Max output speed: {fmt(linearFreeSpeedCmS, 0)} cm/s
                        <span> &nbsp;|&nbsp; Gravity force: {fmt(gravityForce, 1)} N ({fmt(gravityHoldPct, 1)}% of max force)</span>
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
                                <NumInput label="Max Velocity" value={maxVelCmS} onChange={v => setMaxVelCmS(Math.max(1, v))} unit="cm/s" step={10} inputStyle={{ width: 80 }} />
                                <NumInput label="Max Acceleration" value={maxAccelCmSS} onChange={v => setMaxAccelCmSS(Math.max(1, v))} unit="cm/s²" step={10} inputStyle={{ width: 80 }} />
                                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    <label style={{ ...S.fieldLabel, color: "#10b981", opacity: 0.7 }}>Max Jerk (0 = ∞)</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <input type="number" value={maxJerkCmSSS} min={0} step={100} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setMaxJerkCmSSS(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 80, borderColor: "rgba(16,185,129,0.3)", color: "#10b981" }} />
                                        <span style={{ ...S.unit, color: "#10b981" }}>cm/s³</span>
                                    </div>
                                    <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>{maxJerkCmSSS > 0 ? "S-curve (jerk-limited)" : "Pure trapezoidal (infinite jerk)"}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                                {maxJerkCmSSS > 0
                                    ? "S-curve profile: acceleration ramps smoothly (jerk-limited). Reduces belt/chain stress and current spikes."
                                    : "Pure trapezoidal: acceleration steps instantly. Equivalent to WPILib TrapezoidProfile or CTRE MotionMagic."
                                }
                            </div>
                            <div style={{ marginTop: 8, fontSize: 10, opacity: 0.25, fontFamily: MONO }}>
                                Hint: Set max vel to ~80% of free speed ({fmt(linearFreeSpeedCmS * 0.8, 0)} cm/s) for realistic behavior.
                            </div>
                        </div>
                    )}

                    {profileMode === "exponential" && (
                        <div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
                                <GainInput label="Profile kV (V·s/m or A·s/m)" value={profileKv} onChange={setProfileKv} step={0.001} color="#f59e0b" />
                                <GainInput label="Profile kA (V·s²/m or A·s²/m)" value={profileKa} onChange={setProfileKa} step={0.0001} color="#f59e0b" />
                            </div>
                            <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                                Exponential profile models back-EMF limited acceleration. τ = kA/kV = {fmt(profileKa > 0 && profileKv > 0 ? profileKa / profileKv : 0, 4)}s,
                                {" "}vMax ≈ {fmt(profileKv > 0 ? ((controlMode === "voltage" ? 12 : motor.stallCurrent * numMotors) - Math.abs(ks) - Math.abs(kg)) / profileKv : 0, 2)} m/s
                                ({fmt(profileKv > 0 ? ((controlMode === "voltage" ? 12 : motor.stallCurrent * numMotors) - Math.abs(ks) - Math.abs(kg)) / profileKv * 100 : 0, 0)} cm/s)
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
                                <button key={m.id} onClick={() => setKsSignSource(m.id)} style={S.btnColor(ksSignSource === m.id, m.color)}>{m.label}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.8 }}>
                        {ksSignSource === "error" && <>kS applied in the direction of position error: <span style={{ color: "#10b981" }}>kS · sgn(error)</span>. Simple — always pushes toward setpoint.</>}
                        {ksSignSource === "velocity" && <>kS applied in the direction of measured velocity: <span style={{ color: "#a78bfa" }}>kS · sgn(v_measured)</span>. Zero at rest, prevents jitter near setpoint.</>}
                        {ksSignSource === "closedloop" && <>kS applied in the direction of closed-loop PID output: <span style={{ color: "#38bdf8" }}>kS · sgn(kP·e + kD·ė)</span>. CTRE UseClosedLoopSign option.</>}
                    </div>
                </div>

                {/* Gains */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={S.label}>Control Gains ({controlMode === "voltage" ? "Voltage" : "Current"} Mode)</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
                        <GainInput label="kS (static)" value={ks} onChange={setKs} step={0.01} color="#10b981" />
                        <GainInput label="kG (gravity)" value={kg} onChange={setKg} step={0.01} color="#fbbf24" />
                        <GainInput label="kV (velocity FF)" value={kv} onChange={setKv} step={0.0001} color="#60a5fa" />
                        <GainInput label="kA (accel FF)" value={ka} onChange={setKa} step={0.0001} color="#c084fc" />
                        <GainInput label="kP (proportional)" value={kp} onChange={setKp} step={0.1} color="#38bdf8" />
                        <GainInput label="kD (derivative)" value={kd} onChange={setKd} step={0.01} color="#fb7185" />
                    </div>
                    {profileMode === "none" && (kv !== 0 || ka !== 0) && (
                        <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 6, fontSize: 11, fontFamily: MONO, color: "#fbbf24", lineHeight: 1.6 }}>
                            ⚠ kV and kA have no effect without a motion profile. Enable Trapezoid or Exponential profiling above.
                        </div>
                    )}
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Reference Values</div>
                        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>Max force =</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#c084fc" }}>{fmt(maxLinearForce, 1)} N</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>Max velocity =</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#10b981" }}>{fmt(linearFreeSpeedCmS, 0)} cm/s</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>Gravity force =</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#fbbf24" }}>{fmt(gravityForce, 1)} N ({fmt(gravityHoldPct, 1)}% of max)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Elevator Viz + Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 20 }}>
                    <div style={{ ...S.cardSubtle, minWidth: 220 }}>
                        <ElevatorViz currentM={finalM} setpointM={setpointM} softLimitHigh={softLimitHigh} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, alignContent: "start" }}>
                        <MetricCard label="Rise Time (90%)" value={simResult.riseTime !== null ? fmt(simResult.riseTime, 3) : "—"} unit="s" color={simResult.riseTime !== null && simResult.riseTime < 1 ? "#10b981" : "#fbbf24"} />
                        <MetricCard label="Settle Time (2%)" value={simResult.settleTime !== null ? fmt(simResult.settleTime, 3) : "—"} unit="s" color={simResult.settleTime !== null && simResult.settleTime < 2 ? "#10b981" : "#fbbf24"} />
                        <MetricCard label="Overshoot" value={fmt(simResult.overshoot, 1)} unit="%" color={osColor} warn={simResult.overshoot > 10} />
                        <MetricCard label="SS Error" value={fmt(ssErr, 2)} unit="cm" color={ssColor} warn={ssErr > 2} />
                        <MetricCard label="Final Position" value={fmt(finalM * 100, 1)} unit="cm" color="#e2e8f0" />
                        <MetricCard label={setpointM >= 0 ? "Peak Position" : "Min Position"} value={fmt((setpointM >= 0 ? simResult.maxM : simResult.minM) * 100, 1)} unit="cm" color="#10b981" />
                    </div>
                </div>

                {/* Charts */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
                        {TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={S.btn(activeTab === t.id)}>{t.label}</button>)}
                    </div>
                    {activeTab === "position" && <PositionChart history={simResult.history} setpointM={setpointM} profileMode={profileMode} />}
                    {activeTab === "velocity" && <VelocityChart history={simResult.history} />}
                    {activeTab === "effort" && <EffortChart history={simResult.history} controlMode={controlMode} />}
                    {activeTab === "error" && <ErrorChart history={simResult.history} />}
                </div>

                {/* Control Equation */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Control Law — Elevator Position PID{profileMode !== "none" ? ` + ${profileMode === "trapezoid" ? "Trapezoid" : "Exponential"} Profile` : ""}</div>
                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 13, fontFamily: MONO, color: "#e2e8f0", lineHeight: 1.8 }}>
                            <span style={{ opacity: 0.5 }}>{controlMode === "voltage" ? "V" : "I"} = </span>
                            <span style={{ color: "#10b981" }}>kS·sgn({ksSignSource === "velocity" ? "v" : ksSignSource === "closedloop" ? "CL" : "e"})</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#fbbf24" }}>kG</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#60a5fa" }}>kV·v_profile</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#c084fc" }}>kA·a_profile</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#38bdf8" }}>kP·e</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#fb7185" }}>kD·ė</span>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                            e = x_setpoint − x_measured (m) &nbsp;|&nbsp; ė = dx/dt &nbsp;|&nbsp; kG is constant gravity compensation (unlike arms where it varies with angle)
                        </div>
                        <div style={{ marginTop: 8, fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                            For elevators: kG should roughly equal the {controlMode === "voltage" ? "voltage" : "current"} needed to hold the carriage stationary against gravity
                        </div>
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
                            <div><span style={{ opacity: 0.4 }}>Free speed (motor): </span><span style={{ color: "#10b981" }}>{fmt(motor.freeSpeed, 0)} RPM</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.freeSpeedRadS, 2)} rad/s</span></div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Rotational to Linear Conversion</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, color: "#e2e8f0", lineHeight: 2 }}>
                            <div><span style={{ opacity: 0.4 }}>Drum radius: </span><span style={{ color: "#10b981" }}>r = {fmt(drumRadius * 1000, 2)} mm</span></div>
                            <div><span style={{ opacity: 0.4 }}>Linear velocity: </span><span style={{ color: "#10b981" }}>v = ω_output · r</span></div>
                            <div><span style={{ opacity: 0.4 }}>Linear force: </span><span style={{ color: "#c084fc" }}>F = τ_output / r</span></div>
                            <div><span style={{ opacity: 0.4 }}>Effective inertia: </span><span style={{ color: "#60a5fa" }}>J_eff = m · r²</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(carriageMass * drumRadius * drumRadius, 6)} kg·m²</span></div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Physics Integration</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                            <div>Timestep: <span style={{ color: "#e2e8f0" }}>Δt = 1 ms</span> (1 kHz fixed-step Euler integration)</div>
                            <div>Position update: <span style={{ color: "#e2e8f0" }}>x(t+Δt) = x(t) + v·Δt</span></div>
                            <div>Velocity update: <span style={{ color: "#e2e8f0" }}>v(t+Δt) = v(t) + a·Δt</span></div>
                            <div>Net force: <span style={{ color: "#e2e8f0" }}>F_net = F_motor − m·g − F_friction</span></div>
                            <div>Friction: <span style={{ color: "#f43f5e" }}>F_f = F_static·sgn(v) + β·v</span> (configurable below)</div>
                            <div>Gravity: <span style={{ color: "#e2e8f0" }}>F_gravity = m·g = {fmt(gravityForce, 2)} N</span> (constant, always downward)</div>
                            <div>Soft limits: <span style={{ color: "#e2e8f0" }}>[{fmt(softLimitLow * 100, 0)}cm, {fmt(softLimitHigh * 100, 0)}cm]</span> with damped bounce</div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Assumptions & Limitations</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                            <div>Friction model: <span style={{ color: "#f43f5e" }}>static + viscous</span> — configurable via Plant Model section below</div>
                            <div>No current limiting — real motor controllers enforce supply and stator current limits</div>
                            <div>No sensor noise or quantization — real encoders have finite resolution and latency</div>
                            <div>No control loop latency — real systems have 5–20 ms loop periods, not continuous</div>
                            <div>No cable stretch — real belt/cable systems have compliance that affects dynamics</div>
                            <div>Mass is constant — real systems may pick up game pieces, changing carriage mass</div>
                        </div>
                    </div>
                </div>

                {/* Voltage Tuning Guide */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(16,185,129,0.15)" }}>
                    <div style={{ ...S.label, color: "#10b981", opacity: 0.7 }}>Position PID Tuning Guide — Voltage Mode</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Start with kG for gravity compensation", color: "#fbbf24", lines: [
                                    "Unlike turrets, elevators must constantly fight gravity — this is the first thing to tune.",
                                    "With all other gains at zero, increase kG until the carriage just barely floats (doesn't fall).",
                                    "Typical starting point: kG ≈ (gravity force / max force) × 12V. For this setup: ~" + fmt((gravityForce / maxLinearForce) * 12, 2) + "V"
                                ]},
                            { step: "2", title: "Add kP to reach the setpoint", color: "#38bdf8", lines: [
                                    "kP output is in volts per meter of error. Start at ~20-50 V/m for typical elevators.",
                                    "Increase kP until the elevator reaches the setpoint. It will likely oscillate.",
                                    "The oscillation happens because kP alone can't stop the carriage when it arrives."
                                ]},
                            { step: "3", title: "Add kD to damp oscillation", color: "#fb7185", lines: [
                                    "kD opposes velocity — it brakes the carriage as it approaches the setpoint.",
                                    "Start kD at ~5–10% of kP (in V/(m/s)). Increase until oscillation disappears.",
                                    "Too much kD makes the system sluggish. Too little leaves overshoot and ringing."
                                ]},
                            { step: "4", title: "Add kS for static friction (if needed)", color: "#10b981", lines: [
                                    "kS provides a constant voltage in the direction of error, overcoming static friction.",
                                    "Elevator linear bearings usually have low friction, so kS is often unnecessary.",
                                    "If the elevator doesn't quite reach setpoint, try kS = 0.1–0.5V."
                                ]},
                            { step: "5", title: "Consider motion profiling", color: "#60a5fa", lines: [
                                    "Simple PID sends full effort immediately, causing voltage saturation on large moves.",
                                    "Motion profiles limit velocity and acceleration, enabling kV/kA feedforward.",
                                    "WPILib's TrapezoidProfile or CTRE's MotionMagic handle this — the sim shows the unproﬁled response."
                                ]},
                            { step: "6", title: "Validate and iterate", color: "#10b981", lines: [
                                    "Target: rise time < 0.5s, overshoot < 5%, SS error < 1cm, settle < 1s.",
                                    "Test both up and down movements — gravity makes them behave differently.",
                                    "Test with and without game pieces — the mass change affects dynamics significantly."
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
                                    "In current mode, you command amps (force via torque) instead of volts. The motor controller handles voltage internally.",
                                    "Current ∝ force: F = Kt · I · G / r. This gives direct force control — very natural for elevators.",
                                    "Gains have different units: kP is now A/m instead of V/m, kG is amps instead of volts."
                                ]},
                            { step: "2", title: "Start with kG for gravity", color: "#fbbf24", lines: [
                                    "kG in current mode is the amps needed to produce the force that counterbalances gravity.",
                                    "Calculate: I_gravity = F_gravity / (Kt · N · G / r). For this setup: ~" + fmt(gravityForce / (motor.stallTorque / motor.stallCurrent * numMotors * gearing / drumRadius), 2) + "A",
                                    "This should make the carriage float. Current mode makes gravity compensation more direct."
                                ]},
                            { step: "3", title: "Add kP (higher than voltage mode)", color: "#38bdf8", lines: [
                                    "Current mode is more linear — you can typically use higher kP values.",
                                    "Start at ~1-5 A/m. Current mode often achieves better response with simpler tuning.",
                                    "Increase until oscillation, then back off 20-30%."
                                ]},
                            { step: "4", title: "Add kD for damping", color: "#fb7185", lines: [
                                    "kD in current mode commands amps proportional to velocity — it resists motion.",
                                    "Start at ~5% of kP. Current mode often needs less kD because the response is more predictable.",
                                    "Watch the current chart for spikes — they indicate derivative kick on step changes."
                                ]},
                            { step: "5", title: "Validate", color: "#10b981", lines: [
                                    "Current mode often produces less overshoot than voltage mode for the same rise time.",
                                    "CTRE's TorqueCurrentFOC with ElevatorFeedforward handles this particularly well.",
                                    "Test up/down and with/without game pieces. Current mode generalizes better across operating points."
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
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(96,165,250,0.15)" }}>
                    <div style={{ ...S.label, color: "#60a5fa", opacity: 0.7 }}>Motion Profiling Guide</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Why use motion profiling?", color: "#60a5fa", lines: [
                                    "A step setpoint demands infinite acceleration — physically impossible and stresses belts/chains.",
                                    "Motion profiling generates a smooth trajectory the elevator can follow.",
                                    "With profiling, kV and kA feedforward become effective since desired velocity/acceleration are known."
                                ]},
                            { step: "2", title: "Set max velocity", color: "#10b981", lines: [
                                    "Max velocity limits peak linear speed during the move.",
                                    `Set to ~80% of free speed: ${fmt(linearFreeSpeedCmS * 0.8, 0)} cm/s for your setup.`,
                                    "Too high: motor can't keep up while fighting gravity. Too low: unnecessarily slow."
                                ]},
                            { step: "3", title: "Set max acceleration", color: "#fbbf24", lines: [
                                    "This limits how fast velocity changes (cm/s²).",
                                    "Start conservative (200–500 cm/s²). Elevators need more force to accelerate upward than downward.",
                                    "Watch the effort chart — if voltage/current saturates during accel phase, reduce the constraint."
                                ]},
                            { step: "4", title: "Optional: Add jerk limiting", color: "#a78bfa", lines: [
                                    "Jerk = rate of acceleration change. Jerk = 0 means infinite (pure trapezoidal).",
                                    "S-curve profiles reduce belt/chain stress, vibration, and current spikes.",
                                    "Especially useful for heavy elevators or cascade designs with cable compliance."
                                ]},
                            { step: "5", title: "Tune kV and kA feedforward", color: "#60a5fa", lines: [
                                    "kV produces the effort to maintain the profiled velocity. kA produces effort for profiled acceleration.",
                                    "With good feedforward, kP can be lower — less aggressive feedback for the same tracking performance.",
                                    "Note: kG still handles gravity separately. kV/kA handle the dynamic motion component."
                                ]},
                            { step: "6", title: "Validate tracking", color: "#10b981", lines: [
                                    "Watch position chart — actual should follow the profile (green dashed line) closely.",
                                    "Test both upward and downward moves — gravity makes them asymmetric.",
                                    "Large tracking gaps mean feedforward is wrong or constraints exceed available force."
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
                    <div style={S.label}>Elevator Position Control Physics Reference</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, fontSize: 12, opacity: 0.6, fontFamily: MONO }}>
                        <div>F_motor = Kt · I_motor · N · G / r</div>
                        <div>F_net = F_motor − m·g − F_friction</div>
                        <div>F_friction = F_static·sgn(v) + β·v</div>
                        <div>a = F_net / m (linear acceleration)</div>
                        <div>v = ∫ a dt (linear velocity)</div>
                        <div>x = ∫ v dt (linear position)</div>
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
                            ? "Plant dynamics from motor specs, gearing, drum radius, and mass above. Friction parameters below add realism."
                            : "Plant dynamics from feedforward constants (like from SysId). Derives effective mass from kA/kV."
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
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Effort to overcome static friction (belt/bearing drag)</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Viscous Friction</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={viscousFriction} min={0} step={0.1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setViscousFriction(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>N/(m/s)</span>
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
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V/(m/s)" : "A/(m/s)"}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Plant kA</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={plantKa} min={0} step={0.0001} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPlantKa(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V/(m/s²)" : "A/(m/s²)"}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Viscous Friction</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={viscousFriction} min={0} step={0.1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setViscousFriction(Math.max(0, v)); }} style={{ ...S.inputSmall, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }} />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>N/(m/s)</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(244,63,94,0.04)", borderRadius: 6, border: "1px solid rgba(244,63,94,0.1)" }}>
                        <div style={{ fontSize: 10, opacity: 0.5, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Friction Model</div>
                        <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.6, lineHeight: 1.8 }}>
                            <div>F_friction = <span style={{ color: "#f43f5e" }}>F_static·sgn(v)</span> + <span style={{ color: "#f43f5e" }}>β·v</span></div>
                            <div style={{ opacity: 0.5, marginTop: 4 }}>
                                F_static derived from plant kS: {controlMode === "voltage" ? "F = Kt·N·G·(kS/R)/r" : "F = Kt·G·kS/r"} &nbsp;|&nbsp; β = viscous friction coefficient
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer style={{ padding: "16px 24px", textAlign: "center" }}>
                <span style={{ fontSize: 12, opacity: 0.2, fontFamily: MONO }}>Elevator Position Tuning Simulator — FRC Mechanism Control</span>
            </footer>
        </div>
    );
}