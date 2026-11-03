'use strict';
const $ = id => document.getElementById(id);
const defaults = {W:600,L:650,D:200,T:490};
let params = {...defaults};
try { const saved=JSON.parse(localStorage.getItem('friday-amr-d')||'null'); if(saved) for(const k of Object.keys(defaults)){const el=$(k),v=Number(saved[k]);if(Number.isFinite(v)&&v>=+el.min&&v<=+el.max)params[k]=v;} } catch {}
let selected='j1', yaw=0.95, elevation=0.48, zoom=1, exploded=false, shell=false, fov=false, sweep=true, labels=true;
const suspension={bogie:true,preload:false,fifth:true,springForce:180,pivotPct:47,lever:60};
const colors={drive:'#92c9ab',motor:'#7aaf8e',caster:'#dab475',lidar:'#bba2d6',camera:'#8bbacb',battery:'#424e49',rear:'#dfa574',j1:'#b7c2b0',frame:'#bccbb1',lower:'#cbd7c3',j2:'#a9bc98',link2:'#d3ddc7',j3:'#a4b88f',j4:'#91ac7c',j5:'#b8cba7',harness:'#69a6a1',torso:'#cfdbbf',shoulders:'#9caf91',armL:'#b9cdb0',armR:'#a9c2a0',head:'#9dc4ac',hands:'#bbcbb0',electronics:'#5a8e7d',battery2:'#c9aa6a',hydraulic:'#6ca2bd',belt:'#b5ba89',fingerHydraulic:'#82a6b0',palmMotor:'#b49b63',tactile:'#e0e4c7'};
const definitions=[
 {
  "id": "drive",
  "num": "01",
  "name": "좌우 구동휠",
  "qty": 2,
  "status": "5휠 설계 적용",
  "reason": "중앙 차축 좌우에 구동휠 2개를 적용했습니다. 두 구동휠과 세 캐스터를 합쳐 총 5휠입니다.",
  "note": "Ø200·윤거 490 mm는 설계 추정입니다. 사진의 치형 원형 부품을 접지휠로 세지 않았습니다."
 },
 {
  "id": "motor",
  "num": "02",
  "name": "휠모터·감속기",
  "qty": 2,
  "status": "공간 추정",
  "reason": "구동휠 안쪽의 모터·감속기와 전방 현가 캐스터를 좌우 보기 링크로 연결해 배치했습니다.",
  "note": "모터 형식·감속비·보기 피벗의 정확한 위치는 추가 확인 대상입니다."
 },
 {
  "id": "caster",
  "num": "03",
  "name": "전방 현가 캐스터",
  "qty": 2,
  "status": "사진 형상 반영",
  "reason": "내부 사진의 두 모듈에서 보이는 검은 원형 캡, 노출 코일 스프링, 중앙 가이드와 주변 지지부를 모델에 반영했습니다. 좌우에 각각 현가 캐스터를 배치했습니다. REV. I에서는 등가 스프링·타이어 직렬 모델과 상하 이동·선회·기계식 스톱 예약을 연결했습니다.",
  "note": "전방 좌우 배치·스프링 치수·스트로크는 사진 해석에 따른 설계 추정입니다. 선경·자유장·스트로크·스톱은 후보 설계이며 실제 스프링 선정값은 아닙니다."
 },
 {
  "id": "rear",
  "num": "04",
  "name": "후방 중앙 캐스터",
  "qty": 1,
  "status": "5휠 설계 적용",
  "reason": "베이스 후방 중앙 캐스터 1개를 유지합니다. 배터리를 좌측으로 옮겨 배터리 아래라는 설명을 철회하고, 후방 프레임에 별도 지지대로 연결합니다.",
  "note": "후방 중앙 위치·장착 높이·지지대 형상은 설계 추정입니다. 이 세부 형상이 사진에서 확인됐다는 뜻은 아닙니다."
 },
 {
  "id": "lidar",
  "num": "05",
  "name": "전후 LiDAR",
  "qty": 2,
  "status": "외관 + 배치 추정",
  "reason": "정면 상판 센서 돌출부를 LiDAR 후보로 적용했습니다. 후방 센서는 감지 범위 검토용 추가 배치입니다.",
  "note": "센서 제조사·후방 실물·정확한 시야각은 미확인입니다."
 },
 {
  "id": "camera",
  "num": "06",
  "name": "주행부 전방 광학창",
  "qty": 2,
  "status": "사진 장착면 + 각도 가설",
  "reason": "공식 정면 사진과 60.4초 원본 영상의 좌우 코너 광학창을 반영했습니다. 좌우 바깥쪽 요각과 올바른 광학축을 적용하고 프레임 고정·피치 조절 브래킷을 추가했습니다.",
  "note": "±25° 요·0° 틸트·FOV·치수는 검토값입니다. 제조사는 모바일 스테레오 1대를 명시하지만 두 외부 창과의 대응은 미확인입니다. 원통 축과 창 수를 카메라 대수로 세지 않습니다."
 },
 {
  "id": "battery",
  "num": "07",
  "name": "좌측 배터리 · 14S4P 자료",
  "qty": 1,
  "status": "사진 라벨 확인",
  "reason": "사진 오른쪽의 Holiday Robotics 로고와 14S4P 표기가 있는 검은 직사각형 팩입니다. 로봇 좌측(+Y), 구동휠 위쪽 측면 슬롯으로 수정했습니다. 내부 사진의 은색 고정대를 반영하고 공식 교체 영상의 접이식 손잡이·상향 인출을 추가했습니다. 14직렬·4병렬, 총 56셀 구성입니다.",
  "note": "230X × 80Y × 150Z mm와 팩당 4 kg는 이번 배치 검토용 추정값입니다. 셀 형식·화학계·용량·전압은 14S4P 표기만으로 확정하지 않습니다."
 },
 {
  "id": "j1",
  "num": "08",
  "name": "J1 · 하단 피치·U자 지지부",
  "qty": 1,
  "status": "사진 반영 + 축 추정",
  "reason": "내부 사진의 큰 원통형 구동부와 공식 정면 사진의 검은 U자 지지부를 반영했습니다. 좌우 지지판·중공 플랜지·관절 구동부·브레이크 예약 공간을 배치했습니다.",
  "note": "축 높이 340 mm, Y축 피치와 Ø150 플랜지는 초기 설계 가정입니다. 베어링 형식·감속기·브레이크 실물은 미확인입니다."
 }
].concat(waistDefinitions,upperDefinitions,batteryExtraDefinitions,handExtraDefinitions,beltExtraDefinitions).sort((a,b)=>+a.num-+b.num);
const patents=[
 {title:'자기식 촉각 센서를 시뮬레이션하는 방법 및 장치',application:'10-2026-0049510',filed:'2026.03.19',registration:'10-3036917',registered:'2026.10.19',published:'2026.10.23',inventors:'이민지 · 이정민',summary:'접촉 데이터로부터 변형과 자석의 변위를 구하고, 자기장 벡터를 계산해 가상 촉각 신호를 생성하는 시뮬레이션 기술입니다.',doi:''},
 {title:'유연체 시뮬레이션을 수행하는 방법 및 장치',application:'10-2026-0042625',filed:'2026.03.10',registration:'10-3036916',registered:'2026.10.19',published:'2026.10.22',inventors:'이정민',summary:'MPM 기반 유연체 시뮬레이션에서 그리드 속도, 접촉 구속을 위한 슬랙 변수, 듀얼 변수를 반복 갱신하는 계산 방법입니다.',doi:''}
];
function coordinates(){const {L,W,D,T}=params,cx=L/2-90,cy=W/2-80;return {
 drive:{positions:[[0,T/2,D/2],[0,-T/2,D/2]],size:`Ø${D} × 50 mm`,desc:'구동휠 중심'},
 motor:{positions:[[0,T/2-67.5,D/2],[0,-T/2+67.5,D/2]],size:'140X × 85Y × 100Z mm',desc:'모터 공간 중심'},
 caster:{positions:rideDesign.enabled?rideLocations().slice(2,4):[[cx,cy,37.5],[cx,-cy,37.5]],size:'휠 Ø75 / 현가 상단 185 / 선회 R60 mm',desc:'휠 중심 / 선회축 X +20 mm'},
 rear:{positions:rideDesign.enabled?rideLocations().slice(4):[[-L/2+70,0,32.5]],size:'휠 Ø65 / 장착면 Z105 / 선회 R50 mm',desc:'휠 중심 / 선회축 X −16 mm'},
 lidar:{positions:[[L/2-45,0,265],[-L/2+45,0,265]],size:'Ø70 × 60 mm',desc:'전후 센서 중심'},
 camera:cameraCoordinates(),
 ...batteryCoordinates(),
 ...waistCoordinates(),belt:{positions:[[0,0,beltDesign.z]],size:`${beltDesign.pitch} mm pitch / ${beltDesign.width} mm width / candidate`,desc:'기초 요축 벨트 경로 가설'},...upperCoordinates(),...handCoordinates()
};}
function coordText(id){return coordinates()[id].positions.map(p=>p.map(n=>Number.isInteger(n)?n:n.toFixed(1)).join(', ')).join(' / ');}

