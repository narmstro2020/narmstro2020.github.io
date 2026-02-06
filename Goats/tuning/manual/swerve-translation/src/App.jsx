import { useState, useMemo, useRef, useEffect } from "react";

// ─── Physics ─────────────────────────────────────────────────────────────────
const DT = 0.001;
const NOMINAL_V = 12;

function clampVoltage(v) { return Math.max(-NOMINAL_V, Math.min(NOMINAL_V, v)); }

function motorConstants(motor) {
    const freeSpeedRadS = (motor.freeSpeed * 2 * Math.PI) / 60;
    const Kt = motor.stallTorque / motor.stallCurrent;
    const R = NOMINAL_V / motor.stallCurrent;
    const Kv = freeSpeedRadS / (NOMINAL_V - motor.freeCurrent * R);
    return { Kt, R, Kv, freeSpeedRadS };
}

// ─── Trapezoid Profile ──────────────────────────────────────────────────────
function generateProfile(distanceM, maxVelMS, maxAccelMSS, durationS) {
    const steps = Math.ceil(durationS / DT);
    const sign = distanceM >= 0 ? 1 : -1;
    const dist = Math.abs(distanceM);

    const tAccel = Math.min(maxVelMS / maxAccelMSS, Math.sqrt(dist / maxAccelMSS));
    const velPeak = Math.min(maxVelMS, maxAccelMSS * tAccel);
    const distAccel = 0.5 * maxAccelMSS * tAccel * tAccel;
    const distCruise = Math.max(0, dist - 2 * distAccel);
    const tCruise = velPeak > 0 ? distCruise / velPeak : 0;
    const tDecel = tAccel;
    const tTotal = tAccel + tCruise + tDecel;

    const profile = [];
    for (let i = 0; i <= steps; i++) {
        const t = i * DT;
        let pos, vel, accel;
        if (t <= tAccel) {
            accel = maxAccelMSS; vel = maxAccelMSS * t; pos = 0.5 * maxAccelMSS * t * t;
        } else if (t <= tAccel + tCruise) {
            const dt2 = t - tAccel;
            accel = 0; vel = velPeak; pos = distAccel + velPeak * dt2;
        } else if (t <= tTotal) {
            const dt3 = t - tAccel - tCruise;
            accel = -maxAccelMSS; vel = velPeak - maxAccelMSS * dt3; pos = distAccel + distCruise + velPeak * dt3 - 0.5 * maxAccelMSS * dt3 * dt3;
        } else {
            accel = 0; vel = 0; pos = dist;
        }
        profile.push({ t, position: sign * pos, velocity: sign * vel, acceleration: sign * accel });
    }
    return profile;
}

// ─── Simulator ──────────────────────────────────────────────────────────────
// Outer loop: linear position (m) → velocity command (m/s)
// Plant: how v_actual responds to v_cmd
//   Perfect: v = v_cmd instantly
//   First-order: dv/dt = (v_cmd - v) / τ
//   Full swerve: motor physics → force → acceleration → velocity → position

