'use strict';
// Public FRIDAY architecture: hydraulic flexion + spring extension + palm electric spreading.
// Dimensions, pin geometry, axis allocation and remote displacement source below are our design proposal.
const handJointNames=['엄지 대립','엄지 벌림','엄지 MCP','엄지 IP'];
const digitNames=['엄지','검지','중지','약지','소지'];
const handDefaults={q:[[15,-25,20,15],[-5,25,35,25],[-2,25,35,25],[3,25,35,25],[7,25,35,25]],finger:1,cover:true,section:false,ports:true,load:20,bore:[6,5.5,4],outer:[9,8,7],rod:2,masterBore:10,pressureLimit:8,lineID:1.5,lineOD:3,lineLength:1,viscosity:.03,density:850,bulk:800,closeTime:.6,sealForce:1.5,efficiency:.9,springPreload:.035,springRate:.00006,screwLead:1,screwEfficiency:.75,driveJoint:0};
function freshHand(){return{...handDefaults,q:handDefaults.q.map(q=>[...q]),bore:[...handDefaults.bore],outer:[...handDefaults.outer]};}
let handState=freshHand();
const fingerLengths=[[30,24],[38,25,18],[42,27,19],[39,25,18],[31,21,16]];
const fingerLimits=[85,95,80];
const pinGeometry=[{d:18,b:20,r:8,l:4,stroke:12},{d:15,b:17,r:6,l:3,stroke:10},{d:12,b:14,r:5,l:2,stroke:7}];
const handIds=['hands','fingerHydraulic','palmMotor','tactile'];
const handExtraDefinitions=[
 {id:'fingerHydraulic',num:'26',name:'손등 단동 실린더·복귀 스프링',qty:28,status:'단동·스프링 공식 / 치수·수량 가설',reason:'제조사는 유압으로 굽히고 스프링으로 펴며 작은 실린더를 손등에 배치한다고 설명합니다. 손가락 굽힘에 실린더·핀·크랭크와 복귀 스프링을 구성했습니다. 추가 사진의 중앙 코일·양측 지지·분절 접촉 패드를 반영했습니다.',note:'손당 14개는 20축을 배분한 설계안입니다. Ø6/5.5/4 보어, 크랭크·씰·스프링·스트로크는 실측값이 아닙니다.'},
 {id:'palmMotor',num:'27',name:'손바닥 벌림·대립 모터 공간',qty:12,status:'팜 모터 공식 / 6축 배분 가설',reason:'벌림·모음은 손바닥에 둔 소형 모터로 양방향 구동합니다. 네 손가락 벌림과 엄지 대립·벌림의 6축을 후보 배분했습니다.',note:'14유압+6전동=20축은 제안 토폴로지이며 제조사가 공개한 채널별 배분이 아닙니다. 모터·감속기·치형은 선정 전입니다.'},
 {id:'tactile',num:'28',name:'손바닥·각 마디 안쪽 촉각 면',qty:2,status:'접촉 면 공식 / 형상 예약',reason:'손바닥부터 손가락 각 마디 안쪽까지 센싱 면을 비워두는 공개 설계 원칙을 반영했습니다. 실린더·모터와 배관은 손등 쪽에 예약합니다.',note:'패드 두께·분할·기판·신호선은 가정입니다. 촉각 센서 내부 구조·회로·제조 공정은 재현하지 않습니다.'}
];
function fingerFrames(finger=1,side=1,q=handState.q[finger]){
 const ys=[0,-26,-9,9,26];let m=finger===0?mMul(mTrans(0,-side*43,-38),mMul(mRot('x',-side*48),mMul(mRot('z',q[0]*side),mRot('x',q[1]*side)))):mMul(mTrans(0,ys[finger]*side,-80),mRot('x',q[0]*side));
 const root=m,angles=finger===0?q.slice(2):q.slice(1),before=[],after=[],lengths=fingerLengths[finger];
 for(let j=0;j<angles.length;j++){before.push(m);m=mMul(m,mRot('y',-angles[j]));after.push(m);m=mMul(m,mTrans(0,0,-lengths[j]));}
 return{root,before,after,angles,lengths,tip:m,side,finger};
}
function fingerCylinder(angle,j){const p=pinGeometry[j],a=[-p.d,0,p.b],b=mPoint(mRot('y',-angle),[-p.r,0,-p.l]),v=b.map((n,i)=>n-a[i]),length=Math.hypot(...v),initial=Math.hypot(p.d-p.r,p.b+p.l),db=[-b[2],0,b[0]],lever=v.reduce((s,n,i)=>s+n*db[i],0)/length;return{a,b,length,initial,bodyLength:initial-3,packingMargin:initial-3-p.stroke-6,stroke:length-initial,lever,capacity:p.stroke};}
function inverseFingerStroke(stroke,j,maxAngle=fingerLimits[j]){let lo=0,hi=maxAngle;const max=fingerCylinder(hi,j).stroke,target=Math.max(0,Math.min(stroke,max));for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(fingerCylinder(mid,j).stroke<target)lo=mid;else hi=mid;}return(lo+hi)/2;}
const cross3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot3=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
function lineResistance(){return 128*handState.viscosity*handState.lineLength/(Math.PI*(handState.lineID/1000)**4);}
function fingerReturnTime(angle,j){const h=handState,A=Math.PI*(h.bore[j]/1000)**2/4,R=lineResistance(),steps=80,dq=angle*Math.PI/180/steps;let total=0;for(let k=0;k<steps;k++){const q=(k+.5)*angle/steps,c=fingerCylinder(q,j),spring=h.springPreload+h.springRate*q,force=spring*h.efficiency/(c.lever/1000)-h.sealForce;if(force<=0)return Infinity;const p=force/A;total+=R*A*(c.lever/1000)/p*dq;}return total;}
function handFingerAnalysis(finger=handState.finger){
 const h=handState,f=fingerFrames(finger),tip=mPoint(f.tip,[0,0,0]),normal=mVector(f.after.at(-1),[1,0,0]),force=normal.map(n=>-n*h.load),Am=Math.PI*h.masterBore**2/4,R=lineResistance(),lineVolume=Math.PI*h.lineID**2/4*h.lineLength*1000;
 const rows=f.before.map((m,j)=>{const p=mPoint(m,[0,0,0]),axis=mVector(m,[0,-1,0]),r=tip.map((n,i)=>(n-p[i])/1000),torquePerN=-dot3(cross3(r,normal.map(n=>-n)),axis),loadTorque=torquePerN*h.load,c=fingerCylinder(f.angles[j],j),spring=h.springPreload+h.springRate*f.angles[j],A=Math.PI*h.bore[j]**2/4,required=(loadTorque+spring)/(c.lever/1000*h.efficiency)+h.sealForce,pressure=Math.max(0,required/A),volume=A*c.stroke,flow=volume/h.closeTime,loss=R*flow*1e-9/1e6,supply=pressure+loss,compression=lineVolume*supply/h.bulk,masterIdeal=volume/Am,masterReal=(volume+compression)/Am,masterForce=supply*Am,motorTorque=masterForce*h.screwLead/1000/(2*Math.PI*h.screwEfficiency),maxLoad=torquePerN>1e-8?(((h.pressureLimit-loss)*A-h.sealForce)*c.lever/1000*h.efficiency-spring)/torquePerN:Infinity,speed=flow*1e-9/(Math.PI*(h.lineID/1000)**2/4),re=h.density*speed*h.lineID/1000/h.viscosity;
  return{joint:j,angle:f.angles[j],...c,area:A,torquePerN,loadTorque,spring,requiredForce:required,pressure,supply,loss,volume,flow,compression,masterIdeal,masterReal,masterForce,motorTorque,re,maxLoad,returnTime:fingerReturnTime(f.angles[j],j),unilateral:required>=0,within:supply<=h.pressureLimit&&required>=0&&c.stroke<=c.capacity&&c.lever>.5&&c.packingMargin>=1};});
 const finite=rows.map(r=>r.maxLoad).filter(Number.isFinite),capacity=finite.length?Math.max(0,Math.min(...finite)):null;return{finger,tip,normal,force,rows,capacity,allWithin:rows.every(r=>r.within&&Number.isFinite(r.returnTime)),bundleDiameter:Math.sqrt(14*handState.lineOD**2/.65),lineVolume,proposedHydraulicAxes:14,proposedElectricAxes:6};
}
function handMassBudget(){const rows=[['손바닥 프레임',80],['손가락 링크·핀',150],['단동 실린더 14 × 5 g',70],['팜 모터·전달부 6 × 12 g',72],['촉각 면·전장',65],['유체·호스·커넥터',25],['커버·체결재',38]];return{rows,total:rows.reduce((s,r)=>s+r[1],0),status:'allocation budget, not CAD mass or selected hardware'};}
function applyHandGrip(value){for(let f=0;f<5;f++)for(let j=f===0?2:1;j<4;j++)handState.q[f][j]=(f===0?[0,0,65,75][j]:fingerLimits[j-1])*value;}
function handCoordinates(){const tip=upperFrames().left.tool,f=fingerFrames(handState.finger);return{fingerHydraulic:{positions:[mPoint(tip,mPoint(f.before[0],[-12,0,5]))],size:'손등 단동 / 보어 Ø6·5.5·4 mm 후보',desc:'좌측 선택 손가락 구동부'},palmMotor:{positions:[mPoint(tip,[-11,0,-60])],size:'손당 6축 공간 가설 / 모터 형식 미선정',desc:'팜 등쪽 전동 구동 공간'},tactile:{positions:[mPoint(tip,[15,0,-43])],size:'손바닥 + 각 마디 안쪽 예약 면',desc:'좌측 손바닥 접촉 면'}};}

