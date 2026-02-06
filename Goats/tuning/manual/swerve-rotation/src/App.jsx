import { useState, useMemo, useRef, useEffect } from "react";

// ─── Physics ─────────────────────────────────────────────────────────────────
const DT = 0.001;
const NOMINAL_V = 12;

function clampVoltage(v) { return Math.max(-NOMINAL_V, Math.min(NOMINAL_V, v)); }
function degToRad(deg) { return deg * Math.PI / 180; }
function radToDeg(rad) { return rad * 180 / Math.PI; }

function motorConstants(motor) {
    const freeSpeedRadS = (motor.freeSpeed * 2 * Math.PI) / 60;
    const Kt = motor.stallTorque / motor.stallCurrent;
    const R = NOMINAL_V / motor.stallCurrent;
    const Kv = freeSpeedRadS / (NOMINAL_V - motor.freeCurrent * R);
    return { Kt, R, Kv, freeSpeedRadS };
}

// ─── Continuous heading wrap ────────────────────────────────────────────────
// Wraps error to [-180, 180] so controller takes shortest path
function wrapDeg(deg) {
    let d = ((deg % 360) + 540) % 360 - 180;
    return d;
}

// ─── Trapezoid Profile for heading moves ────────────────────────────────────
function generateHeadingProfile(distanceDeg, maxVelDegS, maxAccelDegSS, durationS) {
    const steps = Math.ceil(durationS / DT);
    const sign = distanceDeg >= 0 ? 1 : -1;
    const dist = Math.abs(distanceDeg);

    // Compute trapezoid timings
    const tAccel = Math.min(maxVelDegS / maxAccelDegSS, Math.sqrt(dist / maxAccelDegSS));
    const velPeak = Math.min(maxVelDegS, maxAccelDegSS * tAccel);
    const distAccel = 0.5 * maxAccelDegSS * tAccel * tAccel;
    const distCruise = Math.max(0, dist - 2 * distAccel);
    const tCruise = velPeak > 0 ? distCruise / velPeak : 0;
    const tDecel = tAccel;
    const tTotal = tAccel + tCruise + tDecel;

    const profile = [];
    for (let i = 0; i <= steps; i++) {
        const t = i * DT;
        let pos, vel, accel;
        if (t <= tAccel) {
            accel = maxAccelDegSS;
            vel = maxAccelDegSS * t;
            pos = 0.5 * maxAccelDegSS * t * t;
        } else if (t <= tAccel + tCruise) {
            const dt2 = t - tAccel;
            accel = 0;
            vel = velPeak;
            pos = distAccel + velPeak * dt2;
        } else if (t <= tTotal) {
            const dt3 = t - tAccel - tCruise;
            accel = -maxAccelDegSS;
            vel = velPeak - maxAccelDegSS * dt3;
            pos = distAccel + distCruise + velPeak * dt3 - 0.5 * maxAccelDegSS * dt3 * dt3;
        } else {
            accel = 0;
            vel = 0;
            pos = dist;
        }
        profile.push({ t, position: sign * pos, velocity: sign * vel, acceleration: sign * accel });
    }
    return profile;
}

// ─── Simulator ──────────────────────────────────────────────────────────────
// Outer loop: heading position → angular velocity command
// Inner "plant": swerve yaw dynamics (voltage → torque → α → ω → θ)
// The outer PID outputs a desired ω, which an ideal inner loop tracks.
// For realism, we model the inner loop as either:
//   (a) Perfect: ω_actual instantly = ω_commanded (pure integrator plant)
//   (b) First-order: ω tracks ω_cmd with a time constant τ (like a tuned velocity loop)
//   (c) Full swerve model: motor physics with a simple proportional inner velocity controller

