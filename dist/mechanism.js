'use strict';
// Independent design basis: topology and dimensions are engineering estimates.
const mechanismDefaults={angles:[-5,12,-7,0,0],L1:360,L2:300,z0:340,scope:'full',covers:false,details:true,axes:true,cables:true,load:true,mBase:76,mWaist:24,mUpper:25,mPayload:10,reach:250,payloadMode:'hands',leftShare:.5,loadOffset:80};
let mechanism={...mechanismDefaults,angles:[...mechanismDefaults.angles]};
let geometryMatrix=null;
let partGroup='all';
const mIdentity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
function mMul(a,b){return Array.from({length:16},(_,n)=>{const r=n>>2,c=n%4;return a[r*4]*b[c]+a[r*4+1]*b[c+4]+a[r*4+2]*b[c+8]+a[r*4+3]*b[c+12];});}
function mTrans(x,y,z){const m=mIdentity();m[3]=x;m[7]=y;m[11]=z;return m;}
function mRot(axis,degrees){const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return axis==='y'?[c,0,s,0,0,1,0,0,-s,0,c,0,0,0,0,1]:axis==='x'?[1,0,0,0,0,c,-s,0,0,s,c,0,0,0,0,1]:[c,-s,0,0,s,c,0,0,0,0,1,0,0,0,0,1];}
function mPoint(m,v){return [m[0]*v[0]+m[1]*v[1]+m[2]*v[2]+m[3],m[4]*v[0]+m[5]*v[1]+m[6]*v[2]+m[7],m[8]*v[0]+m[9]*v[1]+m[10]*v[2]+m[11]];}
function mVector(m,v){const p=mPoint(m,v);return[p[0]-m[3],p[1]-m[7],p[2]-m[11]];}
function withTransform(m,fn){const prev=geometryMatrix;geometryMatrix=prev?mMul(prev,m):m;try{fn();}finally{geometryMatrix=prev;}}
function waistFrames(){const q=mechanism.angles,baseYaw=typeof beltDesign!=='undefined'&&beltDesign.enabled,rz=baseYaw?mRot('z',q[4]):mIdentity(),root=mMul(mTrans(0,0,mechanism.z0),rz),a1=mMul(root,mRot('y',q[0])),j2=mMul(a1,mTrans(0,0,mechanism.L1)),a2=mMul(j2,mRot('y',q[1])),j3=mMul(a2,mTrans(0,0,mechanism.L2)),a3=mMul(j3,mRot('y',q[2])),j4=mMul(a3,mTrans(0,0,55)),a4=mMul(j4,mRot('x',q[3])),j5=baseYaw?mTrans(0,0,beltDesign.z):mMul(a4,mTrans(0,0,65)),a5=baseYaw?mMul(a4,mTrans(0,0,65)):mMul(j5,mRot('z',q[4])),tip=mMul(a5,mTrans(0,0,25));return{root,a1,j2,a2,j3,a3,j4,a4,j5,a5,tip,baseYaw};}