function simulateLinearPosition({
                                    startM, setpointM, durationS,
                                    kp, ki, kd, maxAbsVelocity, deadband,
                                    targetRateFeedforward,
                                    profileMode, maxVelMS, maxAccelMSS,
                                    plantModel, plantTau,
                                    // Full swerve plant
                                    motor, motorsPerModule, numModules, driveGearing, wheelRadius, robotMass,
                                    innerKp, innerKv, innerKs,
                                    plantKs, viscousFriction,
                                }) {
    const steps = Math.ceil(durationS / DT);
    const record = Math.max(1, Math.floor(steps / 2000));
    const history = [];
    const distance = setpointM - startM;

    let profile = null;
    if (profileMode === "trapezoid" && maxVelMS > 0 && maxAccelMSS > 0) {
        profile = generateProfile(distance, maxVelMS, maxAccelMSS, durationS);
    }

    let pos = startM;
    let vel = 0;
    let integralSum = 0;

    // Full swerve plant setup
    let mc;
    if (plantModel === "swerve" && motor) {
        mc = motorConstants(motor);
    }
    const totalMotors = (motorsPerModule || 1) * (numModules || 4);

    for (let i = 0; i <= steps; i++) {
        const t = i * DT;

        // Current setpoint
        let currentSetpointM, profileVel;
        if (profile && i < profile.length) {
            currentSetpointM = startM + profile[i].position;
            profileVel = profile[i].velocity;
        } else if (profile) {
            currentSetpointM = setpointM;
            profileVel = 0;
        } else {
            currentSetpointM = setpointM;
            profileVel = 0;
        }

        // TargetRateFeedforward: profile velocity when profiling, user constant when not
        const rateFF = (profile ? profileVel : (targetRateFeedforward || 0));

        // Position error
        const error = currentSetpointM - pos;

        // Integral
        integralSum += error * DT;

        // PID: position (m) → velocity (m/s)
        const pTerm = kp * error;
        const iTerm = ki * integralSum;
        const dTerm = kd * (-vel); // derivative on measurement

        let velCmd = pTerm + iTerm + dTerm + rateFF;
        let velCmdRaw = velCmd; // pre-clamp for display

        // MaxAbsVelocity clamp (0 = no cap)
        if (maxAbsVelocity > 0) {
            velCmd = Math.max(-maxAbsVelocity, Math.min(maxAbsVelocity, velCmd));
        }

        // Deadband
        if (Math.abs(velCmd) < deadband) {
            velCmd = 0;
        }

        // Track saturation
        const saturated = Math.abs(velCmdRaw) > Math.abs(velCmd) + 0.001;

        // Plant
        let appliedVoltage = 0;
        if (plantModel === "perfect") {
            vel = velCmd;
        } else if (plantModel === "firstorder") {
            const tau = Math.max(plantTau, DT);
            vel += ((velCmd - vel) / tau) * DT;
        } else if (plantModel === "swerve" && mc) {
            // Inner velocity loop: voltage to drive motors
            const wheelOmegaCmd = velCmd / wheelRadius;
            const wheelOmega = vel / wheelRadius;
            const motorOmegaCmd = wheelOmegaCmd * driveGearing;
            const motorOmega = wheelOmega * driveGearing;

            const innerError = motorOmegaCmd - motorOmega;
            const vKs = (innerKs || 0) * (innerError === 0 ? 0 : Math.sign(innerError));
            const vKv = (innerKv || 0) * motorOmegaCmd;
            const vP = (innerKp || 0) * innerError;
            appliedVoltage = clampVoltage(vKs + vKv + vP);

            // Motor physics (all drive motors in parallel pushing linearly)
            const backEmf = motorOmega / mc.Kv;
            const currentPerMotor = (appliedVoltage - backEmf) / mc.R;
            const forcePerMotor = mc.Kt * currentPerMotor * driveGearing / wheelRadius;
            const totalForce = forcePerMotor * totalMotors;

            // Friction
            let frictionForce = 0;
            if (Math.abs(vel) > 0.001) {
                frictionForce = (plantKs || 0) * Math.sign(vel) + (viscousFriction || 0) * vel;
            }

            const accel = robotMass > 0 ? (totalForce - frictionForce) / robotMass : 0;
            vel += accel * DT;
        }

        pos += vel * DT;

        if (i % record === 0) {
            history.push({
                t, pos, vel, velCmd, velCmdRaw, error, saturated,
                setpointM: currentSetpointM,
                profilePosM: profile && i < profile.length ? startM + profile[i].position : setpointM,
                profileVelMS: profileVel,
                rateFF, voltage: appliedVoltage,
            });
        }
    }

    // Metrics
    const finalPos = history[history.length - 1].pos;
    const ssError = Math.abs(setpointM - finalPos);
    let riseTime = null, settleTime = null, overshoot = 0;
    let peakDisplacement = 0;

    for (const pt of history) {
        const disp = pt.pos - startM;
        if (Math.abs(disp) > Math.abs(peakDisplacement)) peakDisplacement = disp;
        if (riseTime === null && distance !== 0) {
            if (Math.sign(distance) * disp >= Math.abs(distance) * 0.9) riseTime = pt.t;
        }
    }

    if (distance !== 0) {
        const ovAmt = Math.sign(distance) * peakDisplacement - Math.abs(distance);
        overshoot = ovAmt > 0 ? (ovAmt / Math.abs(distance)) * 100 : 0;
    }

    for (let i = history.length - 1; i >= 0; i--) {
        const err = Math.abs(history[i].setpointM - history[i].pos);
        if (err / Math.max(Math.abs(distance), 0.01) > 0.02) {
            settleTime = history[Math.min(i + 1, history.length - 1)].t;
            break;
        }
    }

    // Saturation percentage
    const satCount = history.filter(pt => pt.saturated).length;
    const satPct = history.length > 0 ? (satCount / history.length) * 100 : 0;

    return { history, ssError, riseTime, settleTime, overshoot, satPct };
}

// ─── Motor DB ───────────────────────────────────────────────────────────────
const DC_MOTORS = [
    { id: "krakenX60FOC", label: "Kraken X60 FOC", stallTorque: 9.37, stallCurrent: 483, freeSpeed: 5800, freeCurrent: 2 },
    { id: "krakenX60", label: "Kraken X60", stallTorque: 7.09, stallCurrent: 366, freeSpeed: 6000, freeCurrent: 2 },
    { id: "falcon500FOC", label: "Falcon 500 FOC", stallTorque: 5.84, stallCurrent: 304, freeSpeed: 6080, freeCurrent: 1.5 },
    { id: "falcon500", label: "Falcon 500", stallTorque: 4.69, stallCurrent: 257, freeSpeed: 6380, freeCurrent: 1.5 },
    { id: "neo", label: "NEO", stallTorque: 2.6, stallCurrent: 105, freeSpeed: 5676, freeCurrent: 1.8 },
    { id: "neoVortex", label: "NEO Vortex", stallTorque: 3.6, stallCurrent: 211, freeSpeed: 6784, freeCurrent: 3.6 },
];

const DRIVE_GEARINGS = [
    { label: "SDS L1 (8.14)", value: 8.14 }, { label: "SDS L2 (6.75)", value: 6.75 },
    { label: "SDS L3 (6.12)", value: 6.12 }, { label: "SDS L4 (5.36)", value: 5.36 },
    { label: "WCP X1 (7.36)", value: 7.36 }, { label: "WCP X2 (6.55)", value: 6.55 },
    { label: "WCP X3 (5.96)", value: 5.96 },
];

// ─── Styles ─────────────────────────────────────────────────────────────────
const MONO = "'IBM Plex Mono', monospace";
const SANS = "'DM Sans', sans-serif";
function fmt(v, d = 4) { if (v === undefined || v === null || isNaN(v)) return "—"; if (Math.abs(v) < 0.0001 && v !== 0) return v.toExponential(d); return parseFloat(v.toFixed(d)).toString(); }