function simulateHeading({
                             startDeg, setpointDeg, durationS,
                             kp, ki, kd, maxAbsRotRate, rotDeadband,
                             targetRateFeedforward,
                             profileMode, maxVelDegS, maxAccelDegSS,
                             plantModel, plantTau,
                             // Full swerve plant params
                             motor, motorsPerModule, driveGearing, wheelRadius, moduleRadii, robotMOI,
                             innerKp, innerKv, innerKs,
                             plantKs, viscousFriction,
                         }) {
    const steps = Math.ceil(durationS / DT);
    const record = Math.max(1, Math.floor(steps / 2000));
    const history = [];

    const wrappedDistance = wrapDeg(setpointDeg - startDeg);

    // Generate profile
    let profile = null;
    if (profileMode === "trapezoid" && maxVelDegS > 0 && maxAccelDegSS > 0) {
        profile = generateHeadingProfile(wrappedDistance, maxVelDegS, maxAccelDegSS, durationS);
    }

    let theta = startDeg; // current heading (deg, unwrapped for smooth tracking)
    let omega = 0;        // current yaw rate (deg/s)
    let integralSum = 0;  // integral accumulator (deg·s)

    // For full swerve plant
    let mc, numModules, sumR, staticFrictionTorque;
    if (plantModel === "swerve" && motor) {
        mc = motorConstants(motor);
        numModules = moduleRadii.length;
        sumR = moduleRadii.reduce((a, b) => a + b, 0);
        staticFrictionTorque = motorsPerModule * mc.Kt * (plantKs || 0) * driveGearing / (mc.R * wheelRadius) * sumR;
    }

    for (let i = 0; i <= steps; i++) {
        const t = i * DT;

        // Current setpoint (with profile or step)
        let currentSetpointDeg, targetRateFF;
        if (profile && i < profile.length) {
            currentSetpointDeg = startDeg + profile[i].position;
            targetRateFF = profile[i].velocity; // profile provides TargetRateFeedforward
        } else if (profile) {
            currentSetpointDeg = startDeg + wrappedDistance;
            targetRateFF = 0; // profile finished
        } else {
            currentSetpointDeg = startDeg + wrappedDistance; // step input
            targetRateFF = targetRateFeedforward || 0; // user-set constant TargetRateFeedforward
        }

        // Heading error (continuous wrap [-180, 180])
        const rawError = currentSetpointDeg - theta;
        const error = wrapDeg(rawError);

        // Integral
        integralSum += error * DT;

        // HeadingController PID: position (°) → angular velocity (°/s)
        // derivative on measurement (negate ω) to avoid derivative kick
        const pTerm = kp * error;
        const iTerm = ki * integralSum;
        const dTerm = kd * (-omega);

        // PID output + TargetRateFeedforward
        let omegaCmd = pTerm + iTerm + dTerm + targetRateFF;

        // MaxAbsRotationalRate clamp (0 = no cap)
        if (maxAbsRotRate > 0) {
            omegaCmd = Math.max(-maxAbsRotRate, Math.min(maxAbsRotRate, omegaCmd));
        }

        // RotationalDeadband
        if (Math.abs(omegaCmd) < rotDeadband) {
            omegaCmd = 0;
        }

        // Plant: how ω_actual responds to ω_cmd
        let appliedVoltage = 0;
        if (plantModel === "perfect") {
            // Instant tracking
            omega = omegaCmd;
        } else if (plantModel === "firstorder") {
            // First-order lag: dω/dt = (ω_cmd - ω) / τ
            const tau = Math.max(plantTau, DT);
            omega += ((omegaCmd - omega) / tau) * DT;
        } else if (plantModel === "swerve" && mc) {
            // Full swerve yaw dynamics with a simple inner velocity P controller
            const omegaCmdRadS = degToRad(omegaCmd);
            const omegaRadS = degToRad(omega);
            const innerError = omegaCmdRadS - omegaRadS;

            // Inner loop voltage
            const vKs = (innerKs || 0) * (innerError === 0 ? 0 : Math.sign(innerError));
            const vKv = (innerKv || 0) * omegaCmdRadS;
            const vP = (innerKp || 0) * innerError;
            appliedVoltage = clampVoltage(vKs + vKv + vP);

            // Physics
            let totalYawTorque = 0;
            for (let m = 0; m < numModules; m++) {
                const r_mod = moduleRadii[m];
                const motorOmega = omegaRadS * r_mod * driveGearing / wheelRadius;
                const backEmf = motorOmega / mc.Kv;
                const currentPerMotor = (appliedVoltage - backEmf) / mc.R;
                const wheelForce = mc.Kt * currentPerMotor * driveGearing / wheelRadius;
                totalYawTorque += wheelForce * r_mod * motorsPerModule;
            }

            let frictionTorque = 0;
            if (Math.abs(omegaRadS) > 0.001) {
                frictionTorque = (staticFrictionTorque || 0) * Math.sign(omegaRadS) + (viscousFriction || 0) * omegaRadS;
            }

            const alphaRadSS = robotMOI > 0 ? (totalYawTorque - frictionTorque) / robotMOI : 0;
            omega += radToDeg(alphaRadSS * DT);
        }

        theta += omega * DT;

        if (i % record === 0) {
            history.push({
                t,
                theta, setpointDeg: currentSetpointDeg,
                omega, omegaCmd,
                error,
                profilePosDeg: profile && i < profile.length ? startDeg + profile[i].position : startDeg + wrappedDistance,
                profileVelDegS: profile && i < profile.length ? profile[i].velocity : 0,
                targetRateFF: targetRateFF,
                voltage: appliedVoltage,
            });
        }
    }

    // Metrics
    const finalTheta = history[history.length - 1].theta;
    const finalSetpoint = history[history.length - 1].setpointDeg;
    const ssError = Math.abs(wrapDeg(finalSetpoint - finalTheta));

    let riseTime = null, settleTime = null, overshoot = 0;
    const target = wrappedDistance;
    let peakDisplacement = 0;

    for (const pt of history) {
        const displacement = pt.theta - startDeg;
        if (Math.abs(displacement) > Math.abs(peakDisplacement)) peakDisplacement = displacement;
        if (riseTime === null && target !== 0) {
            if (Math.sign(target) * displacement >= Math.abs(target) * 0.9) riseTime = pt.t;
        }
    }

    if (target !== 0) {
        const ovAmt = Math.sign(target) * peakDisplacement - Math.abs(target);
        overshoot = ovAmt > 0 ? (ovAmt / Math.abs(target)) * 100 : 0;
    }

    for (let i = history.length - 1; i >= 0; i--) {
        const err = Math.abs(wrapDeg(history[i].setpointDeg - history[i].theta));
        if (err / Math.max(Math.abs(target), 1) > 0.02) {
            settleTime = history[Math.min(i + 1, history.length - 1)].t;
            break;
        }
    }

    return { history, ssError, riseTime, settleTime, overshoot };
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

function NumInput({ label, value, onChange, unit, inputStyle, step, min, max }) {
    return (<div style={{ display: "flex", flexDirection: label ? "column" : "row", gap: 4, alignItems: label ? "flex-start" : "center" }}>
        {label && <label style={S.fieldLabel}>{label}</label>}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input type="number" value={value} step={step} min={min} max={max} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }} style={{ ...S.input, ...inputStyle }} />
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
function PositionChart({ history, startDeg, setpointDeg, profileMode }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 280, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;
        const maxT = history[history.length - 1].t;

        // Y range
        let yMin = Infinity, yMax = -Infinity;
        for (const pt of history) {
            if (pt.theta < yMin) yMin = pt.theta;
            if (pt.theta > yMax) yMax = pt.theta;
            if (pt.setpointDeg < yMin) yMin = pt.setpointDeg;
            if (pt.setpointDeg > yMax) yMax = pt.setpointDeg;
        }
        const yPad = Math.max((yMax - yMin) * 0.15, 10);
        yMin -= yPad; yMax += yPad;

        drawGrid(ctx, pad, pw, ph);

        // Start heading line
        const startY = pad.t + ph * (1 - (startDeg - yMin) / (yMax - yMin));
        ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(pad.l, startY); ctx.lineTo(pad.l + pw, startY); ctx.stroke(); ctx.setLineDash([]);

        // Setpoint line
        const spFinal = history[history.length - 1].setpointDeg;
        const spY = pad.t + ph * (1 - (spFinal - yMin) / (yMax - yMin));
        ctx.strokeStyle = "rgba(56,189,248,0.4)"; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(pad.l, spY); ctx.lineTo(pad.l + pw, spY); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(56,189,248,0.5)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "right";
        ctx.fillText(`Setpoint: ${fmt(spFinal, 1)}°`, pad.l + pw - 4, spY - 6);

        // 2% band
        const range = Math.abs(spFinal - startDeg);
        if (range > 0) {
            const band = range * 0.02;
            const bhY = pad.t + ph * (1 - (spFinal + band - yMin) / (yMax - yMin));
            const blY = pad.t + ph * (1 - (spFinal - band - yMin) / (yMax - yMin));
            ctx.fillStyle = "rgba(56,189,248,0.04)"; ctx.fillRect(pad.l, bhY, pw, blY - bhY);
        }

        // Profile overlay
        if (profileMode !== "none") {
            ctx.strokeStyle = "rgba(16,185,129,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath();
            history.forEach((pt, i) => {
                const x = pad.l + (pt.t / maxT) * pw;
                const y = pad.t + ph * (1 - (pt.profilePosDeg - yMin) / (yMax - yMin));
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }); ctx.stroke(); ctx.setLineDash([]);
        }

        // Actual heading
        ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.5; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.theta - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        // Labels
        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("HEADING POSITION", pad.l, pad.t - 10);
        ctx.fillStyle = "#38bdf8"; ctx.font = `9px ${MONO}`; ctx.fillText("— actual", pad.l + 150, pad.t - 10);
        ctx.fillStyle = "rgba(56,189,248,0.5)"; ctx.fillText("--- setpoint", pad.l + 210, pad.t - 10);
        if (profileMode !== "none") { ctx.fillStyle = "rgba(16,185,129,0.5)"; ctx.fillText("--- profile", pad.l + 280, pad.t - 10); }

        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.fillText("Time (seconds)", pad.l + pw / 2, pad.t + ph + 38);
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(yMax - (i / 5) * (yMax - yMin), 1) + "°", pad.l - 8, pad.t + (i / 5) * ph + 3);
        ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("Heading (°)", 0, 0); ctx.restore();
    }, [history, startDeg, setpointDeg, profileMode]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Velocity Chart ─────────────────────────────────────────────────────────
