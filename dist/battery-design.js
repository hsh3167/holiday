'use strict';
// Left side is +Y in the base frame. The second pack's mirrored location is provisional.
const batteryDefaults={x:-70,y:165,z:240,size:[230,80,150],massEach:4,installed:[true,true],lift:0,service:false};
let batteryDesign={...batteryDefaults,size:[...batteryDefaults.size],installed:[...batteryDefaults.installed]};
const batteryExtraDefinitions=[{id:'battery2',num:'24',name:'두 번째 팩·우측 슬롯 가설',qty:1,status:'2팩 수량 공식 · 위치 가설',reason:'제조사 공식 게시물은 두 팩 중 하나를 교체해도 다른 팩으로 작동을 유지한다고 설명합니다. 두 번째 슬롯은 패키징 검토를 위해 우측 대칭 위치에 반투명으로 예약했습니다.',note:'우측 대칭 위치·동일 외형·팩당 4 kg는 가정입니다. 원본 내부 사진의 14S4P를 두 팩 모두의 현행 사양으로 확장하지 않습니다.'}];
function batteryCenters(){return[[batteryDesign.x,batteryDesign.y,batteryDesign.z],[batteryDesign.x,-batteryDesign.y,batteryDesign.z]];}
function batteryCoordinates(){return{battery:{positions:[batteryCenters()[0]],size:batteryDesign.size.map((v,i)=>v+'XYZ'[i]).join(' × ')+' mm / 좌측 +Y',desc:'좌측 수직 인출 팩·추정 외형'},battery2:{positions:[batteryCenters()[1]],size:'동일 외형 우측 −Y 예약 / 위치 미확인',desc:'두 번째 팩의 대칭 배치 가설'}};}
function baseMassProperties(){const b=batteryDesign,centers=batteryCenters(),residual=mechanism.mBase-2*b.massEach,parts=[{m:residual,p:[-30,0,135]}];for(let i=0;i<2;i++)if(b.installed[i])parts.push({m:b.massEach,p:centers[i]});const mass=parts.reduce((s,e)=>s+e.m,0),cg=[0,1,2].map(j=>parts.reduce((s,e)=>s+e.m*e.p[j],0)/mass);return{mass,cg,residual,parts};}
function batteryClearances(){const b=batteryDesign,[sx,sy,sz]=b.size,packOuter=b.y+sy/2,motorTop=params.D/2+50;return[
 {name:'좌측 팩–구동휠 내측 Y',value:params.T/2-25-packOuter-8,required:5},
 ...(typeof beltDesign!=='undefined'&&beltDesign.enabled&&typeof beltBayClearances==='function'?beltBayClearances().map(r=>({name:(r.side>0?'좌측':'우측')+' 팩–'+r.part+' / 현재 요각',value:r.gap,required:3})):[{name:'좌측 팩–J1 기초판 Y',value:b.y-sy/2-8-110,required:5}]),
 {name:'트레이–모터 상단 Z',value:b.z-sz/2-8-motorTop,required:5},
 {name:'팩–베이스 후단 X',value:b.x-sx/2+params.L/2,required:10},
 {name:'팩–베이스 좌측 외곽 Y',value:params.W/2-packOuter,required:10}
 ];}
function batteryWireBox(c,s,id){const [x,y,z]=c,[a,b,d]=s.map(v=>v/2),v=[[-a,-b,-d],[a,-b,-d],[a,b,-d],[-a,b,-d],[-a,-b,d],[a,-b,d],[a,b,d],[-a,b,d]].map(p=>[p[0]+x,p[1]+y,p[2]+z]);for(const [i,j]of[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])beamBetween(v[i],v[j],2,2,'#b69b60',id);}
function buildBatteries(){const b=batteryDesign,[sx,sy,sz]=b.size,centers=batteryCenters();for(let i=0;i<2;i++){
 const id=i===0?'battery':'battery2',p=centers[i],side=i===0?1:-1,bottom=p[2]-sz/2;
 box([p[0],p[1],bottom-5],[sx+12,sy+12,6],'#a1b59d',id);
 for(const x of[-sx/2+15,sx/2-15]){box([p[0]+x,p[1],bottom-9],[12,sy+16,6],'#9eae95',id);for(const y of[-sy/2+9,sy/2-9])bolt([p[0]+x,p[1]+y,bottom-1],'z',id,5);}
 for(const y of[-sy/2-4,sy/2+4])box([p[0],p[1]+y,p[2]-4],[sx+8,6,sz-15],'#647f70',id,.35);
 for(const x of[-sx/2-5,sx/2+5])box([p[0]+x,p[1],p[2]-5],[6,sy+8,sz-18],'#738f7a',id,.4);
 box([p[0],p[1],bottom+3],[42,28,12],'#495e59',id);for(const y of[-8,8])cylinder([p[0],p[1]+y,bottom+10],3,4,'z','#c7b274',id,8);
 const lift=i===0?b.lift:0,q=[p[0],p[1],p[2]+lift];
 if(b.installed[i]){box(q,[sx,sy,sz],i===0?'#394d43':'#b99c63',id,i===0?1:.22);box([q[0],q[1],q[2]+sz/2+4],[sx+6,sy+4,12],'#273e32',id,i===0?1:.35);
 for(const x of[-45,45]){box([q[0]+x,q[1],q[2]+sz/2+38],[6,9,62],'#aebbae',id,i===0?1:.4);cylinder([q[0]+x,q[1],q[2]+sz/2+9],6,13,'y','#8a9c8e',id,12);}box([q[0],q[1],q[2]+sz/2+70],[96,12,9],'#bac6b4',id,i===0?1:.4);
 if(i===0)box([q[0],q[1]+side*(sy/2+4),q[2]+15],[35,7,sz-15],'#bdc7b8',id);
 }else batteryWireBox(p,[sx,sy,sz],id);
 if(b.service&&i===0)batteryWireBox([p[0],p[1],p[2]+sz/2+175],[sx+20,sy+20,350],id);
 }}