const S = {
    card: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 16 },
    label: { fontFamily: SANS, fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 },
    fieldLabel: { fontSize: 10, letterSpacing: "0.08em", opacity: 0.6, fontFamily: MONO, textTransform: "uppercase" },
    input: { background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "4px 8px", fontSize: 13, color: "#e2e8f0", fontFamily: MONO, outline: "none", width: 96 },
    inputSmall: { background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "2px 8px", fontSize: 13, color: "#e2e8f0", fontFamily: MONO, outline: "none", width: 56, textAlign: "center" },
    unit: { fontSize: 11, opacity: 0.4, fontFamily: MONO, marginLeft: 4 },
    select: { background: "transparent", color: "#e2e8f0", fontFamily: MONO, fontSize: 13, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "4px 8px", outline: "none", cursor: "pointer" },
    btn: (a) => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.04)", color: a ? "#38bdf8" : "rgba(255,255,255,0.5)", border: a ? "1px solid rgba(56,189,248,0.4)" : "1px solid rgba(255,255,255,0.06)", transition: "all 0.15s ease" }),
    btnC: (a, c) => ({ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: MONO, cursor: "pointer", background: a ? `${c}22` : "rgba(255,255,255,0.04)", color: a ? c : "rgba(255,255,255,0.5)", border: a ? `1px solid ${c}55` : "1px solid rgba(255,255,255,0.06)", transition: "all 0.15s ease" }),
};

function NumInput({ label, value, onChange, unit, inputStyle, step, min }) {
    return (<div style={{ display: "flex", flexDirection: label ? "column" : "row", gap: 4, alignItems: label ? "flex-start" : "center" }}>
        {label && <label style={S.fieldLabel}>{label}</label>}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input type="number" value={value} step={step} min={min} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }} style={{ ...S.input, ...inputStyle }} />
            {unit && <span style={S.unit}>{unit}</span>}
        </div>
    </div>);
}

function GainInput({ label, value, onChange, step = 0.1, color = "#38bdf8" }) {
    return (<div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <label style={{ ...S.fieldLabel, color, opacity: 0.8 }}>{label}</label>
        <input type="number" value={value} step={step} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }} style={{ ...S.input, width: 110, borderColor: `${color}33`, color }} />
    </div>);
}

// ─── Canvas ─────────────────────────────────────────────────────────────────
function useChart(containerRef, canvasRef, h, draw, deps) {
    useEffect(() => {
        const el = containerRef.current; if (!el) return;
        const ro = new ResizeObserver(() => {
            const c = canvasRef.current; if (!c) return;
            const w = el.clientWidth, dpr = window.devicePixelRatio || 1;
            c.width = w * dpr; c.height = h * dpr; c.style.width = w + "px"; c.style.height = h + "px";
            const ctx = c.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(ctx, w, h);
        }); ro.observe(el); return () => ro.disconnect();
    }, deps);
}

function drawGrid(ctx, p, pw, ph) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) { const x = p.l + (i / 5) * pw; ctx.beginPath(); ctx.moveTo(x, p.t); ctx.lineTo(x, p.t + ph); ctx.stroke(); }
    for (let i = 0; i <= 5; i++) { const y = p.t + (i / 5) * ph; ctx.beginPath(); ctx.moveTo(p.l, y); ctx.lineTo(p.l + pw, y); ctx.stroke(); }
}

// ─── Position Chart ─────────────────────────────────────────────────────────
function PositionChart({ history, startM, setpointM, profileMode }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 280, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;
        const maxT = history[history.length - 1].t;

        // Y range based on actual data only — setpoint drawn wherever it falls
        let yMin = Infinity, yMax = -Infinity;
        for (const pt of history) {
            if (pt.pos < yMin) yMin = pt.pos; if (pt.pos > yMax) yMax = pt.pos;
        }
        // Include profile/setpoint in range only if actual position moved meaningfully
        const actualRange = yMax - yMin;
        const moved = actualRange > 0.001;
        if (moved) {
            // Actual data moved — include setpoint so we see the full picture
            if (setpointM < yMin) yMin = setpointM;
            if (setpointM > yMax) yMax = setpointM;
            if (startM < yMin) yMin = startM;
            if (startM > yMax) yMax = startM;
        }
        const yPad = Math.max((yMax - yMin) * 0.15, 0.1);
        yMin -= yPad; yMax += yPad;
        const yRange = yMax - yMin;

        drawGrid(ctx, pad, pw, ph);

        // Start line
        if (moved) {
            const startY = pad.t + ph * (1 - (startM - yMin) / yRange);
            ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
            ctx.beginPath(); ctx.moveTo(pad.l, startY); ctx.lineTo(pad.l + pw, startY); ctx.stroke(); ctx.setLineDash([]);
        }

        // Setpoint line (only if actual position moved and setpoint is in view)
        if (moved && setpointM >= yMin && setpointM <= yMax) {
            const spY = pad.t + ph * (1 - (setpointM - yMin) / yRange);
            ctx.strokeStyle = "rgba(56,189,248,0.4)"; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
            ctx.beginPath(); ctx.moveTo(pad.l, spY); ctx.lineTo(pad.l + pw, spY); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = "rgba(56,189,248,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "right";
            ctx.fillText(`Setpoint: ${fmt(setpointM, 3)} m`, pad.l + pw - 4, spY - 6);
        }

        // 2% band
        if (moved) {
            const range = Math.abs(setpointM - startM);
            if (range > 0.001) {
                const band = range * 0.02;
                const bhY = pad.t + ph * (1 - (setpointM + band - yMin) / yRange);
                const blY = pad.t + ph * (1 - (setpointM - band - yMin) / yRange);
                ctx.fillStyle = "rgba(56,189,248,0.04)"; ctx.fillRect(pad.l, bhY, pw, blY - bhY);
            }
        }

        // Profile overlay (only when actual position moved — don't show unfollowed trajectory)
        if (profileMode !== "none" && moved) {
            ctx.strokeStyle = "rgba(16,185,129,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath();
            history.forEach((pt, i) => {
                const x = pad.l + (pt.t / maxT) * pw;
                const y = pad.t + ph * (1 - (pt.profilePosM - yMin) / yRange);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }); ctx.stroke(); ctx.setLineDash([]);
        }

        // Actual position
        ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.5; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.pos - yMin) / yRange);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        // No movement indicator
        if (!moved) {
            ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.font = `12px ${SANS}`;
            ctx.textAlign = "center"; ctx.fillText("No movement — all gains and feedforward are zero", pad.l + pw / 2, pad.t + ph / 2 - 20);
            ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.font = `10px ${MONO}`;
            ctx.fillText(`Position: ${fmt(startM, 3)} m  |  Setpoint: ${fmt(setpointM, 3)} m`, pad.l + pw / 2, pad.t + ph / 2);
        }

        // Labels
        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("POSITION", pad.l, pad.t - 10);
        ctx.fillStyle = "#38bdf8"; ctx.font = `9px ${MONO}`; ctx.fillText("— actual", pad.l + 80, pad.t - 10);
        ctx.fillStyle = "rgba(56,189,248,0.5)"; ctx.fillText("--- setpoint", pad.l + 140, pad.t - 10);
        if (profileMode !== "none") { ctx.fillStyle = "rgba(16,185,129,0.5)"; ctx.fillText("--- profile", pad.l + 210, pad.t - 10); }

        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(yMax - (i / 5) * yRange, 3) + "m", pad.l - 8, pad.t + (i / 5) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Position (m)", 0, 0); ctx.restore();
    }, [history, startM, setpointM, profileMode]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Velocity Chart ─────────────────────────────────────────────────────────