function VelocityChart({ history, maxAbsRotRate, profileMode }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 220, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;
        const maxT = history[history.length - 1].t;
        let yMax = maxAbsRotRate > 0 ? maxAbsRotRate * 1.1 : 10;
        if (maxAbsRotRate <= 0) {
            for (const pt of history) {
                if (Math.abs(pt.omega) > yMax) yMax = Math.abs(pt.omega) * 1.15;
                if (Math.abs(pt.omegaCmd) > yMax) yMax = Math.abs(pt.omegaCmd) * 1.15;
            }
        }
        let yMin = -yMax;

        drawGrid(ctx, pad, pw, ph);

        // Zero line
        const zy = pad.t + ph * 0.5;
        ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, zy); ctx.lineTo(pad.l + pw, zy); ctx.stroke();

        // Clamp lines (MaxAbsRotationalRate)
        if (maxAbsRotRate > 0) {
            const clampHi = pad.t + ph * (1 - (maxAbsRotRate - yMin) / (yMax - yMin));
            const clampLo = pad.t + ph * (1 - (-maxAbsRotRate - yMin) / (yMax - yMin));
            ctx.strokeStyle = "rgba(244,63,94,0.2)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.moveTo(pad.l, clampHi); ctx.lineTo(pad.l + pw, clampHi); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pad.l, clampLo); ctx.lineTo(pad.l + pw, clampLo); ctx.stroke(); ctx.setLineDash([]);
        }

        // Profile velocity
        if (profileMode !== "none") {
            ctx.strokeStyle = "rgba(16,185,129,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath();
            history.forEach((pt, i) => {
                const x = pad.l + (pt.t / maxT) * pw;
                const y = pad.t + ph * (1 - (pt.profileVelDegS - yMin) / (yMax - yMin));
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }); ctx.stroke(); ctx.setLineDash([]);
        }

        // Commanded ω
        ctx.strokeStyle = "rgba(163,130,250,0.5)"; ctx.lineWidth = 1.5; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.omegaCmd - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        // Actual ω
        ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2; ctx.beginPath();
        history.forEach((pt, i) => {
            const x = pad.l + (pt.t / maxT) * pw;
            const y = pad.t + ph * (1 - (pt.omega - yMin) / (yMax - yMin));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "left";
        ctx.fillText("ANGULAR VELOCITY", pad.l, pad.t - 10);
        ctx.fillStyle = "#f59e0b"; ctx.font = `9px ${MONO}`; ctx.fillText("— actual", pad.l + 160, pad.t - 10);
        ctx.fillStyle = "rgba(163,130,250,0.6)"; ctx.fillText("— cmd", pad.l + 215, pad.t - 10);

        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(yMax - (i / 5) * (yMax - yMin), 0) + "°/s", pad.l - 8, pad.t + (i / 5) * ph + 3);
    }, [history, maxAbsRotRate, profileMode]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Error Chart ────────────────────────────────────────────────────────────