function inspector(){
 $('component-list').innerHTML=definitions.filter(d=>matchesPartGroup(d.id)).map(d=>`<button class="component ${selected===d.id?'selected':''}" data-part="${d.id}" aria-pressed="${selected===d.id}"><span class="part-id">${d.num}</span><span class="part-name">${d.name}</span><small>×${d.qty}</small></button>`).join('');
 document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>select(b.dataset.part));
 const allCoordinates=coordinates(),formatted=id=>allCoordinates[id].positions.map(p=>p.map(n=>Number.isInteger(n)?n:n.toFixed(1)).join(', ')).join(' / '),d=definitions.find(d=>d.id===selected),c=allCoordinates[selected];
 const photoEvidence=selected==='battery'?'<figure class="battery-inspector-source"><img src="assets/friday-battery-official-60s.png" alt="공식 영상의 좌측 구동휠 위 배터리 슬롯"><figcaption>공식 MP4 60.4초 · 좌측 휠 위 슬롯 / © Holiday Robotics</figcaption></figure>':selected==='caster'?'<figure class="battery-inspector-source camera-inspector-source"><img src="assets/friday-base-internal-original.png" alt="사용자 제공 원본의 노출 코일 현가 두 곳"><figcaption>원본의 코일·검은 캡 / 연결축·치수·강성은 미확인</figcaption></figure>':selected==='camera'?'<figure class="battery-inspector-source camera-inspector-source"><img src="assets/friday-battery-official-60s.png" alt="공식 영상의 코너 장착면 광학창"><figcaption>공식 MP4 60.4초 · 코너 광학창 / © Holiday Robotics</figcaption></figure>':selected==='fingerHydraulic'?'<figure class="battery-inspector-source hand-inspector-source"><img src="assets/friday-hand-cylinder.jpg" alt="제조사 공개 소형 손가락 실린더"><figcaption>제조사 기술 글의 실제 실린더 · 모델 치수는 추정 / © Holiday Robotics</figcaption></figure>':'';
 $('part-detail').innerHTML=`<span class="pill ${d.status.includes('사진')?'observed':'assumption'}">${d.status}</span><h3>${d.name}</h3><div class="detail-coord">XYZ: ${formatted(selected)}<br>${c.size}</div>${photoEvidence}<p>${d.reason}</p><div class="detail-note">${d.note}</div>`;
 $('coordinate-table').innerHTML=definitions.map(d=>`<tr><td><span>${d.num}</span>${d.name}</td><td>${d.qty}</td><td>${formatted(d.id)}</td><td>${allCoordinates[d.id].size}</td><td><span class="pill ${d.status.includes('사진')?'observed':'assumption'}">${d.status}</span></td></tr>`).join('');
}
function select(id){selected=id;inspector();draw();}
function update(){for(const k of Object.keys(params)){$(k).value=params[k];$(k+'-out').textContent=params[k]+' mm';}try{localStorage.setItem('friday-amr-d',JSON.stringify(params));}catch{}inspector();checkClearance();calculate();draw();if(window.renderSuspensionReview)window.renderSuspensionReview();if(window.renderMechanismReview)window.renderMechanismReview();if(window.renderCameraReview)window.renderCameraReview();if(window.renderRideReview)window.renderRideReview();}
function checkClearance(){
 const margin=(params.W-params.T-50)/2,items=[{ok:margin>=10,text:`구동휠–외곽 여유 ${margin.toFixed(0)} mm / 측`},...batteryClearances().map(c=>({ok:c.value>=c.required,text:`${c.name} ${c.value.toFixed(0)} mm (검토 기준 ≥${c.required})`}))];
 $('clearance').innerHTML=items.map(x=>`<div class="${x.ok?'ok':'warn'}">${x.ok?'✓':'△'} ${x.text}</div>`).join('')+'<p class="clearance-note">추정 직육면체 간격이며 실제 형상·공차·변형을 포함한 간섭 판정은 아닙니다. 후방 캐스터와 배터리의 이전 Z 단차 검토는 폐기했습니다.</p>';
}