function VelocityChart({ history, maxAbsVelocity, profileMode }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 220, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;
        const maxT = history[history.length - 1].t;

        // Y range: data-driven, with optional clamp lines shown
        let yMax = 0.1;
        for (const pt of history) {
            if (Math.abs(pt.vel) > yMax) yMax = Math.abs(pt.vel) * 1.15;
            if (Math.abs(pt.velCmd) > yMax) yMax = Math.abs(pt.velCmd) * 1.15;
        }
        // Include MaxAbsVelocity line if close to data range
        if (maxAbsVelocity > 0 && maxAbsVelocity < yMax * 2) {
            yMax = Math.max(yMax, maxAbsVelocity * 1.1);
        } else if (maxAbsVelocity > 0 && yMax < 0.2) {
            // Nothing is moving — just show a small window around zero
            yMax = Math.max(yMax, 0.5);
        }
        let yMin = -yMax;

        drawGrid(ctx, pad, pw, ph);

        // Zero line
        const zy = pad.t + ph * 0.5;
        ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();

        // Clamp lines
        if (maxAbsVelocity > 0) {
            const clampHi = pad.t + ph * (1 - (maxAbsVelocity - yMin) / (yMax - yMin));
            const clampLo = pad.t + ph * (1 - (-maxAbsVelocity - yMin) / (yMax - yMin));
            ctx.strokeStyle = "rgba(244,63,94,0.2)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.moveTo(pad.l, clampHi); ctx.lineTo(pad.l + pw, clampHi); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pad.l, clampLo); ctx.lineTo(pad.l + pw, clampLo); ctx.stroke(); ctx.setLineDash([]);
        }

        // Profile velocity
        if (profileMode !== "none") {
            ctx.strokeStyle = "rgba(16,185,129,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath();
            history.forEach((pt, i) => {
                const x = pad.l + (pt.t / maxT) * pw;
                const y = pad.t + ph * (1 - (pt.profileVelMS - yMin) / (yMax - yMin));
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }); ctx.stroke(); ctx.setLineDash([]);
        }

        // Raw (pre-clamp) command — show if different from clamped
        let hasClipping = false;
        for (const pt of history) { if (Math.abs(pt.velCmdRaw - pt.velCmd) > 0.01) { hasClipping = true; break; } }
        if (hasClipping) {
            ctx.strokeStyle = "rgba(163,130,250,0.2)"; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath();
            history.forEach((pt, i) => {
                const raw = Math.max(yMin, Math.min(yMax, pt.velCmdRaw)); // clip to chart range
                const x = pad.l + (pt.t / maxT) * pw;
                const y = pad.t + ph * (1 - (raw - yMin) / (yMax - yMin));
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }); ctx.stroke(); ctx.setLineDash([]);
        }

        // Commanded v (post-clamp)
        ctx.strokeStyle = "rgba(163,130,250,0.5)"; ctx.lineWidth = 1.5; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.velCmd - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        // Actual v
        ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.vel - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("VELOCITY", pad.l, pad.t - 10);
        ctx.fillStyle = "#f59e0b"; ctx.font = `9px ${MONO}`; ctx.fillText("— actual", pad.l + 80, pad.t - 10);
        ctx.fillStyle = "rgba(163,130,250,0.6)"; ctx.fillText("— cmd", pad.l + 135, pad.t - 10);
        if (hasClipping) { ctx.fillStyle = "rgba(163,130,250,0.3)"; ctx.fillText("--- raw", pad.l + 180, pad.t - 10); }

        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(yMax - (i / 5) * (yMax - yMin), 2) + " m/s", pad.l - 8, pad.t + (i / 5) * ph + 3);
    }, [history, maxAbsVelocity, profileMode]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Error Chart ────────────────────────────────────────────────────────────
function ErrorChart({ history }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 200, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;
        const maxT = history[history.length - 1].t;
        let eMax = 0.01;
        for (const pt of history) { if (Math.abs(pt.error) > eMax) eMax = Math.abs(pt.error); }
        eMax *= 1.1;

        drawGrid(ctx, pad, pw, ph);
        const zy = pad.t + ph * 0.5;
        ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();

        ctx.strokeStyle = "#fb7185"; ctx.lineWidth = 2; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.error + eMax) / (2 * eMax));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("POSITION ERROR", pad.l, pad.t - 10);
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(eMax - (i / 5) * 2 * eMax, 3) + "m", pad.l - 8, pad.t + (i / 5) * ph + 3);
    }, [history]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Field Viz (1D top-down) ────────────────────────────────────────────────
