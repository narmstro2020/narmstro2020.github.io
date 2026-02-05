import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const MONO = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const SANS = "'Space Grotesk', 'Inter', system-ui, sans-serif";
const ACCENT = "#FF6B35";
const ACCENT2 = "#A855F7";
const ACCENT3 = "#22D3EE";
const BG = "#0A0A0C";
const CARD = "#111114";
const CARD2 = "#18181B";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT = "#E4E4E7";
const DIM = "#71717A";

// ─── Motor Database (same as Arm/Elevator) ──────────────────────────────────
const MOTORS = {
    "Kraken X60": { stallTorque: 7.09, stallCurrent: 366, freeSpeed: 6000, freeCurrent: 2, nominalVoltage: 12 },
    "Kraken X60 FOC": { stallTorque: 9.37, stallCurrent: 483, freeSpeed: 5800, freeCurrent: 2, nominalVoltage: 12 },
    "Falcon 500": { stallTorque: 4.69, stallCurrent: 257, freeSpeed: 6380, freeCurrent: 1.5, nominalVoltage: 12 },
    "Falcon 500 FOC": { stallTorque: 5.84, stallCurrent: 304, freeSpeed: 6080, freeCurrent: 1.5, nominalVoltage: 12 },
    "NEO": { stallTorque: 2.6, stallCurrent: 105, freeSpeed: 5676, freeCurrent: 1.8, nominalVoltage: 12 },
    "NEO 550": { stallTorque: 0.97, stallCurrent: 100, freeSpeed: 11000, freeCurrent: 1.4, nominalVoltage: 12 },
    "NEO Vortex": { stallTorque: 3.6, stallCurrent: 211, freeSpeed: 6784, freeCurrent: 3.6, nominalVoltage: 12 },
    "CIM": { stallTorque: 2.41, stallCurrent: 131, freeSpeed: 5310, freeCurrent: 2.7, nominalVoltage: 12 },
    "MiniCIM": { stallTorque: 1.41, stallCurrent: 89, freeSpeed: 5840, freeCurrent: 3, nominalVoltage: 12 },
    "775pro": { stallTorque: 0.71, stallCurrent: 134, freeSpeed: 18730, freeCurrent: 0.7, nominalVoltage: 12 },
};

// ─── Styles Object ───────────────────────────────────────────────────────────
const S = {
    root: { fontFamily: SANS, background: BG, color: TEXT, minHeight: "100vh", lineHeight: 1.5 },
    header: { padding: "24px 24px 0", display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" },
    title: { fontFamily: MONO, fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#fff" },
    subtitle: { fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "1px", textTransform: "uppercase" },
    body: { padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 16 },
    row: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 },
    card: { background: CARD, borderRadius: 10, padding: "18px 20px", border: `1px solid ${BORDER}` },
    cardSubtle: { background: CARD2, borderRadius: 8, padding: "14px 16px" },
    label: { fontFamily: MONO, fontSize: 11, color: DIM, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 },
    value: { fontFamily: MONO, fontSize: 28, fontWeight: 700, color: "#fff" },
    unit: { fontFamily: MONO, fontSize: 13, color: DIM, marginLeft: 4 },
    toggleRow: { display: "flex", gap: 6, flexWrap: "wrap" },
    toggleBtn: (active) => ({
        fontFamily: MONO, fontSize: 12, padding: "6px 14px", borderRadius: 6,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        background: active ? `${ACCENT}18` : "transparent",
        color: active ? ACCENT : DIM, cursor: "pointer", transition: "all 0.15s",
        fontWeight: active ? 600 : 400,
    }),
    tabBtn: (active) => ({
        fontFamily: MONO, fontSize: 11, padding: "5px 12px", borderRadius: 5,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        background: active ? `${ACCENT}15` : "transparent",
        color: active ? ACCENT : DIM, cursor: "pointer", transition: "all 0.15s",
        letterSpacing: "0.3px", textTransform: "uppercase",
    }),
    input: {
        fontFamily: MONO, fontSize: 14, background: "#0D0D10", border: `1px solid ${BORDER}`,
        borderRadius: 6, padding: "8px 12px", color: "#fff", width: "100%", boxSizing: "border-box",
        outline: "none",
    },
    select: {
        fontFamily: MONO, fontSize: 13, background: "#0D0D10", border: `1px solid ${BORDER}`,
        borderRadius: 6, padding: "8px 12px", color: "#fff", width: "100%", boxSizing: "border-box",
        outline: "none", cursor: "pointer", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%2371717A' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
        paddingRight: 32,
    },
    slider: {
        width: "100%", height: 4, borderRadius: 2, appearance: "none", background: "#27272A",
        outline: "none", cursor: "pointer",
    },
    presetBtn: {
        fontFamily: MONO, fontSize: 11, padding: "5px 10px", borderRadius: 5,
        border: `1px solid ${BORDER}`, background: "transparent", color: DIM,
        cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v, d = 2) => {
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + "M";
    if (Math.abs(v) >= 1e4) return (v / 1e3).toFixed(1) + "k";
    if (Math.abs(v) < 0.01 && v !== 0) return v.toExponential(1);
    return Number(v.toFixed(d)).toString();
};

const rpmToRadS = (rpm) => (rpm * 2 * Math.PI) / 60;
const radSToRpm = (radS) => (radS * 60) / (2 * Math.PI);

// ─── NumInput ────────────────────────────────────────────────────────────────
function NumInput({ label, value, onChange, min, max, step = 1, unit, width }) {
    return (
        <div style={{ flex: width || 1 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {label}{unit && <span style={{ opacity: 0.5 }}> ({unit})</span>}
            </div>
            <input
                type="number" value={value} min={min} max={max} step={step}
                onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.max(min ?? -Infinity, Math.min(max ?? Infinity, v))); }}
                style={S.input}
            />
        </div>
    );
}

// ─── useChart (canvas hook) ──────────────────────────────────────────────────
function useChart(canvasRef, drawFn, deps) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rect.width, rect.height);
        drawFn(ctx, rect.width, rect.height);
    }, deps);
}

