import { useState, useMemo, useRef, useEffect } from "react";

// ─── DC Motor Database ──────────────────────────────────────────────────────
const DC_MOTORS = [
    { id: "krakenX60",    label: "Kraken X60",         stallTorque: 7.09,  freeSpeed: 6000,  stallCurrent: 366, freeCurrent: 2,   V: 12 },
    { id: "krakenX60FOC", label: "Kraken X60 (FOC)",   stallTorque: 9.37,  freeSpeed: 5800,  stallCurrent: 483, freeCurrent: 2,   V: 12 },
    { id: "krakenX44",    label: "Kraken X44",         stallTorque: 4.28,  freeSpeed: 7530,  stallCurrent: 275, freeCurrent: 1.4, V: 12 },
    { id: "falcon500",    label: "Falcon 500",         stallTorque: 4.69,  freeSpeed: 6380,  stallCurrent: 257, freeCurrent: 1.5, V: 12 },
    { id: "falcon500FOC", label: "Falcon 500 (FOC)",   stallTorque: 5.84,  freeSpeed: 6080,  stallCurrent: 304, freeCurrent: 1.5, V: 12 },
    { id: "neoVortex",    label: "NEO Vortex",         stallTorque: 3.60,  freeSpeed: 6784,  stallCurrent: 211, freeCurrent: 3.6, V: 12 },
    { id: "neo",          label: "NEO",                stallTorque: 2.6,   freeSpeed: 5676,  stallCurrent: 105, freeCurrent: 1.8, V: 12 },
    { id: "neo550",       label: "NEO 550",            stallTorque: 0.97,  freeSpeed: 11000, stallCurrent: 100, freeCurrent: 1.4, V: 12 },
    { id: "cim",          label: "CIM",                stallTorque: 2.41,  freeSpeed: 5330,  stallCurrent: 131, freeCurrent: 2.7, V: 12 },
    { id: "miniCim",      label: "Mini CIM",           stallTorque: 1.41,  freeSpeed: 5840,  stallCurrent: 89,  freeCurrent: 3,   V: 12 },
    { id: "bag",          label: "BAG",                stallTorque: 0.43,  freeSpeed: 13180, stallCurrent: 53,  freeCurrent: 1.8, V: 12 },
    { id: "775pro",       label: "775pro",             stallTorque: 0.71,  freeSpeed: 18730, stallCurrent: 134, freeCurrent: 0.7, V: 12 },
];

function deriveMotorConstants(m) {
    const R = m.V / m.stallCurrent;
    const Kt = m.stallTorque / m.stallCurrent;
    const freeSpeedRadS = (m.freeSpeed * 2 * Math.PI) / 60;
    const Kv = freeSpeedRadS / (m.V - m.freeCurrent * R);
    return { ...m, R, Kt, Kv, freeSpeedRadS };
}

// ─── Physics ────────────────────────────────────────────────────────────────
function forwardKvKa(motor, J, G, n) {
    const m = deriveMotorConstants(motor);
    const Kt_n = m.Kt * n, kV = G / m.Kv, kA = (m.R * J) / (G * Kt_n);
    return { kV, kA, R: m.R, Kt: m.Kt, Kv: m.Kv, Kt_n, freeSpeedRadS: m.freeSpeedRadS };
}
function reverseJ(motor, kV_measured, kA_measured, G, n) {
    const m = deriveMotorConstants(motor);
    const Kt_n = m.Kt * n, J = (kA_measured * G * Kt_n) / m.R, kV_theoretical = G / m.Kv;
    return { J, kV_theoretical, R: m.R, Kt: m.Kt, Kv: m.Kv, Kt_n, freeSpeedRadS: m.freeSpeedRadS };
}

// ─── 2×2 Matrix math ────────────────────────────────────────────────────────
const M = {
    make: (a, b, c, d) => [a, b, c, d],
    add: (A, B) => [A[0]+B[0], A[1]+B[1], A[2]+B[2], A[3]+B[3]],
    sub: (A, B) => [A[0]-B[0], A[1]-B[1], A[2]-B[2], A[3]-B[3]],
    mul: (A, B) => [A[0]*B[0]+A[1]*B[2], A[0]*B[1]+A[1]*B[3], A[2]*B[0]+A[3]*B[2], A[2]*B[1]+A[3]*B[3]],
    scale: (A, s) => [A[0]*s, A[1]*s, A[2]*s, A[3]*s],
    T: (A) => [A[0], A[2], A[1], A[3]],
    det: (A) => A[0]*A[3] - A[1]*A[2],
    inv: (A) => { const d = M.det(A); if (Math.abs(d)<1e-30) return null; return [A[3]/d,-A[1]/d,-A[2]/d,A[0]/d]; },
    I: () => [1, 0, 0, 1],
};
function mv(A, v) { return [A[0]*v[0]+A[1]*v[1], A[2]*v[0]+A[3]*v[1]]; }
function outer(a, b) { return [a[0]*b[0], a[0]*b[1], a[1]*b[0], a[1]*b[1]]; }
function quadForm(v, A) { const Av = mv(A, v); return v[0]*Av[0]+v[1]*Av[1]; }

// ─── Matrix Exp (2×2, Padé scale-and-square) ────────────────────────────────
function matExp2(A) {
    const norm = Math.max(Math.abs(A[0])+Math.abs(A[1]), Math.abs(A[2])+Math.abs(A[3]));
    let s = 0, As = [...A];
    if (norm > 0.5) { s = Math.ceil(Math.log2(norm/0.5)); As = M.scale(A, Math.pow(2,-s)); }
    const c = [1,1/2,1/10,1/120,1/1680,1/30240,1/665280];
    const I = M.I();
    let A2=M.mul(As,As), A3=M.mul(A2,As), A4=M.mul(A2,A2), A5=M.mul(A4,As), A6=M.mul(A4,A2);
    const U=M.add(M.add(M.add(M.scale(I,c[0]),M.scale(As,c[1])),M.add(M.scale(A2,c[2]),M.scale(A3,c[3]))),M.add(M.scale(A4,c[4]),M.add(M.scale(A5,c[5]),M.scale(A6,c[6]))));
    const Vn=M.add(M.add(M.add(M.scale(I,c[0]),M.scale(As,-c[1])),M.add(M.scale(A2,c[2]),M.scale(A3,-c[3]))),M.add(M.scale(A4,c[4]),M.add(M.scale(A5,-c[5]),M.scale(A6,c[6]))));
    const Vi=M.inv(Vn); if(!Vi) return I;
    let r=M.mul(Vi,U); for(let i=0;i<s;i++) r=M.mul(r,r); return r;
}

// ─── Discretize A,B via augmented matrix exponential ────────────────────────
function discretizeAB(Ac, Bc, dt) {
    const a=Ac[0]*dt,b=Ac[1]*dt,c=Ac[2]*dt,d=Ac[3]*dt,e=Bc[0]*dt,f=Bc[1]*dt;
    const aug=[a,b,e,c,d,f,0,0,0];let R=[1,0,0,0,1,0,0,0,1],T=[1,0,0,0,1,0,0,0,1];
    for(let k=1;k<=25;k++){const n=mul3(T,aug);const s=1/k;for(let i=0;i<9;i++)n[i]*=s;T=n;for(let i=0;i<9;i++)R[i]+=T[i];let mx=0;for(let i=0;i<9;i++)mx=Math.max(mx,Math.abs(T[i]));if(mx<1e-16)break;}
    return{Ad:M.make(R[0],R[1],R[3],R[4]),Bd:[R[2],R[5]]};
}
function mul3(A,B){const r=new Array(9).fill(0);for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++)r[i*3+j]+=A[i*3+k]*B[k*3+j];return r;}

