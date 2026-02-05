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

// ─── Trapezoidal Motion Profile Generator ────────────────────────────────────
function generateTrapezoidalProfile({
                                        startVel,
                                        endVel,
                                        cruiseVel,
                                        maxAccel,
                                        maxJerk,
                                        durationS
                                    }) {
    const steps = Math.ceil(durationS / DT);
    const profile = [];

    const direction = endVel >= startVel ? 1 : -1;
    const deltaV = Math.abs(endVel - startVel);

    if (deltaV < 0.001) {
        for (let i = 0; i <= steps; i++) {
            profile.push({ t: i * DT, setpoint: endVel, setpointAccel: 0 });
        }
        return profile;
    }

    const useJerkLimit = maxJerk > 0;

    if (useJerkLimit) {
        const t_j = maxAccel / maxJerk;
        let currentVel = startVel;
        let currentAccel = 0;

        const targetVel = direction > 0
            ? Math.min(endVel, cruiseVel)
            : Math.max(endVel, -cruiseVel);

        for (let i = 0; i <= steps; i++) {
            const t = i * DT;
            const remainingDeltaV = (targetVel - currentVel) * direction;

            if (remainingDeltaV > 0.001) {
                const accelStopV = currentAccel > 0 ? (currentAccel * currentAccel) / (2 * maxJerk) : 0;

                if (remainingDeltaV <= accelStopV + 0.001) {
                    currentAccel = Math.max(0, currentAccel - maxJerk * DT);
                } else if (currentAccel < maxAccel) {
                    currentAccel = Math.min(maxAccel, currentAccel + maxJerk * DT);
                }

                currentVel += direction * currentAccel * DT;
            } else {
                currentAccel = 0;
                currentVel = targetVel;
            }

            profile.push({ t, setpoint: currentVel, setpointAccel: direction * currentAccel });
        }
    } else {
        let currentVel = startVel;

        const targetVel = direction > 0
            ? Math.min(endVel, cruiseVel)
            : Math.max(endVel, -cruiseVel);

        for (let i = 0; i <= steps; i++) {
            const t = i * DT;
            const remainingDeltaV = (targetVel - currentVel) * direction;

            if (remainingDeltaV > 0.001) {
                currentVel += direction * maxAccel * DT;
                if (direction > 0) currentVel = Math.min(currentVel, targetVel);
                else currentVel = Math.max(currentVel, targetVel);

                profile.push({ t, setpoint: currentVel, setpointAccel: direction * maxAccel });
            } else {
                profile.push({ t, setpoint: targetVel, setpointAccel: 0 });
            }
        }
    }

    return profile;
}