function drawGrid(ctx, W, H, pad, xMax, yMax, xLabel, yLabel, xTicks = 5, yTicks = 5) {
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    const pw = W - pad.l - pad.r;
    const ph = H - pad.t - pad.b;

    for (let i = 0; i <= yTicks; i++) {
        const y = pad.t + (ph * i) / yTicks;
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
        ctx.fillStyle = DIM; ctx.font = `10px ${MONO}`;
        ctx.textAlign = "right"; ctx.textBaseline = "middle";
        ctx.fillText(fmt(yMax * (1 - i / yTicks)), pad.l - 8, y);
    }
    for (let i = 0; i <= xTicks; i++) {
        const x = pad.l + (pw * i) / xTicks;
        ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, H - pad.b); ctx.stroke();
        ctx.fillStyle = DIM; ctx.font = `10px ${MONO}`;
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText(fmt(xMax * (i / xTicks)), x, H - pad.b + 6);
    }

    // Axis labels
    ctx.fillStyle = DIM; ctx.font = `10px ${MONO}`;
    ctx.textAlign = "center";
    ctx.fillText(xLabel, pad.l + pw / 2, H - 4);
    ctx.save();
    ctx.translate(10, pad.t + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
}

// ─── Gearbox Physics ─────────────────────────────────────────────────────────
function computeGearbox(motor, numMotors, ratio, efficiency, loadInertia) {
    const { stallTorque, stallCurrent, freeSpeed, freeCurrent, nominalVoltage } = motor;

    const totalStallTorque = stallTorque * numMotors;
    const totalStallCurrent = stallCurrent * numMotors;
    const totalFreeCurrent = freeCurrent * numMotors;
    const freeSpeedRadS = rpmToRadS(freeSpeed);

    // Output side
    const outputStallTorque = totalStallTorque * ratio * efficiency;
    const outputFreeSpeed = freeSpeed / ratio; // RPM
    const outputFreeSpeedRadS = freeSpeedRadS / ratio;

    // Motor inertia reflected to output
    // For N motors: J_motor_reflected = N * J_motor * ratio^2
    // Approximate motor inertia from stall torque & stall current:
    //   τ = Kt * I, Kt = τ_stall / I_stall
    //   Ke = Kt (in SI), back-emf at free speed = V - I_free * R
    //   R = V / I_stall, Ke = (V - I_free * R) / ω_free
    const resistance = nominalVoltage / stallCurrent;
    const Kt = stallTorque / stallCurrent;
    const Ke = (nominalVoltage - freeCurrent * resistance) / freeSpeedRadS;

    // Total inertia at output shaft
    const totalInertia = loadInertia; // User provides total load inertia at output

    // Torque-speed curve at output
    // τ_out(ω_out) = τ_stall_out * (1 - ω_out / ω_free_out)
    // Current draw: I(ω_out) = I_stall - (I_stall - I_free) * (ω_out * ratio) / ω_free_motor
    const torqueAtSpeed = (outputRPM) => {
        const frac = outputRPM / outputFreeSpeed;
        return outputStallTorque * (1 - frac);
    };

    const currentAtSpeed = (outputRPM) => {
        const motorRPM = outputRPM * ratio;
        const frac = motorRPM / freeSpeed;
        return totalStallCurrent - (totalStallCurrent - totalFreeCurrent) * frac;
    };

    const powerAtSpeed = (outputRPM) => {
        const torque = torqueAtSpeed(outputRPM);
        const radS = rpmToRadS(outputRPM);
        return torque * radS;
    };

    // Max power point: at 50% free speed
    const maxPowerRPM = outputFreeSpeed / 2;
    const maxPower = powerAtSpeed(maxPowerRPM);
    const maxPowerTorque = torqueAtSpeed(maxPowerRPM);

    // Max acceleration from stall with given inertia
    const maxAccelRadS2 = totalInertia > 0 ? outputStallTorque / totalInertia : Infinity;
    const maxAccelRPMS = radSToRpm(maxAccelRadS2); // RPM/s

    // Time to reach percentage of free speed (simplified, constant torque approximation)
    // More accurate: t = -J * ω_free / τ_stall * ln(1 - ω/ω_free)
    const timeToSpeed = (fraction) => {
        if (totalInertia <= 0 || outputStallTorque <= 0) return 0;
        if (fraction >= 1) return Infinity;
        return -(totalInertia * outputFreeSpeedRadS / outputStallTorque) * Math.log(1 - fraction);
    };

    // Electrical power & thermal
    const stallPowerDraw = nominalVoltage * totalStallCurrent;
    const maxMechPower = maxPower;
    const efficiencyAtMaxPower = efficiency;

    return {
        outputStallTorque, outputFreeSpeed, outputFreeSpeedRadS,
        totalStallTorque, totalStallCurrent, totalFreeCurrent,
        freeSpeed, freeSpeedRadS,
        resistance, Kt, Ke,
        torqueAtSpeed, currentAtSpeed, powerAtSpeed,
        maxPower, maxPowerRPM, maxPowerTorque,
        maxAccelRadS2, maxAccelRPMS,
        timeToSpeed,
        totalInertia,
        stallPowerDraw, maxMechPower,
        ratio, efficiency, numMotors,
    };
}