function calculate(){
 const mass=+$('mass').value,slope=+$('slope').value,a=+$('accel').value;
 if(![mass,slope,a].every(Number.isFinite)||mass<80||mass>250||slope<0||slope>15||a<0||a>2){$('rpm').textContent='입력 확인';$('torque').textContent='—';$('power').textContent='—';if(window.renderSuspensionReview)window.renderSuspensionReview();return;}
 const D=params.D/1000,v=1.9,g=9.81,theta=slope*Math.PI/180;
 const force=mass*(a+g*Math.sin(theta)+.02*g*Math.cos(theta)),torque=force*D/4*1.5,rpm=60*v/(Math.PI*D),power=torque*v/(D/2);
 $('rpm').innerHTML=`${rpm.toFixed(0)}<small>rpm</small>`;$('torque').innerHTML=`${torque.toFixed(1)}<small>N·m</small>`;$('power').innerHTML=`${power.toFixed(0)}<small>W</small>`;if(window.renderSuspensionReview)window.renderSuspensionReview();
}
// Lightweight orthographic geometry. All objects are packaging envelopes, not CAD.
const canvas=$('model'),ctx=canvas.getContext('2d');let cw=1,ch=1,scale=1,faces=[],picks=[];
let gpu=null,sceneCache=null,renderPending=false,settleTimer,quality='auto',viewBusy=false;
const gpuCanvas=document.createElement('canvas');gpuCanvas.className='gpu-model';gpuCanvas.setAttribute('aria-hidden','true');canvas.before(gpuCanvas);
try{gpu=new GPUViewport(gpuCanvas);}catch(error){gpuCanvas.hidden=true;console.info('Using Canvas fallback:',error.message);}
gpuCanvas.addEventListener('renderer-lost',()=>{gpu=null;gpuCanvas.hidden=true;draw();});
const qualityBar=document.createElement('div');qualityBar.className='quality-bar';qualityBar.innerHTML='<label>화질 <select aria-label="3D 화면 화질"><option value="auto">자동</option><option value="high">선명</option><option value="speed">속도</option></select></label><output aria-label="화면 해상도"></output>';canvas.parentElement.append(qualityBar);
qualityBar.querySelector('select').onchange=e=>{quality=e.target.value;draw();};
const fullscreenButton=document.createElement('button');fullscreenButton.type='button';fullscreenButton.textContent='전체화면';fullscreenButton.className='viewer-fullscreen';qualityBar.append(fullscreenButton);
fullscreenButton.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await canvas.parentElement.requestFullscreen();}catch{toast('이 브라우저에서는 전체화면을 사용할 수 없습니다.');}};
document.addEventListener('fullscreenchange',()=>{fullscreenButton.textContent=document.fullscreenElement?'전체화면 닫기':'전체화면';draw();});
const viewerStats={geometryBuilds:0,cacheHits:0,frames:0};window.viewerDiagnostics=()=>({...viewerStats,gpu:!!gpu,bufferUploads:gpu?.uploads||0,resolution:[canvas.width,canvas.height]});
function draw(){if(renderPending)return;renderPending=true;requestAnimationFrame(()=>{renderPending=false;renderFrame();});}
function settleView(){viewBusy=true;clearTimeout(settleTimer);settleTimer=setTimeout(()=>{viewBusy=false;draw();},180);}
function sceneKey(){return JSON.stringify([params,mechanism,upperBody,batteryDesign,handState,rideDesign,cameraDesign,suspension,beltDesign,shell,exploded]);}
function cachedScene(){const key=sceneKey();if(sceneCache?.key===key){viewerStats.cacheHits++;faces=sceneCache.faces;return sceneCache;}
 const start=performance.now();geometry();faces=faces.filter(f=>scopeIncludes(f.id));const analysis=massAnalysis(),cs=coordinates();
 const bounds=[Infinity,Infinity,Infinity,-Infinity,-Infinity,-Infinity],add=p=>{for(let i=0;i<3;i++){bounds[i]=Math.min(bounds[i],p[i]);bounds[i+3]=Math.max(bounds[i+3],p[i]);}};
 for(const f of faces)for(const p of f.verts)add(p);
 if(!['waist','upper','hand'].includes(mechanism.scope)){add([-params.L/2,-params.W/2,0]);add([params.L/2,params.W/2,0]);}
 if(mechanism.load&&!['base','hand'].includes(mechanism.scope))for(const e of analysis.entries.slice(4))add(e.p);
 const corners=[];for(let i=0;i<8;i++)corners.push([bounds[i&1?3:0],bounds[i&2?4:1],bounds[i&4?5:2]]);
 sceneCache={key,faces,analysis,cs,corners};if(gpu)gpu.setGeometry(faces);viewerStats.geometryBuilds++;viewerStats.lastBuildMs=performance.now()-start;return sceneCache;
}
let projectionCenter=[0,0];
function projectRaw(v){const[x,y,z]=v,u=x*Math.cos(yaw)-y*Math.sin(yaw),w=x*Math.sin(yaw)+y*Math.cos(yaw);return{u,v:w*Math.sin(elevation)-z*Math.cos(elevation),depth:w*Math.cos(elevation)+z*Math.sin(elevation)};}
function project(v){const p=projectRaw(v);return{x:cw*.5-(p.u-projectionCenter[0])*scale,y:ch*.51+(p.v-projectionCenter[1])*scale,depth:p.depth};}
function tint(hex,f){const n=parseInt(hex.slice(1),16);return `rgb(${Math.min(255,((n>>16)&255)*f)|0},${Math.min(255,((n>>8)&255)*f)|0},${Math.min(255,(n&255)*f)|0})`;}
function polygon(verts,color,id,shade=1,alpha=1){if(geometryMatrix)verts=verts.map(p=>mPoint(geometryMatrix,p));faces.push({verts,color:tint(color,shade),id,alpha});}
function box(c,s,color,id,alpha=1){const [x,y,z]=c,[a,b,d]=s.map(n=>n/2);const v=[[-a,-b,-d],[a,-b,-d],[a,b,-d],[-a,b,-d],[-a,-b,d],[a,-b,d],[a,b,d],[-a,b,d]].map(q=>[q[0]+x,q[1]+y,q[2]+z]);const ix=[[0,1,2,3],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]];ix.forEach((f,i)=>polygon(f.map(j=>v[j]),color,id,[.52,.7,.82,.68,.82,1.07][i],alpha));}
function cylinder(c,r,h,axis,color,id,segments=24){segments=Math.min(64,segments*2);const ring=t=>Array.from({length:segments},(_,i)=>{const a=i/segments*Math.PI*2;return axis==='z'?[c[0]+r*Math.cos(a),c[1]+r*Math.sin(a),c[2]+t]:axis==='x'?[c[0]+t,c[1]+r*Math.cos(a),c[2]+r*Math.sin(a)]:[c[0]+r*Math.cos(a),c[1]+t,c[2]+r*Math.sin(a)];});const a=ring(-h/2),b=ring(h/2);polygon(a,color,id,.8);polygon(b,color,id,1.1);for(let i=0;i<segments;i++)polygon([a[i],a[(i+1)%segments],b[(i+1)%segments],b[i]],color,id,.68+.2*Math.sin(i/segments*Math.PI*2));}
function line(a,b,color,width=1,dash=[]){const p=project(a),q=project(b);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);}
function path3(points,color,fill='',width=1,dash=[]){ctx.beginPath();points.map(project).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}if(color){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);}}
function ring3(c,r,color){path3(Array.from({length:65},(_,i)=>[c[0]+r*Math.cos(i/64*Math.PI*2),c[1]+r*Math.sin(i/64*Math.PI*2),c[2]]),color,'',1,[3,4]);}
function wireBox(c,s,color){const[a,b,d]=s.map(n=>n/2),v=[[-a,-b,-d],[a,-b,-d],[a,b,-d],[-a,b,-d],[-a,-b,d],[a,-b,d],[a,b,d],[-a,b,d]].map(p=>p.map((n,i)=>n+c[i]));[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([i,j])=>line(v[i],v[j],color,1,[3,4]));}
function dimension(a,b,label){line(a,b,'#778768',.8);const p=project(a),q=project(b);for(const x of[p,q]){ctx.beginPath();ctx.moveTo(x.x-3,x.y-3);ctx.lineTo(x.x+3,x.y+3);ctx.strokeStyle='#839572';ctx.stroke();}ctx.font='10px monospace';ctx.textAlign='center';ctx.fillStyle='#9bab8c';ctx.fillText(label,(p.x+q.x)/2,(p.y+q.y)/2-7);}
function coilSpring(x,y,z0,z1){
 const count=72,turns=rideDesign.enabled?rideDesign.activeCoils:5.5,r=rideDesign.enabled?rideDesign.mean/2:21,tube=rideDesign.enabled?rideDesign.wire/2:2.6,sides=5;
 const rings=Array.from({length:count+1},(_,i)=>{const a=i/count*turns*2*Math.PI,z=z0+(z1-z0)*i/count;return Array.from({length:sides},(_,j)=>{const b=j/sides*2*Math.PI;return[x+(r+tube*Math.cos(b))*Math.cos(a),y+(r+tube*Math.cos(b))*Math.sin(a),z+tube*Math.sin(b)];});});
 for(let i=0;i<count;i++)for(let j=0;j<sides;j++)polygon([rings[i][j],rings[i+1][j],rings[i+1][(j+1)%sides],rings[i][(j+1)%sides]],'#d4d5c9','caster',.8+.2*Math.cos(i/count*turns*2*Math.PI));
}
function casterModule(p,sprung,id){
 const [wheelX,y]=p,r=sprung?37.5:32.5,trail=sprung?20:-16,x=wheelX+trail,h=sprung?185:101;
 cylinder([wheelX,y,r],r,26,'y','#242d27',id,24);
 for(const side of[-1,1]){cylinder([wheelX,y+side*14,r],r*.6,3,'y',colors[id],id,18);box([(wheelX+x)/2,y+side*20,r+21],[42,7,44],'#c9cfbf',id);}
 cylinder([x,y,sprung?90:78],20,12,'z','#bac5b2',id,18);
 cylinder([x,y,sprung?126:92],8,sprung?88:18,'z','#e4e7df',id,16);
 if(sprung){cylinder([x,y,110],25,9,'z','#acb6a1',id);coilSpring(x,y,116,169);cylinder([x,y,178],29,16,'z','#202923',id);for(const side of[-1,1])box([x+side*34,y,149],[12,62,78],'#cbd1c1',id);}
 cylinder([x,y,h],sprung?33:25,8,'z','#bcc6b1',id,20);
}