// ─── 1×1 Discretize for velocity-only system ───────────────────────────────
function discretizeAB_1x1(a_c, b_c, dt) {
    // x_{k+1} = Ad x_k + Bd u_k for scalar system dx/dt = a*x + b*u
    const ad = Math.exp(a_c * dt);
    // Bd = integral_0^dt e^(a*tau) d(tau) * b
    const bd = Math.abs(a_c) > 1e-10 ? (b_c / a_c) * (ad - 1) : b_c * dt;
    return { ad, bd };
}

// ─── DARE Solver (2×2 state, 1 input) ──────────────────────────────────────
function solveDARE(Ad, Bd, Q, R_s) {
    let P=[...Q]; const AdT=M.T(Ad);
    for(let iter=0;iter<2000;iter++){
        const AdTP=M.mul(AdT,P),AdTPAd=M.mul(AdTP,Ad);
        const BdTPBd=quadForm(Bd,P)+R_s; if(Math.abs(BdTPBd)<1e-30)break;
        const AdTPBd=mv(AdTP,Bd);
        const corr=M.scale(outer(AdTPBd,AdTPBd),1/BdTPBd);
        const Pn=M.add(Q,M.sub(AdTPAd,corr));
        const diff=M.sub(Pn,P);
        const mx=Math.max(Math.abs(diff[0]),Math.abs(diff[1]),Math.abs(diff[2]),Math.abs(diff[3]));
        P=Pn; if(mx<1e-12)break;
    } return P;
}

// ─── DARE Solver (1×1 state, 1 input — scalar) ─────────────────────────────
function solveDARE_1x1(ad, bd, q, r) {
    // AᵀPA - P - AᵀPB(BᵀPB+R)⁻¹BᵀPA + Q = 0  (all scalar)
    let p = q;
    for (let iter = 0; iter < 2000; iter++) {
        const atpa = ad * p * ad;
        const bpb_r = bd * p * bd + r;
        if (Math.abs(bpb_r) < 1e-30) break;
        const atpb = ad * p * bd;
        const pn = q + atpa - (atpb * atpb) / bpb_r;
        const diff = Math.abs(pn - p);
        p = pn; if (diff < 1e-14) break;
    }
    return p;
}

// ─── Position LQR (2-state) ────────────────────────────────────────────────
function computePositionLQR(kV, kA, qPos, qVel, rEff, dt) {
    if(kV<=0||kA<=0||qPos<=0||qVel<=0||rEff<=0||dt<=0) return{kP:0,kD:0,K:[0,0],error:"Invalid"};
    const Ac=M.make(0,1,0,-1/kV), Bc=[0,1/kA];
    const{Ad,Bd}=discretizeAB(Ac,Bc,dt);
    const Q=M.make(1/(qPos*qPos),0,0,1/(qVel*qVel)), R_s=1/(rEff*rEff);
    const S=solveDARE(Ad,Bd,Q,R_s);
    const denom=quadForm(Bd,S)+R_s; if(Math.abs(denom)<1e-30)return{kP:0,kD:0,K:[0,0],error:"Singular"};
    const BdTS=mv(M.T(S),Bd);
    const kP=(BdTS[0]*Ad[0]+BdTS[1]*Ad[2])/denom;
    const kD=(BdTS[0]*Ad[1]+BdTS[1]*Ad[3])/denom;
    const Acl=M.sub(Ad,outer(Bd,[kP,kD]));
    const tr=Acl[0]+Acl[3],det=M.det(Acl),disc=tr*tr-4*det;
    let e1,e2;
    if(disc>=0){e1=(tr+Math.sqrt(disc))/2;e2=(tr-Math.sqrt(disc))/2;}else{e1=Math.sqrt(det);e2=e1;}
    return{kP,kD,K:[kP,kD],eig1:e1,eig2:e2,stable:Math.abs(e1)<1&&Math.abs(e2)<1,Ac,Bc,Ad,Bd};
}

// ─── Velocity LQR (1-state) ────────────────────────────────────────────────
// State: [velocity], Input: [voltage]
// Continuous: A = -1/kV, B = 1/kA   →  dx/dt = (-1/kV)*v + (1/kA)*u
function computeVelocityLQR(kV, kA, qVel, rEff, dt) {
    if(kV<=0||kA<=0||qVel<=0||rEff<=0||dt<=0) return{kP:0,error:"Invalid"};
    const a_c = -1/kV, b_c = 1/kA;
    const{ad,bd}=discretizeAB_1x1(a_c,b_c,dt);
    const q=1/(qVel*qVel), r=1/(rEff*rEff);
    const S=solveDARE_1x1(ad,bd,q,r);
    const denom=bd*S*bd+r; if(Math.abs(denom)<1e-30)return{kP:0,error:"Singular"};
    const kP=(bd*S*ad)/denom;
    const acl=ad-bd*kP;
    return{kP,eig:acl,stable:Math.abs(acl)<1,a_c,b_c,ad,bd};
}

// ─── Latency Compensation ──────────────────────────────────────────────────
function latencyCompPos(Ac, Bc, K, delay) {
    if(delay<=0) return K;
    const Acl_dt=M.scale(M.sub(Ac,outer(Bc,K)),delay);
    const e=matExp2(Acl_dt);
    return[K[0]*e[0]+K[1]*e[2], K[0]*e[1]+K[1]*e[3]];
}
function latencyCompVel(a_c, b_c, kP, delay) {
    if(delay<=0) return kP;
    // K_new = K * exp((A - B*K) * delay)   (all scalar)
    return kP * Math.exp((a_c - b_c * kP) * delay);
}

// ─── Presets ────────────────────────────────────────────────────────────────
const GAIN_PRESETS = [
    { id: "wpilib",   label: "WPILib (default)",        period: 0.020, delay: 0 },
    { id: "talonFX",  label: "Talon FX / Kraken",       period: 0.020, delay: 0.025 },
    { id: "sparkMax", label: "SPARK MAX (NEO encoder)",  period: 0.020, delay: 0.032 },
    { id: "sparkFlex",label: "SPARK Flex",               period: 0.020, delay: 0.032 },
    { id: "talonSRX", label: "Talon SRX (Quad)",         period: 0.020, delay: 0.025 },
    { id: "custom",   label: "Custom",                   period: 0.020, delay: 0 },
];
const COMMON_GEARINGS = [
    {label:"Custom",value:null},{label:"1:1",value:1},{label:"3:1",value:3},{label:"4:1",value:4},{label:"5:1",value:5},
    {label:"6.75:1",value:6.75},{label:"8.14:1",value:8.14},{label:"9:1",value:9},{label:"10:1",value:10},{label:"12:1",value:12},
    {label:"16:1",value:16},{label:"20:1",value:20},{label:"25:1",value:25},{label:"30:1",value:30},{label:"36:1",value:36},
    {label:"40:1",value:40},{label:"48:1",value:48},{label:"50:1",value:50},{label:"64:1",value:64},{label:"100:1",value:100},
];

// ─── Shared styles ──────────────────────────────────────────────────────────
const MONO="'JetBrains Mono',monospace",SANS="'Space Grotesk',sans-serif";
function fmt(v,d=4){if(v==null||isNaN(v)||!isFinite(v))return"—";if(Math.abs(v)<0.0001&&v!==0)return v.toExponential(d);return parseFloat(v.toFixed(d)).toString();}
function fmtSci(v,d=4){if(v==null||isNaN(v)||!isFinite(v))return"—";if(Math.abs(v)<0.001||Math.abs(v)>99999)return v.toExponential(d);return parseFloat(v.toFixed(d)).toString();}

