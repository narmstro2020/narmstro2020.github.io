import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ─── Physics ─────────────────────────────────────────────────────────────────
const G = 9.80665;

function computeArmTorque(lengthM, massKg, pivotFraction, angleDeg) {
  const comFromPivot = lengthM * (0.5 - pivotFraction);
  const angleRad = (angleDeg * Math.PI) / 180;
  const horizontalArm = comFromPivot * Math.cos(angleRad);
  const torque = massKg * G * horizontalArm;
  return { torqueNm: torque, comFromPivotM: comFromPivot, horizontalArmM: horizontalArm, angleRad };
}

function computeMOI(massKg, lengthM, pivotFraction) {
  const Icom = (1 / 12) * massKg * lengthM * lengthM;
  const d = lengthM * (0.5 - pivotFraction);
  return Icom + massKg * d * d;
}

function computeArmDynamics(angleDeg, motor, numMotors, gearing, massKg, lengthM, pivotFraction) {
  const stallTorqueOut = motor.stallTorque * numMotors * gearing;
  const freeSpeedRadS = (motor.freeSpeed / gearing) * (2 * Math.PI) / 60;
  const I = computeMOI(massKg, lengthM, pivotFraction);
  const { torqueNm: gravTorque } = computeArmTorque(lengthM, massKg, pivotFraction, angleDeg);
  const absGravTorque = Math.abs(gravTorque);
  const omegaMax = stallTorqueOut > 0 ? Math.max(0, freeSpeedRadS * (1 - absGravTorque / stallTorqueOut)) : 0;
  const alphaMax = I > 0 ? (stallTorqueOut - absGravTorque) / I : 0;
  return { omegaMax, alphaMax, I, stallTorqueOut, freeSpeedRadS, absGravTorque };
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

function computeMotorOutput(motor, numMotors, gearing) {
  const totalStallTorque = motor.stallTorque * numMotors * gearing;
  const outputFreeSpeed = motor.freeSpeed / gearing;
  const outputFreeSpeedRadS = (outputFreeSpeed * 2 * Math.PI) / 60;
  const totalStallCurrent = motor.stallCurrent * numMotors;
  return { totalStallTorque, outputFreeSpeed, outputFreeSpeedRadS, totalStallCurrent };
}

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
  unit: { fontSize: 11, opacity: 0.4, fontFamily: MONO, marginLeft: 4 },
  select: { background: "transparent", color: "#e2e8f0", fontFamily: MONO, fontSize: 13, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "4px 8px", outline: "none", cursor: "pointer" },
  btn: (a) => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.04)", color: a ? "#f97316" : "rgba(255,255,255,0.5)", border: a ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.06)" }),
};
function NumInput({ label, value, onChange, unit, inputStyle }) {
  return (<div style={{ display: "flex", flexDirection: label ? "column" : "row", gap: 4, alignItems: label ? "flex-start" : "center" }}>
    {label && <label style={S.fieldLabel}>{label}</label>}
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} style={{ ...S.input, ...inputStyle }} />{unit && <span style={S.unit}>{unit}</span>}</div>
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

// ─── Reusable Angle-Curve Chart ─────────────────────────────────────────────
function AngleChart({ valueFn, currentAngle, yLabel, curveColor, markerFmt }) {
  const canvasRef = useRef(null), containerRef = useRef(null);
  const data = useMemo(() => { const pts = []; let yMin = Infinity, yMax = -Infinity; for (let i = 0; i <= 360; i++) { const a = -180 + i, v = valueFn(a); pts.push({ a, v }); if (v < yMin) yMin = v; if (v > yMax) yMax = v; } const r = yMax - yMin; if (r < 0.001) { yMin -= 1; yMax += 1; } else { yMin -= r * 0.1; yMax += r * 0.1; } return { pts, yMin, yMax }; }, [valueFn]);
  useChart(containerRef, canvasRef, 260, (ctx, w, h) => {
    const pad = { t: 24, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
    const { pts, yMin, yMax } = data;
    drawGrid(ctx, pad, pw, ph, 6, 4);
    if (yMin < 0 && yMax > 0) { const zy = pad.t + ph * (1 - (0 - yMin) / (yMax - yMin)); ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke(); }
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
    [-180, -120, -60, 0, 60, 120, 180].forEach((a, i) => ctx.fillText(a + "°", pad.l + (i / 6) * pw, pad.t + ph + 16));
    ctx.fillText("Angle (degrees)", pad.l + pw / 2, pad.t + ph + 38);
    ctx.textAlign = "right"; for (let i = 0; i <= 4; i++) ctx.fillText(fmt(yMax - (i / 4) * (yMax - yMin), 1), pad.l - 8, pad.t + (i / 4) * ph + 3);
    ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText(yLabel, 0, 0); ctx.restore();
    ctx.strokeStyle = curveColor; ctx.lineWidth = 2.5; ctx.beginPath();
    pts.forEach((p, i) => { const x = pad.l + ((p.a + 180) / 360) * pw, y = pad.t + ph * (1 - (p.v - yMin) / (yMax - yMin)); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }); ctx.stroke();
    const curV = valueFn(currentAngle), mx = pad.l + ((currentAngle + 180) / 360) * pw, my = pad.t + ph * (1 - (curV - yMin) / (yMax - yMin));
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(mx, pad.t); ctx.lineTo(mx, pad.t + ph); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fillStyle = curveColor; ctx.fill();
    ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI * 2); ctx.fillStyle = "#0c0e14"; ctx.fill();
    ctx.fillStyle = curveColor; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = mx > pad.l + pw / 2 ? "right" : "left";
    ctx.fillText(markerFmt(curV), mx + (mx > pad.l + pw / 2 ? -12 : 12), my - 10);
  }, [data, currentAngle, yLabel, curveColor]);
  return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Arm Diagram ────────────────────────────────────────────────────────────
function ArmDiagram({ lengthM, massKg, pivotFraction, angleDeg, torqueNm, comFromPivotM }) {
  const canvasRef = useRef(null), containerRef = useRef(null);
  useChart(containerRef, canvasRef, 320, (ctx, w, h) => {
    const cx = w / 2, cy = h / 2, armPx = Math.min(w * 0.35, h * 0.38), angleRad = (angleDeg * Math.PI) / 180;
    const baseDist = pivotFraction * armPx, tipDist = (1 - pivotFraction) * armPx;
    const baseX = cx - baseDist * Math.cos(angleRad), baseY = cy + baseDist * Math.sin(angleRad);
    const tipX = cx + tipDist * Math.cos(angleRad), tipY = cy - tipDist * Math.sin(angleRad);
    const comPx = (0.5 - pivotFraction) * armPx, comX = cx + comPx * Math.cos(angleRad), comY = cy - comPx * Math.sin(angleRad);
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(cx - armPx * 1.3, cy); ctx.lineTo(cx + armPx * 1.3, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - armPx * 1.3); ctx.lineTo(cx, cy + armPx * 1.3); ctx.stroke(); ctx.setLineDash([]);
    const arcR = Math.min(40, armPx * 0.25), ca = -angleRad;
    if (Math.abs(angleDeg) > 0.5) { ctx.strokeStyle = "rgba(249,115,22,0.3)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, arcR, Math.min(0, ca), Math.max(0, ca)); ctx.stroke(); const la = ca / 2, lr = arcR + 14; ctx.fillStyle = "rgba(249,115,22,0.6)"; ctx.font = `11px ${MONO}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(`${angleDeg}°`, cx + lr * Math.cos(la), cy + lr * Math.sin(la)); }
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(tipX, tipY); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(tipX, tipY); ctx.stroke();
    const gl = Math.min(50, armPx * 0.35); ctx.strokeStyle = "#3b82f6"; ctx.fillStyle = "#3b82f6"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(comX, comY); ctx.lineTo(comX, comY + gl); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(comX, comY + gl + 2); ctx.lineTo(comX - 6, comY + gl - 6); ctx.lineTo(comX + 6, comY + gl - 6); ctx.closePath(); ctx.fill();
    ctx.font = `10px ${MONO}`; ctx.textAlign = "left"; ctx.fillStyle = "rgba(59,130,246,0.7)"; ctx.fillText("mg", comX + 8, comY + gl - 2);
    if (Math.abs(torqueNm) > 0.001) { const tR = 22, tc = torqueNm > 0 ? "#10b981" : "#f43f5e"; ctx.strokeStyle = tc; ctx.lineWidth = 2.5; const ts = -Math.PI * 0.6, te = Math.PI * 0.3; ctx.beginPath(); torqueNm > 0 ? ctx.arc(cx, cy, tR, ts, te) : ctx.arc(cx, cy, tR, te, ts, true); ctx.stroke(); const aa = torqueNm > 0 ? te : ts, td = torqueNm > 0 ? 1 : -1, ax = cx + tR * Math.cos(aa), ay = cy + tR * Math.sin(aa), ta = aa + (Math.PI / 2) * td; ctx.fillStyle = tc; ctx.beginPath(); ctx.moveTo(ax + 5 * Math.cos(ta), ay + 5 * Math.sin(ta)); ctx.lineTo(ax + 5 * Math.cos(ta + 2.4), ay + 5 * Math.sin(ta + 2.4)); ctx.lineTo(ax + 5 * Math.cos(ta - 2.4), ay + 5 * Math.sin(ta - 2.4)); ctx.closePath(); ctx.fill(); ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "center"; ctx.fillStyle = torqueNm > 0 ? "rgba(16,185,129,0.8)" : "rgba(244,63,94,0.8)"; ctx.fillText("τ", cx, cy - tR - 8); }
    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fillStyle = "#f97316"; ctx.fill(); ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = "#0c0e14"; ctx.fill(); ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fillStyle = "#f97316"; ctx.fill();
    ctx.beginPath(); ctx.arc(comX, comY, 5, 0, Math.PI * 2); ctx.fillStyle = "#3b82f6"; ctx.fill();
    ctx.beginPath(); ctx.arc(tipX, tipY, 4, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.fill();
    ctx.beginPath(); ctx.arc(baseX, baseY, 4, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fill();
    let ly = 14; const lx = 12; ctx.font = `10px ${MONO}`; ctx.textAlign = "left";
    [["#f97316", "Pivot"], ["#3b82f6", "CoM"]].forEach(([c, t]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(lx + 4, ly, 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillText(t, lx + 14, ly + 3); ly += 16; });
  }, [lengthM, massKg, pivotFraction, angleDeg, torqueNm, comFromPivotM]);
  return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Torque vs Angle ────────────────────────────────────────────────────────
function TorqueAngleChart({ lengthM, massKg, pivotFraction, currentAngle, motorTorqueAtOutput }) {
  const canvasRef = useRef(null), containerRef = useRef(null);
  useChart(containerRef, canvasRef, 260, (ctx, w, h) => {
    const pad = { t: 24, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
    const peakT = Math.abs(massKg * G * lengthM * (0.5 - pivotFraction));
    const maxT = Math.max(peakT > 0 ? peakT * 1.15 : 1, motorTorqueAtOutput > 0 ? motorTorqueAtOutput * 1.15 : 0);
    drawGrid(ctx, pad, pw, ph, 6, 4);
    const zy = pad.t + ph / 2; ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();
    if (motorTorqueAtOutput > 0) { const mpy = pad.t + ph / 2 - (motorTorqueAtOutput / maxT) * (ph / 2), mny = pad.t + ph / 2 + (motorTorqueAtOutput / maxT) * (ph / 2); ctx.strokeStyle = "rgba(168,85,247,0.35)"; ctx.lineWidth = 1; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(pad.l, mpy); ctx.lineTo(pad.l + pw, mpy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(pad.l, mny); ctx.lineTo(pad.l + pw, mny); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "rgba(168,85,247,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "right"; ctx.fillText("Motor stall τ", pad.l + pw - 4, mpy - 4); }
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center"; [-180, -120, -60, 0, 60, 120, 180].forEach((a, i) => ctx.fillText(a + "°", pad.l + (i / 6) * pw, pad.t + ph + 16)); ctx.fillText("Angle (degrees)", pad.l + pw / 2, pad.t + ph + 38); ctx.textAlign = "right"; for (let i = 0; i <= 4; i++) ctx.fillText(fmt(maxT - (i / 4) * 2 * maxT, 2), pad.l - 8, pad.t + (i / 4) * ph + 3); ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Torque (N·m)", 0, 0); ctx.restore();
    ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 360; i++) { const a = -180 + i, { torqueNm } = computeArmTorque(lengthM, massKg, pivotFraction, a), x = pad.l + ((a + 180) / 360) * pw, y = pad.t + ph / 2 - (torqueNm / maxT) * (ph / 2); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    const { torqueNm: curT } = computeArmTorque(lengthM, massKg, pivotFraction, currentAngle), mx = pad.l + ((currentAngle + 180) / 360) * pw, my = pad.t + ph / 2 - (curT / maxT) * (ph / 2);
    ctx.strokeStyle = "rgba(249,115,22,0.3)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(mx, pad.t); ctx.lineTo(mx, pad.t + ph); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fillStyle = "#f97316"; ctx.fill(); ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI * 2); ctx.fillStyle = "#0c0e14"; ctx.fill();
    ctx.fillStyle = "#f97316"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = mx > pad.l + pw / 2 ? "right" : "left"; ctx.fillText(`${fmt(curT, 3)} N·m`, mx + (mx > pad.l + pw / 2 ? -12 : 12), my - 10);
  }, [lengthM, massKg, pivotFraction, currentAngle, motorTorqueAtOutput]);
  return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Presets & Main ─────────────────────────────────────────────────────────
const ARM_PRESETS = [
  { id: "custom", label: "Custom", length: 1.0, mass: 5.0, pivot: 0.0 }, { id: "intake", label: "Intake Arm", length: 0.45, mass: 3.5, pivot: 0.0 },
  { id: "singleStage", label: "Single-Stage Arm", length: 0.7, mass: 5.0, pivot: 0.0 }, { id: "doubleStage", label: "Double-Stage Arm", length: 1.1, mass: 8.0, pivot: 0.0 },
  { id: "wrist", label: "Wrist / End Effector", length: 0.25, mass: 2.0, pivot: 0.0 }, { id: "balanced", label: "Counterbalanced", length: 0.8, mass: 6.0, pivot: 0.3 },
];

export default function ArmTorqueApp() {
  const [presetId, setPresetId] = useState("singleStage");
  const [length, setLength] = useState(0.7), [mass, setMass] = useState(5.0), [pivot, setPivot] = useState(0.0), [angle, setAngle] = useState(0);
  const [activeTab, setActiveTab] = useState("diagram"), [unitSystem, setUnitSystem] = useState("metric");
  const [motorId, setMotorId] = useState("krakenX60FOC"), [numMotors, setNumMotors] = useState(1), [gearingPreset, setGearingPreset] = useState(null), [gearing, setGearing] = useState(25);

  const applyPreset = useCallback((id) => { setPresetId(id); if (id !== "custom") { const p = ARM_PRESETS.find(pr => pr.id === id); if (p) { setLength(p.length); setMass(p.mass); setPivot(p.pivot); } } }, []);
  const setLengthCustom = (v) => { setLength(v); setPresetId("custom"); };
  const setMassCustom = (v) => { setMass(v); setPresetId("custom"); };
  const setPivotCustom = (v) => { setPivot(v); setPresetId("custom"); };

  const result = useMemo(() => computeArmTorque(length, mass, pivot, angle), [length, mass, pivot, angle]);
  const motor = DC_MOTORS.find(m => m.id === motorId);
  const motorOutput = useMemo(() => computeMotorOutput(motor, numMotors, gearing), [motor, numMotors, gearing]);
  const dynamics = useMemo(() => computeArmDynamics(angle, motor, numMotors, gearing, mass, length, pivot), [angle, motor, numMotors, gearing, mass, length, pivot]);
  const dynamicsWorst = useMemo(() => computeArmDynamics(0, motor, numMotors, gearing, mass, length, pivot), [motor, numMotors, gearing, mass, length, pivot]);
  const dynamicsBest = useMemo(() => computeArmDynamics(90, motor, numMotors, gearing, mass, length, pivot), [motor, numMotors, gearing, mass, length, pivot]);
  const velocityFn = useCallback((a) => computeArmDynamics(a, motor, numMotors, gearing, mass, length, pivot).omegaMax * (180 / Math.PI), [motor, numMotors, gearing, mass, length, pivot]);
  const accelFn = useCallback((a) => computeArmDynamics(a, motor, numMotors, gearing, mass, length, pivot).alphaMax * (180 / Math.PI), [motor, numMotors, gearing, mass, length, pivot]);

  const displayTorque = unitSystem === "imperial" ? result.torqueNm * 8.8507 : result.torqueNm;
  const displayComDist = unitSystem === "imperial" ? result.comFromPivotM * 39.3701 : result.comFromPivotM * 100;
  const displayHorizArm = unitSystem === "imperial" ? result.horizontalArmM * 39.3701 : result.horizontalArmM * 100;
  const torqueUnit = unitSystem === "imperial" ? "lbf·in" : "N·m"; const smallLenUnit = unitSystem === "imperial" ? "in" : "cm";
  const peakTorque = Math.abs(mass * G * length * (0.5 - pivot)); const peakDisplay = unitSystem === "imperial" ? peakTorque * 8.8507 : peakTorque;
  const displayMotorStall = unitSystem === "imperial" ? motorOutput.totalStallTorque * 8.8507 : motorOutput.totalStallTorque;
  const torqueMargin = motorOutput.totalStallTorque - peakTorque; const marginPct = peakTorque > 0 ? (motorOutput.totalStallTorque / peakTorque) * 100 : Infinity;
  const tColor = Math.abs(result.torqueNm) > 0.001 ? (result.torqueNm > 0 ? "#10b981" : "#f43f5e") : "#f97316";
  const tBg = Math.abs(result.torqueNm) > 0.001 ? (result.torqueNm > 0 ? "rgba(16,185,129,0.06)" : "rgba(244,63,94,0.06)") : "rgba(249,115,22,0.06)";
  const tBorder = Math.abs(result.torqueNm) > 0.001 ? (result.torqueNm > 0 ? "1px solid rgba(16,185,129,0.15)" : "1px solid rgba(244,63,94,0.15)") : "1px solid rgba(249,115,22,0.15)";
  const motorOk = marginPct >= 200, motorWarn = marginPct >= 100 && marginPct < 200, motorBad = marginPct < 100;
  const motorColor = motorOk ? "#10b981" : motorWarn ? "#eab308" : "#f43f5e";
  const motorBg = motorOk ? "rgba(16,185,129,0.06)" : motorWarn ? "rgba(234,179,8,0.06)" : "rgba(244,63,94,0.06)";
  const motorBorder = motorOk ? "1px solid rgba(16,185,129,0.15)" : motorWarn ? "1px solid rgba(234,179,8,0.15)" : "1px solid rgba(244,63,94,0.15)";

  const TABS = [{ id: "diagram", label: "Arm Diagram" }, { id: "torque_angle", label: "Torque vs Angle" }, { id: "velocity", label: "Max ω vs Angle" }, { id: "accel", label: "Max α vs Angle" }];

  return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0c0e14 0%, #111420 50%, #0c0e14 100%)", color: "#c8ced8", fontFamily: SANS }}>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <header style={{ padding: "24px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}><h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: "#f97316", margin: 0 }}>ArmTorque</h1><span style={{ fontSize: 12, opacity: 0.3, fontFamily: MONO }}>Gravity Load Calculator</span></div>
          <p style={{ fontSize: 12, opacity: 0.3, marginTop: 4 }}>FRC arm gravity torque analysis & motor sizing</p>
        </header>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Preset</span>
              <select value={presetId} onChange={e => applyPreset(e.target.value)} style={S.select}>{ARM_PRESETS.map(p => <option key={p.id} value={p.id} style={{ background: "#1a1d2e" }}>{p.label}</option>)}</select></div>
            <div style={{ display: "flex", gap: 4 }}>{["metric", "imperial"].map(u => <button key={u} onClick={() => setUnitSystem(u)} style={S.btn(unitSystem === u)}>{u === "metric" ? "Metric" : "Imperial"}</button>)}</div>
          </div>

          <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
            <div style={S.label}>Parameters</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <NumInput label="Arm Length" value={parseFloat((unitSystem === "imperial" ? length * 39.3701 : length).toFixed(4))} onChange={v => setLengthCustom(Math.max(0.001, unitSystem === "imperial" ? v / 39.3701 : v))} unit={unitSystem === "imperial" ? "in" : "m"} />
              <NumInput label="Arm Mass" value={parseFloat((unitSystem === "imperial" ? mass * 2.20462 : mass).toFixed(4))} onChange={v => setMassCustom(Math.max(0.001, unitSystem === "imperial" ? v / 2.20462 : v))} unit={unitSystem === "imperial" ? "lb" : "kg"} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Pivot Location</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="range" min={0} max={1} step={0.01} value={pivot} onChange={e => setPivotCustom(parseFloat(e.target.value))} style={{ accentColor: "#f97316", width: 100 }} /><input type="number" value={parseFloat(pivot.toFixed(2))} min={0} max={1} step={0.01} onChange={e => { let v = parseFloat(e.target.value); if (isNaN(v)) v = 0; setPivotCustom(Math.max(0, Math.min(1, v))); }} style={S.inputSmall} /></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.25, fontFamily: MONO, width: 100 }}><span>Base</span><span>Tip</span></div></div>
            </div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Angle</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><input type="range" min={-180} max={180} step={1} value={angle} onChange={e => setAngle(parseFloat(e.target.value))} style={{ flex: 1, accentColor: "#f97316" }} /><div style={{ display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={angle} min={-180} max={180} step={1} onChange={e => { let v = parseFloat(e.target.value); if (isNaN(v)) v = 0; setAngle(Math.max(-180, Math.min(180, v))); }} style={S.inputSmall} /><span style={S.unit}>°</span></div></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.25, fontFamily: MONO, padding: "0 2px" }}><span>−180°</span><span>−90°</span><span>0° horiz</span><span>90°</span><span>180°</span></div></div>
          </div>

          <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
            <div style={S.label}>Motor & Gearing</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>DC Motor</label><select value={motorId} onChange={e => setMotorId(e.target.value)} style={S.select}>{DC_MOTORS.map(m => <option key={m.id} value={m.id} style={{ background: "#1a1d2e" }}>{m.label}</option>)}</select></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Number of Motors</label><div style={{ display: "flex", gap: 4 }}>{[1, 2, 3, 4].map(n => <button key={n} onClick={() => setNumMotors(n)} style={{ ...S.btn(numMotors === n), width: 36, textAlign: "center", padding: "4px 0" }}>{n}</button>)}</div></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><label style={S.fieldLabel}>Gear Ratio</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><select value={gearingPreset === null ? "" : gearingPreset} onChange={e => { const v = e.target.value; if (v === "") setGearingPreset(null); else { setGearingPreset(parseFloat(v)); setGearing(parseFloat(v)); } }} style={{ ...S.select, width: 88 }}>{COMMON_GEARINGS.map(g => <option key={g.label} value={g.value === null ? "" : g.value} style={{ background: "#1a1d2e" }}>{g.label}</option>)}</select><input type="number" value={parseFloat(gearing.toFixed(2))} min={0.1} step={0.1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) { setGearing(v); setGearingPreset(null); } }} style={{ ...S.inputSmall, width: 64 }} /><span style={S.unit}>:1</span></div></div>
            </div>
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>Per Motor</span><MotorSpecBar label="Stall τ" value={motor.stallTorque} max={10} color="#a855f7" unit="N·m" /><MotorSpecBar label="Free Spd" value={motor.freeSpeed} max={20000} color="#3b82f6" unit="RPM" /><MotorSpecBar label="Stall I" value={motor.stallCurrent} max={500} color="#eab308" unit="A" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em" }}>At Output ({numMotors}× {motor.label}, {fmt(gearing, 1)}:1)</span><MotorSpecBar label="Stall τ" value={motorOutput.totalStallTorque} max={Math.max(motorOutput.totalStallTorque * 1.2, peakTorque * 1.2)} color="#a855f7" unit="N·m" /><MotorSpecBar label="Free Spd" value={motorOutput.outputFreeSpeed} max={Math.max(motorOutput.outputFreeSpeed * 1.5, 1)} color="#3b82f6" unit="RPM" /><MotorSpecBar label="Stall I" value={motorOutput.totalStallCurrent} max={Math.max(motorOutput.totalStallCurrent * 1.2, 1)} color="#eab308" unit="A" /></div>
            </div>
          </div>

          <div style={{ borderRadius: 8, padding: "16px 20px", marginBottom: 12, background: tBg, border: tBorder }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}><span style={{ fontSize: 12, opacity: 0.5, fontFamily: MONO }}>Torque due to gravity:</span><span style={{ fontSize: 24, fontWeight: 700, fontFamily: MONO, color: tColor }}>{fmt(displayTorque, 4)}</span><span style={{ fontSize: 13, opacity: 0.4, fontFamily: MONO }}>{torqueUnit}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "4px 24px", marginTop: 12 }}>
              {[["|τ| at 0°", `${fmt(peakDisplay, 4)} ${torqueUnit}`], ["CoM from pivot", `${fmt(displayComDist, 2)} ${smallLenUnit}`], ["Horizontal arm", `${fmt(displayHorizArm, 2)} ${smallLenUnit}`], ["Weight force", `${fmt(mass * G, 3)} N`]].map(([l, v], i) => <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 12, opacity: 0.4, fontFamily: MONO }}>{l}:</span><span style={{ fontSize: 12, fontFamily: MONO, color: "#e2e8f0" }}>{v}</span></div>)}
            </div>
          </div>

          <div style={{ borderRadius: 8, padding: "16px 20px", marginBottom: 20, background: motorBg, border: motorBorder }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}><span style={{ fontSize: 12, opacity: 0.5, fontFamily: MONO }}>Motor stall torque at output:</span><span style={{ fontSize: 24, fontWeight: 700, fontFamily: MONO, color: motorColor }}>{fmt(displayMotorStall, 4)}</span><span style={{ fontSize: 13, opacity: 0.4, fontFamily: MONO }}>{torqueUnit}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "4px 24px", marginTop: 12 }}>
              {[["Margin over peak", `${fmt(unitSystem === "imperial" ? torqueMargin * 8.8507 : torqueMargin, 3)} ${torqueUnit}`], ["Ratio (stall/peak)", `${fmt(marginPct, 1)}%`], ["Moment of inertia", `${fmt(dynamics.I, 4)} kg·m²`], ["Output free speed", `${fmt(motorOutput.outputFreeSpeed, 1)} RPM`]].map(([l, v], i) => <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 12, opacity: 0.4, fontFamily: MONO }}>{l}:</span><span style={{ fontSize: 12, fontFamily: MONO, color: "#e2e8f0" }}>{v}</span></div>)}
            </div>
            <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 10, opacity: 0.4, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Max Velocity & Acceleration (from stall)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "4px 24px" }}>
                {[[`ω_max at ${angle}°`, `${fmt(dynamics.omegaMax * 180 / Math.PI, 1)} °/s  (${fmt(dynamics.omegaMax, 2)} rad/s)`], [`α_max at ${angle}°`, `${fmt(dynamics.alphaMax * 180 / Math.PI, 1)} °/s²  (${fmt(dynamics.alphaMax, 2)} rad/s²)`], ["ω_max at 0° (worst)", `${fmt(dynamicsWorst.omegaMax * 180 / Math.PI, 1)} °/s`], ["α_max at 0° (worst)", `${fmt(dynamicsWorst.alphaMax * 180 / Math.PI, 1)} °/s²`], ["ω_max at ±90° (best)", `${fmt(dynamicsBest.omegaMax * 180 / Math.PI, 1)} °/s`], ["α_max at ±90° (best)", `${fmt(dynamicsBest.alphaMax * 180 / Math.PI, 1)} °/s²`]].map(([l, v], i) => <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 11, opacity: 0.4, fontFamily: MONO }}>{l}:</span><span style={{ fontSize: 11, fontFamily: MONO, color: "#e2e8f0" }}>{v}</span></div>)}
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, fontFamily: MONO, color: motorColor, opacity: 0.8 }}>{motorBad && "⚠ Motor stall torque is insufficient to hold at peak gravity load."}{motorWarn && "△ Motor can hold but margin is thin — continuous load may cause thermal issues. Aim for ≥200% stall/peak."}{motorOk && "✓ Motor has sufficient margin to hold and accelerate against gravity."}</div>
          </div>

          <div style={{ ...S.cardSubtle, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>{TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={S.btn(activeTab === t.id)}>{t.label}</button>)}</div>
            {activeTab === "diagram" && <ArmDiagram lengthM={length} massKg={mass} pivotFraction={pivot} angleDeg={angle} torqueNm={result.torqueNm} comFromPivotM={result.comFromPivotM} />}
            {activeTab === "torque_angle" && <TorqueAngleChart lengthM={length} massKg={mass} pivotFraction={pivot} currentAngle={angle} motorTorqueAtOutput={motorOutput.totalStallTorque} />}
            {activeTab === "velocity" && <AngleChart valueFn={velocityFn} currentAngle={angle} yLabel="Max Angular Vel (°/s)" curveColor="#3b82f6" markerFmt={v => `${fmt(v, 1)} °/s`} />}
            {activeTab === "accel" && <AngleChart valueFn={accelFn} currentAngle={angle} yLabel="Max Angular Accel (°/s²)" curveColor="#10b981" markerFmt={v => `${fmt(v, 1)} °/s²`} />}
          </div>

          <div style={{ ...S.cardSubtle, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={S.label}>Arm Physics Reference</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, fontSize: 12, opacity: 0.6, fontFamily: MONO }}>
              <div>τ_grav = m·g·L·(0.5−p)·cos(θ)</div><div>I = (1/12)·m·L² + m·d²</div><div>τ_motor(ω) = τ_stall·(1 − ω/ω_free)</div>
              <div>ω_max(θ) = ω_free·(1 − |τ_grav|/τ_stall)</div><div>α_max(θ) = (τ_stall − |τ_grav(θ)|) / I</div>
              <div>0° → max load, min ω/α</div><div>±90° → zero load, max ω/α</div><div>Aim for stall/peak ≥ 200%</div>
            </div>
          </div>
        </div>
        <footer style={{ padding: "16px 24px", textAlign: "center" }}><span style={{ fontSize: 12, opacity: 0.2, fontFamily: MONO }}>Arm Gravity Torque Calculator — FRC Mechanism Design</span></footer>
      </div>
  );
}