function FieldViz({ posM, setpointM, startM }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        const c = canvasRef.current; if (!c) return;
        const w = 400, h = 80, dpr = window.devicePixelRatio || 1;
        c.width = w * dpr; c.height = h * dpr; c.style.width = w + "px"; c.style.height = h + "px";
        const ctx = c.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const allPts = [startM, setpointM, posM];
        let lo = Math.min(...allPts), hi = Math.max(...allPts);
        const pad = Math.max((hi - lo) * 0.3, 0.5);
        lo -= pad; hi += pad;
        const range = hi - lo;

        const xOf = (m) => 30 + ((m - lo) / range) * (w - 60);
        const cy = h / 2;

        // Track line
        ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(30, cy); ctx.lineTo(w - 30, cy); ctx.stroke();

        // Tick marks every 0.5m
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = `8px ${MONO}`; ctx.textAlign = "center";
        const step = range > 5 ? 1 : range > 2 ? 0.5 : 0.1;
        for (let m = Math.ceil(lo / step) * step; m <= hi; m += step) {
            const x = xOf(m);
            ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, cy - 6); ctx.lineTo(x, cy + 6); ctx.stroke();
            ctx.fillText(fmt(m, 1), x, cy + 18);
        }

        // Start marker
        const sx = xOf(startM);
        ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx, cy - 14); ctx.lineTo(sx, cy + 14); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = `8px ${MONO}`;
        ctx.fillText("start", sx, cy - 18);

        // Setpoint marker
        const spx = xOf(setpointM);
        ctx.strokeStyle = "rgba(56,189,248,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(spx, cy - 14); ctx.lineTo(spx, cy + 14); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(56,189,248,0.5)"; ctx.fillText("target", spx, cy - 18);

        // Robot
        const rx = xOf(posM);
        ctx.fillStyle = "#38bdf8"; ctx.beginPath(); ctx.arc(rx, cy, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(56,189,248,0.3)"; ctx.beginPath(); ctx.arc(rx, cy, 10, 0, Math.PI * 2); ctx.fill();

    }, [posM, setpointM, startM]);
    return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