const ST={
    card:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:16},
    cardSubtle:{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:16},
    label:{fontFamily:SANS,fontSize:11,fontWeight:600,opacity:0.5,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12},
    fieldLabel:{fontSize:10,letterSpacing:"0.08em",opacity:0.6,fontFamily:MONO,textTransform:"uppercase"},
    input:{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:4,padding:"4px 8px",fontSize:13,color:"#e2e8f0",fontFamily:MONO,outline:"none",width:96},
    inputSmall:{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:4,padding:"2px 8px",fontSize:13,color:"#e2e8f0",fontFamily:MONO,outline:"none",width:56,textAlign:"center"},
    unit:{fontSize:11,opacity:0.4,fontFamily:MONO,marginLeft:4},
    select:{background:"transparent",color:"#e2e8f0",fontFamily:MONO,fontSize:13,border:"1px solid rgba(255,255,255,0.12)",borderRadius:4,padding:"4px 8px",outline:"none",cursor:"pointer"},
    btn:(a)=>({padding:"4px 10px",borderRadius:4,fontSize:11,fontFamily:MONO,cursor:"pointer",background:a?"rgba(56,189,248,0.2)":"rgba(255,255,255,0.04)",color:a?"#38bdf8":"rgba(255,255,255,0.5)",border:a?"1px solid rgba(56,189,248,0.4)":"1px solid rgba(255,255,255,0.06)"}),
    btnColor:(a,col)=>({padding:"4px 10px",borderRadius:4,fontSize:11,fontFamily:MONO,cursor:"pointer",background:a?`${col}20`:"rgba(255,255,255,0.04)",color:a?col:"rgba(255,255,255,0.5)",border:a?`1px solid ${col}66`:"1px solid rgba(255,255,255,0.06)"}),
};

function NumInput({label,value,onChange,unit,style,inputStyle,step}){
    return(<div style={{display:"flex",flexDirection:label?"column":"row",gap:4,alignItems:label?"flex-start":"center",...style}}>
        {label&&<label style={ST.fieldLabel}>{label}</label>}
        <div style={{display:"flex",alignItems:"center",gap:4}}>
            <input type="number" value={value} step={step||"any"} onChange={e=>onChange(parseFloat(e.target.value)||0)} style={{...ST.input,...inputStyle}}/>
            {unit&&<span style={ST.unit}>{unit}</span>}
        </div>
    </div>);
}
function MotorSpecBar({label,value,max,color,unit,fmt:f}){
    const pct=max>0?Math.min((value/max)*100,100):0;
    return(<div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:10,opacity:0.5,fontFamily:MONO,width:56,textTransform:"uppercase",letterSpacing:"0.05em",flexShrink:0}}>{label}</span>
        <div style={{flex:1,height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:3,transition:"width 0.3s ease"}}/></div>
        <span style={{fontSize:11,fontFamily:MONO,color,minWidth:80,textAlign:"right"}}>{f?f(value):fmt(value,3)} {unit}</span>
    </div>);
}

// ─── Canvas helpers ─────────────────────────────────────────────────────────
function useChart(cRef,cvRef,h,draw,deps){useEffect(()=>{const cv=cvRef.current,c=cRef.current;if(!cv||!c)return;const dpr=window.devicePixelRatio||1,w=c.clientWidth;cv.width=w*dpr;cv.height=h*dpr;cv.style.width=w+"px";cv.style.height=h+"px";const ctx=cv.getContext("2d");ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);draw(ctx,w,h);},deps);}
function drawGrid(ctx,pad,pw,ph,cols=5,rows=5){ctx.strokeStyle="rgba(255,255,255,0.06)";ctx.lineWidth=1;for(let i=0;i<=cols;i++){const x=pad.l+(i/cols)*pw;ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,pad.t+ph);ctx.stroke();}for(let i=0;i<=rows;i++){const y=pad.t+(i/rows)*ph;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+pw,y);ctx.stroke();}ctx.strokeStyle="rgba(255,255,255,0.2)";ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,pad.t+ph);ctx.lineTo(pad.l+pw,pad.t+ph);ctx.stroke();}