function simulateFlywheel({
                              motor, numMotors, gearing, moi, ks, kv, ka, kp, kd, setpointRPM, controlMode, durationS = 5,
                              profileMode = "none",
                              cruiseVelRPM = 3000,
                              maxAccelRPMps = 5000,
                              maxJerkRPMps2 = 0,
                              // Plant model parameters
                              plantMode = "physical", // "physical" | "feedforward"
                              plantKs = 0,  // Static friction (used as friction torque in sim)
                              plantKv = 0,  // For feedforward mode: V/(rad/s) or A/(rad/s)
                              plantKa = 0,  // For feedforward mode
                              viscousFriction = 0, // N·m/(rad/s) - viscous friction coefficient
                          }) {
    const mc = motorConstants(motor);
    const setpointRadS = (setpointRPM * 2 * Math.PI) / 60;
    const outputFreeSpeedRadS = mc.freeSpeedRadS / gearing;

    // Plant model parameters - either from physics or direct feedforward constants
    let effectiveMOI, totalKt, effectiveR, effectiveKv;

    if (plantMode === "physical") {
        // Derive from motor + gearing + MOI
        effectiveMOI = moi;
        totalKt = mc.Kt * numMotors * gearing;
        effectiveR = mc.R / numMotors;
        effectiveKv = mc.Kv;
    } else {
        // Feedforward constants mode - derive equivalent physical params
        // From V = kS + kV*ω at steady state, and τ = J*α
        // kV = R / (Kt * N * G) for voltage mode (approx)
        // kA = J * R / (Kt * N * G) for voltage mode
        // So J = kA / kV (if kV != 0)
        effectiveMOI = plantKv > 0 ? plantKa / plantKv : moi;
        totalKt = mc.Kt * numMotors * gearing;
        effectiveR = mc.R / numMotors;
        effectiveKv = mc.Kv;
    }

    // Static friction torque derived from plantKs (the control kS value)
    // In voltage mode: kS [V] → I = kS/R → τ = Kt*I = Kt*kS/R
    // This is the torque that kS is meant to overcome
    const staticFrictionTorque = controlMode === "voltage"
        ? (plantKs * totalKt) / (effectiveR * numMotors)
        : plantKs * totalKt / numMotors; // current mode: kS [A] → τ = Kt*kS

    const steps = Math.ceil(durationS / DT);
    const record = Math.max(1, Math.floor(steps / 2000));
    const history = [];

    // Generate motion profile if enabled
    let motionProfile = null;
    if (profileMode === "trapezoidal") {
        const cruiseVelRadS = (cruiseVelRPM * 2 * Math.PI) / 60;
        const maxAccelRadSps = (maxAccelRPMps * 2 * Math.PI) / 60;
        const maxJerkRadSps2 = (maxJerkRPMps2 * 2 * Math.PI) / 60;

        motionProfile = generateTrapezoidalProfile({
            startVel: 0,
            endVel: setpointRadS,
            cruiseVel: cruiseVelRadS,
            maxAccel: maxAccelRadSps,
            maxJerk: maxJerkRadSps2,
            durationS
        });
    }

    let omega = 0;
    let prevError = setpointRadS;
    let appliedVolts = 0;
    let appliedCurrent = 0;
    let motorCurrent = 0;

    for (let i = 0; i <= steps; i++) {
        const t = i * DT;

        // Get current setpoint from profile or use constant
        let currentSetpointRadS = setpointRadS;
        let profileAccel = 0;

        if (motionProfile && i < motionProfile.length) {
            currentSetpointRadS = motionProfile[i].setpoint;
            profileAccel = motionProfile[i].setpointAccel;
        } else if (motionProfile) {
            currentSetpointRadS = motionProfile[motionProfile.length - 1].setpoint;
            profileAccel = 0;
        }

        const error = currentSetpointRadS - omega;

        // feedforward (controller output)
        const ffSign = currentSetpointRadS === 0 ? 0 : Math.sign(currentSetpointRadS);
        const ffKs = ks * ffSign;
        const ffKv = kv * currentSetpointRadS;

        // For kA: use profile acceleration if available, otherwise estimate
        let desiredAccel;
        if (profileMode === "trapezoidal") {
            desiredAccel = profileAccel;
        } else {
            desiredAccel = i === 0 ? 0 : (error - prevError) / DT;
        }
        const ffKa = ka * desiredAccel;

        // feedback
        const fbP = kp * error;
        const fbD = kd * (i === 0 ? 0 : (error - prevError) / DT);

        // Friction model: static + viscous
        // Static friction opposes motion initiation, viscous friction opposes motion proportionally
        let frictionTorque = 0;
        if (Math.abs(omega) < 0.01) {
            // Near zero velocity - static friction regime
            // Static friction opposes any applied torque up to the static friction limit
            frictionTorque = staticFrictionTorque * (omega === 0 ? 0 : Math.sign(omega));
        } else {
            // Moving - static friction is overcome, apply viscous + coulomb
            frictionTorque = staticFrictionTorque * Math.sign(omega) + viscousFriction * omega;
        }

        if (controlMode === "voltage") {
            const rawV = ffKs + ffKv + ffKa + fbP + fbD;
            appliedVolts = clampVoltage(rawV);

            const backEmf = omega * gearing / effectiveKv;
            motorCurrent = numMotors > 0 ? (appliedVolts - backEmf) / effectiveR : 0;
            const motorTorque = totalKt * (motorCurrent / numMotors);
            const netTorque = motorTorque - frictionTorque;
            const alpha = effectiveMOI > 0 ? netTorque / effectiveMOI : 0;
            omega += alpha * DT;
            appliedCurrent = motorCurrent;
        } else {
            const rawI = ffKs + ffKv + ffKa + fbP + fbD;
            appliedCurrent = clampCurrent(rawI, motor.stallCurrent * numMotors);
            motorCurrent = appliedCurrent;

            const motorTorque = totalKt * (motorCurrent / numMotors);
            const netTorque = motorTorque - frictionTorque;
            const alpha = effectiveMOI > 0 ? netTorque / effectiveMOI : 0;
            omega += alpha * DT;
            const backEmf = omega * gearing / effectiveKv;
            appliedVolts = backEmf + motorCurrent * effectiveR / numMotors;
        }

        // Clamp velocity (can't go negative if setpoint is positive, can't exceed free speed)
        if (omega < 0 && setpointRadS >= 0) omega = 0;
        if (omega > outputFreeSpeedRadS * 1.05) omega = outputFreeSpeedRadS * 1.05;

        prevError = error;

        if (i % record === 0) {
            history.push({
                t,
                omega,
                omegaRPM: (omega * 60) / (2 * Math.PI),
                setpointRPM: (currentSetpointRadS * 60) / (2 * Math.PI),
                finalSetpointRPM: setpointRPM,
                setpointRadS: currentSetpointRadS,
                voltage: appliedVolts,
                current: appliedCurrent,
                error,
                errorRPM: (error * 60) / (2 * Math.PI),
                profileAccelRPMps: (profileAccel * 60) / (2 * Math.PI),
                frictionTorque,
            });
        }
    }

    // metrics
    const setRPM = setpointRPM;
    const finalRPM = history[history.length - 1].omegaRPM;
    const steadyStateError = Math.abs(setRPM - finalRPM);
    let riseTime = null, settleTime = null, overshoot = 0;
    let maxRPM = 0;

    for (const pt of history) {
        if (pt.omegaRPM > maxRPM) maxRPM = pt.omegaRPM;
        if (riseTime === null && pt.omegaRPM >= setRPM * 0.9 && setRPM > 0) riseTime = pt.t;
    }

    if (setRPM > 0) {
        overshoot = ((maxRPM - setRPM) / setRPM) * 100;
        if (overshoot < 0) overshoot = 0;
    }

    for (let i = history.length - 1; i >= 0; i--) {
        if (Math.abs(history[i].omegaRPM - setRPM) > setRPM * 0.02) {
            settleTime = history[Math.min(i + 1, history.length - 1)].t;
            break;
        }
    }

    return { history, riseTime, settleTime, overshoot, steadyStateError, finalRPM, maxRPM };
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
    { label: "Custom", value: null }, { label: "1:1", value: 1 }, { label: "2:1", value: 2 }, { label: "3:1", value: 3 },
    { label: "4:1", value: 4 }, { label: "5:1", value: 5 }, { label: "9:1", value: 9 }, { label: "10:1", value: 10 },
    { label: "12:1", value: 12 }, { label: "16:1", value: 16 }, { label: "20:1", value: 20 }, { label: "25:1", value: 25 },
    { label: "36:1", value: 36 }, { label: "48:1", value: 48 }, { label: "64:1", value: 64 },
];

const FLYWHEEL_PRESETS = [
    { id: "custom", label: "Custom", moi: 0.005, motorId: "krakenX60FOC", numMotors: 1, gearing: 1 },
    { id: "shooter4in", label: "4\" Shooter Wheel", moi: 0.002, motorId: "krakenX60FOC", numMotors: 1, gearing: 1 },
    { id: "shooter6in", label: "6\" Shooter Wheel", moi: 0.008, motorId: "krakenX60FOC", numMotors: 1, gearing: 1 },
    { id: "dualWheel", label: "Dual Wheel Shooter", moi: 0.012, motorId: "krakenX60FOC", numMotors: 2, gearing: 1 },
    { id: "heavyFlywheel", label: "Heavy Flywheel", moi: 0.025, motorId: "falcon500FOC", numMotors: 1, gearing: 2 },
    { id: "indexer", label: "Indexer / Serializer", moi: 0.001, motorId: "neo550", numMotors: 1, gearing: 3 },
];

const SETPOINT_PRESETS = [
    { label: "500 RPM", value: 500 }, { label: "1000 RPM", value: 1000 }, { label: "2000 RPM", value: 2000 },
    { label: "3000 RPM", value: 3000 }, { label: "4000 RPM", value: 4000 }, { label: "5000 RPM", value: 5000 },
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
    btn: (a) => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.04)", color: a ? "#f97316" : "rgba(255,255,255,0.5)", border: a ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.06)", transition: "all 0.15s ease" }),
    btnAlt: (a, color = "#06b6d4") => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? `${color}22` : "rgba(255,255,255,0.04)", color: a ? color : "rgba(255,255,255,0.5)", border: a ? `1px solid ${color}66` : "1px solid rgba(255,255,255,0.06)", transition: "all 0.15s ease" }),
};