function geometry(){
 faces=[];const c=coordinates(),lift=exploded?100:0;
 buildChassisDetail();buildBeltStage();
 for(const pos of c.drive.positions){cylinder(pos,params.D/2,50,'y','#34483a','drive',32);cylinder([pos[0],pos[1]+Math.sign(pos[1])*26,pos[2]],params.D*.26,4,'y',colors.drive,'drive');cylinder([pos[0],pos[1]+Math.sign(pos[1])*29,pos[2]],params.D*.09,6,'y','#486a52','drive',16);}
 for(const p of c.motor.positions){box(p,[140,85,100],colors.motor,'motor');cylinder([p[0],p[1],p[2]],31,90,'y','#6b9b7b','motor');}
 if(rideDesign.enabled){buildRideCaster(2,'caster');buildRideCaster(3,'caster');buildRideCaster(4,'rear');}else{for(const p of c.caster.positions)casterModule(p,true,'caster');for(const p of c.rear.positions)casterModule(p,false,'rear');}
 buildRideGround();
 const rearMount=rideDesign.enabled?-params.L/2+54:c.rear.positions[0][0]-16;
 box([rearMount,0,101],[70,200,8],'#b7c3ac','rear');
 for(const side of[-1,1])box([rearMount,side*85,146],[24,14,90],'#b7c3ac','rear');
 if(suspension.bogie&&!rideDesign.enabled){const span=params.L/2-90,pivot=span*suspension.pivotPct/100;for(const sign of[-1,1]){const y=sign*(params.T/2-25);box([span/2,y,170],[span+55,20,18],'#c5aa79','bogie',.32);cylinder([pivot,y,170],18,34,'y','#bcaa84','bogie',18);box([pivot,y,211],[34,30,64],'#778468','bogie',.25);if(suspension.preload){for(let z=182;z<=230;z+=8)cylinder([pivot-60,y,z],15,3,'z','#dfb56e','preload',16);box([pivot-60,y,236],[42,35,9],'#c9a56d','preload',.45);}}}
 buildBatteries();
 buildWaist();if(['full','upper','hand'].includes(mechanism.scope))buildUpperBody();
 for(const p of c.lidar.positions){const z=p[2]+lift*1.5;cylinder([p[0],p[1],z-13],35,34,'z','#564965','lidar');cylinder([p[0],p[1],z+7],34,12,'z',colors.lidar,'lidar');cylinder([p[0],p[1],z+15],30,5,'z','#7b698b','lidar');}
 buildBaseCameras();
 if(shell){box([0,0,225+lift],[params.L-30,params.W-30,35],'#d7dfcb','shell',.22);}
}
function renderFrame(){
 const frameStart=performance.now();if(!ctx)return;let dpr=quality==='speed'?1:quality==='high'?Math.min(Math.max(window.devicePixelRatio||1,1.5),2.5):viewBusy?1:Math.min(Math.max(window.devicePixelRatio||1,1.5),2);cw=canvas.clientWidth;ch=canvas.clientHeight;if(!cw||!ch)return;dpr=Math.min(dpr,Math.sqrt(6000000/(cw*ch)));
 if(canvas.width!==Math.round(cw*dpr)||canvas.height!==Math.round(ch*dpr)){canvas.width=Math.round(cw*dpr);canvas.height=Math.round(ch*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cw,ch);
 const scene=cachedScene(),{analysis,cs}=scene,raw=scene.corners.map(projectRaw),minU=Math.min(...raw.map(p=>p.u)),maxU=Math.max(...raw.map(p=>p.u)),minV=Math.min(...raw.map(p=>p.v)),maxV=Math.max(...raw.map(p=>p.v));projectionCenter=[(minU+maxU)/2,(minV+maxV)/2];scale=Math.min(Math.max(10,cw-90)/Math.max(1,maxU-minU),Math.max(10,ch-100)/Math.max(1,maxV-minV))*zoom;
 if(gpu){try{gpu.render({width:cw,height:ch,dpr,yaw,elevation,center:projectionCenter,scale,selected});}catch(error){gpu=null;gpuCanvas.hidden=true;console.warn('GPU unavailable; Canvas fallback',error.message);}}
 if(!gpu){
 const gradient=ctx.createRadialGradient(cw*.5,ch*.58,30,cw*.5,ch*.58,cw*.65);gradient.addColorStop(0,'#253426');gradient.addColorStop(1,'#151d18');ctx.fillStyle=gradient;ctx.fillRect(0,0,cw,ch);
 for(let i=-700;i<=700;i+=100){line([i,-700,0],[i,700,0],'#2c3b2b',.7);line([-700,i,0],[700,i,0],'#2c3b2b',.7);}
 }
 if(!['waist','upper','hand'].includes(mechanism.scope)){
  if(!rideDesign.enabled)path3(analysis.hull.map(p=>[...p,1]),'#91b47860','#91b4780a',1,[5,4]);
  if(sweep){if(rideDesign.enabled){for(const side of[-1,1])ring3([params.L/2-70,side*(params.W/2-80),2],Math.hypot(57.5,13),'#9c8250');ring3([-params.L/2+54,0,2],Math.hypot(48.5,13),'#c18d6a');}else{for(const p of cs.caster.positions)ring3([p[0]+20,p[1],2],60,'#9c8250');for(const p of cs.rear.positions)ring3([p[0]-16,p[1],2],50,'#c18d6a');}}
  if(fov)for(const p of cs.lidar.positions){const heading=p[0]>0?0:Math.PI,arc=Array.from({length:41},(_,i)=>{const a=heading-3*Math.PI/4+i/40*3*Math.PI/2;return[p[0]+450*Math.cos(a),p[1]+450*Math.sin(a),4];});path3([[p[0],p[1],4],...arc,[p[0],p[1],4]],'#8c75a080','#ae83c50d',1,[3,4]);}
 }
 picks=[];if(!gpu){for(const f of faces)f.depth=f.verts.reduce((sum,v)=>sum+projectRaw(v).depth,0)/f.verts.length;faces.sort((a,b)=>a.depth-b.depth);
 for(const f of faces){const ps=f.verts.map(project);ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.globalAlpha=f.alpha;ctx.fillStyle=f.color;ctx.fill();const hypothesis=['bogie','preload'].includes(f.id);ctx.strokeStyle=f.id===selected?'#d6ebbd':hypothesis?'#d4b272':'#111c1570';ctx.lineWidth=f.id===selected?1:.4;ctx.setLineDash(hypothesis?[3,3]:[]);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;if(definitions.some(d=>d.id===f.id))picks.push({id:f.id,pts:ps});}
 }
 if(!['waist','upper','hand'].includes(mechanism.scope)){
  const bp=cs.battery.positions[0],p=project([bp[0],bp[1],bp[2]+batteryDesign.size[2]/2+batteryDesign.lift+90]);ctx.font='10px monospace';ctx.textAlign='center';ctx.fillStyle='#e7ecda';ctx.fillText('B1 / LEFT +Y',p.x,p.y);const origin=project([0,0,5]),front=project([180,0,5]),left=project([0,180,5]);line([0,0,5],[180,0,5],'#9fc5ab',1.5);line([0,0,5],[0,180,5],'#b9b27c',1.5);ctx.fillText('+X 전방',front.x,front.y-8);ctx.fillText('+Y 로봇 좌측',left.x,left.y-8);
  dimension([-params.L/2,-params.W/2-40,1],[params.L/2,-params.W/2-40,1],`L ${params.L}`);
 }
 if(mechanism.axes){const f=waistFrames(),jointMarks=[['j1','J1',f.root,mVector(f.root,[0,1,0])],['j2','J2',f.j2,mVector(f.root,[0,1,0])],['j3','J3',f.j3,mVector(f.root,[0,1,0])],['j4','J4',f.j4,mVector(f.a3,[1,0,0])],['j5','J5',f.j5,f.baseYaw?[0,0,1]:mVector(f.a4,[0,0,1])]];
  for(const[id,label,m,axis]of jointMarks){if(!scopeIncludes(id))continue;const a=mPoint(m,[0,0,0]),end=a.map((n,i)=>n+axis[i]*85);line(a,end,'#c7d89b',1.2,[3,3]);const p=project(a),dx=label==='J4'?72:45,dy=label==='J3'?24:label==='J4'?4:label==='J5'?-24:0;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+dx,p.y+dy);ctx.strokeStyle='#c9d9a4';ctx.lineWidth=.8;ctx.stroke();ctx.font='bold 10px monospace';ctx.textAlign='left';ctx.fillStyle='#deebc7';ctx.fillText(label,p.x+dx+3,p.y+dy+3);}
 }
 if(mechanism.load&&mechanism.scope!=='hand'){const mark=(point,label,color,r=5)=>{const p=project(point);ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#17241c';ctx.stroke();ctx.font='10px monospace';ctx.textAlign='left';ctx.fillText(label,p.x+9,p.y-7);};
  if(!['waist','upper','hand'].includes(mechanism.scope)){mark([analysis.cg[0],analysis.cg[1],2],'CG','#e3bc70',5);line(analysis.cg,[analysis.cg[0],analysis.cg[1],2],'#d4b47b',1,[4,4]);}
  if(mechanism.scope!=='base'){mark(analysis.entries[4].p,`상체 ${mechanism.mUpper} kg`,'#b8a8d1');for(const e of analysis.entries.slice(5).filter(e=>e.m>0)){mark(e.p,`${e.desc} ${e.m.toFixed(1)} kg`,'#e3a27f');line(e.p,e.p.map((v,i)=>v-(i===2?85:0)),'#d79d72',1.5);}}
 }
 if(elevation>1.5&&!['waist','upper','hand'].includes(mechanism.scope)){
  const contacts=[...cs.drive.positions.map((p,i)=>[p,'D'+(i+1),'#92c9ab']),...cs.caster.positions.map((p,i)=>[p,'C'+(i+1),'#e2bb7b']),[cs.rear.positions[0],'C3','#efa77a']];for(const[v,label,color]of contacts){const p=project([v[0],v[1],0]);ctx.beginPath();ctx.arc(p.x,p.y,11,0,2*Math.PI);ctx.fillStyle='#15231b';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle=color;ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText(label,p.x,p.y+3);}
 }
 drawUpperAxes();drawCameraRays();drawRideOverlay();
 if(labels&&elevation<1.5){for(const id of[...new Set(['drive','caster','rear','battery',selected])]){if(!scopeIncludes(id)||!cs[id])continue;const d=definitions.find(d=>d.id===id),v=cs[id].positions[0],p=project(v);ctx.beginPath();ctx.arc(p.x,p.y,9,0,Math.PI*2);ctx.fillStyle=id===selected?'#d7e9bb':'#17241b';ctx.fill();ctx.strokeStyle=colors[id];ctx.lineWidth=1;ctx.stroke();ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle=id===selected?'#263e22':'#d6e3c9';ctx.fillText(d.num,p.x,p.y+3);}}
 ctx.font='9px monospace';ctx.fillStyle='#9baa8d';ctx.textAlign='right';ctx.fillText(`${mechanism.scope.toUpperCase()} / 형상·치수 추정`,cw-20,24);viewerStats.frames++;viewerStats.lastFrameCpuMs=performance.now()-frameStart;const status=(gpu?'GPU':'기본')+' · '+canvas.width+' × '+canvas.height;const out=qualityBar.querySelector('output');if(out.textContent!==status)out.textContent=status;
}
function inside(p,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x))c=!c;}return c;}
let pointer=null;
canvas.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';});
canvas.addEventListener('pointermove',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer.moved=pointer.moved||Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>5;yaw+=dx*.008;elevation=Math.max(.03,Math.min(Math.PI/2,elevation+dy*.006));pointer.x=e.clientX;pointer.y=e.clientY;settleView();document.querySelectorAll('[data-view]').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});draw();});
function pointerEnd(e){if(!pointer)return;if(!pointer.moved){const r=canvas.getBoundingClientRect(),p={x:e.clientX-r.left,y:e.clientY-r.top};if(gpu){const id=gpu.pick(p,project,new Set(definitions.map(d=>d.id)));if(id)select(id);}else for(let i=picks.length-1;i>=0;i--)if(inside(p,picks[i].pts)){select(picks[i].id);break;}}pointer=null;canvas.style.cursor='grab';viewBusy=false;clearTimeout(settleTimer);draw();}
canvas.addEventListener('pointerup',pointerEnd);canvas.addEventListener('pointercancel',()=>{pointer=null;canvas.style.cursor='grab';viewBusy=false;draw();});
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.55,Math.min(1.8,zoom*Math.exp(-e.deltaY*.001)));settleView();draw();},{passive:false});
function setView(v){const vs={iso:[.95,.48],top:[-Math.PI/2,Math.PI/2],front:[Math.PI/2,.03],side:[0,.03]};[yaw,elevation]=vs[v];document.querySelectorAll('[data-view]').forEach(b=>{const s=b.dataset.view===v;b.classList.toggle('selected',s);b.setAttribute('aria-pressed',String(s));});draw();}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('reset-view').onclick=()=>{zoom=1;setView('iso');};$('zoom-in').onclick=()=>{zoom=Math.min(1.8,zoom*1.15);draw();};$('zoom-out').onclick=()=>{zoom=Math.max(.55,zoom/1.15);draw();};
for(const k of Object.keys(defaults))$(k).addEventListener('input',()=>{params[k]=+$(k).value;update();});
for(const id of['mass','slope','accel'])$(id).addEventListener('input',calculate);
for(const id of['shell','fov','support','explode','labels'])$(id).addEventListener('change',()=>{shell=$('shell').checked;fov=$('fov').checked;sweep=$('support').checked;exploded=$('explode').checked;labels=$('labels').checked;draw();});
$('defaults').onclick=()=>{$('cg-x').value=0;params={...defaults};mechanism={...mechanismDefaults,angles:[...mechanismDefaults.angles]};handState=freshHand();beltDesign={...beltDefaults};rideDesign=freshRide();cameraDesign={...cameraDefaults};batteryDesign={...batteryDefaults,size:[...batteryDefaults.size],installed:[...batteryDefaults.installed]};upperBody={...upperDefaults,head:[...upperDefaults.head],left:[...upperDefaults.left],right:[...upperDefaults.right]};actuators={...actuatorDefaults,ratios:[...actuatorDefaults.ratios]};if(window.renderBatteryReview)window.renderBatteryReview();if(window.renderCameraReview)window.renderCameraReview();if(window.renderMechanismReview)window.renderMechanismReview();Object.assign(suspension,{bogie:true,preload:false,fifth:true,springForce:180,pivotPct:47,lever:60});update();toast('REV. K 설계 기준을 복원했습니다.');};
$('export').onclick=()=>{const obj={title:'FRIDAY Full Body / Rev K',date:'2026-10-30',units:'mm',coordinate_system:{origin:'base center on ground',x:'forward',y:'left',z:'up'},status:'five-wheel design adopted: 2 drive + 2 front sprung casters + 1 rear central caster; geometry estimated',parameters:params,waist_design:mechanism,upper_body_design:upperBody,camera_design:cameraExport(),belt_transmission:beltExport(),hand_detail:handDetailExport(),suspension_review:rideExport(),hand_design:handState,hand_kinematics:{lengths_mm:fingerLengths,flexion_limits_deg:fingerLimits,pins:pinGeometry,coordinates:'palm +X tactile face, neutral fingers -Z, flexion is local -Y rotation',axis_allocation_status:'14 hydraulic + 6 electric per hand is a proposal; official axis-by-axis allocation unknown'},hand_analysis:handFingerAnalysis(),hand_mass_budget:handMassBudget(),hand_model_status:'shared bilateral candidate 20R topology; 14 hydraulic + 6 electric allocation unconfirmed; static single-finger model',upper_frames:upperFrames(),waist_frames:waistFrames(),mass_analysis:massAnalysis(),arm_load_analysis:armLoadAnalysis(),actuator_assumptions:actuators,workspace_sampling:{samples_per_arm:480,ranges_deg:armRanges,collision_filtered:false},hypotheses:suspension,components:definitions.map(d=>({...d,...coordinates()[d.id]})),wheel_count:5,battery_design:batteryDesign,base_mass:baseMassProperties(),battery_pack:{original_internal_label:'14S4P',series:14,parallel:4,total_cells_per_labeled_pack:56,current_pack_count:2,second_pack_format_confirmed:false,second_bay_position:'right mirror assumed',chemistry:null,capacity_Ah:null},additional_support:{applied:true,position:'rear center; estimated',mount_height_mm:105},evidence:{internal_photo:'assets/friday-base-internal-original.png',observed:'two exposed coil spring modules and black caps; 14S4P battery and silver retaining bracket',user_interpretation:'caster suspension modules and bogie coupling',unconfirmed:'bogie pivot; additional drive preload spring; exact rear wheel position; hardware revision'},patents,sources:['https://holiday-robotics.com/privacy-robot','https://holiday-robotics.com/blog/hands-we-left-behind','https://studios.disneyresearch.com/wp-content/uploads/2016/05/A-Hybrid-Hydrostatic-Transmission-and-Human-Safe-Haptic-Telepresence-Robot-1.pdf','https://public.hday.io/site/hero/product.mp4','https://kr.linkedin.com/company/holiday-robotics','https://holiday-robotics.com/product','https://public.hday.io/site/robots/friday.webp','https://www.youtube.com/watch?v=iUNat-40BeM','https://www.kipris.or.kr/','https://www.arirang.com/tv/259/archive/1379']};const u=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='friday-amr-rev-k.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);toast('관찰과 구조 가정을 구분한 배치 데이터를 내보냈습니다.');};
let toastTimer;function toast(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2400);}
function renderPatents(){$('patent-cards').innerHTML=patents.map((p,i)=>`<article class="patent-card"><div class="patent-top"><span>P0${i+1} / REGISTERED</span><span>국내 등록특허</span></div><h3>${p.title}</h3><dl><dt>출원번호</dt><dd>${p.application}</dd><dt>출원일</dt><dd>${p.filed}</dd><dt>등록번호</dt><dd>${p.registration}</dd><dt>등록일</dt><dd>${p.registered}</dd>${p.published?`<dt>공고일</dt><dd>${p.published}</dd>`:''}<dt>권리자</dt><dd>주식회사 홀리데이로보틱스</dd></dl><p>${p.summary}</p><div class="patent-relevance">AMR 배치와의 관계: 휠·캐스터·서스펜션 구조의 직접 근거로 사용하지 않음</div><a href="${p.doi||'https://www.kipris.or.kr/khome/search/searchResult.do?tab=patent'}" target="_blank" rel="noreferrer">KIPRIS 원문 조회 ↗</a></article>`).join('');}
const resizeObserver=new ResizeObserver(draw);resizeObserver.observe(canvas);renderPatents();update();
const navObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.rail-link').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));},{rootMargin:'-10% 0px -65% 0px'});['workbench','evidence','patents','decisions','waist-review','upper-review','hand-review','camera-review','contact-review'].forEach(id=>navObserver.observe($(id)));