// ─── kV vs Gearing Chart ────────────────────────────────────────────────────
function KvGearingChart({motor,numMotors,currentG}){
    const cvRef=useRef(null),cRef=useRef(null);
    const m=useMemo(()=>deriveMotorConstants(motor),[motor]);
    useChart(cRef,cvRef,220,(ctx,w,h)=>{
        const pad={t:20,r:20,b:48,l:64},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b;
        const maxG=Math.max(currentG*1.5,50),maxKv=(maxG/m.Kv)*1.15;
        drawGrid(ctx,pad,pw,ph,5,4);
        ctx.strokeStyle="#38bdf8";ctx.lineWidth=2.5;ctx.beginPath();
        for(let i=0;i<=200;i++){const g=0.1+(i/200)*(maxG-0.1),kv=g/m.Kv,x=pad.l+((g-0.1)/(maxG-0.1))*pw,y=pad.t+ph-(kv/maxKv)*ph;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
        const ckv=currentG/m.Kv,cx=pad.l+((currentG-0.1)/(maxG-0.1))*pw,cy=pad.t+ph-(ckv/maxKv)*ph;
        ctx.strokeStyle="rgba(56,189,248,0.3)";ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(cx,pad.t);ctx.lineTo(cx,pad.t+ph);ctx.stroke();ctx.beginPath();ctx.moveTo(pad.l,cy);ctx.lineTo(pad.l+pw,cy);ctx.stroke();ctx.setLineDash([]);
        ctx.beginPath();ctx.arc(cx,cy,6,0,Math.PI*2);ctx.fillStyle="#38bdf8";ctx.fill();ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fillStyle="#0c0e14";ctx.fill();
        ctx.fillStyle="#38bdf8";ctx.font=`bold 11px ${MONO}`;ctx.textAlign=cx>pad.l+pw/2?"right":"left";ctx.fillText(`${fmt(ckv,4)} V/(rad/s)`,cx+(cx>pad.l+pw/2?-12:12),cy-10);
        ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font=`10px ${MONO}`;ctx.textAlign="center";for(let i=0;i<=5;i++)ctx.fillText(fmt(0.1+(maxG-0.1)*i/5,0),pad.l+(i/5)*pw,pad.t+ph+16);ctx.fillText("Gear Ratio (G:1)",pad.l+pw/2,pad.t+ph+38);ctx.textAlign="right";for(let i=0;i<=4;i++)ctx.fillText(fmt(maxKv*i/4,3),pad.l-8,pad.t+ph-(i/4)*ph+3);ctx.save();ctx.translate(14,pad.t+ph/2);ctx.rotate(-Math.PI/2);ctx.textAlign="center";ctx.fillText("kV  V/(rad/s)",0,0);ctx.restore();
    },[m,currentG]);
    return <div ref={cRef} style={{width:"100%"}}><canvas ref={cvRef} style={{display:"block"}}/></div>;
}

// ─── kA vs J Chart ──────────────────────────────────────────────────────────
function KaJChart({motor,numMotors,G,currentJ}){
    const cvRef=useRef(null),cRef=useRef(null);
    const m=useMemo(()=>deriveMotorConstants(motor),[motor]);
    useChart(cRef,cvRef,220,(ctx,w,h)=>{
        const pad={t:20,r:20,b:48,l:64},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b;
        const Kt_n=m.Kt*numMotors,maxJ=Math.max(currentJ*2.5,0.01),maxKa=(m.R*maxJ)/(G*Kt_n)*1.15;
        drawGrid(ctx,pad,pw,ph,5,4);
        ctx.strokeStyle="#a855f7";ctx.lineWidth=2.5;ctx.beginPath();
        for(let i=0;i<=200;i++){const j=(i/200)*maxJ,ka=(m.R*j)/(G*Kt_n),x=pad.l+(i/200)*pw,y=pad.t+ph-(ka/maxKa)*ph;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
        const cka=(m.R*currentJ)/(G*Kt_n),cx=pad.l+(currentJ/maxJ)*pw,cy=pad.t+ph-(cka/maxKa)*ph;
        ctx.strokeStyle="rgba(168,85,247,0.3)";ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(cx,pad.t);ctx.lineTo(cx,pad.t+ph);ctx.stroke();ctx.beginPath();ctx.moveTo(pad.l,cy);ctx.lineTo(pad.l+pw,cy);ctx.stroke();ctx.setLineDash([]);
        ctx.beginPath();ctx.arc(cx,cy,6,0,Math.PI*2);ctx.fillStyle="#a855f7";ctx.fill();ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fillStyle="#0c0e14";ctx.fill();
        ctx.fillStyle="#a855f7";ctx.font=`bold 11px ${MONO}`;ctx.textAlign=cx>pad.l+pw/2?"right":"left";ctx.fillText(`${fmtSci(cka,4)} V/(rad/s²)`,cx+(cx>pad.l+pw/2?-12:12),cy-10);
        ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font=`10px ${MONO}`;ctx.textAlign="center";for(let i=0;i<=5;i++)ctx.fillText(fmtSci(maxJ*i/5,2),pad.l+(i/5)*pw,pad.t+ph+16);ctx.fillText("J  (kg·m²)",pad.l+pw/2,pad.t+ph+38);ctx.textAlign="right";for(let i=0;i<=4;i++)ctx.fillText(fmtSci(maxKa*i/4,3),pad.l-8,pad.t+ph-(i/4)*ph+3);ctx.save();ctx.translate(14,pad.t+ph/2);ctx.rotate(-Math.PI/2);ctx.textAlign="center";ctx.fillText("kA  V/(rad/s²)",0,0);ctx.restore();
    },[m,numMotors,G,currentJ]);
    return <div ref={cRef} style={{width:"100%"}}><canvas ref={cvRef} style={{display:"block"}}/></div>;
}

// ─── Position Step Response ─────────────────────────────────────────────────
function PosStepChart({kV,kA,kP,kD,dt}){
    const cvRef=useRef(null),cRef=useRef(null);
    useChart(cRef,cvRef,220,(ctx,w,h)=>{
        const pad={t:20,r:20,b:48,l:64},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b;
        if(kV<=0||kA<=0)return;
        const Ac=M.make(0,1,0,-1/kV),Bc=[0,1/kA];
        const{Ad,Bd}=discretizeAB(Ac,Bc,dt);
        const ref=1.0,steps=Math.ceil(2.0/dt),pos=[],vel=[];
        let x=[0,0];
        for(let i=0;i<=steps;i++){pos.push(x[0]);vel.push(x[1]);const u=Math.max(-12,Math.min(12,kP*(ref-x[0])+kD*(0-x[1])));x=[Ad[0]*x[0]+Ad[1]*x[1]+Bd[0]*u,Ad[2]*x[0]+Ad[3]*x[1]+Bd[1]*u];}
        const maxP=Math.max(1.4,...pos.map(Math.abs)),maxV=Math.max(1,...vel.map(v=>Math.abs(v))),maxY=maxP,tMax=steps*dt;
        drawGrid(ctx,pad,pw,ph,5,4);
        const ry=pad.t+ph-(ref/maxY)*ph;ctx.strokeStyle="rgba(255,255,255,0.15)";ctx.lineWidth=1;ctx.setLineDash([6,3]);ctx.beginPath();ctx.moveTo(pad.l,ry);ctx.lineTo(pad.l+pw,ry);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle="rgba(255,255,255,0.25)";ctx.font=`9px ${MONO}`;ctx.textAlign="right";ctx.fillText("ref",pad.l+pw-4,ry-4);
        ctx.strokeStyle="#38bdf8";ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=steps;i++){const px=pad.l+(i/steps)*pw,py=pad.t+ph-(pos[i]/maxY)*ph;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();
        const vs=maxP/maxV;ctx.strokeStyle="rgba(249,115,22,0.6)";ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.beginPath();for(let i=0;i<=steps;i++){const px=pad.l+(i/steps)*pw,py=pad.t+ph-(vel[i]*vs/maxY)*ph;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font=`10px ${MONO}`;ctx.textAlign="center";for(let i=0;i<=5;i++)ctx.fillText(fmt(tMax*i/5,2),pad.l+(i/5)*pw,pad.t+ph+16);ctx.fillText("Time (s)",pad.l+pw/2,pad.t+ph+38);ctx.textAlign="right";for(let i=0;i<=4;i++)ctx.fillText(fmt(maxY*i/4,2),pad.l-8,pad.t+ph-(i/4)*ph+3);ctx.save();ctx.translate(14,pad.t+ph/2);ctx.rotate(-Math.PI/2);ctx.textAlign="center";ctx.fillText("Position (rad)",0,0);ctx.restore();
        let ly=14;const lx=pad.l+8;ctx.font=`10px ${MONO}`;ctx.textAlign="left";[["#38bdf8","Position"],["rgba(249,115,22,0.8)","Velocity (scaled)"]].forEach(([c,t])=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(lx+4,ly,3,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(255,255,255,0.5)";ctx.fillText(t,lx+14,ly+3);ly+=16;});
    },[kV,kA,kP,kD,dt]);
    return <div ref={cRef} style={{width:"100%"}}><canvas ref={cvRef} style={{display:"block"}}/></div>;
}

// ─── Velocity Step Response ─────────────────────────────────────────────────
function VelStepChart({kV,kA,kP,dt}){
    const cvRef=useRef(null),cRef=useRef(null);
    useChart(cRef,cvRef,220,(ctx,w,h)=>{
        const pad={t:20,r:20,b:48,l:64},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b;
        if(kV<=0||kA<=0)return;
        const a_c=-1/kV,b_c=1/kA;
        const{ad,bd}=discretizeAB_1x1(a_c,b_c,dt);
        const ref=10.0,steps=Math.ceil(2.0/dt),data=[],uData=[];
        let v=0;
        for(let i=0;i<=steps;i++){data.push(v);const ff=kV*ref;const fb=kP*(ref-v);const u=Math.max(-12,Math.min(12,ff+fb));uData.push(u);v=ad*v+bd*u;}
        const maxV=Math.max(ref*1.4,...data.map(Math.abs)),tMax=steps*dt;
        drawGrid(ctx,pad,pw,ph,5,4);
        const ry=pad.t+ph-(ref/maxV)*ph;ctx.strokeStyle="rgba(255,255,255,0.15)";ctx.lineWidth=1;ctx.setLineDash([6,3]);ctx.beginPath();ctx.moveTo(pad.l,ry);ctx.lineTo(pad.l+pw,ry);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle="rgba(255,255,255,0.25)";ctx.font=`9px ${MONO}`;ctx.textAlign="right";ctx.fillText("ref",pad.l+pw-4,ry-4);
        ctx.strokeStyle="#10b981";ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=steps;i++){const px=pad.l+(i/steps)*pw,py=pad.t+ph-(data[i]/maxV)*ph;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();
        const maxU=Math.max(1,...uData.map(Math.abs)),us=maxV/maxU;ctx.strokeStyle="rgba(168,85,247,0.5)";ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.beginPath();for(let i=0;i<=steps;i++){const px=pad.l+(i/steps)*pw,py=pad.t+ph-(uData[i]*us/maxV)*ph;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font=`10px ${MONO}`;ctx.textAlign="center";for(let i=0;i<=5;i++)ctx.fillText(fmt(tMax*i/5,2),pad.l+(i/5)*pw,pad.t+ph+16);ctx.fillText("Time (s)",pad.l+pw/2,pad.t+ph+38);ctx.textAlign="right";for(let i=0;i<=4;i++)ctx.fillText(fmt(maxV*i/4,1),pad.l-8,pad.t+ph-(i/4)*ph+3);ctx.save();ctx.translate(14,pad.t+ph/2);ctx.rotate(-Math.PI/2);ctx.textAlign="center";ctx.fillText("Velocity (rad/s)",0,0);ctx.restore();
        let ly=14;const lx=pad.l+8;ctx.font=`10px ${MONO}`;ctx.textAlign="left";[["#10b981","Velocity"],["rgba(168,85,247,0.8)","Voltage (scaled)"]].forEach(([c,t])=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(lx+4,ly,3,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(255,255,255,0.5)";ctx.fillText(t,lx+14,ly+3);ly+=16;});
    },[kV,kA,kP,dt]);
    return <div ref={cRef} style={{width:"100%"}}><canvas ref={cvRef} style={{display:"block"}}/></div>;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════════════════════
export default function GearboxKvKaApp(){
    const[mode,setMode]=useState("forward");
    const[motorId,setMotorId]=useState("krakenX60FOC");
    const[numMotors,setNumMotors]=useState(1);
    const[gearingPreset,setGearingPreset]=useState(null);
    const[gearing,setGearing]=useState(6.75);
    const[J,setJ]=useState(0.001);
    const[kV_in,setKvIn]=useState(0.0108);
    const[kA_in,setKaIn]=useState(0.0015);
    const[chartTab,setChartTab]=useState("kv_gearing");

    // ── Shared LQR settings ──
    const[lqrKv,setLqrKv]=useState(0.0108);
    const[lqrKa,setLqrKa]=useState(0.0015);
    const[rEff,setReff]=useState(12.0);
    const[loopPeriod,setLoopPeriod]=useState(0.020);
    const[gainPresetId,setGainPresetId]=useState("talonFX");
    const[measDelay,setMeasDelay]=useState(0.025);
    const[lqrUseCalc,setLqrUseCalc]=useState(false);

    // ── Position feedback ──
    const[qPos,setQPos]=useState(0.02);
    const[qVelPos,setQVelPos]=useState(0.4);

    // ── Velocity feedback ──
    const[qVelOnly,setQVelOnly]=useState(0.4);

    // ── Active tab ──
    const[fbTab,setFbTab]=useState("position"); // "position" | "velocity"

    const motor=DC_MOTORS.find(m=>m.id===motorId);
    const derived=useMemo(()=>deriveMotorConstants(motor),[motor]);
    const fwd=useMemo(()=>forwardKvKa(motor,J,gearing,numMotors),[motor,J,gearing,numMotors]);
    const rev=useMemo(()=>reverseJ(motor,kV_in,kA_in,gearing,numMotors),[motor,kV_in,kA_in,gearing,numMotors]);
    const kV_display=mode==="forward"?fwd.kV:kV_in, kA_display=mode==="forward"?fwd.kA:kA_in;
    const kVDelta=mode==="reverse"?Math.abs(kV_in-rev.kV_theoretical):0;
    const kVMatch=kVDelta<0.0001,kVWarn=!kVMatch&&kVDelta<rev.kV_theoretical*0.1,kVBad=!kVMatch&&!kVWarn;

    const activeKv=lqrUseCalc?kV_display:lqrKv, activeKa=lqrUseCalc?kA_display:lqrKa;

    // ── Position LQR ──
    const posLqr=useMemo(()=>computePositionLQR(activeKv,activeKa,qPos,qVelPos,rEff,loopPeriod),[activeKv,activeKa,qPos,qVelPos,rEff,loopPeriod]);
    const posComp=useMemo(()=>{if(!posLqr.Ac||measDelay<=0)return null;const K=latencyCompPos(posLqr.Ac,posLqr.Bc,posLqr.K,measDelay);return{kP:K[0],kD:K[1]};},[posLqr,measDelay]);
    const posFinalKp=posComp?posComp.kP:posLqr.kP, posFinalKd=posComp?posComp.kD:posLqr.kD;

    // ── Velocity LQR ──
    const velLqr=useMemo(()=>computeVelocityLQR(activeKv,activeKa,qVelOnly,rEff,loopPeriod),[activeKv,activeKa,qVelOnly,rEff,loopPeriod]);
    const velFinalKp=useMemo(()=>{if(!velLqr.a_c||measDelay<=0)return velLqr.kP;return latencyCompVel(velLqr.a_c,velLqr.b_c,velLqr.kP,measDelay);},[velLqr,measDelay]);

    const applyGainPreset=(id)=>{setGainPresetId(id);const p=GAIN_PRESETS.find(g=>g.id===id);if(p&&id!=="custom"){setLoopPeriod(p.period);setMeasDelay(p.delay);}};

    return(
        <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0c0e14 0%,#111420 50%,#0c0e14 100%)",color:"#c8ced8",fontFamily:SANS}}>
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>

            <header style={{padding:"24px 24px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{display:"flex",alignItems:"baseline",gap:12}}>
                    <h1 style={{fontSize:20,fontWeight:700,letterSpacing:"-0.025em",color:"#38bdf8",margin:0}}>GearboxSim</h1>
                    <span style={{fontSize:12,opacity:0.3,fontFamily:MONO}}>kV / kA / LQR Calculator</span>
                </div>
                <p style={{fontSize:12,opacity:0.3,marginTop:4}}>WPILib 2026 · LinearSystemId · LQR Feedback Analysis</p>
            </header>

            <div style={{padding:"20px 24px"}}>
                {/* Mode */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                    <span style={{fontSize:11,fontWeight:600,opacity:0.5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Mode</span>
                    <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>setMode("forward")} style={ST.btn(mode==="forward")}>Forward → kV, kA</button>
                        <button onClick={()=>setMode("reverse")} style={ST.btn(mode==="reverse")}>Reverse → J</button>
                    </div>
                </div>

                {/* Motor & Gearing */}
                <div style={{...ST.cardSubtle,marginBottom:20}}>
                    <div style={ST.label}>Motor & Gearing</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16}}>
                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                            <label style={ST.fieldLabel}>DC Motor</label>
                            <select value={motorId} onChange={e=>setMotorId(e.target.value)} style={ST.select}>
                                {DC_MOTORS.map(m=><option key={m.id} value={m.id} style={{background:"#1a1d2e"}}>{m.label}</option>)}
                            </select>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                            <label style={ST.fieldLabel}>Motors (n)</label>
                            <div style={{display:"flex",gap:4}}>{[1,2,3,4].map(n=><button key={n} onClick={()=>setNumMotors(n)} style={{...ST.btn(numMotors===n),width:36,textAlign:"center",padding:"4px 0"}}>{n}</button>)}</div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                            <label style={ST.fieldLabel}>Gear Ratio (G)</label>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <select value={gearingPreset===null?"":gearingPreset} onChange={e=>{const v=e.target.value;if(v==="")setGearingPreset(null);else{const n=parseFloat(v);setGearingPreset(n);setGearing(n);}}} style={{...ST.select,width:88}}>
                                    {COMMON_GEARINGS.map(g=><option key={g.label} value={g.value===null?"":g.value} style={{background:"#1a1d2e"}}>{g.label}</option>)}
                                </select>
                                <input type="number" value={parseFloat(gearing.toFixed(4))} min={0.1} step={0.01} onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v)&&v>0){setGearing(v);setGearingPreset(null);}}} style={{...ST.inputSmall,width:64}}/>
                                <span style={ST.unit}>:1</span>
                            </div>
                        </div>
                    </div>
                    <div style={{marginTop:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                            <span style={{fontSize:10,opacity:0.4,fontFamily:MONO,textTransform:"uppercase",letterSpacing:"0.06em"}}>Per Motor</span>
                            <MotorSpecBar label="Stall τ" value={motor.stallTorque} max={10} color="#a855f7" unit="N·m"/>
                            <MotorSpecBar label="Free ω" value={motor.freeSpeed} max={20000} color="#3b82f6" unit="RPM"/>
                            <MotorSpecBar label="Stall I" value={motor.stallCurrent} max={500} color="#eab308" unit="A"/>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                            <span style={{fontSize:10,opacity:0.4,fontFamily:MONO,textTransform:"uppercase",letterSpacing:"0.06em"}}>Derived (×{numMotors})</span>
                            <MotorSpecBar label="R" value={derived.R} max={0.2} color="#f97316" unit="Ω"/>
                            <MotorSpecBar label="Kt" value={derived.Kt*numMotors} max={0.1} color="#10b981" unit="N·m/A" fmt={v=>fmtSci(v,4)}/>
                            <MotorSpecBar label="Kv" value={derived.Kv} max={800} color="#38bdf8" unit="rad/s/V" fmt={v=>fmt(v,2)}/>
                        </div>
                    </div>
                </div>

                {/* Mode inputs */}
                {mode==="forward"?(
                    <div style={{...ST.cardSubtle,marginBottom:20}}>
                        <div style={ST.label}>Forward: Physical → Feedforward</div>
                        <NumInput label="Moment of Inertia (J)" value={parseFloat(J.toPrecision(6))} onChange={v=>setJ(Math.max(1e-8,v))} unit="kg·m²" inputStyle={{width:120}} step={0.0001}/>
                    </div>
                ):(
                    <div style={{...ST.cardSubtle,marginBottom:20}}>
                        <div style={ST.label}>Reverse: SysId → Inertia</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}>
                            <NumInput label="kV (measured)" value={parseFloat(kV_in.toPrecision(6))} onChange={v=>setKvIn(Math.max(0,v))} unit="V/(rad/s)" inputStyle={{width:120}} step={0.0001}/>
                            <NumInput label="kA (measured)" value={parseFloat(kA_in.toPrecision(6))} onChange={v=>setKaIn(Math.max(1e-12,v))} unit="V/(rad/s²)" inputStyle={{width:120}} step={0.0001}/>
                        </div>
                    </div>
                )}

                {/* Results */}
                {mode==="forward"?(
                    <>
                        <div style={{borderRadius:8,padding:"16px 20px",marginBottom:12,background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.15)"}}>
                            <div style={{display:"flex",alignItems:"baseline",gap:16,flexWrap:"wrap"}}>
                                <div><span style={{fontSize:12,opacity:0.5,fontFamily:MONO}}>kV = </span><span style={{fontSize:24,fontWeight:700,fontFamily:MONO,color:"#38bdf8"}}>{fmtSci(fwd.kV,6)}</span><span style={{fontSize:13,opacity:0.4,fontFamily:MONO,marginLeft:6}}>V/(rad/s)</span></div>
                                <div><span style={{fontSize:12,opacity:0.5,fontFamily:MONO}}>kA = </span><span style={{fontSize:24,fontWeight:700,fontFamily:MONO,color:"#a855f7"}}>{fmtSci(fwd.kA,6)}</span><span style={{fontSize:13,opacity:0.4,fontFamily:MONO,marginLeft:6}}>V/(rad/s²)</span></div>
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"4px 24px",marginTop:12}}>
                                {[["kV = G / Kv_motor",`${fmt(gearing,4)} / ${fmt(derived.Kv,4)} = ${fmtSci(fwd.kV,6)}`],["kA = R·J / (G·n·Kt)",`${fmtSci(derived.R,4)}·${fmtSci(J,4)} / (${fmt(gearing,2)}·${numMotors}·${fmtSci(derived.Kt,4)}) = ${fmtSci(fwd.kA,6)}`],["Output free speed",`${fmt(motor.freeSpeed/gearing,1)} RPM`],["Output stall torque",`${fmt(motor.stallTorque*numMotors*gearing,2)} N·m`]].map(([l,v],i)=>(
                                    <div key={i} style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{fontSize:11,opacity:0.4,fontFamily:MONO}}>{l}:</span><span style={{fontSize:11,fontFamily:MONO,color:"#e2e8f0"}}>{v}</span></div>
                                ))}
                            </div>
                        </div>
                        <div style={{borderRadius:8,padding:"12px 16px",marginBottom:20,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)"}}>
                            <div style={{fontSize:10,opacity:0.4,fontFamily:MONO,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>WPILib Java</div>
                            <pre style={{fontFamily:MONO,fontSize:11,color:"rgba(255,255,255,0.6)",margin:0,overflowX:"auto",lineHeight:1.6}}>
{`var motor = DCMotor.get${motor.label.replace(/[^a-zA-Z0-9]/g,"")}(${numMotors});
var plant = LinearSystemId.createDCMotorSystem(motor, ${J}, ${gearing});
// ≡ createDCMotorSystem(${fmtSci(fwd.kV,6)}, ${fmtSci(fwd.kA,6)})`}
              </pre>
                        </div>
                    </>
                ):(
                    <>
                        <div style={{borderRadius:8,padding:"16px 20px",marginBottom:12,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.15)"}}>
                            <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
                                <span style={{fontSize:12,opacity:0.5,fontFamily:MONO}}>J_effective = </span>
                                <span style={{fontSize:24,fontWeight:700,fontFamily:MONO,color:"#10b981"}}>{fmtSci(rev.J,6)}</span>
                                <span style={{fontSize:13,opacity:0.4,fontFamily:MONO}}>kg·m²</span>
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"4px 24px",marginTop:12}}>
                                {[["J = kA·G·n·Kt / R",`${fmtSci(kA_in,4)}·${fmt(gearing,2)}·${numMotors}·${fmtSci(derived.Kt,4)} / ${fmtSci(derived.R,4)} = ${fmtSci(rev.J,6)}`],["kV (theoretical)",`${fmtSci(rev.kV_theoretical,6)}`],["kV (measured)",`${fmtSci(kV_in,6)}`],["kV delta",`${fmtSci(kVDelta,6)}`]].map(([l,v],i)=>(
                                    <div key={i} style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{fontSize:11,opacity:0.4,fontFamily:MONO}}>{l}:</span><span style={{fontSize:11,fontFamily:MONO,color:"#e2e8f0"}}>{v}</span></div>
                                ))}
                            </div>
                            <div style={{marginTop:10,fontSize:11,fontFamily:MONO,opacity:0.8,color:kVMatch?"#10b981":kVWarn?"#eab308":"#f43f5e"}}>
                                {kVMatch&&"✓ kV matches theoretical."}{kVWarn&&"△ kV close — possible friction/noise."}{kVBad&&"⚠ kV differs — check motor/gearing."}
                            </div>
                        </div>
                        <div style={{borderRadius:8,padding:"12px 16px",marginBottom:20,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)"}}>
                            <div style={{fontSize:10,opacity:0.4,fontFamily:MONO,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>WPILib Java</div>
                            <pre style={{fontFamily:MONO,fontSize:11,color:"rgba(255,255,255,0.6)",margin:0,overflowX:"auto",lineHeight:1.6}}>
{`var motor = DCMotor.get${motor.label.replace(/[^a-zA-Z0-9]/g,"")}(${numMotors});
double J = ${fmtSci(rev.J,6)};
var plant = LinearSystemId.createDCMotorSystem(motor, J, ${gearing});`}
              </pre>
                        </div>
                    </>
                )}

                {/* Charts */}
                <div style={{...ST.cardSubtle,marginBottom:20}}>
                    <div style={{display:"flex",gap:4,marginBottom:16}}>
                        {[{id:"kv_gearing",label:"kV vs Gearing"},{id:"ka_j",label:"kA vs J"}].map(t=><button key={t.id} onClick={()=>setChartTab(t.id)} style={ST.btn(chartTab===t.id)}>{t.label}</button>)}
                    </div>
                    {chartTab==="kv_gearing"&&<KvGearingChart motor={motor} numMotors={numMotors} currentG={gearing}/>}
                    {chartTab==="ka_j"&&<KaJChart motor={motor} numMotors={numMotors} G={gearing} currentJ={mode==="forward"?J:rev.J}/>}
                </div>

                {/* ═══════════════════════════════════════════════════════════════════
            LQR FEEDBACK ANALYSIS
            ═══════════════════════════════════════════════════════════════════ */}
                <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:20,marginTop:8}}>
                    <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:16}}>
                        <h2 style={{fontSize:18,fontWeight:700,letterSpacing:"-0.025em",color:"#f97316",margin:0}}>LQR Feedback Analysis</h2>
                    </div>

                    {/* Shared: kV/kA source */}
                    <div style={{...ST.cardSubtle,marginBottom:16}}>
                        <div style={ST.label}>Feedforward Constants</div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                            <span style={ST.fieldLabel}>Source</span>
                            <button onClick={()=>setLqrUseCalc(true)} style={ST.btn(lqrUseCalc)}>From Calculator</button>
                            <button onClick={()=>setLqrUseCalc(false)} style={ST.btn(!lqrUseCalc)}>Manual Entry</button>
                        </div>
                        {lqrUseCalc?(
                            <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
                                <div style={{display:"flex",alignItems:"baseline",gap:6}}><span style={{fontSize:12,opacity:0.4,fontFamily:MONO}}>kV:</span><span style={{fontSize:14,fontFamily:MONO,color:"#38bdf8"}}>{fmtSci(kV_display,6)}</span><span style={ST.unit}>V/(rad/s)</span></div>
                                <div style={{display:"flex",alignItems:"baseline",gap:6}}><span style={{fontSize:12,opacity:0.4,fontFamily:MONO}}>kA:</span><span style={{fontSize:14,fontFamily:MONO,color:"#a855f7"}}>{fmtSci(kA_display,6)}</span><span style={ST.unit}>V/(rad/s²)</span></div>
                            </div>
                        ):(
                            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                                <NumInput label="kV" value={parseFloat(lqrKv.toPrecision(6))} onChange={v=>setLqrKv(Math.max(1e-8,v))} unit="V/(rad/s)" inputStyle={{width:120}} step={0.0001}/>
                                <NumInput label="kA" value={parseFloat(lqrKa.toPrecision(6))} onChange={v=>setLqrKa(Math.max(1e-8,v))} unit="V/(rad/s²)" inputStyle={{width:120}} step={0.0001}/>
                            </div>
                        )}
                    </div>

                    {/* Shared: Gain Settings */}
                    <div style={{...ST.cardSubtle,marginBottom:20}}>
                        <div style={ST.label}>Gain Settings</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16}}>
                            <div style={{display:"flex",flexDirection:"column",gap:4}}>
                                <label style={ST.fieldLabel}>Controller Preset</label>
                                <select value={gainPresetId} onChange={e=>applyGainPreset(e.target.value)} style={ST.select}>
                                    {GAIN_PRESETS.map(p=><option key={p.id} value={p.id} style={{background:"#1a1d2e"}}>{p.label}</option>)}
                                </select>
                            </div>
                            <NumInput label="Loop Period (dt)" value={parseFloat(loopPeriod.toPrecision(4))} onChange={v=>{setLoopPeriod(Math.max(0.001,v));setGainPresetId("custom");}} unit="s" inputStyle={{width:80}} step={0.001}/>
                            <NumInput label="Measurement Delay" value={parseFloat(measDelay.toPrecision(4))} onChange={v=>{setMeasDelay(Math.max(0,v));setGainPresetId("custom");}} unit="s" inputStyle={{width:80}} step={0.001}/>
                            <NumInput label="Control Effort (rEff)" value={parseFloat(rEff.toPrecision(4))} onChange={v=>setReff(Math.max(0.01,v))} unit="V" inputStyle={{width:80}} step={0.5}/>
                        </div>
                    </div>

                    {/* ─── Tab Switcher ─── */}
                    <div style={{display:"flex",gap:6,marginBottom:20}}>
                        <button onClick={()=>setFbTab("position")} style={ST.btnColor(fbTab==="position","#f97316")}>
                            Position Feedback → kP, kD
                        </button>
                        <button onClick={()=>setFbTab("velocity")} style={ST.btnColor(fbTab==="velocity","#10b981")}>
                            Velocity Feedback → kP
                        </button>
                    </div>

                    {/* ═══════════════ POSITION FEEDBACK ═══════════════ */}
                    {fbTab==="position"&&(
                        <div>
                            <div style={{...ST.cardSubtle,marginBottom:16}}>
                                <div style={ST.label}>Position LQR Tolerances</div>
                                <div style={{fontSize:11,opacity:0.35,fontFamily:MONO,marginBottom:12}}>2-state: x = [position, velocity]ᵀ · Q = diag(1/qPos², 1/qVel²)</div>
                                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                                    <NumInput label="Max Position Error (qPos)" value={parseFloat(qPos.toPrecision(4))} onChange={v=>setQPos(Math.max(1e-6,v))} unit="rad" inputStyle={{width:96}} step={0.005}/>
                                    <NumInput label="Max Velocity Error (qVel)" value={parseFloat(qVelPos.toPrecision(4))} onChange={v=>setQVelPos(Math.max(1e-6,v))} unit="rad/s" inputStyle={{width:96}} step={0.05}/>
                                </div>
                            </div>

                            {/* Result */}
                            <div style={{borderRadius:8,padding:"16px 20px",marginBottom:16,background:posLqr.stable?"rgba(249,115,22,0.06)":"rgba(244,63,94,0.06)",border:posLqr.stable?"1px solid rgba(249,115,22,0.15)":"1px solid rgba(244,63,94,0.15)"}}>
                                <div style={{display:"flex",alignItems:"baseline",gap:16,flexWrap:"wrap"}}>
                                    <div><span style={{fontSize:12,opacity:0.5,fontFamily:MONO}}>kP = </span><span style={{fontSize:24,fontWeight:700,fontFamily:MONO,color:"#f97316"}}>{fmt(posFinalKp,4)}</span><span style={{fontSize:13,opacity:0.4,fontFamily:MONO,marginLeft:6}}>V/rad</span></div>
                                    <div><span style={{fontSize:12,opacity:0.5,fontFamily:MONO}}>kD = </span><span style={{fontSize:24,fontWeight:700,fontFamily:MONO,color:"#f97316"}}>{fmt(posFinalKd,4)}</span><span style={{fontSize:13,opacity:0.4,fontFamily:MONO,marginLeft:6}}>V/(rad/s)</span></div>
                                </div>
                                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"4px 24px",marginTop:12}}>
                                    {[
                                        ["kP (raw LQR)",`${fmt(posLqr.kP,6)} V/rad`],
                                        ["kD (raw LQR)",`${fmt(posLqr.kD,6)} V/(rad/s)`],
                                        ...(measDelay>0?[["kP (latency comp'd)",`${fmt(posFinalKp,6)}`],["kD (latency comp'd)",`${fmt(posFinalKd,6)}`]]:[]),
                                        ["CL eigenvalues",`${fmt(posLqr.eig1,4)}, ${fmt(posLqr.eig2,4)}`],
                                        ["Stable",posLqr.stable?"✓ |λ| < 1":"⚠ UNSTABLE"],
                                    ].map(([l,v],i)=>(
                                        <div key={i} style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{fontSize:11,opacity:0.4,fontFamily:MONO}}>{l}:</span><span style={{fontSize:11,fontFamily:MONO,color:"#e2e8f0"}}>{v}</span></div>
                                    ))}
                                </div>
                                {!posLqr.stable&&<div style={{marginTop:10,fontSize:11,fontFamily:MONO,color:"#f43f5e"}}>⚠ Unstable. Increase tolerances or reduce delay.</div>}
                            </div>

                            {/* Java */}
                            <div style={{borderRadius:8,padding:"12px 16px",marginBottom:16,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)"}}>
                                <div style={{fontSize:10,opacity:0.4,fontFamily:MONO,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>WPILib Java — Position Controller</div>
                                <pre style={{fontFamily:MONO,fontSize:11,color:"rgba(255,255,255,0.6)",margin:0,overflowX:"auto",lineHeight:1.6}}>
{`// 2-state position system: x = [pos, vel]ᵀ
var plant = LinearSystemId.createDCMotorSystem(${fmtSci(activeKv,6)}, ${fmtSci(activeKa,6)});
var controller = new LinearQuadraticRegulator<>(
    plant,
    VecBuilder.fill(${qPos}, ${qVelPos}),   // qelms: [pos rad, vel rad/s]
    VecBuilder.fill(${rEff}),                // relms: [voltage V]
    ${loopPeriod});${measDelay>0?`
controller.latencyCompensate(plant, ${loopPeriod}, ${measDelay});`:""}
// → kP = ${fmt(posFinalKp,4)},  kD = ${fmt(posFinalKd,4)}`}
                </pre>
                            </div>

                            {/* Step Response */}
                            <div style={{...ST.cardSubtle}}>
                                <div style={{fontSize:10,opacity:0.4,fontFamily:MONO,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>Position Step Response (1 rad)</div>
                                <PosStepChart kV={activeKv} kA={activeKa} kP={posFinalKp} kD={posFinalKd} dt={loopPeriod}/>
                                <div style={{marginTop:8,fontSize:10,opacity:0.3,fontFamily:MONO}}>Feedback only (no FF) · ±12V clamp · Blue = position · Orange = velocity (scaled)</div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════ VELOCITY FEEDBACK ═══════════════ */}
                    {fbTab==="velocity"&&(
                        <div>
                            <div style={{...ST.cardSubtle,marginBottom:16}}>
                                <div style={ST.label}>Velocity LQR Tolerance</div>
                                <div style={{fontSize:11,opacity:0.35,fontFamily:MONO,marginBottom:12}}>1-state: x = [velocity] · A = −1/kV · B = 1/kA · Q = 1/qVel²</div>
                                <NumInput label="Max Velocity Error (qVel)" value={parseFloat(qVelOnly.toPrecision(4))} onChange={v=>setQVelOnly(Math.max(1e-6,v))} unit="rad/s" inputStyle={{width:96}} step={0.1}/>
                            </div>

                            {/* Result */}
                            <div style={{borderRadius:8,padding:"16px 20px",marginBottom:16,background:velLqr.stable?"rgba(16,185,129,0.06)":"rgba(244,63,94,0.06)",border:velLqr.stable?"1px solid rgba(16,185,129,0.15)":"1px solid rgba(244,63,94,0.15)"}}>
                                <div style={{display:"flex",alignItems:"baseline",gap:16,flexWrap:"wrap"}}>
                                    <div><span style={{fontSize:12,opacity:0.5,fontFamily:MONO}}>kP = </span><span style={{fontSize:24,fontWeight:700,fontFamily:MONO,color:"#10b981"}}>{fmt(velFinalKp,4)}</span><span style={{fontSize:13,opacity:0.4,fontFamily:MONO,marginLeft:6}}>V/(rad/s)</span></div>
                                </div>
                                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"4px 24px",marginTop:12}}>
                                    {[
                                        ["kP (raw LQR)",`${fmt(velLqr.kP,6)} V/(rad/s)`],
                                        ...(measDelay>0?[["kP (latency comp'd)",`${fmt(velFinalKp,6)} V/(rad/s)`]]:[]),
                                        ["CL eigenvalue",`${fmt(velLqr.eig,4)}`],
                                        ["Stable",velLqr.stable?"✓ |λ| < 1":"⚠ UNSTABLE"],
                                    ].map(([l,v],i)=>(
                                        <div key={i} style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{fontSize:11,opacity:0.4,fontFamily:MONO}}>{l}:</span><span style={{fontSize:11,fontFamily:MONO,color:"#e2e8f0"}}>{v}</span></div>
                                    ))}
                                </div>
                                {!velLqr.stable&&<div style={{marginTop:10,fontSize:11,fontFamily:MONO,color:"#f43f5e"}}>⚠ Unstable. Increase tolerance or reduce delay.</div>}
                            </div>

                            {/* Java */}
                            <div style={{borderRadius:8,padding:"12px 16px",marginBottom:16,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)"}}>
                                <div style={{fontSize:10,opacity:0.4,fontFamily:MONO,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>WPILib Java — Velocity Controller</div>
                                <pre style={{fontFamily:MONO,fontSize:11,color:"rgba(255,255,255,0.6)",margin:0,overflowX:"auto",lineHeight:1.6}}>
{`// 1-state velocity system: x = [vel]
var plant = LinearSystemId.identifyVelocitySystem(${fmtSci(activeKv,6)}, ${fmtSci(activeKa,6)});
var controller = new LinearQuadraticRegulator<>(
    plant,
    VecBuilder.fill(${qVelOnly}),   // qelms: [vel rad/s]
    VecBuilder.fill(${rEff}),       // relms: [voltage V]
    ${loopPeriod});${measDelay>0?`
controller.latencyCompensate(plant, ${loopPeriod}, ${measDelay});`:""}
// → kP = ${fmt(velFinalKp,4)}`}
                </pre>
                            </div>

                            {/* Step Response */}
                            <div style={{...ST.cardSubtle}}>
                                <div style={{fontSize:10,opacity:0.4,fontFamily:MONO,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>Velocity Step Response (10 rad/s)</div>
                                <VelStepChart kV={activeKv} kA={activeKa} kP={velFinalKp} dt={loopPeriod}/>
                                <div style={{marginTop:8,fontSize:10,opacity:0.3,fontFamily:MONO}}>FF (kV·ref) + feedback (kP·error) · ±12V clamp · Green = velocity · Purple = voltage (scaled)</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Reference */}
                <div style={{...ST.cardSubtle,marginTop:20,border:"1px solid rgba(255,255,255,0.05)"}}>
                    <div style={ST.label}>State-Space & LQR Reference</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:6,fontSize:11.5,opacity:0.55,fontFamily:MONO}}>
                        <div style={{fontWeight:600,opacity:0.4,gridColumn:"1/-1",fontSize:10,marginTop:4}}>POSITION (2-state)</div>
                        <div>A = [[0, 1], [0, −kV⁻¹]]  B = [[0], [kA⁻¹]]</div>
                        <div>Q = diag(qPos⁻², qVel⁻²)  R = diag(rEff⁻²)</div>
                        <div>K = [kP, kD]  u = kP·Δpos + kD·Δvel</div>
                        <div style={{fontWeight:600,opacity:0.4,gridColumn:"1/-1",fontSize:10,marginTop:8}}>VELOCITY (1-state)</div>
                        <div>A = −kV⁻¹  B = kA⁻¹</div>
                        <div>Q = qVel⁻²  R = rEff⁻²</div>
                        <div>K = [kP]  u = kV·ω_ref + kP·Δvel</div>
                        <div style={{fontWeight:600,opacity:0.4,gridColumn:"1/-1",fontSize:10,marginTop:8}}>COMMON</div>
                        <div>DARE: AᵀSA − S − AᵀSB(BᵀSB+R)⁻¹BᵀSA + Q = 0</div>
                        <div>K = (BᵀSB + R)⁻¹ · BᵀSA</div>
                        <div>Latency: K_comp = K · e^((A−BK)·delay)</div>
                    </div>
                </div>
            </div>

            <footer style={{padding:"16px 24px",textAlign:"center"}}>
                <span style={{fontSize:12,opacity:0.2,fontFamily:MONO}}>GearboxSim — FRC Mechanism Design</span>
            </footer>
        </div>
    );
}