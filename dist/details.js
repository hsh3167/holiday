(() => {
 const poses={stand:[-5,12,-7,0,0],crouch:[-60,135,-75,0,0],reach:[20,35,-55,0,0],turn:[-5,12,-7,12,45]};
 const config=[['bone-l1','L1'],['bone-l2','L2'],['root-z','z0'],['m-base','mBase'],['m-waist','mWaist'],['m-upper','mUpper'],['m-payload','mPayload'],['load-reach','reach']];
 const toggles=[['waist-covers','covers'],['detail-parts','details'],['joint-axes','axes'],['cable-route','cables'],['mass-markers','load']];
 function coordinate(m){return mPoint(m,[0,0,0]).map(n=>n.toFixed(1)).join(', ');}
 function sideDiagram(a){const f=waistFrames(),origin=m=>mPoint(m,[0,0,0]),points=[origin(f.root),origin(f.j2),origin(f.j3),origin(f.j4),origin(f.j5),origin(f.tip)],side=p=>[195+p[0]*.3,385-p[2]*.265],top=p=>[480-p[1]*.26,171-p[0]*.26],line=(a,b)=>`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`;
  const ordered=f.baseYaw?[points[4],...points.slice(0,4),points[5]]:points;const path=ordered.map(side).map((p,i)=>(i?'L':'M')+p.join(' ')).join(' '),tip=side(points.at(-1)),hull=a.hull.map(top).map(p=>p.join(',')).join(' '),cg=top(a.cg),contacts=[...coordinates().drive.positions,...coordinates().caster.positions,...coordinates().rear.positions];
  let out=`<rect x="1" y="1" width="598" height="428" fill="#edf1e6"/><text x="24" y="28" fill="#71835f" font-size="11">X–Z 側面 / 上体・積載は等価質量</text><line x1="25" y1="385" x2="355" y2="385" stroke="#9faf8d"/><rect x="${195-params.L*.15}" y="319" width="${params.L*.3}" height="66" rx="8" fill="#b3c3a5"/><circle cx="195" cy="359" r="26" fill="#5b7655"/><path d="${path}" fill="none" stroke="#8ca17b" stroke-width="22" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="#d6dfca" stroke-width="12" stroke-linejoin="round"/>`;
  points.slice(0,5).forEach((p,i)=>{const q=side(p),off=i===3?-42:18;out+=`<circle cx="${q[0]}" cy="${q[1]}" r="${i<3?11:8}" fill="#607c4c" stroke="#edf1e6" stroke-width="3"/><text x="${q[0]+off}" y="${q[1]+4}" fill="#3f5f31" font-family="monospace" font-size="12">J${i+1}</text>`;});
  out+=`<rect x="${tip[0]-23}" y="${tip[1]-4}" width="46" height="8" fill="#849f6c"/><text x="${tip[0]+29}" y="${tip[1]-8}" fill="#54713d" font-size="11">허리 Z ${points.at(-1)[2].toFixed(0)}</text><text x="24" y="414" fill="#7d8e6c" font-size="10">축 순서·길이·각도는 추정 설계 / 요·롤 자세는 입체 모델에서 확인</text>`;
  out+=`<rect x="380" y="55" width="200" height="225" rx="5" fill="#f9fbf3" stroke="#d3dfc5"/><text x="400" y="79" fill="#6c815a" font-size="11">5점 접지 · CG 투영</text><polygon points="${hull}" fill="${a.margin>=0?'#d8e6c5':'#efd9c5'}" stroke="#8ba371" stroke-width="1.5"/>`;
  contacts.forEach((p,i)=>{const q=top(p);out+=`<circle cx="${q[0]}" cy="${q[1]}" r="5" fill="${i<2?'#65884d':'#bc9855'}"/>`;});
  out+=`<path d="${line([cg[0]-6,cg[1]],[cg[0]+6,cg[1]])} ${line([cg[0],cg[1]-6],[cg[0],cg[1]+6])}" stroke="#b26e3e" stroke-width="2.5"/><text x="${cg[0]+9}" y="${cg[1]-7}" fill="#ac6b3c" font-size="10">CG</text><text x="396" y="263" fill="#748967" font-size="10">最小余裕 ${a.margin.toFixed(0)} mm</text>`;
  return out.replace('X–Z 側面 / 上体・積載は等価質量','X–Z 측면 / 상체·적재는 등가질량').replace('最小余裕','최소 여유');
 }
 window.renderMechanismReview=()=>{
  for(let i=0;i<5;i++){$('q'+(i+1)).value=mechanism.angles[i];$('q'+(i+1)+'-out').textContent=mechanism.angles[i]+'°';}
  for(const[id,key]of config)$(id).value=mechanism[key];for(const[id,key]of toggles)$(id).checked=mechanism[key];
  document.querySelectorAll('[data-scope]').forEach(b=>{const on=b.dataset.scope===mechanism.scope;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  document.querySelectorAll('[data-pose]').forEach(b=>{const on=poses[b.dataset.pose].every((v,i)=>v===mechanism.angles[i]);b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  const a=massAnalysis(),f=waistFrames(),frames=[f.root,f.j2,f.j3,f.j4,f.j5];
  $('waist-height').textContent=mPoint(f.tip,[0,0,0])[2].toFixed(0)+' mm';$('whole-cg').textContent=a.cg[0].toFixed(0)+' / '+a.cg[1].toFixed(0)+' mm';$('support-margin').textContent=a.margin.toFixed(0)+' mm';$('support-margin').className=a.margin<20?'warn':'';
  $('waist-diagram').innerHTML=sideDiagram(a);
  $('mechanism-assessment').className='mechanism-assessment'+(a.margin<20?' warn':'');$('mechanism-assessment').textContent=`합계 ${a.total.toFixed(1)} kg · 허리 전방 위치 X ${mPoint(f.tip,[0,0,0])[0].toFixed(0)} mm. ${a.margin<0?'CG 투영이 지지 다각형 밖입니다. 자세·적재를 조정하세요.':a.margin<20?'CG 투영이 지지 경계에 가깝습니다.':'현재 가정에서 CG 투영은 지지 다각형 안쪽입니다.'} 자체 간섭·동적 전도·현가 변형은 별도 검토합니다.`;
  $('joint-register').innerHTML=a.torques.map((t,i)=>`<tr><td>J${i+1} / ${i<3?(f.baseYaw?'국부 Y 피치':'Y 피치'):i===3?'국부 X 롤':(f.baseYaw?'기초 Z 요':'국부 Z 요')}</td><td>${mechanism.angles[i]}°</td><td>${coordinate(frames[i])}</td><td>${Math.abs(t.gravity).toFixed(1)}</td><td>${(Math.abs(t.gravity)*1.5).toFixed(1)}</td><td>${i<2?'외관 + 축 추정':'5축 구성 가설'}</td></tr>`).join('');
  // Keep drive sizing and the existing sagittal reaction model on the same total load.
  $('mass').value=a.total;$('cg-x').value=Math.round(a.cg[0]);calculate();if(window.renderUpperReview)window.renderUpperReview();if(window.renderBatteryReview)window.renderBatteryReview();if(window.renderRideReview)window.renderRideReview();if(window.renderBeltReview)window.renderBeltReview();
 };
 function refresh(){inspector();checkClearance();window.renderMechanismReview();draw();}
 for(let i=0;i<5;i++)$('q'+(i+1)).addEventListener('input',()=>{mechanism.angles[i]=+$('q'+(i+1)).value;refresh();});
 for(const[id,key]of config)$(id).addEventListener('input',()=>{const el=$(id),v=Number(el.value),valid=el.value!==''&&Number.isFinite(v)&&v>=Number(el.min)&&v<=Number(el.max);el.classList.toggle('error-input',!valid);if(!valid)return;mechanism[key]=v;refresh();});
 for(const[id,key]of toggles)$(id).addEventListener('change',()=>{mechanism[key]=$(id).checked;draw();});
 document.querySelectorAll('[data-pose]').forEach(b=>b.addEventListener('click',()=>{mechanism.angles=[...poses[b.dataset.pose]];refresh();}));
 document.querySelectorAll('[data-scope]').forEach(b=>b.addEventListener('click',()=>{mechanism.scope=b.dataset.scope;zoom=1;window.renderMechanismReview();draw();}));
 document.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{partGroup=b.dataset.group;document.querySelectorAll('[data-group]').forEach(x=>x.classList.toggle('active',x===b));inspector();}));
 $('expand-view').addEventListener('click',()=>{const expanded=document.querySelector('.workspace').classList.toggle('expanded');$('expand-view').textContent=expanded?'큰 화면 닫기 ×':'큰 화면 ↗';$('expand-view').setAttribute('aria-pressed',String(expanded));document.body.style.overflow=expanded?'hidden':'';draw();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.workspace').classList.contains('expanded'))$('expand-view').click();});
 window.renderMechanismReview();select('j1');
})();