function handCylinderDetail(angle,j){const c=fingerCylinder(angle,j),body=c.initial-3,pistonClosed=body-c.capacity-3,piston=pistonClosed+c.stroke;return{body,pistonClosed,piston,pistonThickness:2,pistonToGuide:body-1-(piston+1),rodLength:c.length-piston,wall:(handState.outer[j]-handState.bore[j])/2,hoopAtPressureLimit:handState.pressureLimit*(handState.outer[j]**2+handState.bore[j]**2)/(handState.outer[j]**2-handState.bore[j]**2),rodStress:handFingerAnalysis().rows[j]?.requiredForce/(Math.PI*handState.rod**2/4),status:'piston/guide/seal dimensions proposed; no selected seal or fatigue qualification'};}
function handDetailExport(){return{source:'https://holiday-robotics.com/ko/blog/hands-we-left-behind',architecture:'hydraulic flexion; spring return; palm electric abduction',allocation:'14H+6E candidate only; photographs span different generations',cylinders:handFingerAnalysis().rows.map((r,j)=>handCylinderDetail(r.angle,j)),spring:'central torsion-coil envelope and two moving legs; equivalent torque law is independent of drawn coil geometry',interfaces:{pinDiameter_mm:3,bushingLength_mm:3,pinSupportSpan_mm:14,proposedDiametralClearance_mm:[.01,.04],tactilePadThickness_mm:3,outerTubeDiameter_mm:handState.lineOD,minimumBendRadius_mm:15},validation:'seal friction, leakage, burst pressure, fatigue, bearing wear, tactile stack and hose life require selected parts and physical tests'};}
