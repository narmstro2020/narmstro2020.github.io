import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ─── Physics ─────────────────────────────────────────────────────────────────
const G = 9.80665;

function computeElevator(massKg) {
    const weight = massKg * G;
    return { weight };
}

function computeMotorForElevator(motor, numMotors, gearing, drumRadiusM, stages) {
    const totalStallTorque = motor.stallTorque * numMotors * gearing;
    const stallForceAtCable = totalStallTorque / drumRadiusM;
    const effectiveLiftForceN = stallForceAtCable * stages;
    const drumRPM = motor.freeSpeed / gearing;
    const drumRadS = (drumRPM * 2 * Math.PI) / 60;
    const cableSpeedMs = drumRadS * drumRadiusM;
    const carriageFreeSpeedMs = cableSpeedMs / stages;
    const totalStallCurrent = motor.stallCurrent * numMotors;
    return { totalStallTorque, stallForceAtCable, effectiveLiftForceN, drumRPM, cableSpeedMs, carriageFreeSpeedMs, totalStallCurrent };
}

// Linear dynamics: F_motor(v) = F_stall * (1 - v/v_free)
// Net force up = F_motor - mg
// a = F_net / m
// v_max: where F_motor(v) = mg → v = v_free * (1 - mg/F_stall)
// a_max (from stall): (F_stall - mg) / m
function computeElevatorDynamics(motor, numMotors, gearing, drumRadiusM, stages, massKg) {
    const mo = computeMotorForElevator(motor, numMotors, gearing, drumRadiusM, stages);
    const weight = massKg * G;
    const vFree = mo.carriageFreeSpeedMs;
    const fStall = mo.effectiveLiftForceN;
    const vMax = fStall > 0 ? Math.max(0, vFree * (1 - weight / fStall)) : 0;
    const aMax = massKg > 0 ? (fStall - weight) / massKg : 0;

    // Force at a given velocity: F(v) = F_stall * (1 - v/v_free)
    // Net accel at velocity v: a(v) = (F_stall*(1-v/vFree) - mg) / m
    return { vMax, aMax, vFree, fStall, weight, ...mo };
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
    { label: "Custom", value: null }, { label: "3:1", value: 3 }, { label: "4:1", value: 4 }, { label: "5:1", value: 5 },
    { label: "9:1", value: 9 }, { label: "10:1", value: 10 }, { label: "12:1", value: 12 }, { label: "16:1", value: 16 },
    { label: "20:1", value: 20 }, { label: "25:1", value: 25 }, { label: "30:1", value: 30 }, { label: "36:1", value: 36 },
    { label: "40:1", value: 40 }, { label: "48:1", value: 48 }, { label: "50:1", value: 50 }, { label: "64:1", value: 64 },
    { label: "80:1", value: 80 }, { label: "100:1", value: 100 }, { label: "125:1", value: 125 }, { label: "150:1", value: 150 },
    { label: "200:1", value: 200 },
];
const COMMON_DRUMS = [
    { label: "Custom", value: null }, { label: '1"', value: 0.0254 / 2 }, { label: '1.125"', value: 0.028575 / 2 },
    { label: '1.25"', value: 0.03175 / 2 }, { label: '1.5"', value: 0.0381 / 2 }, { label: '1.75"', value: 0.04445 / 2 }, { label: '2"', value: 0.0508 / 2 },
];