// ─── Gear Diagram Canvas ─────────────────────────────────────────────────────
function GearDiagram({ ratio, numMotors, efficiency, motorName }) {
    const ref = useRef(null);

    useChart(ref, (ctx, W, H) => {
        const cx = W / 2;
        const cy = H / 2;

        // Draw housing
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 2;
        const hw = W * 0.85, hh = H * 0.7;
        const rx = (cx - hw / 2), ry = (cy - hh / 2);
        ctx.beginPath();
        ctx.roundRect(rx, ry, hw, hh, 12);
        ctx.stroke();

        // Housing label
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.font = `bold 10px ${MONO}`;
        ctx.textAlign = "left";
        ctx.fillText("GEARBOX", rx + 10, ry + 16);

        // Determine gear stages from ratio
        const stages = ratio <= 3 ? 1 : ratio <= 15 ? 2 : ratio <= 60 ? 3 : 4;
        const stageRatios = [];
        const perStage = Math.pow(ratio, 1 / stages);
        for (let i = 0; i < stages; i++) stageRatios.push(perStage);

        // Layout gears left to right
        const gearAreaL = rx + 40;
        const gearAreaR = rx + hw - 40;
        const gearSpacing = (gearAreaR - gearAreaL) / (stages + 0.5);

        // Draw input shaft (motor side)
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rx - 20, cy);
        ctx.lineTo(gearAreaL, cy);
        ctx.stroke();

        // Motor icon
        ctx.fillStyle = `${ACCENT}30`;
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(rx - 60, cy - 18, 42, 36, 6);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = ACCENT;
        ctx.font = `bold 9px ${MONO}`;
        ctx.textAlign = "center";
        ctx.fillText("M", rx - 39, cy + 1);
        ctx.fillText(`×${numMotors}`, rx - 39, cy + 13);

        // Draw gear pairs
        let cumulativeRatio = 1;
        for (let i = 0; i < stages; i++) {
            const x = gearAreaL + gearSpacing * (i + 0.5);
            const sr = stageRatios[i];
            cumulativeRatio *= sr;

            // Small driving gear
            const smallR = 14;
            const bigR = Math.min(smallR * Math.min(sr, 4), H * 0.28);

            // Small gear (top/input)
            const sy = cy - (bigR - smallR) * 0.3;
            ctx.strokeStyle = ACCENT3;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(x, sy - smallR * 0.2, smallR, 0, Math.PI * 2); ctx.stroke();

            // Gear teeth marks on small
            const teethSmall = Math.max(6, Math.round(smallR * 0.8));
            ctx.strokeStyle = `${ACCENT3}60`;
            for (let t = 0; t < teethSmall; t++) {
                const a = (t / teethSmall) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(a) * (smallR - 2), sy - smallR * 0.2 + Math.sin(a) * (smallR - 2));
                ctx.lineTo(x + Math.cos(a) * (smallR + 3), sy - smallR * 0.2 + Math.sin(a) * (smallR + 3));
                ctx.stroke();
            }

            // Big gear (bottom/output)
            const by = cy + (bigR - smallR) * 0.3;
            ctx.strokeStyle = ACCENT2;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(x, by + smallR * 0.2, bigR, 0, Math.PI * 2); ctx.stroke();

            // Gear teeth marks on big
            const teethBig = Math.max(8, Math.round(bigR * 0.6));
            ctx.strokeStyle = `${ACCENT2}40`;
            for (let t = 0; t < teethBig; t++) {
                const a = (t / teethBig) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(a) * (bigR - 2), by + smallR * 0.2 + Math.sin(a) * (bigR - 2));
                ctx.lineTo(x + Math.cos(a) * (bigR + 3), by + smallR * 0.2 + Math.sin(a) * (bigR + 3));
                ctx.stroke();
            }

            // Center dots
            ctx.fillStyle = ACCENT3;
            ctx.beginPath(); ctx.arc(x, sy - smallR * 0.2, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = ACCENT2;
            ctx.beginPath(); ctx.arc(x, by + smallR * 0.2, 2.5, 0, Math.PI * 2); ctx.fill();

            // Stage ratio label
            ctx.fillStyle = DIM;
            ctx.font = `10px ${MONO}`;
            ctx.textAlign = "center";
            ctx.fillText(`${fmt(sr, 1)}:1`, x, ry + hh - 8);

            // Connecting shaft between stages
            if (i < stages - 1) {
                const nextX = gearAreaL + gearSpacing * (i + 1.5);
                ctx.strokeStyle = "rgba(255,255,255,0.15)";
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 3]);
                ctx.beginPath();
                ctx.moveTo(x + bigR + 4, by + smallR * 0.2);
                ctx.lineTo(nextX - 16, cy - (bigR - smallR) * 0.3 - smallR * 0.2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Output shaft
        const lastGearX = gearAreaL + gearSpacing * (stages - 0.5);
        const lastBigR = Math.min(14 * Math.min(stageRatios[stages - 1], 4), H * 0.28);
        const lastBy = cy + (lastBigR - 14) * 0.3 + 14 * 0.2;
        ctx.strokeStyle = ACCENT2;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lastGearX + lastBigR + 4, lastBy);
        ctx.lineTo(rx + hw + 20, lastBy);
        ctx.stroke();

        // Output label
        ctx.fillStyle = ACCENT2;
        ctx.font = `bold 9px ${MONO}`;
        ctx.textAlign = "left";
        ctx.fillText("OUTPUT", rx + hw + 6, lastBy - 10);

        // Summary text top-right
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = `10px ${MONO}`;
        ctx.textAlign = "right";
        ctx.fillText(`${motorName} ×${numMotors}`, rx + hw - 10, ry + 16);
        ctx.fillText(`Total ratio: ${fmt(ratio, 2)}:1`, rx + hw - 10, ry + 30);
        ctx.fillText(`${stages} stage${stages > 1 ? "s" : ""} · η=${fmt(efficiency * 100, 0)}%`, rx + hw - 10, ry + 44);

        // Speed arrows
        ctx.fillStyle = `${ACCENT}80`;
        ctx.font = `9px ${MONO}`;
        ctx.textAlign = "center";
        ctx.fillText("⟶ FAST", (rx - 20 + gearAreaL) / 2, cy - 14);
        ctx.fillStyle = `${ACCENT2}80`;
        ctx.fillText("SLOW ⟶", (lastGearX + rx + hw + 20) / 2, lastBy - 14);

    }, [ratio, numMotors, efficiency, motorName]);

    return <canvas ref={ref} style={{ width: "100%", height: 260, borderRadius: 8 }} />;
}

