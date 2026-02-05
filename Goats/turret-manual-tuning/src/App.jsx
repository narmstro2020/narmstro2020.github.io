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

function simulateTurret({ motor, numMotors, gearing, moi, ks, kv, ka, kp, kd, setpointDeg, controlMode, durationS = 5, gravityTorque = 0, enableWrap = false, softLimitLow = -180, softLimitHigh = 180 }) {
    const mc = motorConstants(motor);
    const effectiveMOI = moi;
    const setpointRad = (setpointDeg * Math.PI) / 180;
    const totalKt = mc.Kt * numMotors * gearing;
    const effectiveR = mc.R / numMotors;

    const steps = Math.ceil(durationS / DT);
    const record = Math.max(1, Math.floor(steps / 2000));
    const history = [];

    let theta = 0; // position in rad
    let omega = 0; // velocity in rad/s
    let prevError = setpointRad;
    let appliedVolts = 0;
    let appliedCurrent = 0;
    let motorCurrent = 0;

    const softLowRad = (softLimitLow * Math.PI) / 180;
    const softHighRad = (softLimitHigh * Math.PI) / 180;

    for (let i = 0; i <= steps; i++) {
        const t = i * DT;
        const error = setpointRad - theta;

        // feedforward: velocity profile (trapezoidal-ish)
        // For position control, kV is applied to desired velocity (which we approximate from error derivative)
        const desiredVel = i === 0 ? 0 : (error - prevError) / DT; // this is negative of error rate
        const ffSign = error === 0 ? 0 : Math.sign(error);
        const ffKs = ks * ffSign;
        const ffKv = kv * 0; // in position mode, kV feedforward is typically zero unless profiled
        const ffKa = ka * 0; // same for kA — no motion profile in simple position PID

        // feedback
        const fbP = kp * error;
        const fbD = kd * (i === 0 ? 0 : (error - prevError) / DT);

        // gravity compensation
        const gravTorqueNm = gravityTorque * Math.cos(theta);
        const gravCompensation = controlMode === "voltage"
            ? (gravTorqueNm > 0 ? gravTorqueNm / (totalKt / (effectiveR > 0 ? effectiveR : 0.001)) : gravTorqueNm / (totalKt / (effectiveR > 0 ? effectiveR : 0.001)))
            : gravTorqueNm / (totalKt > 0 ? totalKt / numMotors : 0.001);

        if (controlMode === "voltage") {
            const rawV = ffKs + ffKv + ffKa + fbP + fbD;
            appliedVolts = clampVoltage(rawV);

            const backEmf = omega * gearing / mc.Kv;
            motorCurrent = numMotors > 0 ? (appliedVolts - backEmf) / effectiveR : 0;
            const motorTorque = totalKt * (motorCurrent / numMotors);
            const netTorque = motorTorque - gravTorqueNm;
            const alpha = effectiveMOI > 0 ? netTorque / effectiveMOI : 0;
            omega += alpha * DT;
            theta += omega * DT;
            appliedCurrent = motorCurrent;
        } else {
            const rawI = ffKs + ffKv + ffKa + fbP + fbD;
            appliedCurrent = clampCurrent(rawI, motor.stallCurrent * numMotors);
            motorCurrent = appliedCurrent;

            const motorTorque = totalKt * (motorCurrent / numMotors);
            const netTorque = motorTorque - gravTorqueNm;
            const alpha = effectiveMOI > 0 ? netTorque / effectiveMOI : 0;
            omega += alpha * DT;
            theta += omega * DT;
            const backEmf = omega * gearing / mc.Kv;
            appliedVolts = backEmf + motorCurrent * effectiveR / numMotors;
        }

        // soft limits — bounce back with damping
        if (theta < softLowRad) { theta = softLowRad; omega = Math.abs(omega) * 0.1; }
        if (theta > softHighRad) { theta = softHighRad; omega = -Math.abs(omega) * 0.1; }

        prevError = error;

        if (i % record === 0) {
            history.push({
                t,
                theta,
                thetaDeg: (theta * 180) / Math.PI,
                omega,
                omegaDegS: (omega * 180) / Math.PI,
                setpointDeg,
                setpointRad,
                voltage: appliedVolts,
                current: appliedCurrent,
                error,
                errorDeg: (error * 180) / Math.PI,
            });
        }
    }

    // metrics
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
        const band = Math.max(Math.abs(setpointDeg) * 0.02, 0.5); // 2% or 0.5 deg
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
function PositionChart({ history, setpointDeg }) {
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
        }
        if (yMax - yMin < 20) { yMax += 10; yMin -= 10; }

        drawGrid(ctx, pad, pw, ph, 5, 5);

        // setpoint line
        const spY = pad.t + ph * (1 - (setpointDeg - yMin) / (yMax - yMin));
        ctx.strokeStyle = "rgba(56,189,248,0.4)"; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(pad.l, spY); ctx.lineTo(pad.l + pw, spY); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(56,189,248,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "right";
        ctx.fillText(`Setpoint: ${setpointDeg}°`, pad.l + pw - 4, spY - 6);

        // 2% band (or 0.5 deg min)
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

        // position curve
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
    }, [history, setpointDeg]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Velocity Chart ─────────────────────────────────────────────────────────
function VelocityChart({ history }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 200, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;

        const maxT = history[history.length - 1].t;
        const values = history.map(pt => pt.omegaDegS);
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
            // smooth towards actual value
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

            // degree ticks
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

            // outer ring
            ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

            // setpoint indicator (ghost arm)
            const spAngle = (setpointDeg - 90) * Math.PI / 180;
            ctx.strokeStyle = "rgba(56,189,248,0.2)"; ctx.lineWidth = 3; ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (r - 6) * Math.cos(spAngle), cy + (r - 6) * Math.sin(spAngle)); ctx.stroke();
            ctx.setLineDash([]);
            // setpoint dot
            ctx.beginPath(); ctx.arc(cx + (r - 6) * Math.cos(spAngle), cy + (r - 6) * Math.sin(spAngle), 4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(56,189,248,0.3)"; ctx.fill();

            // gravity arrow if present
            if (gravityTorque > 0) {
                const gx = cx + r + 28, gy = cy - 20;
                ctx.strokeStyle = "rgba(251,191,36,0.4)"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + 20); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(gx - 4, gy + 16); ctx.lineTo(gx, gy + 22); ctx.lineTo(gx + 4, gy + 16); ctx.stroke();
                ctx.fillStyle = "rgba(251,191,36,0.5)"; ctx.font = `8px ${MONO}`; ctx.textAlign = "center";
                ctx.fillText("g", gx, gy - 4);
            }

            // turret arm
            const armAngle = (angleRef.current - 90) * Math.PI / 180;
            // arm shadow
            ctx.strokeStyle = "rgba(56,189,248,0.1)"; ctx.lineWidth = 8; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (r - 10) * Math.cos(armAngle), cy + (r - 10) * Math.sin(armAngle)); ctx.stroke();
            // arm
            ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 4; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (r - 10) * Math.cos(armAngle), cy + (r - 10) * Math.sin(armAngle)); ctx.stroke();
            ctx.lineCap = "butt";

            // arm tip
            ctx.beginPath(); ctx.arc(cx + (r - 10) * Math.cos(armAngle), cy + (r - 10) * Math.sin(armAngle), 5, 0, Math.PI * 2);
            ctx.fillStyle = "#38bdf8"; ctx.fill();
            ctx.beginPath(); ctx.arc(cx + (r - 10) * Math.cos(armAngle), cy + (r - 10) * Math.sin(armAngle), 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#0c0e14"; ctx.fill();

            // center hub
            ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fillStyle = "rgba(56,189,248,0.15)"; ctx.fill();
            ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.strokeStyle = "rgba(56,189,248,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fillStyle = "#38bdf8"; ctx.fill();

            // text
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
        return simulateTurret({ motor, numMotors, gearing, moi, ks, kv, ka, kp, kd, setpointDeg, controlMode, durationS: duration, gravityTorque, softLimitLow, softLimitHigh });
    }, [motor, numMotors, gearing, moi, ks, kv, ka, kp, kd, setpointDeg, controlMode, duration, gravityTorque, softLimitLow, softLimitHigh]);

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
                    {activeTab === "position" && <PositionChart history={simResult.history} setpointDeg={setpointDeg} />}
                    {activeTab === "velocity" && <VelocityChart history={simResult.history} />}
                    {activeTab === "effort" && <EffortChart history={simResult.history} controlMode={controlMode} />}
                    {activeTab === "error" && <ErrorChart history={simResult.history} />}
                </div>

                {/* Control Equation */}
                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Control Law — Position PID</div>
                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 13, fontFamily: MONO, color: "#e2e8f0", lineHeight: 1.8 }}>
                            <span style={{ opacity: 0.5 }}>{controlMode === "voltage" ? "V" : "I"} = </span>
                            <span style={{ color: "#10b981" }}>kS·sgn(e)</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#38bdf8" }}>kP·e</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#fbbf24" }}>kD·ė</span>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                            e = θ_setpoint − θ_measured (rad) &nbsp;|&nbsp; ė = de/dt &nbsp;|&nbsp; kP output is {controlMode === "voltage" ? "V" : "A"} per rad of error &nbsp;|&nbsp; kD output is {controlMode === "voltage" ? "V" : "A"} per rad/s of error rate
                        </div>
                        <div style={{ marginTop: 8, fontSize: 11, fontFamily: MONO, opacity: 0.35, lineHeight: 1.6 }}>
                            For position control: kV and kA feedforward are typically zero unless using a motion profile (trapezoidal or S-curve)
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
                            <div><span style={{ opacity: 0.4 }}>Free speed (motor): </span><span style={{ color: "#38bdf8" }}>{fmt(motor.freeSpeed, 0)} RPM</span><span style={{ opacity: 0.3 }}> → </span><span style={{ color: "#e2e8f0" }}>{fmt(mc.freeSpeedRadS, 2)} rad/s</span></div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Physics Integration</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                            <div>Timestep: <span style={{ color: "#e2e8f0" }}>Δt = 1 ms</span> (1 kHz fixed-step Euler integration)</div>
                            <div>Position update: <span style={{ color: "#e2e8f0" }}>θ(t+Δt) = θ(t) + ω·Δt</span></div>
                            <div>Velocity update: <span style={{ color: "#e2e8f0" }}>ω(t+Δt) = ω(t) + α·Δt</span></div>
                            <div>Net torque: <span style={{ color: "#e2e8f0" }}>τ_net = τ_motor − τ_gravity·cos(θ)</span></div>
                            <div>Gravity model: <span style={{ color: "#e2e8f0" }}>τ_g(θ) = τ_g_max · cos(θ)</span> — max at horizontal, zero at vertical</div>
                            <div>Soft limits: <span style={{ color: "#e2e8f0" }}>[{softLimitLow}°, {softLimitHigh}°]</span> with damped bounce</div>
                        </div>
                    </div>

                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Assumptions & Limitations</div>
                        <div style={{ fontSize: 12, fontFamily: MONO, opacity: 0.6, lineHeight: 2 }}>
                            <div>No friction model — real turrets have static + viscous friction and cable drag</div>
                            <div>No current limiting — real motor controllers enforce supply and stator current limits</div>
                            <div>No sensor noise or quantization — real encoders have finite resolution and latency</div>
                            <div>No control loop latency — real systems have 5–20 ms loop periods, not continuous</div>
                            <div>No backlash — real gearboxes have backlash that causes limit cycles near setpoint</div>
                            <div>No motion profiling — real position controllers often use trapezoidal or S-curve profiles</div>
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
                            { step: "5", title: "Consider motion profiling", color: "#60a5fa", lines: [
                                    "Simple PID sends full effort immediately, causing voltage saturation on large moves.",
                                    "Motion profiles (trapezoidal/S-curve) limit velocity and acceleration, allowing kV/kA feedforward.",
                                    "WPILib's TrapezoidProfile or CTRE's MotionMagic handle this — the sim shows the unproﬁled response."
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

                {/* Physics Reference */}
                <div style={{ ...S.cardSubtle, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={S.label}>Position Control Physics Reference</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, fontSize: 12, opacity: 0.6, fontFamily: MONO }}>
                        <div>τ_motor = Kt · I_motor · N · G</div>
                        <div>τ_net = τ_motor − τ_gravity · cos(θ)</div>
                        <div>α = τ_net / J (angular acceleration)</div>
                        <div>ω = ∫ α dt (angular velocity)</div>
                        <div>θ = ∫ ω dt (angular position)</div>
                        <div>V = I·R + ω/Kv (back-EMF model)</div>
                    </div>
                </div>
            </div>

            <footer style={{ padding: "16px 24px", textAlign: "center" }}>
                <span style={{ fontSize: 12, opacity: 0.2, fontFamily: MONO }}>Turret Position Tuning Simulator — FRC Mechanism Control</span>
            </footer>
        </div>
    );
}