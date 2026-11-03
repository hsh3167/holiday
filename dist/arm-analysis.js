'use strict';
// Engineering assumptions, independent of manufacturer hardware/ratings.
const armNames=['어깨 피치','어깨 롤','상완 회전','팔꿈치','전완 회전','손목 피치','손목 롤'];
const armAxes=['y','x','z','y','z','y','x'];
const armRanges=[[-120,80],[-140,140],[-150,150],[-135,40],[-160,160],[-100,100],[-90,90]];
const actuatorDefaults={factor:1.5,efficiency:.75,ratios:[80,80,60,80,60,50,50]};
let actuators={...actuatorDefaults,ratios:[...actuatorDefaults.ratios]};
const armMassFractions=[.16,.14,.25,.15,.20,.06,.04];
function armMassEntries(a,side){
 const points=[[0,0,0],[0,0,0],[0,0,-117.5],[0,0,-25],[0,0,-95],[0,0,-15],[0,0,-17.5]];
 const entries=points.map((p,joint)=>({m:mechanism.mUpper*.22*armMassFractions[joint],p:mPoint(a.after[joint],p),side,joint,desc:(side>0?'좌':'우')+' A'+(joint+1)}));
 entries.push({m:mechanism.mUpper*.02,p:mPoint(a.tool,[0,0,-43]),side,joint:7,desc:(side>0?'좌':'우')+' 손'});
 return entries;
}
function upperMassParts(tip){const f=upperFrames(tip);return[{m:mechanism.mUpper*.432,p:mPoint(tip,[0,0,205]),desc:'흉부'}, {m:mechanism.mUpper*.088,p:mPoint(f.head,[0,0,105]),desc:'머리'},...armMassEntries(f.left,1),...armMassEntries(f.right,-1)];}
function payloadEntries(tip=waistFrames().tip){
 if(mechanism.payloadMode==='equivalent')return[{m:mechanism.mPayload,p:mPoint(tip,[mechanism.reach,0,150]),desc:'허리 기준 등가 적재',side:0}];
 const f=upperFrames(tip);return[[1,f.left,mechanism.leftShare],[-1,f.right,1-mechanism.leftShare]].map(([side,a,share])=>({m:mechanism.mPayload*share,p:mPoint(a.tool,[0,0,-mechanism.loadOffset]),side,desc:(side>0?'좌':'우')+' 손 적재'}));
}
function gravityMoment(entries,origin,axis){return entries.reduce((sum,e)=>{const r=e.p.map((v,i)=>(v-origin[i])/1000);return sum+e.m*9.81*(r[0]*axis[1]-r[1]*axis[0]);},0);}
function armLoadAnalysis(tip=waistFrames().tip){
 const f=upperFrames(tip),payload=payloadEntries(tip);return[[1,f.left],[-1,f.right]].map(([side,a])=>{
  const body=armMassEntries(a,side),load=payload.filter(e=>e.side===side),rows=a.before.map((matrix,i)=>{
   const origin=mPoint(matrix,[0,0,0]),unit=armAxes[i]==='x'?[1,0,0]:armAxes[i]==='y'?[0,1,0]:[0,0,1],axis=mVector(matrix,unit),self=gravityMoment(body.filter(e=>e.joint>=i),origin,axis),external=gravityMoment(load,origin,axis),gravity=self+external,output=Math.abs(gravity)*actuators.factor;
   return{side,joint:i,name:armNames[i],origin,axis,self,payload:external,gravity,output,ratio:actuators.ratios[i],motor:output/(actuators.ratios[i]*actuators.efficiency)};
  });
  const root=mPoint(a.root,[0,0,0]),entries=[...body,...load],force=entries.reduce((s,e)=>s+e.m*9.81,0),reactionMoment=[0,0,0];
  for(const e of entries){const r=e.p.map((v,i)=>(v-root[i])/1000);reactionMoment[0]-=r[1]*e.m*9.81;reactionMoment[1]+=r[0]*e.m*9.81;}
  return{side,rows,bodyMass:body.reduce((s,e)=>s+e.m,0),payloadMass:load.reduce((s,e)=>s+e.m,0),force,moment:reactionMoment,momentMagnitude:Math.hypot(...reactionMoment)};
 });
}
let localWorkspaceCache;
function workspaceSamples(){
 if(!localWorkspaceCache){const halton=(n,b)=>{let f=1,r=0;while(n){f/=b;r+=f*(n%b);n=Math.floor(n/b);}return r;},primes=[2,3,5,7,11,13,17];
  localWorkspaceCache=[1,-1].map(side=>({side,points:Array.from({length:480},(_,n)=>{const q=armRanges.map(([lo,hi],j)=>lo+(hi-lo)*halton(n+1,primes[j]));return mPoint(armFrames(mIdentity(),side,q).tool,[0,0,0]);})}));
 }
 const tip=waistFrames().tip;return localWorkspaceCache.map(a=>({...a,points:a.points.map(p=>mPoint(tip,p))}));
}