// ─── Torque-Speed Chart ──────────────────────────────────────────────────────
function TorqueSpeedChart({ gb, operatingRPM }) {
    const ref = useRef(null);

    useChart(ref, (ctx, W, H) => {
        const pad = { t: 24, r: 60, b: 36, l: 60 };
        const pw = W - pad.l - pad.r;
        const ph = H - pad.t - pad.b;
        const xMax = gb.outputFreeSpeed * 1.05;
        const yMax = gb.outputStallTorque * 1.1;

        drawGrid(ctx, W, H, pad, xMax, yMax, "Output Speed (RPM)", "Torque (N·m)", 6, 5);

        // Torque-speed line
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
            const rpm = (i / 200) * gb.outputFreeSpeed;
            const torque = gb.torqueAtSpeed(rpm);
            const x = pad.l + (rpm / xMax) * pw;
            const y = pad.t + (1 - torque / yMax) * ph;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Power curve (secondary axis)
        const powerMax = gb.maxPower * 1.3;
        ctx.strokeStyle = ACCENT2;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
            const rpm = (i / 200) * gb.outputFreeSpeed;
            const power = gb.powerAtSpeed(rpm);
            const x = pad.l + (rpm / xMax) * pw;
            const y = pad.t + (1 - power / powerMax) * ph;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Power axis labels (right side)
        ctx.fillStyle = ACCENT2;
        ctx.font = `10px ${MONO}`;
        ctx.textAlign = "left";
        for (let i = 0; i <= 5; i++) {
            const y = pad.t + (ph * i) / 5;
            ctx.fillText(fmt(powerMax * (1 - i / 5)) + "W", W - pad.r + 8, y + 3);
        }

        // Max power point marker
        const mpX = pad.l + (gb.maxPowerRPM / xMax) * pw;
        const mpY = pad.t + (1 - gb.maxPower / powerMax) * ph;
        ctx.fillStyle = ACCENT2;
        ctx.beginPath(); ctx.arc(mpX, mpY, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `${ACCENT2}CC`;
        ctx.font = `9px ${MONO}`;
        ctx.textAlign = "center";
        ctx.fillText(`Peak: ${fmt(gb.maxPower)}W`, mpX, mpY - 10);

        // Operating point marker
        if (operatingRPM > 0 && operatingRPM < gb.outputFreeSpeed) {
            const opTorque = gb.torqueAtSpeed(operatingRPM);
            const opX = pad.l + (operatingRPM / xMax) * pw;
            const opY = pad.t + (1 - opTorque / yMax) * ph;

            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = `${ACCENT3}60`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(opX, pad.t); ctx.lineTo(opX, H - pad.b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pad.l, opY); ctx.lineTo(W - pad.r, opY); ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = ACCENT3;
            ctx.beginPath(); ctx.arc(opX, opY, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `${ACCENT3}DD`;
            ctx.font = `bold 10px ${MONO}`;
            ctx.textAlign = "left";
            ctx.fillText(`${fmt(opTorque)} N·m @ ${fmt(operatingRPM)} RPM`, opX + 10, opY - 6);
        }

        // Legend
        ctx.fillStyle = ACCENT;
        ctx.fillRect(pad.l + 8, pad.t + 8, 16, 3);
        ctx.fillStyle = TEXT;
        ctx.font = `10px ${MONO}`;
        ctx.textAlign = "left";
        ctx.fillText("Torque", pad.l + 30, pad.t + 13);

        ctx.strokeStyle = ACCENT2;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(pad.l + 8, pad.t + 24); ctx.lineTo(pad.l + 24, pad.t + 24); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = TEXT;
        ctx.fillText("Power", pad.l + 30, pad.t + 28);

    }, [gb, operatingRPM]);

    return <canvas ref={ref} style={{ width: "100%", height: 300, borderRadius: 8 }} />;
}

// ─── Current Draw Chart ──────────────────────────────────────────────────────
function CurrentChart({ gb, operatingRPM }) {
    const ref = useRef(null);

    useChart(ref, (ctx, W, H) => {
        const pad = { t: 24, r: 20, b: 36, l: 60 };
        const pw = W - pad.l - pad.r;
        const ph = H - pad.t - pad.b;
        const xMax = gb.outputFreeSpeed * 1.05;
        const yMax = gb.totalStallCurrent * 1.1;

        drawGrid(ctx, W, H, pad, xMax, yMax, "Output Speed (RPM)", "Current (A)", 6, 5);

        // Current-speed line
        ctx.strokeStyle = "#EF4444";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
            const rpm = (i / 200) * gb.outputFreeSpeed;
            const current = gb.currentAtSpeed(rpm);
            const x = pad.l + (rpm / xMax) * pw;
            const y = pad.t + (1 - current / yMax) * ph;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 40A breaker line
        const breakerAmps = 40;
        if (breakerAmps < yMax) {
            const bY = pad.t + (1 - breakerAmps / yMax) * ph;
            ctx.strokeStyle = "#FBBF24";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([8, 4]);
            ctx.beginPath(); ctx.moveTo(pad.l, bY); ctx.lineTo(W - pad.r, bY); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#FBBF24";
            ctx.font = `bold 9px ${MONO}`;
            ctx.textAlign = "right";
            ctx.fillText("40A BREAKER", W - pad.r - 4, bY - 6);
        }

        // Operating point
        if (operatingRPM > 0 && operatingRPM < gb.outputFreeSpeed) {
            const opCurrent = gb.currentAtSpeed(operatingRPM);
            const opX = pad.l + (operatingRPM / xMax) * pw;
            const opY = pad.t + (1 - opCurrent / yMax) * ph;

            ctx.fillStyle = ACCENT3;
            ctx.beginPath(); ctx.arc(opX, opY, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `${ACCENT3}DD`;
            ctx.font = `bold 10px ${MONO}`;
            ctx.textAlign = "left";
            ctx.fillText(`${fmt(opCurrent)} A`, opX + 10, opY - 6);
        }

    }, [gb, operatingRPM]);

    return <canvas ref={ref} style={{ width: "100%", height: 300, borderRadius: 8 }} />;
}

// ─── Acceleration Chart ──────────────────────────────────────────────────────
function AccelerationChart({ gb }) {
    const ref = useRef(null);

    useChart(ref, (ctx, W, H) => {
        if (gb.totalInertia <= 0) {
            ctx.fillStyle = DIM;
            ctx.font = `12px ${MONO}`;
            ctx.textAlign = "center";
            ctx.fillText("Set load inertia > 0 to see acceleration curve", W / 2, H / 2);
            return;
        }

        const pad = { t: 24, r: 20, b: 36, l: 60 };
        const pw = W - pad.l - pad.r;
        const ph = H - pad.t - pad.b;
        const xMax = gb.outputFreeSpeed * 1.05;
        const yMax = gb.maxAccelRadS2 * 1.1;

        drawGrid(ctx, W, H, pad, xMax, yMax, "Output Speed (RPM)", "Accel (rad/s²)", 6, 5);

        // Acceleration vs speed: α(ω) = (τ_stall_out * (1 - ω/ω_free)) / J
        ctx.strokeStyle = ACCENT3;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
            const rpm = (i / 200) * gb.outputFreeSpeed;
            const torque = gb.torqueAtSpeed(rpm);
            const accel = torque / gb.totalInertia;
            const x = pad.l + (rpm / xMax) * pw;
            const y = pad.t + (1 - accel / yMax) * ph;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Time annotations
        const fractions = [0.25, 0.5, 0.75, 0.9];
        fractions.forEach((f) => {
            const rpm = gb.outputFreeSpeed * f;
            const t = gb.timeToSpeed(f);
            const torque = gb.torqueAtSpeed(rpm);
            const accel = torque / gb.totalInertia;
            const x = pad.l + (rpm / xMax) * pw;
            const y = pad.t + (1 - accel / yMax) * ph;

            ctx.fillStyle = `${ACCENT3}40`;
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `${ACCENT3}AA`;
            ctx.font = `9px ${MONO}`;
            ctx.textAlign = "center";
            ctx.fillText(`${fmt(t, 2)}s → ${fmt(f * 100, 0)}%`, x, y + 14);
        });

    }, [gb]);

    return <canvas ref={ref} style={{ width: "100%", height: 300, borderRadius: 8 }} />;
}

// ─── Presets ─────────────────────────────────────────────────────────────────
const PRESETS = [
    { name: "Intake Roller", motor: "Kraken X60", numMotors: 1, ratio: 1.5, efficiency: 0.95, loadInertia: 0.001, operatingPct: 80 },
    { name: "Shooter Flywheel", motor: "Kraken X60 FOC", numMotors: 2, ratio: 1, efficiency: 0.97, loadInertia: 0.005, operatingPct: 90 },
    { name: "Arm Joint", motor: "Kraken X60 FOC", numMotors: 2, ratio: 50, efficiency: 0.85, loadInertia: 0.8, operatingPct: 30 },
    { name: "Elevator Winch", motor: "Kraken X60 FOC", numMotors: 2, ratio: 12, efficiency: 0.88, loadInertia: 0.05, operatingPct: 50 },
    { name: "Swerve Drive", motor: "Kraken X60", numMotors: 1, ratio: 6.12, efficiency: 0.90, loadInertia: 0.025, operatingPct: 70 },
    { name: "Swerve Steer", motor: "Kraken X60", numMotors: 1, ratio: 21.43, efficiency: 0.85, loadInertia: 0.004, operatingPct: 40 },
    { name: "Climber Winch", motor: "NEO", numMotors: 2, ratio: 25, efficiency: 0.82, loadInertia: 2.0, operatingPct: 20 },
    { name: "775 Shooter", motor: "775pro", numMotors: 2, ratio: 2, efficiency: 0.94, loadInertia: 0.003, operatingPct: 85 },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export default function GearboxApp() {
    const [motorName, setMotorName] = useState("Kraken X60 FOC");
    const [numMotors, setNumMotors] = useState(2);
    const [ratio, setRatio] = useState(12);
    const [efficiency, setEfficiency] = useState(0.90);
    const [loadInertia, setLoadInertia] = useState(0.05);
    const [operatingPct, setOperatingPct] = useState(50);
    const [chartTab, setChartTab] = useState("torque-speed");
    const [unitSystem, setUnitSystem] = useState("metric");

    const motor = MOTORS[motorName];
    const gb = useMemo(() => computeGearbox(motor, numMotors, ratio, efficiency, loadInertia), [motor, numMotors, ratio, efficiency, loadInertia]);
    const operatingRPM = (operatingPct / 100) * gb.outputFreeSpeed;
    const opTorque = gb.torqueAtSpeed(operatingRPM);
    const opCurrent = gb.currentAtSpeed(operatingRPM);
    const opPower = gb.powerAtSpeed(operatingRPM);

    const applyPreset = (p) => {
        setMotorName(p.motor);
        setNumMotors(p.numMotors);
        setRatio(p.ratio);
        setEfficiency(p.efficiency);
        setLoadInertia(p.loadInertia);
        setOperatingPct(p.operatingPct);
    };

    // Torque display units
    const torqueLabel = unitSystem === "metric" ? "N·m" : "oz·in";
    const torqueFactor = unitSystem === "metric" ? 1 : 141.612;
    const inertiaLabel = unitSystem === "metric" ? "kg·m²" : "oz·in·s²";
    const inertiaFactor = unitSystem === "metric" ? 1 : 141.612;

    return (
        <div style={S.root}>
            {/* Header */}
            <div style={S.header}>
                <span style={S.title}>⚙ Gearbox Calculator</span>
                <span style={S.subtitle}>FRC Mechanism Design</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    {["metric", "imperial"].map((u) => (
                        <button key={u} style={S.toggleBtn(unitSystem === u)} onClick={() => setUnitSystem(u)}>
                            {u === "metric" ? "SI" : "IMP"}
                        </button>
                    ))}
                </div>
            </div>

            <div style={S.body}>
                {/* Presets */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {PRESETS.map((p) => (
                        <button key={p.name} style={S.presetBtn} onClick={() => applyPreset(p)}
                                onMouseEnter={(e) => { e.target.style.borderColor = ACCENT; e.target.style.color = ACCENT; }}
                                onMouseLeave={(e) => { e.target.style.borderColor = BORDER; e.target.style.color = DIM; }}>
                            {p.name}
                        </button>
                    ))}
                </div>

                <div style={S.row}>
                    {/* Motor Selection */}
                    <div style={S.card}>
                        <div style={S.label}>Motor Selection</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Motor Type</div>
                                <select style={S.select} value={motorName} onChange={(e) => setMotorName(e.target.value)}>
                                    {Object.keys(MOTORS).map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Number of Motors</div>
                                <div style={S.toggleRow}>
                                    {[1, 2, 3, 4].map((n) => (
                                        <button key={n} style={S.toggleBtn(numMotors === n)} onClick={() => setNumMotors(n)}>{n}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <div style={S.cardSubtle}>
                                    <div style={{ fontFamily: MONO, fontSize: 9, color: DIM, textTransform: "uppercase" }}>Stall Torque (per)</div>
                                    <div style={{ fontFamily: MONO, fontSize: 16, color: "#fff", fontWeight: 600 }}>{fmt(motor.stallTorque * torqueFactor)}<span style={{ fontSize: 10, color: DIM }}> {torqueLabel}</span></div>
                                </div>
                                <div style={S.cardSubtle}>
                                    <div style={{ fontFamily: MONO, fontSize: 9, color: DIM, textTransform: "uppercase" }}>Free Speed</div>
                                    <div style={{ fontFamily: MONO, fontSize: 16, color: "#fff", fontWeight: 600 }}>{fmt(motor.freeSpeed, 0)}<span style={{ fontSize: 10, color: DIM }}> RPM</span></div>
                                </div>
                                <div style={S.cardSubtle}>
                                    <div style={{ fontFamily: MONO, fontSize: 9, color: DIM, textTransform: "uppercase" }}>Stall Current (per)</div>
                                    <div style={{ fontFamily: MONO, fontSize: 16, color: "#fff", fontWeight: 600 }}>{fmt(motor.stallCurrent, 0)}<span style={{ fontSize: 10, color: DIM }}> A</span></div>
                                </div>
                                <div style={S.cardSubtle}>
                                    <div style={{ fontFamily: MONO, fontSize: 9, color: DIM, textTransform: "uppercase" }}>Kt</div>
                                    <div style={{ fontFamily: MONO, fontSize: 16, color: "#fff", fontWeight: 600 }}>{fmt(gb.Kt, 4)}<span style={{ fontSize: 10, color: DIM }}> N·m/A</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gearbox Parameters */}
                    <div style={S.card}>
                        <div style={S.label}>Gearbox Parameters</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <NumInput label="Gear Ratio" value={ratio} onChange={setRatio} min={0.1} max={500} step={0.1} unit=":1" />
                            <div>
                                <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Efficiency: {fmt(efficiency * 100, 0)}%
                                </div>
                                <input type="range" min={50} max={100} step={1} value={efficiency * 100}
                                       onChange={(e) => setEfficiency(parseFloat(e.target.value) / 100)}
                                       style={S.slider} />
                                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9, color: DIM, marginTop: 2 }}>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                            <NumInput
                                label="Load Inertia at Output"
                                value={unitSystem === "metric" ? loadInertia : loadInertia * inertiaFactor}
                                onChange={(v) => setLoadInertia(unitSystem === "metric" ? v : v / inertiaFactor)}
                                min={0} max={100} step={0.001}
                                unit={inertiaLabel}
                            />
                            <div>
                                <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Operating Point: {fmt(operatingPct, 0)}% free speed ({fmt(operatingRPM, 0)} RPM)
                                </div>
                                <input type="range" min={0} max={99} step={1} value={operatingPct}
                                       onChange={(e) => setOperatingPct(parseFloat(e.target.value))}
                                       style={S.slider} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Output Summary Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                    {[
                        { label: "Output Stall Torque", value: fmt(gb.outputStallTorque * torqueFactor, 1), unit: torqueLabel, color: ACCENT },
                        { label: "Output Free Speed", value: fmt(gb.outputFreeSpeed, 0), unit: "RPM", color: ACCENT2 },
                        { label: "Peak Mech. Power", value: fmt(gb.maxPower, 0), unit: "W", color: ACCENT3 },
                        { label: "@ Operating Point", value: fmt(opTorque * torqueFactor, 2), unit: `${torqueLabel} @ ${fmt(operatingRPM, 0)} RPM`, color: "#22C55E" },
                        { label: "Current @ Operating", value: fmt(opCurrent, 1), unit: `A (${fmt(opCurrent / numMotors, 1)} per)`, color: opCurrent > 40 ? "#EF4444" : "#FBBF24" },
                        { label: "Power @ Operating", value: fmt(opPower, 0), unit: "W", color: "#818CF8" },
                    ].map((item, i) => (
                        <div key={i} style={{ ...S.cardSubtle, borderLeft: `3px solid ${item.color}` }}>
                            <div style={{ fontFamily: MONO, fontSize: 9, color: DIM, textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                            <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
                            <div style={{ fontFamily: MONO, fontSize: 10, color: DIM }}>{item.unit}</div>
                        </div>
                    ))}
                </div>

                {/* Dynamics summary */}
                {gb.totalInertia > 0 && (
                    <div style={{ ...S.card, borderLeft: `3px solid ${ACCENT3}` }}>
                        <div style={S.label}>Dynamics Summary</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, fontFamily: MONO, fontSize: 13 }}>
                            <div>
                                <span style={{ color: DIM }}>Max Accel (from stall): </span>
                                <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(gb.maxAccelRadS2)} rad/s²</span>
                                <span style={{ color: DIM }}> ({fmt(radSToRpm(gb.maxAccelRadS2))} RPM/s)</span>
                            </div>
                            <div>
                                <span style={{ color: DIM }}>Time to 25% speed: </span>
                                <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(gb.timeToSpeed(0.25), 3)} s</span>
                            </div>
                            <div>
                                <span style={{ color: DIM }}>Time to 50% speed: </span>
                                <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(gb.timeToSpeed(0.5), 3)} s</span>
                            </div>
                            <div>
                                <span style={{ color: DIM }}>Time to 75% speed: </span>
                                <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(gb.timeToSpeed(0.75), 3)} s</span>
                            </div>
                            <div>
                                <span style={{ color: DIM }}>Time to 90% speed: </span>
                                <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(gb.timeToSpeed(0.9), 3)} s</span>
                            </div>
                            <div>
                                <span style={{ color: DIM }}>Motor Kt: </span>
                                <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(gb.Kt, 4)} N·m/A</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts */}
                <div style={S.card}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                        {[
                            { id: "diagram", label: "Gear Diagram" },
                            { id: "torque-speed", label: "Torque · Power" },
                            { id: "current", label: "Current Draw" },
                            { id: "acceleration", label: "Acceleration" },
                        ].map((tab) => (
                            <button key={tab.id} style={S.tabBtn(chartTab === tab.id)} onClick={() => setChartTab(tab.id)}>{tab.label}</button>
                        ))}
                    </div>

                    {chartTab === "diagram" && <GearDiagram ratio={ratio} numMotors={numMotors} efficiency={efficiency} motorName={motorName} />}
                    {chartTab === "torque-speed" && <TorqueSpeedChart gb={gb} operatingRPM={operatingRPM} />}
                    {chartTab === "current" && <CurrentChart gb={gb} operatingRPM={operatingRPM} />}
                    {chartTab === "acceleration" && <AccelerationChart gb={gb} />}
                </div>

                {/* Comparison Table: Motor vs Output */}
                <div style={S.card}>
                    <div style={S.label}>Motor Side vs Output Side</div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: 12 }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                                    {["Parameter", "Motor Side", "Output Side", "Multiplier"].map((h) => (
                                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: DIM, fontWeight: 500, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { param: "Stall Torque", motor: `${fmt(gb.totalStallTorque * torqueFactor)} ${torqueLabel}`, output: `${fmt(gb.outputStallTorque * torqueFactor)} ${torqueLabel}`, mult: `×${fmt(ratio * efficiency)}` },
                                    { param: "Free Speed", motor: `${fmt(gb.freeSpeed, 0)} RPM`, output: `${fmt(gb.outputFreeSpeed, 1)} RPM`, mult: `÷${fmt(ratio)}` },
                                    { param: "Stall Current", motor: `${fmt(gb.totalStallCurrent, 0)} A`, output: `${fmt(gb.totalStallCurrent, 0)} A`, mult: "same" },
                                    { param: "Free Current", motor: `${fmt(gb.totalFreeCurrent, 1)} A`, output: `${fmt(gb.totalFreeCurrent, 1)} A`, mult: "same" },
                                    { param: `@ ${fmt(operatingPct, 0)}% Torque`, motor: `${fmt(opTorque / (ratio * efficiency) * torqueFactor)} ${torqueLabel}`, output: `${fmt(opTorque * torqueFactor)} ${torqueLabel}`, mult: `×${fmt(ratio * efficiency)}` },
                                    { param: `@ ${fmt(operatingPct, 0)}% Speed`, motor: `${fmt(operatingRPM * ratio, 0)} RPM`, output: `${fmt(operatingRPM, 0)} RPM`, mult: `÷${fmt(ratio)}` },
                                    { param: `@ ${fmt(operatingPct, 0)}% Current`, motor: `${fmt(opCurrent, 1)} A`, output: `—`, mult: "" },
                                ].map((row, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                                        <td style={{ padding: "8px 12px", color: DIM }}>{row.param}</td>
                                        <td style={{ padding: "8px 12px", color: ACCENT }}>{row.motor}</td>
                                        <td style={{ padding: "8px 12px", color: ACCENT2 }}>{row.output}</td>
                                        <td style={{ padding: "8px 12px", color: ACCENT3, fontSize: 11 }}>{row.mult}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Physics Reference */}
                <div style={{ ...S.cardSubtle, border: `1px solid ${BORDER}` }}>
                    <div style={S.label}>Gearbox Physics Reference</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, fontSize: 12, opacity: 0.6, fontFamily: MONO }}>
                        <div>τ_out = τ_motor · N · ratio · η</div>
                        <div>ω_out = ω_motor / ratio</div>
                        <div>P_out = τ_out · ω_out = P_motor · η</div>
                        <div>I(ω) = I_stall − (I_stall − I_free) · ω/ω_free</div>
                        <div>α_max = τ_stall_out / J_load</div>
                        <div>t(f) = −J·ω_free_out/τ_stall_out · ln(1−f)</div>
                        <div>P_max @ 50% free speed</div>
                        <div>Kt = τ_stall / I_stall</div>
                    </div>
                </div>
            </div>

            <footer style={{ padding: "16px 24px", textAlign: "center" }}>
                <span style={{ fontSize: 12, opacity: 0.2, fontFamily: MONO }}>Gearbox Calculator — FRC Mechanism Design</span>
            </footer>
        </div>
    );
}