function NumInput({ label, value, onChange, unit, inputStyle, step, min, max }) {
    return (<div style={{ display: "flex", flexDirection: label ? "column" : "row", gap: 4, alignItems: label ? "flex-start" : "center" }}>
        {label && <label style={S.fieldLabel}>{label}</label>}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={value} step={step} min={min} max={max} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }} style={{ ...S.input, ...inputStyle }} />{unit && <span style={S.unit}>{unit}</span>}</div>
    </div>);
}

function GainInput({ label, value, onChange, step = 0.001, color = "#f97316" }) {
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

// ─── Velocity Chart ─────────────────────────────────────────────────────────
function VelocityChart({ history, setpointRPM, profileMode }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 280, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;

        const maxT = history[history.length - 1].t;
        let yMax = setpointRPM * 1.3;
        for (const pt of history) {
            if (pt.omegaRPM > yMax) yMax = pt.omegaRPM * 1.1;
            if (pt.setpointRPM > yMax) yMax = pt.setpointRPM * 1.1;
        }
        if (yMax < 100) yMax = 100;
        const yMin = 0;

        drawGrid(ctx, pad, pw, ph, 5, 5);

        // final setpoint line (dashed)
        const spY = pad.t + ph * (1 - (setpointRPM - yMin) / (yMax - yMin));
        ctx.strokeStyle = "rgba(249,115,22,0.4)"; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(pad.l, spY); ctx.lineTo(pad.l + pw, spY); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(249,115,22,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "right";
        ctx.fillText(`Target: ${setpointRPM} RPM`, pad.l + pw - 4, spY - 6);

        // 2% band around final setpoint
        const bandHi = setpointRPM * 1.02, bandLo = setpointRPM * 0.98;
        const bhY = pad.t + ph * (1 - (bandHi - yMin) / (yMax - yMin));
        const blY = pad.t + ph * (1 - (bandLo - yMin) / (yMax - yMin));
        ctx.fillStyle = "rgba(249,115,22,0.04)";
        ctx.fillRect(pad.l, bhY, pw, blY - bhY);

        // Profile setpoint line (if profiling enabled)
        if (profileMode === "trapezoidal") {
            ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
            ctx.beginPath();
            history.forEach((pt, i) => {
                const x = pad.l + (pt.t / maxT) * pw;
                const y = pad.t + ph * (1 - (pt.setpointRPM - yMin) / (yMax - yMin));
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // velocity curve
        ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2.5; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.omegaRPM - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        // axes labels
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(yMax - (i / 5) * (yMax - yMin), 0), pad.l - 8, pad.t + (i / 5) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Velocity (RPM)", 0, 0); ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("VELOCITY RESPONSE", pad.l, pad.t - 10);

        // Legend
        ctx.fillStyle = "#3b82f6"; ctx.font = `10px ${MONO}`; ctx.textAlign = "right";
        ctx.fillText("● Actual", pad.l + pw, pad.t - 10);
        if (profileMode === "trapezoidal") {
            ctx.fillStyle = "#06b6d4";
            ctx.fillText("┅ Profile", pad.l + pw - 70, pad.t - 10);
        }
    }, [history, setpointRPM, profileMode]);
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
        for (const pt of history) { if (pt.errorRPM > yMax) yMax = pt.errorRPM; if (pt.errorRPM < yMin) yMin = pt.errorRPM; }
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
            const y = pad.t + ph * (1 - (pt.errorRPM - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 4; i++) ctx.fillText(fmt(yMax - (i / 4) * (yMax - yMin), 0), pad.l - 8, pad.t + (i / 4) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Error (RPM)", 0, 0); ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("TRACKING ERROR", pad.l, pad.t - 10);
    }, [history]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Flywheel Visualization ─────────────────────────────────────────────────
function FlywheelViz({ currentRPM, setpointRPM, maxRPM }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    const angleRef = useRef(0);
    const animRef = useRef(null);
    const rpmRef = useRef(currentRPM);
    rpmRef.current = currentRPM;

    useEffect(() => {
        const c = canvasRef.current, ct = containerRef.current;
        if (!c || !ct) return;
        let lastTime = performance.now();

        function animate(now) {
            const dt = (now - lastTime) / 1000;
            lastTime = now;
            const rpm = rpmRef.current;
            const rps = rpm / 60;
            angleRef.current += rps * 2 * Math.PI * dt;

            const d = window.devicePixelRatio || 1;
            const w = ct.clientWidth, h = 160;
            c.width = w * d; c.height = h * d;
            c.style.width = w + "px"; c.style.height = h + "px";
            const ctx = c.getContext("2d");
            ctx.scale(d, d);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2, r = 50;

            // outer ring
            ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 8;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

            // progress arc
            const pct = maxRPM > 0 ? Math.min(rpmRef.current / maxRPM, 1) : 0;
            const arcColor = pct > 0.95 ? "#10b981" : pct > 0.5 ? "#3b82f6" : "#f97316";
            ctx.strokeStyle = arcColor; ctx.lineWidth = 8; ctx.lineCap = "round";
            ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2); ctx.stroke(); ctx.lineCap = "butt";

            // spokes
            const angle = angleRef.current;
            for (let i = 0; i < 6; i++) {
                const a = angle + (i * Math.PI) / 3;
                ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx + 12 * Math.cos(a), cy + 12 * Math.sin(a));
                ctx.lineTo(cx + (r - 8) * Math.cos(a), cy + (r - 8) * Math.sin(a)); ctx.stroke();
            }

            // center
            ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fillStyle = arcColor; ctx.fill();
            ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = "#0c0e14"; ctx.fill();

            // text
            ctx.fillStyle = "#e2e8f0"; ctx.font = `bold 16px ${MONO}`; ctx.textAlign = "center";
            ctx.fillText(`${fmt(rpmRef.current, 0)} RPM`, cx, cy + r + 30);
            ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = `10px ${MONO}`;
            ctx.fillText(`target: ${setpointRPM} RPM`, cx, cy + r + 46);

            animRef.current = requestAnimationFrame(animate);
        }
        animRef.current = requestAnimationFrame(animate);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [setpointRPM, maxRPM]);

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
export default function FlywheelTunerApp() {
    const [presetId, setPresetId] = useState("shooter4in");
    const [motorId, setMotorId] = useState("krakenX60FOC");
    const [numMotors, setNumMotors] = useState(1);
    const [gearingPreset, setGearingPreset] = useState(null);
    const [gearing, setGearing] = useState(1);
    const [moi, setMoi] = useState(0.002);
    const [controlMode, setControlMode] = useState("voltage");
    const [setpointRPM, setSetpointRPM] = useState(3000);
    const [duration, setDuration] = useState(3);

    // Motion profile settings
    const [profileMode, setProfileMode] = useState("none"); // "none" | "trapezoidal"
    const [cruiseVelRPM, setCruiseVelRPM] = useState(3000);
    const [maxAccelRPMps, setMaxAccelRPMps] = useState(5000);
    const [maxJerkRPMps2, setMaxJerkRPMps2] = useState(0); // 0 = infinite (pure trapezoidal)

    // gains
    const [ks, setKs] = useState(0);
    const [kv, setKv] = useState(0);
    const [ka, setKa] = useState(0);
    const [kp, setKp] = useState(0);
    const [kd, setKd] = useState(0);

    // Plant model settings
    const [plantMode, setPlantMode] = useState("physical"); // "physical" | "feedforward"
    const [plantKs, setPlantKs] = useState(0.05); // Static friction (V or A that kS must overcome)
    const [plantKv, setPlantKv] = useState(0); // For feedforward mode
    const [plantKa, setPlantKa] = useState(0); // For feedforward mode
    const [viscousFriction, setViscousFriction] = useState(0.0001); // N·m/(rad/s)

    const [activeTab, setActiveTab] = useState("velocity");

    const motor = DC_MOTORS.find(m => m.id === motorId);
    const mc = useMemo(() => motorConstants(motor), [motor]);

    const applyPreset = useCallback((id) => {
        setPresetId(id);
        if (id !== "custom") {
            const p = FLYWHEEL_PRESETS.find(pr => pr.id === id);
            if (p) { setMoi(p.moi); setMotorId(p.motorId); setNumMotors(p.numMotors); setGearing(p.gearing); setGearingPreset(p.gearing === 1 ? 1 : null); }
        }
    }, []);

    const setMoiCustom = (v) => { setMoi(v); setPresetId("custom"); };

    // compute theoretical kV and kS for hint
    const theoreticalKv = useMemo(() => {
        const freeRadS = mc.freeSpeedRadS / gearing;
        return freeRadS > 0 ? NOMINAL_V / freeRadS : 0;
    }, [mc, gearing]);

    const theoreticalKs = useMemo(() => {
        return mc.R * motor.freeCurrent / (numMotors > 0 ? 1 : 1);
    }, [mc, motor, numMotors]);

    const outputFreeSpeedRPM = useMemo(() => motor.freeSpeed / gearing, [motor, gearing]);

    const simResult = useMemo(() => {
        return simulateFlywheel({
            motor, numMotors, gearing, moi, ks, kv, ka, kp, kd,
            setpointRPM, controlMode, durationS: duration,
            profileMode, cruiseVelRPM, maxAccelRPMps, maxJerkRPMps2,
            plantMode, plantKs, plantKv, plantKa, viscousFriction
        });
    }, [motor, numMotors, gearing, moi, ks, kv, ka, kp, kd, setpointRPM, controlMode, duration, profileMode, cruiseVelRPM, maxAccelRPMps, maxJerkRPMps2, plantMode, plantKs, plantKv, plantKa, viscousFriction]);

    const finalRPM = simResult.history.length > 0 ? simResult.history[simResult.history.length - 1].omegaRPM : 0;

    // response quality
    const ssErr = simResult.steadyStateError;
    const ssColor = ssErr < setpointRPM * 0.01 ? "#10b981" : ssErr < setpointRPM * 0.05 ? "#eab308" : "#f43f5e";
    const osColor = simResult.overshoot < 2 ? "#10b981" : simResult.overshoot < 10 ? "#eab308" : "#f43f5e";

    const motorOutput = useMemo(() => {
        const totalStallTorque = motor.stallTorque * numMotors * gearing;
        const outputFreeSpeed = motor.freeSpeed / gearing;
        const outputFreeSpeedRadS = (outputFreeSpeed * 2 * Math.PI) / 60;
        const totalStallCurrent = motor.stallCurrent * numMotors;
        return { totalStallTorque, outputFreeSpeed, outputFreeSpeedRadS, totalStallCurrent };
    }, [motor, numMotors, gearing]);

    const TABS = [
        { id: "velocity", label: "Velocity" },
        { id: "effort", label: controlMode === "voltage" ? "Voltage" : "Current" },
        { id: "error", label: "Error" },
    ];

    const autoTuneFF = useCallback(() => {
        setKs(parseFloat(theoreticalKs.toFixed(4)));
        setKv(parseFloat(theoreticalKv.toFixed(6)));
        setKa(0);
    }, [theoreticalKs, theoreticalKv]);

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0c0e14 0%, #111420 50%, #0c0e14 100%)", color: "#c8ced8", fontFamily: SANS }}>
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <header style={{ padding: "24px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}><h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: "#f97316", margin: 0 }}>FlywheelTuner</h1><span style={{ fontSize: 12, opacity: 0.3, fontFamily: MONO }}>Velocity PID Simulator</span></div>
                <p style={{ fontSize: 12, opacity: 0.3, marginTop: 4 }}>FRC flywheel feedforward + feedback tuning sandbox</p>
            </header>

            <div style={{ padding: "20px 24px" }}>
                {/* Preset & Control Mode */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Preset</span>
                        <select value={presetId} onChange={e => applyPreset(e.target.value)} style={S.select}>
                            {FLYWHEEL_PRESETS.map(p => <option key={p.id} value={p.id} style={{ background: "#1a1d2e" }}>{p.label}</option>)}
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
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Gear Ratio</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><select value={gearingPreset === null ? "" : gearingPreset} onChange={e => { const v = e.target.value; if (v === "") setGearingPreset(null); else { setGearingPreset(parseFloat(v)); setGearing(parseFloat(v)); setPresetId("custom"); } }} style={{ ...S.select, width: 88 }}>{COMMON_GEARINGS.map(g => <option key={g.label} value={g.value === null ? "" : g.value} style={{ background: "#1a1d2e" }}>{g.label}</option>)}</select><input type="number" value={parseFloat(gearing.toFixed(2))} min={0.1} step={0.1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) { setGearing(v); setGearingPreset(null); setPresetId("custom"); } }} style={{ ...S.inputSmall, width: 64 }} /><span style={S.unit}>:1</span></div></div>
                        <NumInput label="Moment of Inertia" value={parseFloat(moi.toFixed(6))} onChange={v => setMoiCustom(Math.max(0.0001, v))} unit="kg·m²" step={0.001} inputStyle={{ width: 110 }} />
                    </div>

                    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>Per Motor</span>
                            <MotorSpecBar label="Stall τ" value={motor.stallTorque} max={10} color="#a855f7" unit="N·m" />
                            <MotorSpecBar label="Free Spd" value={motor.freeSpeed} max={20000} color="#3b82f6" unit="RPM" />
                            <MotorSpecBar label="Stall I" value={motor.stallCurrent} max={500} color="#eab308" unit="A" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>At Output ({numMotors}× {motor.label}, {fmt(gearing, 1)}:1)</span>
                            <MotorSpecBar label="Stall τ" value={motorOutput.totalStallTorque} max={Math.max(motorOutput.totalStallTorque * 1.2, 1)} color="#a855f7" unit="N·m" />
                            <MotorSpecBar label="Free Spd" value={motorOutput.outputFreeSpeed} max={Math.max(motorOutput.outputFreeSpeed * 1.5, 1)} color="#3b82f6" unit="RPM" />
                            <MotorSpecBar label="Stall I" value={motorOutput.totalStallCurrent} max={Math.max(motorOutput.totalStallCurrent * 1.2, 1)} color="#eab308" unit="A" />
                        </div>
                    </div>
                </div>

                {/* Setpoint & Motion Profile */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Setpoint & Motion Profile</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={S.fieldLabel}>Velocity Setpoint</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input type="range" min={0} max={Math.ceil(outputFreeSpeedRPM)} step={50} value={setpointRPM} onChange={e => setSetpointRPM(parseFloat(e.target.value))} style={{ accentColor: "#f97316", width: 200 }} />
                                <input type="number" value={setpointRPM} min={0} max={Math.ceil(outputFreeSpeedRPM)} step={50} onChange={e => { let v = parseFloat(e.target.value); if (!isNaN(v)) setSetpointRPM(Math.max(0, Math.min(Math.ceil(outputFreeSpeedRPM), v))); }} style={S.inputSmall} />
                                <span style={S.unit}>RPM</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.25, fontFamily: MONO, width: 200 }}><span>0</span><span>{fmt(outputFreeSpeedRPM, 0)} max</span></div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {SETPOINT_PRESETS.filter(p => p.value <= outputFreeSpeedRPM).map(p => (
                                <button key={p.value} onClick={() => setSetpointRPM(p.value)} style={S.btn(setpointRPM === p.value)}>{p.label}</button>
                            ))}
                        </div>
                        <NumInput label="Duration" value={duration} onChange={v => setDuration(Math.max(0.5, Math.min(20, v)))} unit="s" step={0.5} inputStyle={{ width: 56 }} />
                    </div>

                    {/* Profile Mode Selection */}
                    <div style={{ padding: "12px 16px", background: "rgba(6,182,212,0.04)", borderRadius: 6, border: "1px solid rgba(6,182,212,0.15)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div style={{ ...S.fieldLabel, color: "#06b6d4", opacity: 0.8, marginBottom: 0 }}>Motion Profile</div>
                            <div style={{ display: "flex", gap: 4 }}>
                                <button onClick={() => setProfileMode("none")} style={S.btnAlt(profileMode === "none", "#06b6d4")}>None (Step)</button>
                                <button onClick={() => setProfileMode("trapezoidal")} style={S.btnAlt(profileMode === "trapezoidal", "#06b6d4")}>Trapezoidal</button>
                            </div>
                        </div>

                        {profileMode === "trapezoidal" && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    <label style={{ ...S.fieldLabel, color: "#06b6d4", opacity: 0.7 }}>Cruise Velocity</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <input
                                            type="number"
                                            value={cruiseVelRPM}
                                            min={100}
                                            step={100}
                                            onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setCruiseVelRPM(Math.max(100, v)); }}
                                            style={{ ...S.input, width: 80, borderColor: "rgba(6,182,212,0.3)", color: "#06b6d4" }}
                                        />
                                        <span style={{ ...S.unit, color: "#06b6d4" }}>RPM</span>
                                    </div>
                                    <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Max velocity during profile</div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    <label style={{ ...S.fieldLabel, color: "#06b6d4", opacity: 0.7 }}>Max Acceleration</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <input
                                            type="number"
                                            value={maxAccelRPMps}
                                            min={100}
                                            step={500}
                                            onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setMaxAccelRPMps(Math.max(100, v)); }}
                                            style={{ ...S.input, width: 80, borderColor: "rgba(6,182,212,0.3)", color: "#06b6d4" }}
                                        />
                                        <span style={{ ...S.unit, color: "#06b6d4" }}>RPM/s</span>
                                    </div>
                                    <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Rate of velocity change</div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    <label style={{ ...S.fieldLabel, color: "#06b6d4", opacity: 0.7 }}>Max Jerk (0 = ∞)</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <input
                                            type="number"
                                            value={maxJerkRPMps2}
                                            min={0}
                                            step={1000}
                                            onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setMaxJerkRPMps2(Math.max(0, v)); }}
                                            style={{ ...S.input, width: 80, borderColor: "rgba(6,182,212,0.3)", color: "#06b6d4" }}
                                        />
                                        <span style={{ ...S.unit, color: "#06b6d4" }}>RPM/s²</span>
                                    </div>
                                    <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Rate of accel change (S-curve)</div>
                                </div>
                            </div>
                        )}

                        {profileMode === "none" && (
                            <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.5, lineHeight: 1.6 }}>
                                No motion profile — setpoint steps instantly to target. Good for testing raw controller response.
                            </div>
                        )}
                    </div>
                </div>

                {/* Gains */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={S.label}>Control Gains ({controlMode === "voltage" ? "Voltage" : "Current"} Mode)</div>
                        <button onClick={autoTuneFF} style={{ ...S.btn(false), fontSize: 10, padding: "3px 8px" }}>Auto kS/kV from motor model</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
                        <GainInput label="kS (static)" value={ks} onChange={setKs} step={0.01} color="#10b981" />
                        <GainInput label="kV (velocity)" value={kv} onChange={setKv} step={0.0001} color="#3b82f6" />
                        <GainInput label="kA (accel)" value={ka} onChange={setKa} step={0.0001} color="#a855f7" />
                        <GainInput label="kP (proportional)" value={kp} onChange={setKp} step={0.001} color="#f97316" />
                        <GainInput label="kD (derivative)" value={kd} onChange={setKd} step={0.0001} color="#eab308" />
                    </div>
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Theoretical Values (from motor model)</div>
                        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>kS ≈</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#10b981" }}>{fmt(theoreticalKs, 4)} {controlMode === "voltage" ? "V" : "A"}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>kV ≈</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#3b82f6" }}>{fmt(theoreticalKv, 6)} {controlMode === "voltage" ? "V/(rad/s)" : "A/(rad/s)"}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>Output free ω =</span>
                                <span style={{ fontSize: 11, fontFamily: MONO, color: "#e2e8f0" }}>{fmt(mc.freeSpeedRadS / gearing, 2)} rad/s ({fmt(outputFreeSpeedRPM, 0)} RPM)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flywheel Viz + Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 20 }}>
                    <div style={{ ...S.cardSubtle, minWidth: 220 }}>
                        <FlywheelViz currentRPM={finalRPM} setpointRPM={setpointRPM} maxRPM={outputFreeSpeedRPM} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, alignContent: "start" }}>
                        <MetricCard label="Rise Time (90%)" value={simResult.riseTime !== null ? fmt(simResult.riseTime, 3) : "—"} unit="s" color={simResult.riseTime !== null && simResult.riseTime < 1 ? "#10b981" : "#eab308"} />
                        <MetricCard label="Settle Time (2%)" value={simResult.settleTime !== null ? fmt(simResult.settleTime, 3) : "—"} unit="s" color={simResult.settleTime !== null && simResult.settleTime < 2 ? "#10b981" : "#eab308"} />
                        <MetricCard label="Overshoot" value={fmt(simResult.overshoot, 1)} unit="%" color={osColor} warn={simResult.overshoot > 10} />
                        <MetricCard label="SS Error" value={fmt(ssErr, 1)} unit="RPM" color={ssColor} warn={ssErr > setpointRPM * 0.05} />
                        <MetricCard label="Final Velocity" value={fmt(finalRPM, 0)} unit="RPM" color="#e2e8f0" />
                        <MetricCard label="Peak Velocity" value={fmt(simResult.maxRPM, 0)} unit="RPM" color="#3b82f6" />
                    </div>
                </div>

                {/* Charts */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
                        {TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={S.btn(activeTab === t.id)}>{t.label}</button>)}
                    </div>
                    {activeTab === "velocity" && <VelocityChart history={simResult.history} setpointRPM={setpointRPM} profileMode={profileMode} />}
                    {activeTab === "effort" && <EffortChart history={simResult.history} controlMode={controlMode} />}
                    {activeTab === "error" && <ErrorChart history={simResult.history} />}
                </div>

                {/* Control Equation */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Control Law</div>
                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 13, fontFamily: MONO, color: "#e2e8f0", lineHeight: 1.8 }}>
                            <span style={{ opacity: 0.5 }}>{controlMode === "voltage" ? "V" : "I"} = </span>
                            <span style={{ color: "#10b981" }}>kS·sgn(r)</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#3b82f6" }}>kV·ṙ</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#a855f7" }}>kA·r̈</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#f97316" }}>kP·e</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#eab308" }}>kD·ė</span>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                            r = setpoint (rad/s) &nbsp;|&nbsp; e = r − ω &nbsp;|&nbsp; ṙ = setpoint velocity &nbsp;|&nbsp; r̈ = {profileMode === "trapezoidal" ? "profile accel" : "desired accel"} &nbsp;|&nbsp; ė = de/dt
                        </div>
                        {profileMode === "trapezoidal" && (
                            <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(6,182,212,0.06)", borderRadius: 4, border: "1px solid rgba(6,182,212,0.15)" }}>
                                <div style={{ fontSize: 11, fontFamily: MONO, color: "#06b6d4", opacity: 0.8 }}>
                                    With trapezoidal profiling: r(t) follows a smooth trajectory from 0 → target, and r̈ comes directly from the profile generator
                                </div>
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
                            <div><span style={{ opacity: 0.4 }}>Resistance: </span><span style={{ color: "#a855f7" }}>R = V_nom / I_stall</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.R, 4)} Ω</span></div>
                            <div><span style={{ opacity: 0.4 }}>Torque constant: </span><span style={{ color: "#a855f7" }}>Kt = τ_stall / I_stall</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.Kt, 6)} N·m/A</span></div>
                            <div><span style={{ opacity: 0.4 }}>Back-EMF constant: </span><span style={{ color: "#a855f7" }}>Kv = ω_free / (V_nom − I_free·R)</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.Kv, 4)} rad/s/V</span></div>
                            <div><span style={{ opacity: 0.4 }}>Free speed (motor): </span><span style={{ color: "#3b82f6" }}>{fmt(motor.freeSpeed, 0)} RPM</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.freeSpeedRadS, 2)} rad/s</span></div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Physics Integration</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                            <div>Timestep: <span style={{ color: "#e2e8f0" }}>Δt = 1 ms</span> (1 kHz fixed-step Euler integration)</div>
                            <div>Voltage mode: <span style={{ color: "#e2e8f0" }}>V_applied → I = (V − ω·G/Kv) / R_eff → τ = Kt·I·N·G → α = τ/J</span></div>
                            <div>Current mode: <span style={{ color: "#e2e8f0" }}>I_applied → τ = Kt·I·N·G → α = τ/J → V = back-EMF + I·R</span></div>
                            <div>Velocity update: <span style={{ color: "#e2e8f0" }}>ω(t+Δt) = ω(t) + α·Δt</span></div>
                            <div>Voltage clamp: <span style={{ color: "#e2e8f0" }}>[-12V, +12V]</span> &nbsp;|&nbsp; Current clamp: <span style={{ color: "#e2e8f0" }}>[-I_stall·N, +I_stall·N]</span></div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Control Law</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                            <div>Output = <span style={{ color: "#10b981" }}>kS·sgn(setpoint)</span> + <span style={{ color: "#3b82f6" }}>kV·setpoint</span> + <span style={{ color: "#a855f7" }}>kA·(Δerror/Δt)</span> + <span style={{ color: "#f97316" }}>kP·error</span> + <span style={{ color: "#eab308" }}>kD·(Δerror/Δt)</span></div>
                            <div>The feedforward terms (kS, kV, kA) are computed from the <span style={{ color: "#e2e8f0" }}>setpoint</span>, not the measurement</div>
                            <div>The feedback terms (kP, kD) are computed from <span style={{ color: "#e2e8f0" }}>error = setpoint − measured_ω</span></div>
                            <div>This matches the WPILib SimpleMotorFeedforward + PID controller pattern</div>
                        </div>
                    </div>

                    {profileMode === "trapezoidal" && (
                        <div style={{ padding: "12px 16px", background: "rgba(6,182,212,0.04)", borderRadius: 6, border: "1px solid rgba(6,182,212,0.15)", marginBottom: 12 }}>
                            <div style={{ fontSize: 10, opacity: 0.6, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, color: "#06b6d4" }}>Trapezoidal Motion Profile</div>
                            <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                                <div>Profile generates <span style={{ color: "#06b6d4" }}>r(t)</span> trajectory from rest to target velocity</div>
                                <div>Constraints: <span style={{ color: "#06b6d4" }}>|ṙ| ≤ cruise</span>, <span style={{ color: "#06b6d4" }}>|r̈| ≤ max_accel</span>{maxJerkRPMps2 > 0 && <>, <span style={{ color: "#06b6d4" }}>|r⃛| ≤ max_jerk</span></>}</div>
                                <div>kA feedforward uses <span style={{ color: "#06b6d4" }}>r̈</span> from profile (not estimated from error)</div>
                                {maxJerkRPMps2 > 0 ? (
                                    <div>S-curve profile: acceleration ramps smoothly (jerk-limited)</div>
                                ) : (
                                    <div>Pure trapezoidal: acceleration steps instantly (infinite jerk)</div>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Assumptions & Limitations</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                            <div>No friction model — real systems have static + viscous friction the kS term compensates for</div>
                            <div>No current limiting — real motor controllers enforce supply and stator current limits</div>
                            <div>No sensor noise or quantization — real encoders have finite resolution and latency</div>
                            <div>No control loop latency — real systems have 5–20 ms loop periods, not continuous</div>
                            <div>Ideal gearbox — no backlash, compliance, or efficiency losses modeled</div>
                        </div>
                    </div>
                </div>

                {/* Voltage Tuning Guide */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(168,85,247,0.15)" }}>
                    <div style={{ ...S.label, color: "#a855f7", opacity: 0.7 }}>Manual Voltage Tuning Guide</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Start with feedforward only", color: "#3b82f6", lines: [
                                    "Set all gains to zero. Set kV = V_nominal / ω_free_output (in rad/s).",
                                    `For your current config: kV ≈ ${fmt(theoreticalKv, 6)} V/(rad/s).`,
                                    "Run the sim — the flywheel should reach near setpoint but undershoot."
                                ]},
                            { step: "2", title: "Add static friction compensation", color: "#10b981", lines: [
                                    "Set kS to overcome static friction. Start with kS = I_free · R.",
                                    `For your current config: kS ≈ ${fmt(theoreticalKs, 4)} V.`,
                                    "This voltage is applied whenever the setpoint is non-zero to get the motor turning."
                                ]},
                            { step: "3", title: "Verify feedforward alone", color: "#e2e8f0", lines: [
                                    "With just kS + kV the flywheel should reach ~90–95% of setpoint.",
                                    "If it overshoots with just FF, kV is too high. If it barely moves, kV is too low.",
                                    "Feedforward does the heavy lifting — feedback only corrects the residual."
                                ]},
                            { step: "4", title: "Add proportional feedback", color: "#f97316", lines: [
                                    "Start kP very small (try 0.01). Increase gradually.",
                                    "kP output is in volts-per-(rad/s-error). Watch the voltage chart for saturation at ±12V.",
                                    "Stop increasing when you see the first hint of oscillation or overshoot, then back off 20%."
                                ]},
                            { step: "5", title: "Add derivative damping if needed", color: "#eab308", lines: [
                                    "If overshoot is present, add kD. Start at ~10% of kP value.",
                                    "kD resists rapid error changes — it damps oscillation but amplifies sensor noise.",
                                    "On real hardware, use a low-pass filter on the derivative term."
                                ]},
                            { step: "6", title: "Validate and iterate", color: "#10b981", lines: [
                                    "Target metrics: rise time < 1s, overshoot < 5%, SS error < 2%, settle < 2s.",
                                    "Test multiple setpoints — a tune that works at 3000 RPM should also work at 1000 RPM.",
                                    "If it works at one setpoint but not another, your kV is likely off."
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
                                    "Current is proportional to torque: τ = Kt · I. This gives direct torque/acceleration control.",
                                    "Feedforward gains have different units: kV is now A/(rad/s), kS is now in amps."
                                ]},
                            { step: "2", title: "Set velocity feedforward kV", color: "#3b82f6", lines: [
                                    "At steady-state velocity, motor current ≈ friction current only (nearly zero for ideal model).",
                                    "Start kV very small or zero — in current mode, back-EMF is handled by the controller, not you.",
                                    "The physics are different: voltage FF compensates back-EMF, current FF compensates friction/load."
                                ]},
                            { step: "3", title: "Set kS for static friction", color: "#10b981", lines: [
                                    "kS in current mode represents the amps needed to overcome static friction.",
                                    "On a real robot, this is the current needed to just barely start the flywheel from rest.",
                                    "Start small — in the ideal sim with no friction, kS can be zero."
                                ]},
                            { step: "4", title: "Tune kP more aggressively", color: "#f97316", lines: [
                                    "Current mode is inherently more linear than voltage mode (no back-EMF nonlinearity).",
                                    "You can typically use larger kP values. Start with 0.1 and work up.",
                                    "kP output is in amps-per-(rad/s-error). Watch for current clamp saturation."
                                ]},
                            { step: "5", title: "Use kA for acceleration feedforward", color: "#a855f7", lines: [
                                    "kA is more useful in current mode since τ = J·α and τ = Kt·I.",
                                    "Theoretical kA = J / (Kt · N · G) where J is the moment of inertia at the output.",
                                    "This makes the motor apply exactly the torque needed for the desired acceleration."
                                ]},
                            { step: "6", title: "Add kD and validate", color: "#eab308", lines: [
                                    "Current mode often produces less overshoot, so kD may not be needed.",
                                    "If you do add kD, start at ~5% of kP. It damps oscillation just like in voltage mode.",
                                    "Validate across setpoints. Current mode typically generalizes better across operating points."
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
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(6,182,212,0.15)" }}>
                    <div style={{ ...S.label, color: "#06b6d4", opacity: 0.7 }}>Motion Profiling Guide</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Why use motion profiling?", color: "#06b6d4", lines: [
                                    "A step setpoint demands infinite acceleration — physically impossible and stresses the system.",
                                    "Motion profiling generates a smooth trajectory the mechanism can actually follow.",
                                    "With profiling, kA feedforward becomes much more effective since r̈ is known exactly."
                                ]},
                            { step: "2", title: "Set cruise velocity", color: "#3b82f6", lines: [
                                    "Cruise velocity is the maximum velocity during the profile (before deceleration).",
                                    "For a flywheel, set this equal to or slightly above your target setpoint.",
                                    "If cruise < setpoint, the profile will ramp to cruise and stay there (won't reach target)."
                                ]},
                            { step: "3", title: "Set max acceleration", color: "#10b981", lines: [
                                    "This limits how fast velocity can change (RPM per second).",
                                    "Start conservative (1000–3000 RPM/s) and increase based on available torque.",
                                    "Too high: controller can't keep up, large tracking error. Too low: slow response."
                                ]},
                            { step: "4", title: "Optional: Add jerk limiting", color: "#a855f7", lines: [
                                    "Jerk = rate of acceleration change. Jerk = 0 means infinite (pure trapezoidal).",
                                    "Adding jerk limiting creates an S-curve profile — smoother but slower.",
                                    "Good for reducing mechanical stress, vibration, and current spikes."
                                ]},
                            { step: "5", title: "Tune kA for acceleration FF", color: "#f97316", lines: [
                                    "With profiling, the desired acceleration r̈ comes directly from the profile.",
                                    "kA should produce the torque needed: kA ≈ J / (Kt · N · G) for current mode.",
                                    "Good kA feedforward means kP can be lower — less aggressive feedback needed."
                                ]},
                            { step: "6", title: "Validate tracking performance", color: "#eab308", lines: [
                                    "Watch the velocity chart — actual should closely follow the profile (cyan dashed line).",
                                    "Large gaps mean feedforward is wrong or constraints are too aggressive.",
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
                    <div style={S.label}>Flywheel Physics Reference</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, fontSize: 12, opacity: 0.6, fontFamily: MONO }}>
                        <div>τ_motor = Kt · I_motor · N · G</div>
                        <div>α = τ_net / J (moment of inertia)</div>
                        <div>V = I·R + ω/Kv (back-EMF model)</div>
                        <div>ω_free_output = ω_free_motor / G</div>
                        <div>Kt = τ_stall / I_stall</div>
                        <div>Kv = ω_free / (V − I_free·R)</div>
                    </div>
                </div>

                {/* Plant Model Configuration */}
                <div style={{ ...S.cardSubtle, marginBottom: 20, border: "1px solid rgba(244,63,94,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ ...S.label, color: "#f43f5e", opacity: 0.8, marginBottom: 0 }}>Simulated Plant Model</div>
                        <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => setPlantMode("physical")} style={S.btnAlt(plantMode === "physical", "#f43f5e")}>Physical</button>
                            <button onClick={() => setPlantMode("feedforward")} style={S.btnAlt(plantMode === "feedforward", "#f43f5e")}>Feedforward Constants</button>
                        </div>
                    </div>

                    <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.5, marginBottom: 16, lineHeight: 1.6 }}>
                        {plantMode === "physical"
                            ? "Plant dynamics derived from motor specs, gearing, and MOI configured above. Friction parameters below add realism."
                            : "Plant dynamics defined by feedforward constants (like from SysId). Useful for testing gains against characterized system."
                        }
                    </div>

                    {plantMode === "physical" ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Static Friction (plant kS)</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input
                                        type="number"
                                        value={plantKs}
                                        min={0}
                                        step={0.01}
                                        onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPlantKs(Math.max(0, v)); }}
                                        style={{ ...S.input, width: 80, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }}
                                    />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V" : "A"}</span>
                                </div>
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Effort needed to overcome static friction</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Viscous Friction</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input
                                        type="number"
                                        value={viscousFriction}
                                        min={0}
                                        step={0.0001}
                                        onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setViscousFriction(Math.max(0, v)); }}
                                        style={{ ...S.input, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }}
                                    />
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
                                    <input
                                        type="number"
                                        value={plantKs}
                                        min={0}
                                        step={0.01}
                                        onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPlantKs(Math.max(0, v)); }}
                                        style={{ ...S.input, width: 80, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }}
                                    />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V" : "A"}</span>
                                </div>
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Static friction constant</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Plant kV</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input
                                        type="number"
                                        value={plantKv}
                                        min={0}
                                        step={0.0001}
                                        onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPlantKv(Math.max(0, v)); }}
                                        style={{ ...S.input, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }}
                                    />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V/(rad/s)" : "A/(rad/s)"}</span>
                                </div>
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Velocity constant</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Plant kA</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input
                                        type="number"
                                        value={plantKa}
                                        min={0}
                                        step={0.0001}
                                        onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setPlantKa(Math.max(0, v)); }}
                                        style={{ ...S.input, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }}
                                    />
                                    <span style={{ ...S.unit, color: "#f43f5e" }}>{controlMode === "voltage" ? "V/(rad/s²)" : "A/(rad/s²)"}</span>
                                </div>
                                <div style={{ fontSize: 9, opacity: 0.4, fontFamily: MONO }}>Acceleration constant</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f43f5e", opacity: 0.7 }}>Viscous Friction</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input
                                        type="number"
                                        value={viscousFriction}
                                        min={0}
                                        step={0.0001}
                                        onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setViscousFriction(Math.max(0, v)); }}
                                        style={{ ...S.input, width: 100, borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }}
                                    />
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
                                τ_static derived from plant kS: {controlMode === "voltage" ? "τ = Kt·(kS/R)" : "τ = Kt·kS"} &nbsp;|&nbsp; β = viscous friction coefficient
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer style={{ padding: "16px 24px", textAlign: "center" }}>
                <span style={{ fontSize: 12, opacity: 0.2, fontFamily: MONO }}>Flywheel Velocity Tuning Simulator — FRC Mechanism Control</span>
            </footer>
        </div>
    );
}