// ─── Metric Card ────────────────────────────────────────────────────────────
function MetricCard({ label, value, unit, color = "#e2e8f0", warn }) {
    return (<div style={{ padding: "10px 14px", background: warn ? "rgba(244,63,94,0.06)" : "rgba(255,255,255,0.02)", borderRadius: 6, border: `1px solid ${warn ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.05)"}` }}>
        <div style={{ fontSize: 9, fontFamily: MONO, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: MONO, color }}>{value}</span>
            <span style={{ fontSize: 10, fontFamily: MONO, opacity: 0.4 }}>{unit}</span>
        </div>
    </div>);
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function LinearPositionApp() {
    // Setpoint
    const [startM, setStartM] = useState(0);
    const [setpointM, setSetpointM] = useState(2);
    const [duration, setDuration] = useState(3);

    // Controller gains
    const [kp, setKp] = useState(3);
    const [ki, setKi] = useState(0);
    const [kd, setKd] = useState(0);
    const [maxAbsVelocity, setMaxAbsVelocity] = useState(4.5); // m/s
    const [deadband, setDeadband] = useState(0);
    const [targetRateFF, setTargetRateFF] = useState(0);

    // Profile
    const [profileMode, setProfileMode] = useState("none");
    const [maxVelMS, setMaxVelMS] = useState(4.5);
    const [maxAccelMSS, setMaxAccelMSS] = useState(6);

    // Plant model
    const [plantModel, setPlantModel] = useState("perfect");
    const [plantTau, setPlantTau] = useState(0.04);

    // Swerve plant config
    const [motorId, setMotorId] = useState("krakenX60FOC");
    const [motorsPerModule, setMotorsPerModule] = useState(1);
    const [numModules] = useState(4);
    const [driveGearing, setDriveGearing] = useState(6.75);
    const [wheelRadius, setWheelRadius] = useState(0.0508);
    const [robotMass, setRobotMass] = useState(54);
    const [innerKp, setInnerKp] = useState(0.05);
    const [innerKv, setInnerKv] = useState(0);
    const [innerKs, setInnerKs] = useState(0);
    const [swervePlantKs, setSwervePlantKs] = useState(0);
    const [swerveViscous, setSwerveViscous] = useState(0);

    const [activeTab, setActiveTab] = useState("position");

    const motor = DC_MOTORS.find(m => m.id === motorId);
    const mc = useMemo(() => motorConstants(motor), [motor]);

    // Theoretical max free speed
    const freeSpeedMS = mc.freeSpeedRadS / driveGearing * wheelRadius;
    // Theoretical kV for inner loop
    const theoreticalKv = driveGearing / (wheelRadius * mc.Kv);

    const simResult = useMemo(() => simulateLinearPosition({
        startM, setpointM, durationS: duration,
        kp, ki, kd, maxAbsVelocity, deadband,
        targetRateFeedforward: targetRateFF,
        profileMode, maxVelMS, maxAccelMSS,
        plantModel, plantTau,
        motor, motorsPerModule, numModules, driveGearing, wheelRadius, robotMass,
        innerKp, innerKv, innerKs,
        plantKs: swervePlantKs, viscousFriction: swerveViscous,
    }), [startM, setpointM, duration, kp, ki, kd, maxAbsVelocity, deadband, targetRateFF, profileMode, maxVelMS, maxAccelMSS, plantModel, plantTau, motor, motorsPerModule, numModules, driveGearing, wheelRadius, robotMass, innerKp, innerKv, innerKs, swervePlantKs, swerveViscous]);

    const finalPos = simResult.history.length > 0 ? simResult.history[simResult.history.length - 1].pos : startM;

    const TABS = [
        { id: "position", label: "Position" },
        { id: "velocity", label: "Velocity" },
        { id: "error", label: "Error" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#0f1117", color: "#e2e8f0", fontFamily: SANS }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: "#38bdf8", margin: 0 }}>Linear Position</h1>
                        <span style={{ fontSize: 12, opacity: 0.3, fontFamily: MONO }}>Swerve Translation PID</span>
                    </div>
                    <p style={{ fontSize: 12, opacity: 0.3, marginTop: 4 }}>Odometry position → PID → velocity command — for X/Y trajectory following and translational alignment</p>
                </div>

                {/* Setpoint */}
                <div style={{ ...S.card, marginBottom: 20 }}>
                    <div style={S.label}>Setpoint</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 12 }}>
                        <NumInput label="Start Position" value={startM} onChange={setStartM} unit="m" step={0.1} inputStyle={{ width: 70 }} />
                        <NumInput label="Target Position" value={setpointM} onChange={setSetpointM} unit="m" step={0.1} inputStyle={{ width: 70 }} />
                        <NumInput label="Duration" value={duration} onChange={v => setDuration(Math.max(0.5, Math.min(20, v)))} unit="s" step={0.5} inputStyle={{ width: 56 }} />
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontFamily: MONO, opacity: 0.3, paddingTop: 4 }}>Quick moves:</span>
                        {[
                            { l: "1m", s: 0, t: 1 }, { l: "2m", s: 0, t: 2 }, { l: "4m", s: 0, t: 4 },
                            { l: "Half field", s: 0, t: 8.2 }, { l: "Short align", s: 0, t: 0.3 },
                            { l: "Backup 1m", s: 2, t: 1 },
                        ].map(q => (
                            <button key={q.l} onClick={() => { setStartM(q.s); setSetpointM(q.t); }} style={S.btn(startM === q.s && setpointM === q.t)}>{q.l}</button>
                        ))}
                    </div>
                </div>

                {/* Motion Profile */}
                <div style={{ ...S.card, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ ...S.label, marginBottom: 0 }}>Motion Profile</div>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[{ id: "none", label: "None (step)" }, { id: "trapezoid", label: "Trapezoid" }].map(m => (
                                <button key={m.id} onClick={() => setProfileMode(m.id)} style={S.btnC(profileMode === m.id, "#10b981")}>{m.label}</button>
                            ))}
                        </div>
                    </div>
                    {profileMode === "trapezoid" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
                            <NumInput label="Max Velocity" value={maxVelMS} onChange={v => setMaxVelMS(Math.max(0.01, v))} unit="m/s" step={0.1} inputStyle={{ width: 70 }} />
                            <NumInput label="Max Acceleration" value={maxAccelMSS} onChange={v => setMaxAccelMSS(Math.max(0.01, v))} unit="m/s²" step={0.5} inputStyle={{ width: 70 }} />
                        </div>
                    )}
                    {profileMode === "none" && (
                        <div style={{ fontSize: 10, fontFamily: MONO, opacity: 0.3 }}>Step input — setpoint changes instantly. TargetRateFeedforward = user-set constant. Good for testing raw PID.</div>
                    )}
                </div>

                {/* Controller Gains */}
                <div style={{ ...S.card, marginBottom: 20 }}>
                    <div style={S.label}>Translation Controller Gains (PID output: m/s)</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 12 }}>
                        <GainInput label="kP ((m/s) / m)" value={kp} onChange={setKp} step={0.1} color="#38bdf8" />
                        <GainInput label="kI ((m/s) / (m·s))" value={ki} onChange={setKi} step={0.01} color="#10b981" />
                        <GainInput label="kD ((m/s) / (m/s))" value={kd} onChange={setKd} step={0.01} color="#fb7185" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
                        <NumInput label="MaxAbsVelocity (0=no cap)" value={maxAbsVelocity} onChange={v => setMaxAbsVelocity(Math.max(0, v))} unit="m/s" step={0.1} inputStyle={{ width: 60 }} />
                        <NumInput label="Deadband" value={deadband} onChange={v => setDeadband(Math.max(0, v))} unit="m/s" step={0.01} inputStyle={{ width: 60 }} />
                        {profileMode === "none" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <label style={{ ...S.fieldLabel, color: "#f59e0b", opacity: 0.8 }}>TargetRateFeedforward</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="number" value={targetRateFF} step={0.1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setTargetRateFF(v); }} style={{ ...S.input, width: 80, borderColor: "rgba(245,158,11,0.3)", color: "#f59e0b" }} />
                                    <span style={{ ...S.unit, color: "#f59e0b" }}>m/s</span>
                                </div>
                                <div style={{ fontSize: 9, fontFamily: MONO, opacity: 0.3, marginTop: 2 }}>
                                    Constant velocity added to PID output each cycle
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3, justifyContent: "center" }}>
                                <label style={{ ...S.fieldLabel, color: "#f59e0b", opacity: 0.8 }}>TargetRateFeedforward</label>
                                <div style={{ fontSize: 10, fontFamily: MONO, color: "#f59e0b", opacity: 0.5 }}>Auto-fed by profile velocity</div>
                            </div>
                        )}
                    </div>
                    <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 13, fontFamily: MONO, color: "#e2e8f0", lineHeight: 1.8 }}>
                            <span style={{ opacity: 0.5 }}>v_cmd = </span>
                            <span style={{ color: "#38bdf8" }}>kP · (x_sp − x)</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#10b981" }}>kI · ∫e·dt</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#fb7185" }}>kD · (−v)</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#f59e0b" }}>TargetRateFeedforward</span>
                        </div>
                        <div style={{ marginTop: 4, fontSize: 11, fontFamily: MONO, opacity: 0.5, lineHeight: 1.6, color: "#e2e8f0" }}>
                            <span style={{ opacity: 0.5 }}>then: </span>
                            {maxAbsVelocity > 0 && <span>clamp to <span style={{ color: "#a78bfa" }}>±{maxAbsVelocity} m/s</span></span>}
                            {maxAbsVelocity <= 0 && <span style={{ opacity: 0.4 }}>no velocity cap</span>}
                            {deadband > 0 && <span style={{ opacity: 0.5 }}> → deadband {deadband} m/s</span>}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 10, fontFamily: MONO, opacity: 0.3 }}>
                            kD uses derivative-on-measurement &nbsp;|&nbsp; Same PID structure for X and Y axes independently
                        </div>
                    </div>
                </div>

                {/* Plant Model */}
                <div style={{ ...S.card, marginBottom: 20, border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ ...S.label, marginBottom: 0, color: "#f59e0b", opacity: 0.8 }}>Velocity Plant Model</div>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[
                                { id: "perfect", label: "Perfect tracking", color: "#10b981" },
                                { id: "firstorder", label: "First-order lag", color: "#f59e0b" },
                                { id: "swerve", label: "Full swerve", color: "#38bdf8" },
                            ].map(m => (
                                <button key={m.id} onClick={() => setPlantModel(m.id)} style={S.btnC(plantModel === m.id, m.color)}>{m.label}</button>
                            ))}
                        </div>
                    </div>

                    {plantModel === "perfect" && (
                        <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.4, lineHeight: 1.8 }}>
                            v_actual = v_cmd instantly. Pure integrator plant (ẋ = v_cmd). Use when your swerve velocity tracking is very fast.
                        </div>
                    )}

                    {plantModel === "firstorder" && (
                        <div>
                            <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.4, lineHeight: 1.8, marginBottom: 12 }}>
                                v tracks v_cmd with time constant τ: <span style={{ color: "#f59e0b" }}>dv/dt = (v_cmd − v) / τ</span>.
                                Models a swerve drive with finite velocity response.
                            </div>
                            <NumInput label="Time Constant (τ)" value={plantTau} onChange={v => setPlantTau(Math.max(0.001, v))} unit="s" step={0.01} inputStyle={{ width: 70 }} />
                            <div style={{ marginTop: 8, fontSize: 10, fontFamily: MONO, opacity: 0.3 }}>
                                Typical: 0.02–0.08s for a swerve with good drive motor tuning
                            </div>
                        </div>
                    )}

                    {plantModel === "swerve" && (
                        <div>
                            <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.4, lineHeight: 1.8, marginBottom: 12 }}>
                                Full motor → force → acceleration → velocity physics. All {numModules * motorsPerModule} drive motors push in parallel.
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <label style={S.fieldLabel}>Drive Motor</label>
                                    <select value={motorId} onChange={e => setMotorId(e.target.value)} style={{ ...S.select, width: 160 }}>
                                        {DC_MOTORS.map(m => <option key={m.id} value={m.id} style={{ background: "#1a1d2e" }}>{m.label}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <label style={S.fieldLabel}>Motors / Module</label>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        {[1, 2].map(n => <button key={n} onClick={() => setMotorsPerModule(n)} style={{ ...S.btn(motorsPerModule === n), width: 36 }}>{n}</button>)}
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <label style={S.fieldLabel}>Gear Ratio</label>
                                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                        {DRIVE_GEARINGS.map(g => (
                                            <button key={g.value} onClick={() => setDriveGearing(g.value)} style={{ ...S.btn(driveGearing === g.value), fontSize: 9, padding: "2px 6px" }}>{g.value}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 12 }}>
                                <NumInput label="Wheel Radius" value={+(wheelRadius.toFixed(4))} onChange={setWheelRadius} unit="m" step={0.001} inputStyle={{ width: 70 }} />
                                <NumInput label="Robot Mass" value={robotMass} onChange={v => setRobotMass(Math.max(0.1, v))} unit="kg" step={0.5} inputStyle={{ width: 60 }} />
                            </div>

                            <div style={{ ...S.label, fontSize: 10, opacity: 0.4 }}>Inner Velocity Loop Gains</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 8 }}>
                                <GainInput label="Inner kP (V/(rad/s))" value={innerKp} onChange={setInnerKp} step={0.01} color="#f59e0b" />
                                <div>
                                    <GainInput label="Inner kV (V/(rad/s))" value={innerKv} onChange={setInnerKv} step={0.0001} color="#60a5fa" />
                                    <button onClick={() => setInnerKv(+(theoreticalKv.toFixed(4)))} style={{ ...S.btn(false), fontSize: 9, marginTop: 4, padding: "2px 6px" }}>Auto: {fmt(theoreticalKv, 4)}</button>
                                </div>
                                <GainInput label="Inner kS (V)" value={innerKs} onChange={setInnerKs} step={0.01} color="#10b981" />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                                <NumInput label="Plant Friction (kS)" value={swervePlantKs} onChange={v => setSwervePlantKs(Math.max(0, v))} unit="N" step={1} inputStyle={{ width: 60 }} />
                                <NumInput label="Viscous Friction" value={swerveViscous} onChange={v => setSwerveViscous(Math.max(0, v))} unit="N·s/m" step={1} inputStyle={{ width: 60 }} />
                            </div>
                            <div style={{ marginTop: 10, fontSize: 10, fontFamily: MONO, opacity: 0.3 }}>
                                Free speed: {fmt(freeSpeedMS, 2)} m/s &nbsp;|&nbsp; Total motors: {numModules * motorsPerModule}
                            </div>
                        </div>
                    )}
                </div>

                {/* Field Viz + Metrics */}
                <div style={{ ...S.card, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                        <FieldViz posM={finalPos} setpointM={setpointM} startM={startM} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                        <MetricCard label="Rise Time (90%)" value={simResult.riseTime !== null ? fmt(simResult.riseTime, 3) : "—"} unit="s" color={simResult.riseTime !== null && simResult.riseTime < 1 ? "#10b981" : "#eab308"} />
                        <MetricCard label="Settle Time (2%)" value={simResult.settleTime !== null ? fmt(simResult.settleTime, 3) : "—"} unit="s" color={simResult.settleTime !== null && simResult.settleTime < 2 ? "#10b981" : "#eab308"} />
                        <MetricCard label="Overshoot" value={fmt(simResult.overshoot, 1)} unit="%" color={simResult.overshoot < 5 ? "#10b981" : simResult.overshoot < 15 ? "#eab308" : "#f43f5e"} warn={simResult.overshoot > 15} />
                        <MetricCard label="SS Error" value={fmt(simResult.ssError, 4)} unit="m" color={simResult.ssError < 0.01 ? "#10b981" : simResult.ssError < 0.05 ? "#eab308" : "#f43f5e"} warn={simResult.ssError > 0.05} />
                        <MetricCard label="Final Position" value={fmt(finalPos, 3)} unit="m" color="#e2e8f0" />
                        <MetricCard label="Vel Saturated" value={fmt(simResult.satPct, 0)} unit="%" color={simResult.satPct < 5 ? "#10b981" : simResult.satPct < 30 ? "#eab308" : "#f43f5e"} warn={simResult.satPct > 30} />
                    </div>
                    {simResult.satPct > 10 && targetRateFF !== 0 && (
                        <div style={{ marginTop: 8, padding: "6px 10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, fontSize: 10, fontFamily: MONO, color: "#f59e0b", opacity: 0.8 }}>
                            ⚠ Velocity output is saturating {fmt(simResult.satPct, 0)}% of the time — TargetRateFeedforward effect may be hidden by MaxAbsVelocity clamp. Try reducing kP or increasing MaxAbsVelocity.
                        </div>
                    )}
                </div>

                {/* Charts */}
                <div style={{ ...S.card, marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
                        {TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={S.btn(activeTab === t.id)}>{t.label}</button>)}
                    </div>
                    {activeTab === "position" && <PositionChart history={simResult.history} startM={startM} setpointM={setpointM} profileMode={profileMode} />}
                    {activeTab === "velocity" && <VelocityChart history={simResult.history} maxAbsVelocity={maxAbsVelocity} profileMode={profileMode} />}
                    {activeTab === "error" && <ErrorChart history={simResult.history} />}
                </div>

                {/* Tuning Guide */}
                <div style={{ ...S.card, marginBottom: 20, border: "1px solid rgba(56,189,248,0.15)" }}>
                    <div style={{ ...S.label, color: "#38bdf8", opacity: 0.7 }}>Translation Controller Tuning Guide</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Understand the architecture", color: "#38bdf8", lines: [
                                    "Same structure as CTRE's HeadingController but for linear axes.",
                                    "PID operates on position error (m) and outputs velocity command (m/s).",
                                    "X and Y axes use identical but independent controllers. This sim tunes one axis.",
                                ]},
                            { step: "2", title: "Start with kP only", color: "#10b981", lines: [
                                    "kP maps position error (m) to velocity (m/s): e.g. kP=3 → 1m error → 3 m/s command.",
                                    "Increase kP until the response is fast but begins to overshoot.",
                                    "MaxAbsVelocity limits output — keep it at or below your robot's free speed (~4.5 m/s typical).",
                                ]},
                            { step: "3", title: "Add kD to reduce overshoot", color: "#fb7185", lines: [
                                    "kD opposes velocity: brakes as position approaches setpoint.",
                                    "Uses derivative-on-measurement (−v) to avoid derivative kick.",
                                    "Start small (kD ≈ 0.05–0.3). Swerve drives are already well-damped by back-EMF.",
                                ]},
                            { step: "4", title: "Use profiling with TargetRateFeedforward", color: "#f59e0b", lines: [
                                    "Trapezoid profile constrains max velocity and acceleration for smooth motion.",
                                    "Profile velocity auto-feeds TargetRateFeedforward — PID only corrects tracking error.",
                                    "Set profile MaxVelocity ≤ MaxAbsVelocity to avoid saturation.",
                                ]},
                            { step: "5", title: "Test realistic distances", color: "#c084fc", lines: [
                                    "Try short alignment (0.3m), medium (2m), and long (8m half-field) moves.",
                                    "Short moves test responsiveness. Long moves test profile tracking and saturation.",
                                    "The same gains work for both X and Y — tune once, apply to both axes.",
                                ]},
                            { step: "6", title: "Validate with realistic plant", color: "#f59e0b", lines: [
                                    "Switch to 'First-order lag' (τ ≈ 0.03–0.08s) or 'Full swerve' for realism.",
                                    "The 'Full swerve' model: voltage → motor torque → linear force → F=ma → velocity.",
                                    "If real robot overshoots more than sim: increase kD or reduce kP.",
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
                <div style={{ ...S.card, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={S.label}>Physics Reference</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, fontSize: 12, opacity: 0.6, fontFamily: MONO }}>
                        <div>Outer: v_cmd = kP·e + kI·∫e + kD·(−v) + TargetRateFF</div>
                        <div>TargetRateFF: profile velocity (trap) or user constant (step)</div>
                        <div>MaxAbsVelocity: clamps |v_cmd| (0 = no cap)</div>
                        <div>Perfect plant: ẋ = v_cmd (pure integrator)</div>
                        <div>First-order: dv/dt = (v_cmd − v) / τ</div>
                        <div>Full swerve: F = N_motors · Kt · I · G / r_wheel</div>
                    </div>
                </div>
            </div>
            <footer style={{ padding: "16px 24px", textAlign: "center" }}>
                <span style={{ fontSize: 12, opacity: 0.2, fontFamily: MONO }}>Swerve Linear Position — Translation PID Tuner</span>
            </footer>
        </div>
    );
}