// ─── Shared styles ──────────────────────────────────────────────────────────
const MONO = "'JetBrains Mono', monospace"; const SANS = "'Space Grotesk', sans-serif";
function fmt(v, d = 4) { if (v === undefined || v === null || isNaN(v)) return "—"; if (Math.abs(v) < 0.0001 && v !== 0) return v.toExponential(d); return parseFloat(v.toFixed(d)).toString(); }
const S = {
    cardSubtle: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 16 },
    label: { fontFamily: SANS, fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 },
    fieldLabel: { fontSize: 10, letterSpacing: "0.08em", opacity: 0.6, fontFamily: MONO, textTransform: "uppercase" },
    input: { background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "4px 8px", fontSize: 13, color: "#e2e8f0", fontFamily: MONO, outline: "none", width: 96 },
    inputSmall: { background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "2px 8px", fontSize: 13, color: "#e2e8f0", fontFamily: MONO, outline: "none", width: 56, textAlign: "center" },
    unit: { fontSize: 11, opacity: 0.4, fontFamily: MONO, marginLeft: 4 },
    select: { background: "transparent", color: "#e2e8f0", fontFamily: MONO, fontSize: 13, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "4px 8px", outline: "none", cursor: "pointer" },
    btn: (a) => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.04)", color: a ? "#f97316" : "rgba(255,255,255,0.5)", border: a ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.06)" }),
};
function NumInput({ label, value, onChange, unit, inputStyle }) {
    return (<div style={{ display: "flex", flexDirection: label ? "column" : "row", gap: 4, alignItems: label ? "flex-start" : "center" }}>{label && <label style={S.fieldLabel}>{label}</label>}<div style={{ display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} style={{ ...S.input, ...inputStyle }} />{unit && <span style={S.unit}>{unit}</span>}</div></div>);
}
function MotorSpecBar({ label, value, max, color, unit }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (<div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 10, opacity: 0.5, fontFamily: MONO, width: 80, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>{label}</span><div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s ease" }} /></div><span style={{ fontSize: 11, fontFamily: MONO, color, minWidth: 72, textAlign: "right" }}>{fmt(value, 1)} {unit}</span></div>);
}

// ─── Canvas ─────────────────────────────────────────────────────────────────
function useChart(containerRef, canvasRef, h, draw, deps) {
    useEffect(() => { const c = canvasRef.current, ct = containerRef.current; if (!c || !ct) return; const d = window.devicePixelRatio || 1, w = ct.clientWidth; c.width = w * d; c.height = h * d; c.style.width = w + "px"; c.style.height = h + "px"; const x = c.getContext("2d"); x.scale(d, d); x.clearRect(0, 0, w, h); draw(x, w, h); }, deps);
}
function drawGrid(ctx, p, pw, ph, cols = 5, rows = 5) {
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) { const x = p.l + (i / cols) * pw; ctx.beginPath(); ctx.moveTo(x, p.t); ctx.lineTo(x, p.t + ph); ctx.stroke(); }
    for (let i = 0; i <= rows; i++) { const y = p.t + (i / rows) * ph; ctx.beginPath(); ctx.moveTo(p.l, y); ctx.lineTo(p.l + pw, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.beginPath(); ctx.moveTo(p.l, p.t); ctx.lineTo(p.l, p.t + ph); ctx.lineTo(p.l + pw, p.t + ph); ctx.stroke();
}

// ─── Elevator Diagram ───────────────────────────────────────────────────────
function ElevatorDiagram({ stages, heightFraction, massKg, maxHeightM, motorLiftForce, weight }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 380, (ctx, w, h) => {
        const pad = 30, elevW = Math.min(70, w * 0.12), elevH = h - pad * 2, cx = w / 2, baseY = pad + elevH, topY = pad;
        ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.strokeRect(cx - elevW * 0.8, topY, elevW * 1.6, elevH);
        const stageH = elevH / stages, stageColors = ["rgba(249,115,22,0.25)", "rgba(59,130,246,0.2)", "rgba(16,185,129,0.2)"];
        for (let s = 0; s < stages; s++) { let totalOffset = 0; for (let k = 0; k < s; k++) totalOffset += stageH * Math.min(1, Math.max(0, heightFraction * stages - k)); const sBaseY = baseY - totalOffset, sW = elevW - s * 10; ctx.fillStyle = stageColors[s % stageColors.length]; ctx.fillRect(cx - sW / 2, sBaseY - stageH, sW, stageH); ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1.5; ctx.strokeRect(cx - sW / 2, sBaseY - stageH, sW, stageH); ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "center"; ctx.fillText(`S${s + 1}`, cx, sBaseY - stageH / 2 + 3); }
        let cOff = 0; for (let k = 0; k < stages; k++) cOff += stageH * Math.min(1, Math.max(0, heightFraction * stages - k));
        const cY = baseY - cOff, cW = elevW - stages * 10 + 4, cH = 16;
        ctx.fillStyle = "#f97316"; ctx.globalAlpha = 0.3; ctx.fillRect(cx - cW / 2, cY - cH, cW, cH); ctx.globalAlpha = 1; ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2; ctx.strokeRect(cx - cW / 2, cY - cH, cW, cH); ctx.fillStyle = "#f97316"; ctx.font = `bold 9px ${MONO}`; ctx.textAlign = "center"; ctx.fillText("▼", cx, cY - cH / 2 + 3);
        ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx, topY + 6); ctx.lineTo(cx, cY - cH); ctx.stroke(); ctx.setLineDash([]);
        const gl = Math.min(45, elevH * 0.12); ctx.strokeStyle = "#3b82f6"; ctx.fillStyle = "#3b82f6"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cY + 2); ctx.lineTo(cx, cY + 2 + gl); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, cY + gl + 4); ctx.lineTo(cx - 5, cY + gl - 2); ctx.lineTo(cx + 5, cY + gl - 2); ctx.closePath(); ctx.fill(); ctx.font = `10px ${MONO}`; ctx.textAlign = "left"; ctx.fillStyle = "rgba(59,130,246,0.7)"; ctx.fillText(`${fmt(weight, 1)} N`, cx + 10, cY + gl);
        if (motorLiftForce > 0) { const ll = Math.min(45, elevH * 0.12), lx = cx + elevW * 0.8 + 16, lBy = cY - cH / 2, lc = motorLiftForce >= weight ? "#10b981" : "#f43f5e"; ctx.strokeStyle = lc; ctx.fillStyle = lc; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, lBy); ctx.lineTo(lx, lBy - ll); ctx.stroke(); ctx.beginPath(); ctx.moveTo(lx, lBy - ll - 2); ctx.lineTo(lx - 5, lBy - ll + 4); ctx.lineTo(lx + 5, lBy - ll + 4); ctx.closePath(); ctx.fill(); ctx.font = `10px ${MONO}`; ctx.textAlign = "left"; ctx.fillStyle = lc; ctx.fillText(`${fmt(motorLiftForce, 1)} N`, lx + 8, lBy - ll + 4); ctx.font = `9px ${MONO}`; ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillText("Motor lift", lx + 8, lBy - ll + 16); }
        const aX = cx - elevW * 0.8 - 20; ctx.strokeStyle = "rgba(249,115,22,0.4)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(aX, baseY); ctx.lineTo(aX, cY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(aX - 4, baseY); ctx.lineTo(aX + 4, baseY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(aX - 4, cY); ctx.lineTo(aX + 4, cY); ctx.stroke(); ctx.fillStyle = "#f97316"; ctx.font = `10px ${MONO}`; ctx.textAlign = "right"; ctx.fillText(`${fmt(heightFraction * maxHeightM * 100, 1)} cm`, aX - 8, (baseY + cY) / 2 + 3);
        let ly = 14; const lx = 12; ctx.font = `10px ${MONO}`; ctx.textAlign = "left";
        [["#f97316", "Carriage"], ["#3b82f6", "Weight (mg)"]].concat(motorLiftForce > 0 ? [[motorLiftForce >= weight ? "#10b981" : "#f43f5e", "Motor force"]] : []).forEach(([c, t]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(lx + 4, ly, 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillText(t, lx + 14, ly + 3); ly += 16; });
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "center"; ctx.fillText(`Max: ${fmt(maxHeightM * 100, 1)} cm`, cx, baseY + 18);
    }, [stages, heightFraction, massKg, maxHeightM, motorLiftForce, weight]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Force Chart ────────────────────────────────────────────────────────────
function ForceChart({ weight, motorLiftForce, maxHeightM, currentHeightFraction }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 260, (ctx, w, h) => {
        const pad = { t: 24, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        const maxF = Math.max(weight, motorLiftForce) * 1.3;
        drawGrid(ctx, pad, pw, ph, 5, 4);
        const gY = pad.t + ph - (weight / maxF) * ph; ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(pad.l, gY); ctx.lineTo(pad.l + pw, gY); ctx.stroke();
        if (motorLiftForce > 0) { const mY = pad.t + ph - (motorLiftForce / maxF) * ph; ctx.strokeStyle = "rgba(168,85,247,0.7)"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(pad.l, mY); ctx.lineTo(pad.l + pw, mY); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "rgba(168,85,247,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "right"; ctx.fillText("Motor stall force", pad.l + pw - 4, mY - 6); }
        ctx.fillStyle = "rgba(249,115,22,0.6)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "left"; ctx.fillText("Gravity load (constant)", pad.l + 4, gY - 6);
        const mx = pad.l + currentHeightFraction * pw; ctx.strokeStyle = "rgba(249,115,22,0.3)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(mx, pad.t); ctx.lineTo(mx, pad.t + ph); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(mx, gY, 6, 0, Math.PI * 2); ctx.fillStyle = "#f97316"; ctx.fill(); ctx.beginPath(); ctx.arc(mx, gY, 3, 0, Math.PI * 2); ctx.fillStyle = "#0c0e14"; ctx.fill();
        ctx.fillStyle = "#f97316"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = mx > pad.l + pw / 2 ? "right" : "left"; ctx.fillText(`${fmt(weight, 1)} N`, mx + (mx > pad.l + pw / 2 ? -12 : 12), gY - 12);
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center"; for (let i = 0; i <= 5; i++) ctx.fillText(fmt((maxHeightM * i / 5) * 100, 1), pad.l + (i / 5) * pw, pad.t + ph + 16); ctx.fillText("Height (cm)", pad.l + pw / 2, pad.t + ph + 38); ctx.textAlign = "right"; for (let i = 0; i <= 4; i++) ctx.fillText(fmt(maxF * (1 - i / 4), 1), pad.l - 8, pad.t + (i / 4) * ph + 3); ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Force (N)", 0, 0); ctx.restore();
    }, [weight, motorLiftForce, maxHeightM, currentHeightFraction]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Velocity vs Carriage Speed Chart ───────────────────────────────────────
function VelocityChart({ vMax, vFree, weight, fStall, maxHeightM, currentHeightFraction }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 260, (ctx, w, h) => {
        const pad = { t: 24, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        // Plot: motor force vs velocity, and gravity line
        const maxV = vFree * 1.1, maxF = Math.max(fStall, weight) * 1.15;
        drawGrid(ctx, pad, pw, ph, 5, 4);
        // Motor force-speed line: F = F_stall * (1 - v/v_free)
        ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2.5; ctx.beginPath();
        for (let i = 0; i <= 100; i++) { const v = (i / 100) * maxV, f = fStall * (1 - v / vFree), x = pad.l + (v / maxV) * pw, y = pad.t + ph - (Math.max(0, f) / maxF) * ph; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
        // Gravity line
        const gY = pad.t + ph - (weight / maxF) * ph; ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(pad.l, gY); ctx.lineTo(pad.l + pw, gY); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(249,115,22,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "right"; ctx.fillText("Gravity (mg)", pad.l + pw - 4, gY - 5);
        // Intersection = vMax
        if (vMax > 0 && vMax <= maxV) { const mx = pad.l + (vMax / maxV) * pw; ctx.strokeStyle = "rgba(59,130,246,0.3)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(mx, pad.t); ctx.lineTo(mx, pad.t + ph); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(mx, gY, 6, 0, Math.PI * 2); ctx.fillStyle = "#3b82f6"; ctx.fill(); ctx.beginPath(); ctx.arc(mx, gY, 3, 0, Math.PI * 2); ctx.fillStyle = "#0c0e14"; ctx.fill(); ctx.fillStyle = "#3b82f6"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = mx > pad.l + pw / 2 ? "right" : "left"; ctx.fillText(`v_max = ${fmt(vMax * 100, 1)} cm/s`, mx + (mx > pad.l + pw / 2 ? -12 : 12), gY - 12); }
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center"; for (let i = 0; i <= 5; i++) ctx.fillText(fmt((maxV * i / 5) * 100, 0), pad.l + (i / 5) * pw, pad.t + ph + 16); ctx.fillText("Carriage Velocity (cm/s)", pad.l + pw / 2, pad.t + ph + 38); ctx.textAlign = "right"; for (let i = 0; i <= 4; i++) ctx.fillText(fmt(maxF * (1 - i / 4), 0), pad.l - 8, pad.t + (i / 4) * ph + 3); ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Force (N)", 0, 0); ctx.restore();
        ctx.fillStyle = "rgba(59,130,246,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "left"; ctx.fillText("Motor force F(v)", pad.l + 4, pad.t + 12);
    }, [vMax, vFree, weight, fStall, maxHeightM, currentHeightFraction]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Acceleration vs Velocity Chart ─────────────────────────────────────────
function AccelChart({ vMax, vFree, weight, fStall, massKg }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 260, (ctx, w, h) => {
        const pad = { t: 24, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        const aMax = massKg > 0 ? (fStall - weight) / massKg : 0;
        const aAtFree = massKg > 0 ? (fStall * (1 - 1) - weight) / massKg : 0; // = -mg/m = -g at free speed
        const maxA = Math.max(Math.abs(aMax), Math.abs(aAtFree), G) * 1.2;
        const maxV = vFree * 1.1;
        drawGrid(ctx, pad, pw, ph, 5, 4);
        // Zero line
        if (true) { const zy = pad.t + ph * (1 - (0 - (-maxA)) / (2 * maxA)); ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke(); }
        // a(v) = (F_stall*(1 - v/vFree) - mg) / m
        ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2.5; ctx.beginPath();
        for (let i = 0; i <= 100; i++) { const v = (i / 100) * maxV, a = massKg > 0 ? (fStall * (1 - v / vFree) - weight) / massKg : 0; const x = pad.l + (v / maxV) * pw, y = pad.t + ph * (1 - (a - (-maxA)) / (2 * maxA)); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
        // Mark vMax (where a=0)
        if (vMax > 0 && vMax <= maxV) { const mx = pad.l + (vMax / maxV) * pw, zy = pad.t + ph * (1 - (0 - (-maxA)) / (2 * maxA)); ctx.strokeStyle = "rgba(16,185,129,0.3)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(mx, pad.t); ctx.lineTo(mx, pad.t + ph); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(mx, zy, 6, 0, Math.PI * 2); ctx.fillStyle = "#10b981"; ctx.fill(); ctx.beginPath(); ctx.arc(mx, zy, 3, 0, Math.PI * 2); ctx.fillStyle = "#0c0e14"; ctx.fill(); ctx.fillStyle = "#10b981"; ctx.font = `bold 10px ${MONO}`; ctx.textAlign = mx > pad.l + pw / 2 ? "right" : "left"; ctx.fillText(`a=0 @ ${fmt(vMax * 100, 1)} cm/s`, mx + (mx > pad.l + pw / 2 ? -10 : 10), zy - 10); }
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center"; for (let i = 0; i <= 5; i++) ctx.fillText(fmt((maxV * i / 5) * 100, 0), pad.l + (i / 5) * pw, pad.t + ph + 16); ctx.fillText("Carriage Velocity (cm/s)", pad.l + pw / 2, pad.t + ph + 38); ctx.textAlign = "right"; for (let i = 0; i <= 4; i++) { const a = maxA - (i / 4) * 2 * maxA; ctx.fillText(fmt(a, 1), pad.l - 8, pad.t + (i / 4) * ph + 3); } ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Accel (m/s²)", 0, 0); ctx.restore();
        ctx.fillStyle = "rgba(16,185,129,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "left"; ctx.fillText("Net accel a(v)", pad.l + 4, pad.t + 12);
    }, [vMax, vFree, weight, fStall, massKg]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Presets & Main ─────────────────────────────────────────────────────────
const ELEVATOR_PRESETS = [
    { id: "custom", label: "Custom", mass: 8.0, stages: 2, maxHeight: 1.2, drumRadius: 0.019 },
    { id: "singleLow", label: "Single Stage Low", mass: 5.0, stages: 1, maxHeight: 0.6, drumRadius: 0.019 },
    { id: "singleTall", label: "Single Stage Tall", mass: 6.0, stages: 1, maxHeight: 1.0, drumRadius: 0.019 },
    { id: "doubleStd", label: "2-Stage Standard", mass: 8.0, stages: 2, maxHeight: 1.2, drumRadius: 0.019 },
    { id: "doubleTall", label: "2-Stage Tall", mass: 10.0, stages: 2, maxHeight: 1.6, drumRadius: 0.019 },
    { id: "triple", label: "3-Stage", mass: 12.0, stages: 3, maxHeight: 2.0, drumRadius: 0.016 },
    { id: "heavy", label: "Heavy Carriage", mass: 15.0, stages: 2, maxHeight: 1.4, drumRadius: 0.022 },
];

export default function ElevatorForceApp() {
    const [presetId, setPresetId] = useState("doubleStd");
    const [mass, setMass] = useState(8.0), [stages, setStages] = useState(2), [maxHeight, setMaxHeight] = useState(1.2), [heightFraction, setHeightFraction] = useState(0.5);
    const [activeTab, setActiveTab] = useState("diagram"), [unitSystem, setUnitSystem] = useState("metric");
    const [motorId, setMotorId] = useState("krakenX60FOC"), [numMotors, setNumMotors] = useState(1), [gearingPreset, setGearingPreset] = useState(null), [gearing, setGearing] = useState(12);
    const [drumPreset, setDrumPreset] = useState(null), [drumRadius, setDrumRadius] = useState(0.019);

    const applyPreset = useCallback((id) => { setPresetId(id); if (id !== "custom") { const p = ELEVATOR_PRESETS.find(pr => pr.id === id); if (p) { setMass(p.mass); setStages(p.stages); setMaxHeight(p.maxHeight); setDrumRadius(p.drumRadius); } } }, []);
    const setMassCustom = (v) => { setMass(v); setPresetId("custom"); };
    const setStagesCustom = (v) => { setStages(v); setPresetId("custom"); };
    const setMaxHeightCustom = (v) => { setMaxHeight(v); setPresetId("custom"); };

    const result = useMemo(() => computeElevator(mass), [mass]);
    const motor = DC_MOTORS.find(m => m.id === motorId);
    const motorOut = useMemo(() => computeMotorForElevator(motor, numMotors, gearing, drumRadius, stages), [motor, numMotors, gearing, drumRadius, stages]);
    const dynamics = useMemo(() => computeElevatorDynamics(motor, numMotors, gearing, drumRadius, stages, mass), [motor, numMotors, gearing, drumRadius, stages, mass]);

    const displayWeight = unitSystem === "imperial" ? result.weight * 0.2248 : result.weight;
    const forceUnit = unitSystem === "imperial" ? "lbf" : "N";
    const displayMotorForce = unitSystem === "imperial" ? motorOut.effectiveLiftForceN * 0.2248 : motorOut.effectiveLiftForceN;
    const displayHeight = unitSystem === "imperial" ? maxHeight * 39.3701 : maxHeight * 100;
    const heightUnit = unitSystem === "imperial" ? "in" : "cm";
    const displayCurrentHeight = unitSystem === "imperial" ? heightFraction * maxHeight * 39.3701 : heightFraction * maxHeight * 100;
    const displayDrumDia = unitSystem === "imperial" ? drumRadius * 2 * 39.3701 : drumRadius * 2 * 1000;
    const drumDiaUnit = unitSystem === "imperial" ? "in" : "mm";
    const displayCarriageSpeed = unitSystem === "imperial" ? motorOut.carriageFreeSpeedMs * 39.3701 : motorOut.carriageFreeSpeedMs * 100;
    const speedUnit = unitSystem === "imperial" ? "in/s" : "cm/s";

    const marginPct = result.weight > 0 ? (motorOut.effectiveLiftForceN / result.weight) * 100 : Infinity;
    const motorOk = marginPct >= 200, motorWarn = marginPct >= 100 && marginPct < 200, motorBad = marginPct < 100;
    const motorColor = motorOk ? "#10b981" : motorWarn ? "#eab308" : "#f43f5e";
    const motorBg = motorOk ? "rgba(16,185,129,0.06)" : motorWarn ? "rgba(234,179,8,0.06)" : "rgba(244,63,94,0.06)";
    const motorBorder = motorOk ? "1px solid rgba(16,185,129,0.15)" : motorWarn ? "1px solid rgba(234,179,8,0.15)" : "1px solid rgba(244,63,94,0.15)";
    const forceMargin = motorOut.effectiveLiftForceN - result.weight;

    const TABS = [{ id: "diagram", label: "Elevator Diagram" }, { id: "force_chart", label: "Force Chart" }, { id: "velocity", label: "Velocity Chart" }, { id: "accel", label: "Acceleration Chart" }];

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0c0e14 0%, #111420 50%, #0c0e14 100%)", color: "#c8ced8", fontFamily: SANS }}>
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <header style={{ padding: "24px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}><h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: "#f97316", margin: 0 }}>ElevatorForce</h1><span style={{ fontSize: 12, opacity: 0.3, fontFamily: MONO }}>Gravity Load Calculator</span></div>
                <p style={{ fontSize: 12, opacity: 0.3, marginTop: 4 }}>FRC elevator gravity force analysis & motor sizing</p>
            </header>
            <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Preset</span><select value={presetId} onChange={e => applyPreset(e.target.value)} style={S.select}>{ELEVATOR_PRESETS.map(p => <option key={p.id} value={p.id} style={{ background: "#1a1d2e" }}>{p.label}</option>)}</select></div>
                    <div style={{ display: "flex", gap: 4 }}>{["metric", "imperial"].map(u => <button key={u} onClick={() => setUnitSystem(u)} style={S.btn(unitSystem === u)}>{u === "metric" ? "Metric" : "Imperial"}</button>)}</div>
                </div>

                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Elevator Parameters</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                        <NumInput label="Carriage Mass" value={parseFloat((unitSystem === "imperial" ? mass * 2.20462 : mass).toFixed(4))} onChange={v => setMassCustom(Math.max(0.1, unitSystem === "imperial" ? v / 2.20462 : v))} unit={unitSystem === "imperial" ? "lb" : "kg"} />
                        <NumInput label="Max Travel" value={parseFloat(displayHeight.toFixed(2))} onChange={v => setMaxHeightCustom(Math.max(0.01, unitSystem === "imperial" ? v / 39.3701 : v / 100))} unit={heightUnit} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Stages</label><div style={{ display: "flex", gap: 4 }}>{[1, 2, 3].map(n => <button key={n} onClick={() => setStagesCustom(n)} style={{ ...S.btn(stages === n), width: 36, textAlign: "center", padding: "4px 0" }}>{n}</button>)}</div></div>
                    </div>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Current Height</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><input type="range" min={0} max={1} step={0.005} value={heightFraction} onChange={e => setHeightFraction(parseFloat(e.target.value))} style={{ flex: 1, accentColor: "#f97316" }} /><div style={{ display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={parseFloat(displayCurrentHeight.toFixed(1))} min={0} onChange={e => { let v = parseFloat(e.target.value); if (isNaN(v)) v = 0; const m = unitSystem === "imperial" ? v / 39.3701 : v / 100; setHeightFraction(Math.max(0, Math.min(1, m / maxHeight))); }} style={S.inputSmall} /><span style={S.unit}>{heightUnit}</span></div></div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.25, fontFamily: MONO, padding: "0 2px" }}><span>Bottom</span><span>Mid</span><span>Top</span></div></div>
                </div>

                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={S.label}>Motor & Gearing</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>DC Motor</label><select value={motorId} onChange={e => setMotorId(e.target.value)} style={S.select}>{DC_MOTORS.map(m => <option key={m.id} value={m.id} style={{ background: "#1a1d2e" }}>{m.label}</option>)}</select></div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Number of Motors</label><div style={{ display: "flex", gap: 4 }}>{[1, 2, 3, 4].map(n => <button key={n} onClick={() => setNumMotors(n)} style={{ ...S.btn(numMotors === n), width: 36, textAlign: "center", padding: "4px 0" }}>{n}</button>)}</div></div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Gear Ratio</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><select value={gearingPreset === null ? "" : gearingPreset} onChange={e => { const v = e.target.value; if (v === "") setGearingPreset(null); else { setGearingPreset(parseFloat(v)); setGearing(parseFloat(v)); } }} style={{ ...S.select, width: 88 }}>{COMMON_GEARINGS.map(g => <option key={g.label} value={g.value === null ? "" : g.value} style={{ background: "#1a1d2e" }}>{g.label}</option>)}</select><input type="number" value={parseFloat(gearing.toFixed(2))} min={0.1} step={0.1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) { setGearing(v); setGearingPreset(null); } }} style={{ ...S.inputSmall, width: 64 }} /><span style={S.unit}>:1</span></div></div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Spool Diameter</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><select value={drumPreset === null ? "" : drumPreset} onChange={e => { const v = e.target.value; if (v === "") setDrumPreset(null); else { setDrumPreset(parseFloat(v)); setDrumRadius(parseFloat(v)); } }} style={{ ...S.select, width: 88 }}>{COMMON_DRUMS.map(d => <option key={d.label} value={d.value === null ? "" : d.value} style={{ background: "#1a1d2e" }}>{d.label}</option>)}</select><input type="number" value={parseFloat(displayDrumDia.toFixed(2))} min={0.1} step={0.1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) { const r = unitSystem === "imperial" ? (v / 39.3701) / 2 : (v / 1000) / 2; setDrumRadius(r); setDrumPreset(null); } }} style={{ ...S.inputSmall, width: 64 }} /><span style={S.unit}>{drumDiaUnit}</span></div></div>
                    </div>
                    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>Per Motor</span><MotorSpecBar label="Stall τ" value={motor.stallTorque} max={10} color="#a855f7" unit="N·m" /><MotorSpecBar label="Free Spd" value={motor.freeSpeed} max={20000} color="#3b82f6" unit="RPM" /><MotorSpecBar label="Stall I" value={motor.stallCurrent} max={500} color="#eab308" unit="A" /></div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>At Output ({numMotors}× {motor.label})</span><MotorSpecBar label="Lift F" value={motorOut.effectiveLiftForceN} max={Math.max(motorOut.effectiveLiftForceN * 1.2, result.weight * 1.2)} color="#a855f7" unit="N" /><MotorSpecBar label="Speed" value={motorOut.carriageFreeSpeedMs * 100} max={Math.max(motorOut.carriageFreeSpeedMs * 100 * 1.5, 1)} color="#3b82f6" unit="cm/s" /><MotorSpecBar label="Stall I" value={motorOut.totalStallCurrent} max={Math.max(motorOut.totalStallCurrent * 1.2, 1)} color="#eab308" unit="A" /></div>
                    </div>
                </div>

                <div style={{ borderRadius: 8, padding: "16px 20px", marginBottom: 12, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}><span style={{ fontSize: 12, opacity: 0.5, fontFamily: MONO }}>Gravity load on carriage:</span><span style={{ fontSize: 24, fontWeight: 700, fontFamily: MONO, color: "#f97316" }}>{fmt(displayWeight, 3)}</span><span style={{ fontSize: 13, opacity: 0.4, fontFamily: MONO }}>{forceUnit}</span></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "4px 24px", marginTop: 12 }}>
                        {[["Carriage mass", `${fmt(unitSystem === "imperial" ? mass * 2.20462 : mass, 2)} ${unitSystem === "imperial" ? "lb" : "kg"}`], ["Stages", `${stages}`], ["Drum torque needed", `${fmt(result.weight * drumRadius / stages, 3)} N·m`], ["Max travel", `${fmt(displayHeight, 1)} ${heightUnit}`]].map(([l, v], i) => <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 12, opacity: 0.4, fontFamily: MONO }}>{l}:</span><span style={{ fontSize: 12, fontFamily: MONO, color: "#e2e8f0" }}>{v}</span></div>)}
                    </div>
                </div>

                <div style={{ borderRadius: 8, padding: "16px 20px", marginBottom: 20, background: motorBg, border: motorBorder }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}><span style={{ fontSize: 12, opacity: 0.5, fontFamily: MONO }}>Motor stall lift force:</span><span style={{ fontSize: 24, fontWeight: 700, fontFamily: MONO, color: motorColor }}>{fmt(displayMotorForce, 3)}</span><span style={{ fontSize: 13, opacity: 0.4, fontFamily: MONO }}>{forceUnit}</span></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "4px 24px", marginTop: 12 }}>
                        {[["Force margin", `${fmt(unitSystem === "imperial" ? forceMargin * 0.2248 : forceMargin, 2)} ${forceUnit}`], ["Ratio (stall/gravity)", `${fmt(marginPct, 1)}%`], ["Free carriage speed", `${fmt(displayCarriageSpeed, 1)} ${speedUnit}`], ["Total stall current", `${fmt(motorOut.totalStallCurrent, 0)} A`]].map(([l, v], i) => <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 12, opacity: 0.4, fontFamily: MONO }}>{l}:</span><span style={{ fontSize: 12, fontFamily: MONO, color: "#e2e8f0" }}>{v}</span></div>)}
                    </div>
                    <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Max Velocity & Acceleration</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "4px 24px" }}>
                            {[["Max carriage velocity", `${fmt(dynamics.vMax * 100, 1)} cm/s  (${fmt(dynamics.vMax, 3)} m/s)`], ["Max accel (from stall)", `${fmt(dynamics.aMax, 2)} m/s²  (${fmt(dynamics.aMax / G, 2)} g)`], ["Free speed (no load)", `${fmt(dynamics.vFree * 100, 1)} cm/s`], ["Time to max height*", dynamics.vMax > 0 ? `${fmt(maxHeight / (dynamics.vMax * 0.5), 2)} s (est.)` : "—"]].map(([l, v], i) => <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>{l}:</span><span style={{ fontSize: 11, fontFamily: MONO, color: "#e2e8f0" }}>{v}</span></div>)}
                        </div>
                        <div style={{ fontSize: 9, opacity: 0.3, fontFamily: MONO, marginTop: 6 }}>* Rough estimate assuming avg velocity ≈ v_max/2 (trapezoidal profile)</div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, fontFamily: MONO, color: motorColor, opacity: 0.8 }}>{motorBad && "⚠ Motor stall force is insufficient to hold the carriage against gravity."}{motorWarn && "△ Motor can hold but margin is thin — continuous load will cause thermal issues. Aim for ≥200%."}{motorOk && "✓ Motor has sufficient margin to hold and accelerate the elevator."}</div>
                </div>

                <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>{TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={S.btn(activeTab === t.id)}>{t.label}</button>)}</div>
                    {activeTab === "diagram" && <ElevatorDiagram stages={stages} heightFraction={heightFraction} massKg={mass} maxHeightM={maxHeight} motorLiftForce={motorOut.effectiveLiftForceN} weight={result.weight} />}
                    {activeTab === "force_chart" && <ForceChart weight={result.weight} motorLiftForce={motorOut.effectiveLiftForceN} maxHeightM={maxHeight} currentHeightFraction={heightFraction} />}
                    {activeTab === "velocity" && <VelocityChart vMax={dynamics.vMax} vFree={dynamics.vFree} weight={dynamics.weight} fStall={dynamics.fStall} maxHeightM={maxHeight} currentHeightFraction={heightFraction} />}
                    {activeTab === "accel" && <AccelChart vMax={dynamics.vMax} vFree={dynamics.vFree} weight={dynamics.weight} fStall={dynamics.fStall} massKg={mass} />}
                </div>

                <div style={{ ...S.cardSubtle, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={S.label}>Elevator Physics Reference</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, fontSize: 12, opacity: 0.6, fontFamily: MONO }}>
                        <div>F_gravity = m·g (constant)</div><div>F_motor(v) = F_stall·(1 − v/v_free)</div><div>v_max = v_free·(1 − mg/F_stall)</div>
                        <div>a_max = (F_stall − mg) / m</div><div>a(v) = (F_motor(v) − mg) / m</div><div>F_stall = τ_stall·N·ratio / r_drum · stages</div>
                        <div>v_free = ω_free·r_drum / (ratio·stages)</div><div>Cascade: ×stages force, ÷stages speed</div><div>Aim for stall/gravity ≥ 200%</div>
                    </div>
                </div>
            </div>
            <footer style={{ padding: "16px 24px", textAlign: "center" }}><span style={{ fontSize: 12, opacity: 0.2, fontFamily: MONO }}>Elevator Gravity Force Calculator — FRC Mechanism Design</span></footer>
        </div>
    );
}