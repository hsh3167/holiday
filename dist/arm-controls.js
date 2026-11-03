(()=>{
 const ratioRows=[['Ø94 × 86','대향 어깨 지지·출력 플랜지·체결면'],['Ø76 × 70','직교 어깨축 간격·하우징 간섭'],['Ø72 × 50','상완 회전 중공·배선 비틀림'],['Ø88 × 74','양측 팔꿈치 지지·브레이크 공간'],['Ø64 × 40','전완 회전 베어링·하니스 통과'],['Ø62 × 58','손목 피치 직교축·케이블 루프'],['Ø52 × 50','손목 롤 출력·손 교환 커넥터']];
 $('actuator-register').innerHTML=ratioRows.map(([size,note],i)=>`<tr><td>A${i+1} ${armNames[i]}</td><td>${size} mm</td><td><input aria-label="A${i+1} 가정 감속비" id="arm-ratio-${i}" type="number" min="10" max="200" step="5" value="${actuators.ratios[i]}"> : 1</td><td>${note} · 6볼트 패턴 후보</td></tr>`).join('');
 function workspaceSVG(){
  const sets=workspaceSamples(),f=upperFrames(),current=[mPoint(f.left.tool,[0,0,0]),mPoint(f.right.tool,[0,0,0])],colors=['#60988c','#b4935f'];
  let out='<rect width="650" height="330" fill="#edf1e6"/>';
  for(const [panel,vaxis,title]of[[0,2,'X–Z 측면'],[1,1,'X–Y 평면']]){
   const pts=sets.flatMap(s=>s.points),xs=pts.map(p=>p[0]),vs=pts.map(p=>p[vaxis]),xmin=Math.floor(Math.min(...xs)/100)*100,xmax=Math.ceil(Math.max(...xs)/100)*100,vmin=Math.floor(Math.min(...vs)/100)*100,vmax=Math.ceil(Math.max(...vs)/100)*100,x0=46+panel*320,y0=48,w=260,h=211,map=p=>[x0+(p[0]-xmin)/(xmax-xmin)*w,y0+h-(p[vaxis]-vmin)/(vmax-vmin)*h];
   out+=`<text x="${x0}" y="27" fill="#4d6840" font-size="12">${title} / mm</text><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#f8faf3" stroke="#cbd7bd"/>`;
   for(let i=0;i<=4;i++){const x=x0+w*i/4,y=y0+h*i/4;out+=`<path d="M${x} ${y0}V${y0+h}M${x0} ${y}H${x0+w}" stroke="#dde5d4" stroke-width=".6"/>`;}
   sets.forEach((s,i)=>{const path=s.points.map(p=>{const q=map(p);return`M${q[0].toFixed(1)} ${q[1].toFixed(1)}h.1`;}).join('');out+=`<path d="${path}" stroke="${colors[i]}" stroke-width="2.5" stroke-linecap="round" opacity=".4"/>`;const q=map(current[i]);out+=`<circle cx="${q[0]}" cy="${q[1]}" r="5" fill="${colors[i]}" stroke="#32472e"/><text x="${q[0]+8}" y="${q[1]-7}" fill="#345031" font-size="10">${i===0?'L':'R'}</text>`;});
   out+=`<text x="${x0}" y="281" fill="#7c8b70" font-size="9">X ${xmin} → ${xmax}</text><text x="${x0}" y="296" fill="#7c8b70" font-size="9">${vaxis===2?'Z':'Y'} ${vmin} → ${vmax}</text>`;
  }
  return out+'<text x="46" y="320" fill="#63795a" font-size="10">청록: 좌측 / 황토: 우측 · 점 표본: 손목 위치 · 원: 현재 손목</text>';
 }
 window.renderArmReview=()=>{
  $('payload-mode').value=mechanism.payloadMode;$('arm-total-load').value=mechanism.mPayload;$('left-share').value=mechanism.leftShare*100;$('left-share-out').textContent=`${(mechanism.leftShare*100).toFixed(0)}% / ${(mechanism.mPayload*mechanism.leftShare).toFixed(1)} kg`;$('hand-load-offset').value=mechanism.loadOffset;$('actuator-factor').value=actuators.factor;$('actuator-efficiency').value=actuators.efficiency;
  for(let i=0;i<7;i++)$('arm-ratio-'+i).value=actuators.ratios[i];
  const equivalent=mechanism.payloadMode==='equivalent';$('left-share').disabled=equivalent;$('hand-load-offset').disabled=equivalent;$('load-reach').disabled=!equivalent;
  document.querySelectorAll('[data-share]').forEach(b=>{b.disabled=equivalent;const on=!equivalent&&+b.dataset.share===Math.round(mechanism.leftShare*100);b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  $('payload-basis-note').textContent=equivalent?'허리 고정 등가점 모드입니다. 총 적재는 허리·CG에만 반영하며, 팔 토크에는 포함하지 않습니다.':'양손 하중의 합은 총 적재와 같습니다. 각 하중점은 손목에서 국부 −Z 방향으로 이동하며, 좌우 분담은 사용자 가정입니다. 운반 물체의 무게중심·실제 접촉 반력을 자동으로 풀지 않습니다.';
  const a=armLoadAnalysis();$('live-load-summary').textContent=`총 적재 ${mechanism.mPayload} kg / ${equivalent?'허리 등가점':'양손 분담'} · 최대 |중력 토크| L ${Math.max(...a[0].rows.map(r=>Math.abs(r.gravity))).toFixed(1)} / R ${Math.max(...a[1].rows.map(r=>Math.abs(r.gravity))).toFixed(1)} N·m · 지지 여유 ${massAnalysis().margin.toFixed(0)} mm`;$('arm-load-summary').innerHTML=a.map(s=>{const peak=s.rows.reduce((best,r)=>Math.abs(r.gravity)>Math.abs(best.gravity)?r:best);return`<article><span>${s.side>0?'LEFT / 좌측':'RIGHT / 우측'}</span><strong>A${peak.joint+1} · ${Math.abs(peak.gravity).toFixed(1)} N·m</strong><p>현재 최대 중력축 / 계수 전</p><dl><dt>팔+손 자중</dt><dd>${s.bodyMass.toFixed(2)} kg</dd><dt>분담 적재</dt><dd>${s.payloadMass.toFixed(1)} kg</dd><dt>어깨 수직 반력</dt><dd>${s.force.toFixed(1)} N</dd><dt>어깨 합모멘트</dt><dd>${s.momentMagnitude.toFixed(1)} N·m</dd></dl></article>`;}).join('');
  $('arm-torques').innerHTML=a.flatMap(s=>s.rows.map(r=>`<tr><td>${s.side>0?'L':'R'} A${r.joint+1}<small>${r.name}</small></td><td>${r.self.toFixed(1)}</td><td>${r.payload.toFixed(1)}</td><td>${Math.abs(r.gravity).toFixed(1)}</td><td>${r.output.toFixed(1)}</td><td>${r.ratio} : 1</td><td>${r.motor.toFixed(3)}</td></tr>`)).join('');
  $('arm-workspace').innerHTML=workspaceSVG();
 };
 function refresh(){window.renderMechanismReview();inspector();draw();}
 $('payload-mode').addEventListener('change',()=>{mechanism.payloadMode=$('payload-mode').value;refresh();});
 $('left-share').addEventListener('input',()=>{mechanism.leftShare=+$('left-share').value/100;refresh();});
 document.querySelectorAll('[data-share]').forEach(b=>b.addEventListener('click',()=>{mechanism.leftShare=+b.dataset.share/100;refresh();}));
 function numberInput(id,set){$(id).addEventListener('input',()=>{const el=$(id),v=+el.value,valid=el.value!==''&&Number.isFinite(v)&&v>=+el.min&&v<=+el.max;el.classList.toggle('error-input',!valid);if(valid){set(v);refresh();}});}
 numberInput('arm-total-load',v=>mechanism.mPayload=v);numberInput('hand-load-offset',v=>mechanism.loadOffset=v);numberInput('actuator-factor',v=>actuators.factor=v);numberInput('actuator-efficiency',v=>actuators.efficiency=v);
 for(let i=0;i<7;i++)numberInput('arm-ratio-'+i,v=>actuators.ratios[i]=v);
 $('load-review-link').addEventListener('click',()=>{if(document.querySelector('.workspace').classList.contains('expanded'))$('expand-view').click();});
 window.renderMechanismReview();
})();