function ErrorChart({ history }) {
    const canvasRef = useRef(null), containerRef = useRef(null);
    useChart(containerRef, canvasRef, 200, (ctx, w, h) => {
        const pad = { t: 28, r: 24, b: 50, l: 70 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
        if (!history || history.length < 2) return;
        const maxT = history[history.length - 1].t;
        let eMax = 1;
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
        ctx.fillText("HEADING ERROR", pad.l, pad.t - 10);
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `10px ${MONO}`; ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(maxT * (i / 5), 2) + "s", pad.l + (i / 5) * pw, pad.t + ph + 16);
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) ctx.fillText(fmt(eMax - (i / 5) * 2 * eMax, 1) + "°", pad.l - 8, pad.t + (i / 5) * ph + 3);
    }, [history]);
    return <div ref={containerRef} style={{ width: "100%" }}><canvas ref={canvasRef} style={{ display: "block" }} /></div>;
}

// ─── Compass Viz ────────────────────────────────────────────────────────────
function CompassViz({ currentDeg, setpointDeg }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        const c = canvasRef.current; if (!c) return;
        const size = 160, dpr = window.devicePixelRatio || 1;
        c.width = size * dpr; c.height = size * dpr; c.style.width = size + "px"; c.style.height = size + "px";
        const ctx = c.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const cx = size / 2, cy = size / 2, r = 60;
        ctx.clearRect(0, 0, size, size);

        // Ring
        ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

        // Tick marks every 30°
        for (let d = 0; d < 360; d += 30) {
            const rad = degToRad(d - 90);
            const inner = d % 90 === 0 ? r - 10 : r - 6;
            ctx.strokeStyle = d % 90 === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)";
            ctx.lineWidth = d % 90 === 0 ? 1.5 : 1;
            ctx.beginPath(); ctx.moveTo(cx + inner * Math.cos(rad), cy + inner * Math.sin(rad));
            ctx.lineTo(cx + r * Math.cos(rad), cy + r * Math.sin(rad)); ctx.stroke();
        }

        // Setpoint
        const spRad = degToRad(setpointDeg - 90);
        ctx.strokeStyle = "rgba(56,189,248,0.5)"; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (r - 5) * Math.cos(spRad), cy + (r - 5) * Math.sin(spRad)); ctx.stroke(); ctx.setLineDash([]);

        // Current heading
        const curRad = degToRad(currentDeg - 90);
        ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (r - 12) * Math.cos(curRad), cy + (r - 12) * Math.sin(curRad)); ctx.stroke();
        // Arrow tip
        ctx.fillStyle = "#38bdf8"; ctx.beginPath();
        const tipX = cx + (r - 12) * Math.cos(curRad), tipY = cy + (r - 12) * Math.sin(curRad);
        ctx.arc(tipX, tipY, 3, 0, Math.PI * 2); ctx.fill();

        // Center dot
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();

        // Labels
        ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = `9px ${MONO}`; ctx.textAlign = "center";
        ctx.fillText("0°", cx, cy - r - 6);
        ctx.fillText("180°", cx, cy + r + 14);
        ctx.fillText("90°", cx + r + 16, cy + 3);
        ctx.fillText("270°", cx - r - 16, cy + 3);
    }, [currentDeg, setpointDeg]);
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
export default function HeadingControllerApp() {
    // Setpoint
    const [startDeg, setStartDeg] = useState(0);
    const [setpointDeg, setSetpointDeg] = useState(90);
    const [duration, setDuration] = useState(3);

    // Outer loop gains (CTRE HeadingController)
    const [kp, setKp] = useState(4);
    const [ki, setKi] = useState(0);
    const [kd, setKd] = useState(0);
    const [maxAbsRotRate, setMaxAbsRotRate] = useState(360); // MaxAbsRotationalRate (°/s), 0 = no cap
    const [rotDeadband, setRotDeadband] = useState(0); // RotationalDeadband (°/s)
    const [targetRateFF, setTargetRateFF] = useState(0); // TargetRateFeedforward (°/s)

    // Profile
    const [profileMode, setProfileMode] = useState("none");
    const [maxVelDegS, setMaxVelDegS] = useState(360);
    const [maxAccelDegSS, setMaxAccelDegSS] = useState(720);

    // Plant model
    const [plantModel, setPlantModel] = useState("perfect");
    const [plantTau, setPlantTau] = useState(0.05);

    // Swerve plant config
    const [motorId, setMotorId] = useState("krakenX60FOC");
    const [motorsPerModule, setMotorsPerModule] = useState(1);
    const [driveGearing, setDriveGearing] = useState(6.75);
    const [wheelRadius, setWheelRadius] = useState(0.0508);
    const [trackWidth, setTrackWidth] = useState(0.546);
    const [wheelBase, setWheelBase] = useState(0.546);
    const [robotMOI, setRobotMOI] = useState(6.0);
    const [innerKp, setInnerKp] = useState(0.1);
    const [innerKv, setInnerKv] = useState(0);
    const [innerKs, setInnerKs] = useState(0);
    const [swervePlantKs, setSwervePlantKs] = useState(0);
    const [swerveViscous, setSwerveViscous] = useState(0);

    const [activeTab, setActiveTab] = useState("position");

    const motor = DC_MOTORS.find(m => m.id === motorId);
    const mc = useMemo(() => motorConstants(motor), [motor]);
    const modulePositions = useMemo(() => {
        const hw = trackWidth / 2, hb = wheelBase / 2;
        return [{ x: hw, y: hb }, { x: hw, y: -hb }, { x: -hw, y: -hb }, { x: -hw, y: hb }];
    }, [trackWidth, wheelBase]);
    const moduleRadii = useMemo(() => modulePositions.map(m => Math.sqrt(m.x * m.x + m.y * m.y)), [modulePositions]);
    const avgR = moduleRadii.reduce((a, b) => a + b, 0) / moduleRadii.length;

    // Auto-fill inner kV
    const theoreticalKv = avgR * driveGearing / (wheelRadius * mc.Kv);

    const simResult = useMemo(() => simulateHeading({
        startDeg, setpointDeg, durationS: duration,
        kp, ki, kd, maxAbsRotRate, rotDeadband,
        targetRateFeedforward: targetRateFF,
        profileMode, maxVelDegS, maxAccelDegSS,
        plantModel, plantTau,
        motor, motorsPerModule, driveGearing, wheelRadius, moduleRadii, robotMOI,
        innerKp, innerKv, innerKs,
        plantKs: swervePlantKs, viscousFriction: swerveViscous,
    }), [startDeg, setpointDeg, duration, kp, ki, kd, maxAbsRotRate, rotDeadband, targetRateFF, profileMode, maxVelDegS, maxAccelDegSS, plantModel, plantTau, motor, motorsPerModule, driveGearing, wheelRadius, moduleRadii, robotMOI, innerKp, innerKv, innerKs, swervePlantKs, swerveViscous]);

    const finalTheta = simResult.history.length > 0 ? simResult.history[simResult.history.length - 1].theta : startDeg;

    const TABS = [
        { id: "position", label: "Heading" },
        { id: "velocity", label: "Angular Velocity" },
        { id: "error", label: "Error" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#0f1117", color: "#e2e8f0", fontFamily: SANS }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: "#38bdf8", margin: 0 }}>Heading Controller</h1>
                        <span style={{ fontSize: 12, opacity: 0.3, fontFamily: MONO }}>Swerve Angular Position PID</span>
                    </div>
                    <p style={{ fontSize: 12, opacity: 0.3, marginTop: 4 }}>Gyro angle → HeadingController PID → angular velocity — for FieldCentricFacingAngle and auto heading</p>
                </div>

                {/* Setpoint */}
                <div style={{ ...S.card, marginBottom: 20 }}>
                    <div style={S.label}>Setpoint</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={S.fieldLabel}>Start Heading</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <input type="number" value={startDeg} step={5} onChange={e => { const v = +e.target.value; if (!isNaN(v)) setStartDeg(v); }} style={S.inputSmall} /><span style={S.unit}>°</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={S.fieldLabel}>Target Heading</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <input type="number" value={setpointDeg} step={5} onChange={e => { const v = +e.target.value; if (!isNaN(v)) setSetpointDeg(v); }} style={S.inputSmall} /><span style={S.unit}>°</span>
                            </div>
                        </div>
                        <NumInput label="Duration" value={duration} onChange={v => setDuration(Math.max(0.5, Math.min(20, v)))} unit="s" step={0.5} inputStyle={{ width: 56 }} />
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontFamily: MONO, opacity: 0.3, paddingTop: 4 }}>Quick moves:</span>
                        {[{ l: "90° CW", s: 0, t: 90 }, { l: "90° CCW", s: 0, t: -90 }, { l: "180° turn", s: 0, t: 180 }, { l: "45° nudge", s: 0, t: 45 }, { l: "350→10° wrap", s: 350, t: 10 }].map(q => (
                            <button key={q.l} onClick={() => { setStartDeg(q.s); setSetpointDeg(q.t); }} style={S.btn(startDeg === q.s && setpointDeg === q.t)}>{q.l}</button>
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
                            <NumInput label="Max Velocity" value={maxVelDegS} onChange={v => setMaxVelDegS(Math.max(1, v))} unit="°/s" step={10} inputStyle={{ width: 70 }} />
                            <NumInput label="Max Acceleration" value={maxAccelDegSS} onChange={v => setMaxAccelDegSS(Math.max(1, v))} unit="°/s²" step={10} inputStyle={{ width: 70 }} />
                        </div>
                    )}
                    {profileMode === "none" && (
                        <div style={{ fontSize: 10, fontFamily: MONO, opacity: 0.3 }}>Step input — setpoint changes instantly. TargetRateFeedforward = 0. Good for testing raw PID response.</div>
                    )}
                </div>

                {/* Outer Loop Gains — CTRE HeadingController */}
                <div style={{ ...S.card, marginBottom: 20 }}>
                    <div style={S.label}>HeadingController Gains (PID output: °/s)</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 12 }}>
                        <GainInput label="kP ((°/s) / °)" value={kp} onChange={setKp} step={0.1} color="#38bdf8" />
                        <GainInput label="kI ((°/s) / (°·s))" value={ki} onChange={setKi} step={0.01} color="#10b981" />
                        <GainInput label="kD ((°/s) / (°/s))" value={kd} onChange={setKd} step={0.01} color="#fb7185" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
                        <NumInput label="MaxAbsRotationalRate (0=no cap)" value={maxAbsRotRate} onChange={v => setMaxAbsRotRate(Math.max(0, v))} unit="°/s" step={10} inputStyle={{ width: 70 }} />
                        <NumInput label="RotationalDeadband" value={rotDeadband} onChange={v => setRotDeadband(Math.max(0, v))} unit="°/s" step={0.5} inputStyle={{ width: 60 }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <label style={{ ...S.fieldLabel, color: "#f59e0b", opacity: 0.8 }}>TargetRateFeedforward</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <input type="number" value={targetRateFF} step={1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setTargetRateFF(v); }} style={{ ...S.input, width: 80, borderColor: "rgba(245,158,11,0.3)", color: "#f59e0b" }} />
                                <span style={{ ...S.unit, color: "#f59e0b" }}>°/s</span>
                            </div>
                            <div style={{ fontSize: 9, fontFamily: MONO, opacity: 0.3, marginTop: 2 }}>
                                {profileMode !== "none" ? "Overridden by profile velocity" : "Constant additive FF (0 for step response)"}
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 13, fontFamily: MONO, color: "#e2e8f0", lineHeight: 1.8 }}>
                            <span style={{ opacity: 0.5 }}>ω_cmd = </span>
                            <span style={{ color: "#38bdf8" }}>kP · wrap(θ_sp − θ)</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#10b981" }}>kI · ∫e·dt</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#fb7185" }}>kD · (−ω)</span>
                            <span style={{ opacity: 0.3 }}> + </span>
                            <span style={{ color: "#f59e0b" }}>TargetRateFeedforward</span>
                        </div>
                        <div style={{ marginTop: 4, fontSize: 11, fontFamily: MONO, opacity: 0.5, lineHeight: 1.6, color: "#e2e8f0" }}>
                            <span style={{ opacity: 0.5 }}>then: </span>
                            {maxAbsRotRate > 0 && <span>clamp to <span style={{ color: "#a78bfa" }}>±{maxAbsRotRate}°/s</span></span>}
                            {maxAbsRotRate <= 0 && <span style={{ opacity: 0.4 }}>no rate cap</span>}
                            {rotDeadband > 0 && <span style={{ opacity: 0.5 }}> &nbsp;→&nbsp; deadband {rotDeadband}°/s</span>}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 10, fontFamily: MONO, opacity: 0.3 }}>
                            wrap() = continuous input [−180°, 180°] &nbsp;|&nbsp; kD uses derivative-on-measurement &nbsp;|&nbsp; TargetRateFeedforward from motion profile
                        </div>
                    </div>
                </div>

                {/* Plant Model */}
                <div style={{ ...S.card, marginBottom: 20, border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ ...S.label, marginBottom: 0, color: "#f59e0b", opacity: 0.8 }}>Yaw Rate Plant Model</div>
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
                            ω_actual = ω_cmd instantly. Pure integrator plant (θ̇ = ω_cmd). Use when your inner velocity loop is very fast or you just want to tune the position gains.
                        </div>
                    )}

                    {plantModel === "firstorder" && (
                        <div>
                            <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.4, lineHeight: 1.8, marginBottom: 12 }}>
                                ω tracks ω_cmd with time constant τ: <span style={{ color: "#f59e0b" }}>dω/dt = (ω_cmd − ω) / τ</span>.
                                Models a tuned inner velocity loop with finite response time.
                            </div>
                            <NumInput label="Time Constant (τ)" value={plantTau} onChange={v => setPlantTau(Math.max(0.001, v))} unit="s" step={0.01} inputStyle={{ width: 70 }} />
                            <div style={{ marginTop: 8, fontSize: 10, fontFamily: MONO, opacity: 0.3 }}>
                                Typical: 0.02–0.1s for a well-tuned swerve yaw rate loop
                            </div>
                        </div>
                    )}

                    {plantModel === "swerve" && (
                        <div>
                            <div style={{ fontSize: 11, fontFamily: MONO, opacity: 0.4, lineHeight: 1.8, marginBottom: 12 }}>
                                Full motor → torque → α → ω physics with a simple inner P+kV velocity controller.
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <label style={S.fieldLabel}>Drive Motor</label>
                                    <select value={motorId} onChange={e => setMotorId(e.target.value)} style={{ ...S.select, width: 160 }}>
                                        {DC_MOTORS.map(m => <option key={m.id} value={m.id} style={{ background: "#1a1d2e" }}>{m.label}</option>)}
                                    </select>
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
                                <NumInput label="Trackwidth" value={+(trackWidth.toFixed(3))} onChange={setTrackWidth} unit="m" step={0.01} inputStyle={{ width: 70 }} />
                                <NumInput label="Wheelbase" value={+(wheelBase.toFixed(3))} onChange={setWheelBase} unit="m" step={0.01} inputStyle={{ width: 70 }} />
                                <NumInput label="Wheel Radius" value={+(wheelRadius.toFixed(4))} onChange={setWheelRadius} unit="m" step={0.001} inputStyle={{ width: 70 }} />
                                <NumInput label="Robot MOI" value={robotMOI} onChange={v => setRobotMOI(Math.max(0.1, v))} unit="kg·m²" step={0.5} inputStyle={{ width: 60 }} />
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
                                <NumInput label="Plant Friction (kS)" value={swervePlantKs} onChange={v => setSwervePlantKs(Math.max(0, v))} unit="V" step={0.01} inputStyle={{ width: 60 }} />
                                <NumInput label="Viscous Friction" value={swerveViscous} onChange={v => setSwerveViscous(Math.max(0, v))} unit="N·m·s" step={0.01} inputStyle={{ width: 60 }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Compass + Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 20 }}>
                    <div style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CompassViz currentDeg={finalTheta} setpointDeg={setpointDeg} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, alignContent: "start" }}>
                        <MetricCard label="Rise Time (90%)" value={simResult.riseTime !== null ? fmt(simResult.riseTime, 3) : "—"} unit="s" color={simResult.riseTime !== null && simResult.riseTime < 0.5 ? "#10b981" : "#eab308"} />
                        <MetricCard label="Settle Time (2%)" value={simResult.settleTime !== null ? fmt(simResult.settleTime, 3) : "—"} unit="s" color={simResult.settleTime !== null && simResult.settleTime < 1 ? "#10b981" : "#eab308"} />
                        <MetricCard label="Overshoot" value={fmt(simResult.overshoot, 1)} unit="%" color={simResult.overshoot < 5 ? "#10b981" : simResult.overshoot < 15 ? "#eab308" : "#f43f5e"} warn={simResult.overshoot > 15} />
                        <MetricCard label="SS Error" value={fmt(simResult.ssError, 2)} unit="°" color={simResult.ssError < 1 ? "#10b981" : simResult.ssError < 5 ? "#eab308" : "#f43f5e"} warn={simResult.ssError > 5} />
                        <MetricCard label="Final Heading" value={fmt(finalTheta, 1)} unit="°" color="#e2e8f0" />
                        <MetricCard label="Move Distance" value={fmt(wrapDeg(setpointDeg - startDeg), 1)} unit="°" color="#38bdf8" />
                    </div>
                </div>

                {/* Charts */}
                <div style={{ ...S.card, marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
                        {TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={S.btn(activeTab === t.id)}>{t.label}</button>)}
                    </div>
                    {activeTab === "position" && <PositionChart history={simResult.history} startDeg={startDeg} setpointDeg={setpointDeg} profileMode={profileMode} />}
                    {activeTab === "velocity" && <VelocityChart history={simResult.history} maxAbsRotRate={maxAbsRotRate} profileMode={profileMode} />}
                    {activeTab === "error" && <ErrorChart history={simResult.history} />}
                </div>

                {/* Tuning Guide */}
                <div style={{ ...S.card, marginBottom: 20, border: "1px solid rgba(56,189,248,0.15)" }}>
                    <div style={{ ...S.label, color: "#38bdf8", opacity: 0.7 }}>Heading Controller Tuning Guide</div>
                    <div style={{ fontSize: 12, fontFamily: MONO, lineHeight: 2.0 }}>
                        {[
                            { step: "1", title: "Understand the CTRE architecture", color: "#38bdf8", lines: [
                                    "This mirrors CTRE's FieldCentricFacingAngle / RobotCentricFacingAngle HeadingController.",
                                    "HeadingController is a PID on heading (radians) that outputs angular velocity (rad/s).",
                                    "TargetRateFeedforward adds profile velocity to PID output. MaxAbsRotationalRate caps the result.",
                                ]},
                            { step: "2", title: "Start with kP only", color: "#10b981", lines: [
                                    "kP maps heading error (°) to angular velocity (°/s): e.g. kP=4 → 90° error → 360°/s command.",
                                    "Increase kP until the response is fast but just starts to overshoot.",
                                    "MaxAbsRotationalRate limits the output — if it saturates too long, response feels sluggish.",
                                ]},
                            { step: "3", title: "Add kD to reduce overshoot", color: "#fb7185", lines: [
                                    "kD opposes rotation rate: it brakes as the heading approaches the setpoint.",
                                    "Uses derivative-on-measurement (−ω) to avoid derivative kick on setpoint changes.",
                                    "Start small (kD ≈ 0.05–0.2). Too much makes the system sluggish; too little allows ringing.",
                                ]},
                            { step: "4", title: "Add profiling with TargetRateFeedforward", color: "#f59e0b", lines: [
                                    "With a motion profile, TargetRateFeedforward carries the profile's velocity reference.",
                                    "This is CTRE's TargetRateFeedforward — set it to the profile's current velocity setpoint.",
                                    "PID only corrects tracking error while the feedforward does the heavy lifting.",
                                ]},
                            { step: "5", title: "Test the wrap-around", color: "#f59e0b", lines: [
                                    "Try the '350°→10°' quick move. The controller should take the short 20° path, not the 340° one.",
                                    "The continuous input wrap [-180°, 180°] ensures shortest-path rotation.",
                                    "Test moves in both directions and with different magnitudes to verify consistency.",
                                ]},
                            { step: "6", title: "Validate with realistic plant", color: "#c084fc", lines: [
                                    "Switch to 'First-order lag' (τ ≈ 0.02–0.1s) or 'Full swerve' to model real yaw rate response.",
                                    "If your robot overshoots more in reality than with 'Perfect': increase kD or reduce kP.",
                                    "The 'Full swerve' model shows the complete cascade: outer PID → inner kV+kP → motor physics.",
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
                        <div>Outer: ω = HeadingController.calculate(θ, θ_sp) + TargetRateFeedforward</div>
                        <div>HeadingController: kP·wrap(e) + kI·∫e + kD·(−ω)</div>
                        <div>wrap(e): continuous input [−180°, 180°]</div>
                        <div>MaxAbsRotationalRate: clamps |ω| (0 = no cap)</div>
                        <div>RotationalDeadband: ω → 0 if |ω| {"<"} deadband</div>
                        <div>Inner: V = kS·sgn(e) + kV·ω_cmd + kP_inner·e_ω</div>
                    </div>
                </div>
            </div>
            <footer style={{ padding: "16px 24px", textAlign: "center" }}>
                <span style={{ fontSize: 12, opacity: 0.2, fontFamily: MONO }}>Swerve Heading Controller — Angular Position PID Tuner</span>
            </footer>
        </div>
    );
}