const waistDefinitions=[
 {id:'frame',num:'09',name:'포켓 프레임·가교',qty:1,status:'사진 반영 + 설계 치수',reason:'원본의 삼각 포켓·리브 형상을 개방형 가교 구조로 반영했습니다. 좌측 배터리 슬롯 체적과 겹치는 가교를 중앙부로 좁히고 트레이 아래 하중 경로로 변경했습니다.',note:'6061-T6 후보, 주 리브 t12 mm·상부 가교 t12 mm·상체 베이스 t20 mm. 재료·치수·볼트 수량은 설계 가정입니다.'},
 {id:'lower',num:'10',name:'하부 링크 L1',qty:1,status:'외관 반영 + 구조 추정',reason:'공식 사진의 길쭉한 하부 컬럼을 두 측판과 가로 리브로 구성한 박스형 링크로 상세화했습니다.',note:'축간 360 mm, 폭 130 mm, 깊이 110 mm, 측판 t10 mm 후보. 포켓·체결 패턴은 제작 검토안입니다.'},
 {id:'j2',num:'11',name:'J2 · 중간 피치 관절',qty:1,status:'외관 반영 + 축 추정',reason:'정면 사진의 중간 원통형 관절 위치를 반영했습니다. 좌우 지지 베어링과 출력 플랜지·브레이크 예약 공간을 배치했습니다.',note:'Y축 피치, 출력 플랜지 Ø130 / 축 구멍 Ø40 / 8×M8 PCD100 가정. 실제 감속기·축경·베어링 형식은 미확인입니다.'},
 {id:'link2',num:'12',name:'상부 양갈래 링크 L2',qty:1,status:'외관 반영 + 구조 추정',reason:'공식 정면과 제공된 3/4 사진의 양갈래 측면 형상을 반영한 두 측판 링크입니다.',note:'축간 300 mm, 외폭 190 mm, 깊이 125 mm, 측판 t10 mm 후보. 실측 전입니다.'},
 {id:'j3',num:'13',name:'J3 · 상단 피치 관절',qty:1,status:'5축 구성 가설',reason:'상체 자세를 유지하며 하부 두 링크를 접기 위한 상단 피치축을 배치했습니다.',note:'Y축 피치 가설. 사진의 커버 내부이므로 축 위치와 실제 전달계는 미확인입니다.'},
 {id:'j4',num:'14',name:'J4 · 허리 롤 관절',qty:1,status:'5축 구성 가설',reason:'공식 초기 사양의 허리 5자유도를 구현하기 위한 좌우 기울임 축입니다.',note:'국부 X축 롤 가설. 범위 ±25°는 웹 검토 범위이며 제조사 가동 범위가 아닙니다.'},
 {id:'j5',num:'15',name:'J5 · 요축 위치 비교 / 기초 벨트 가설',qty:1,status:'5축 구성 가설',reason:'기본안은 사진의 수평 벨트 해석에 따라 J5 요축을 기초로 이동합니다. 벨트안을 끄면 기존 상단 요축 가설로 비교합니다. 추가 자유도는 만들지 않습니다.',note:'국부 Z축 요 가설. Ø160 외경·Ø60 중공·8×M8 PCD130 가정. 실제 축 순서는 미확인입니다.'},
 {id:'harness',num:'16',name:'가동 하니스·서비스 공간',qty:1,status:'상세 설계 예약',reason:'하단 노출 배선과 중공 관절을 기준으로 전력·통신 케이블 경로와 굽힘 루프를 예약했습니다.',note:'뒤쪽 U자 여유 루프와 링크 안쪽 고정점을 표현했습니다. 굽힘 반경·케이블 규격은 제품 선정 후 확정합니다.'}
];
function waistCoordinates(){const f=waistFrames(),origin=m=>mPoint(m,[0,0,0]);return {
 j1:{positions:[origin(f.root)],size:'Y축 / 플랜지 Ø150 / 중공 Ø50 mm',desc:'하단 피치축 중심'},
 frame:{positions:[[0,0,187]],size:'리브 t12 / 가교 t12 / 상체 베이스 t20 mm',desc:'주 프레임 기준면'},
 lower:{positions:[mPoint(f.a1,[0,0,mechanism.L1/2])],size:`축간 ${mechanism.L1} / 110X × 130Y mm`,desc:'하부 링크 축간 중점'},
 j2:{positions:[origin(f.j2)],size:'Y축 / 플랜지 Ø130 / 중공 Ø40 mm',desc:'중간 피치축 중심'},
 link2:{positions:[mPoint(f.a2,[0,0,mechanism.L2/2])],size:`축간 ${mechanism.L2} / 125X × 190Y mm`,desc:'상부 링크 축간 중점'},
 j3:{positions:[origin(f.j3)],size:'Y축 / 플랜지 Ø120 mm',desc:'상단 피치축 중심'},
 j4:{positions:[origin(f.j4)],size:'국부 X축 / 외경 Ø100 mm',desc:'롤축 중심'},
 j5:{positions:[origin(f.j5)],size:f.baseYaw?'기초 Z 요 / 벨트 출력·축 지지 예약':'국부 Z 요 / 상단 플랜지 후보',desc:'요축 위치 가설'},
 harness:{positions:[mPoint(f.a1,[-65,0,mechanism.L1/2])],size:'가동 루프·중공 경로 예약',desc:'하부 링크 하니스 기준점'}
};}
function annulus(c,ro,ri,h,axis,color,id,n=20){const ring=(r,t)=>Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2,u=r*Math.cos(a),v=r*Math.sin(a);return axis==='y'?[c[0]+u,c[1]+t,c[2]+v]:axis==='x'?[c[0]+t,c[1]+u,c[2]+v]:[c[0]+u,c[1]+v,c[2]+t];});const a=ring(ro,-h/2),b=ring(ro,h/2),d=ring(ri,-h/2),e=ring(ri,h/2);for(let i=0;i<n;i++){const j=(i+1)%n;polygon([a[i],a[j],b[j],b[i]],color,id,.85);polygon([d[j],d[i],e[i],e[j]],color,id,.52);polygon([b[i],b[j],e[j],e[i]],color,id,1.06);polygon([a[j],a[i],d[i],d[j]],color,id,.7);}}
function bolt(p,axis,id,size=8){cylinder(p,size*.8,3,axis,'#9ba89b',id,8);cylinder(p,size*.65,5,axis,'#405249',id,6);}
function boltCircle(c,r,axis,id,count=8,size=8){for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const p=axis==='y'?[c[0]+r*Math.cos(a),c[1],c[2]+r*Math.sin(a)]:axis==='x'?[c[0],c[1]+r*Math.cos(a),c[2]+r*Math.sin(a)]:[c[0]+r*Math.cos(a),c[1]+r*Math.sin(a),c[2]];bolt(p,axis,id,size);}}
function beamBetween(a,b,width,depth,color,id){const d=b.map((n,i)=>n-a[i]),len=Math.hypot(...d);if(len<.001)return;const z=d.map(n=>n/len),seed=Math.abs(z[2])<.95?[0,0,1]:[0,1,0],cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],cx=cross(seed,z),n=Math.hypot(...cx),x=cx.map(v=>v/n),y=cross(z,x),m=[x[0],y[0],z[0],a[0],x[1],y[1],z[1],a[1],x[2],y[2],z[2],a[2],0,0,0,1];withTransform(m,()=>box([0,0,len/2],[width,depth,len],color,id));}
function buildChassisDetail(){
 const L=params.L,W=params.W,c=coordinates(),bx=c.battery.positions[0][0],metal='#c7d2c2';
 for(const sign of[-1,1]){box([0,sign*(W/2-58),187],[L-60,34,12],metal,'frame');for(const x of[-L/2+55,-80,90,L/2-55])bolt([x,sign*(W/2-58),195],'z','frame');}
 box([L/2-40,0,187],[30,W-95,12],metal,'frame');box([-L/2+32,0,101],[24,W-95,12],metal,'frame');
 for(const y of[-98,98]){beamBetween([-100,y,187],[L/2-65,y*.55,187],18,12,metal,'frame');beamBetween([-70,y,187],[190,-y*.65,187],16,12,metal,'frame');}
 box([30,0,222],[30,220,12],metal,'frame');box([-100,0,240],[20,220,12],metal,'frame');
 withTransform(typeof beltDesign!=='undefined'&&beltDesign.enabled?mRot('z',mechanism.angles[4]):mIdentity(),()=>{if(typeof beltDesign!=='undefined'&&beltDesign.enabled&&beltDesign.revisedMount){annulus([0,0,250],100,60,20,'z','#acbda7','j1',48);boltCircle([0,0,263],85,'z','j1',4,10);}else{box([0,0,250],[240,220,20],'#acbda7','j1');for(const x of[-90,90])for(const y of[-80,80])bolt([x,y,263],'z','j1',10);}});
 // Side bay shelves attach below the battery volume to the central crossmembers.
 for(const x of[-170,30])box([x,0,160],[16,426,6],metal,'frame');
}
function pitchActuator(r,width,id){const inner=id==='j1'?25:id==='j2'?20:18,pcd=id==='j1'?60:id==='j2'?50:45;annulus([0,0,0],r*.78,inner,width,'y','#47584e',id,20);for(const side of[-1,1]){annulus([0,side*(width/2+6),0],r,inner,12,'y','#c2cabb',id);if(mechanism.details)boltCircle([0,side*(width/2+14),0],pcd,'y',id,8,6);}annulus([0,-width/2-22,0],r*.7,inner,22,'y','#6e8572',id);}
function ladderLink(length,halfWidth,depth,id){const metal='#cdd6c6';for(const side of[-1,1]){for(const x of[-depth/2+9,depth/2-9])box([x,side*halfWidth,length/2],[18,10,length-60],metal,id);for(const z of[40,length*.36,length*.68,length-40]){box([0,side*halfWidth,z],[depth,10,14],metal,id);if(mechanism.details)for(const x of[-depth*.3,depth*.3])bolt([x,side*(halfWidth+7),z],'y',id,6);}}for(const z of[40,length-40])box([0,0,z],[depth-20,halfWidth*2,12],'#a9baa2',id);if(mechanism.covers)box([0,0,length/2],[depth+10,halfWidth*2+26,length-78],'#eceee3',id,.35);}
function buildWaist(){const f=waistFrames(),L1=mechanism.L1,L2=mechanism.L2;
 withTransform(f.root,()=>{for(const side of[-1,1])box([0,side*91,-42],[typeof beltDesign!=='undefined'&&beltDesign.enabled&&beltDesign.revisedMount?140:150,14,142],'#657b66','j1');pitchActuator(75,150,'j1');});
 withTransform(f.a1,()=>ladderLink(L1,60,105,'lower'));
 withTransform(f.j2,()=>pitchActuator(65,150,'j2'));
 withTransform(f.a2,()=>ladderLink(L2,88,120,'link2'));
 withTransform(f.j3,()=>pitchActuator(60,150,'j3'));
 withTransform(f.a3,()=>box([0,0,29],[85,105,46],'#9caf93','j3'));
 withTransform(f.j4,()=>{annulus([0,0,0],50,18,88,'x','#8ba080','j4');if(mechanism.details)boltCircle([-47,0,0],37,'x','j4',6,6);});
 withTransform(f.a4,()=>box([0,0,33],[88,100,42],'#a6b99d','j4'));
 if(!f.baseYaw)withTransform(f.j5,()=>{annulus([0,0,0],80,30,32,'z','#92aa83','j5');annulus([0,0,24],85,30,12,'z','#d4ddcc','j5');if(mechanism.details)boltCircle([0,0,34],65,'z','j5',8,8);});
 if(f.baseYaw)withTransform(f.a4,()=>{box([0,0,57],[75,90,66],'#a6b99d','j4');annulus([0,0,90],70,30,12,'z','#d4ddcc','j4');});
 if(mechanism.cables){for(const m of[f.a1,f.a2])withTransform(m,()=>{const len=m===f.a1?L1:L2,pts=[[-60,0,30],[-76,0,60],[-73,0,len-60],[-58,0,len-25]];for(let i=0;i<pts.length-1;i++)beamBetween(pts[i],pts[i+1],7,7,'#598f8a','harness');for(const z of[75,len-75])box([-72,0,z],[8,25,10],'#aab7a1','harness');const loop=[[-60,0,30],[-90,0,15],[-98,0,-12],[-83,0,-30],[-62,0,-15]];for(let i=0;i<loop.length-1;i++)beamBetween(loop[i],loop[i+1],6,6,'#598f8a','harness');});}
}
function massAnalysis(){const f=waistFrames(),w=mechanism,base=baseMassProperties(),entries=[{m:base.mass,p:base.cg,desc:'AMR'}, {m:w.mWaist*.42,p:mPoint(f.a1,[0,0,w.L1/2]),desc:'L1'}, {m:w.mWaist*.33,p:mPoint(f.a2,[0,0,w.L2/2]),desc:'L2'}, {m:w.mWaist*.25,p:mPoint(f.a3,[0,0,60]),desc:'허리 상단'}, {m:w.mUpper,p:typeof upperMassCenter==='function'?upperMassCenter(f.tip):mPoint(f.tip,[0,0,250]),desc:'상체 등가질량'}, ...payloadEntries(f.tip)],total=entries.reduce((s,e)=>s+e.m,0),cg=[0,1,2].map(i=>entries.reduce((s,e)=>s+e.m*e.p[i],0)/total),p0=m=>mPoint(m,[0,0,0]),jointSpecs=[['J1',p0(f.root),mVector(f.root,[0,1,0]),1],['J2',p0(f.j2),mVector(f.root,[0,1,0]),2],['J3',p0(f.j3),mVector(f.root,[0,1,0]),3],['J4',p0(f.j4),mVector(f.a3,[1,0,0]),3],['J5',p0(f.j5),f.baseYaw?[0,0,1]:mVector(f.a4,[0,0,1]),f.baseYaw?1:4]],torques=jointSpecs.map(([name,p,axis,skip])=>({name,gravity:entries.slice(skip).reduce((sum,e)=>{const r=e.p.map((n,i)=>(n-p[i])/1000),force=-e.m*9.81,cross=[r[1]*force,-r[0]*force,0];return sum+cross.reduce((s,n,i)=>s+n*axis[i],0);},0)}));
 const c=coordinates(),points=[...c.drive.positions,...c.caster.positions,...c.rear.positions].map(p=>p.slice(0,2)),hull=convexHull(points),margin=Math.min(...hull.map((a,i)=>{const b=hull[(i+1)%hull.length],dx=b[0]-a[0],dy=b[1]-a[1];return (dx*(cg[1]-a[1])-dy*(cg[0]-a[0]))/Math.hypot(dx,dy);}));return{entries,total,cg,torques,hull,margin};
}
function convexHull(points){const p=points.map(v=>[...v]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),lower=[],upper=[];for(const v of p){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),v)<=0)lower.pop();lower.push(v);}for(const v of [...p].reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),v)<=0)upper.pop();upper.push(v);}return lower.slice(0,-1).concat(upper.slice(0,-1));}
function scopeIncludes(id){if(mechanism.scope==='hand')return handIds.includes(id);const up=typeof upperIds!=='undefined'&&upperIds.includes(id),waist=['j1','lower','j2','link2','j3','j4','j5','harness','belt'].includes(id);return mechanism.scope==='full'||(mechanism.scope==='upper'?up:mechanism.scope==='waist'?waist:!up&&!['lower','j2','link2','j3','j4','j5','harness'].includes(id));}
function matchesPartGroup(id){if(partGroup==='hand')return handIds.includes(id);const up=typeof upperIds!=='undefined'&&upperIds.includes(id),waist=['j1','lower','j2','link2','j3','j4','j5','harness','belt'].includes(id);return partGroup==='all'||(partGroup==='upper'?up:partGroup==='waist'?waist:!up&&!['lower','j2','link2','j3','j4','j5','harness'].includes(id));}
