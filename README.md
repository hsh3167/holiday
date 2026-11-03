# FRIDAY 역설계 워크벤치 · Rev L

사진과 공개 자료를 바탕으로 만든 독립적인 구조 추정·계산 웹페이지입니다. 제조사 CAD나 제작 승인 도면이 아닙니다.

**손 설계 정정:** 한 손의 14개 유압 굽힘축＋6개 전동축 배정과 관절별 실린더 개수·위치·치수는 설계 가정입니다. 사진에서 이 개수와 배치를 확인한 것이 아닙니다. 공식 자료는 유압 굽힘·스프링 복귀·모터 벌림 원리를 뒷받침하지만, 현재 모델의 전체 관절별 배치를 입증하지는 않습니다. 게시된 모델에는 아직 이 가정이 포함되어 있습니다.

## Rev L · 캐스터–휠모터 보기 링크

사진의 연결부를 좌우 보기 링크로 해석해 기본 적용했습니다. 각 링크의 구동휠·모터·전방 캐스터가 함께 회전하고, 프레임–링크 코일과 피벗을 통해 지지합니다. 피벗 위치와 상·하단 스프링 시트는 추정입니다. 독립 캐스터 현가는 비교 모드로 남겨 두었습니다. 자세한 구조·계산 한계는 `REV-L.md`를 참고하세요.

## 바로 실행

[**FRIDAY 시뮬레이션 열기**](https://hsh3167.github.io/holiday/)

GitHub Pages에서 설치 없이 실행할 수 있습니다. `main` 브랜치의 루트에서 배포하며, 첫 화면이 `dist/`의 워크벤치로 연결됩니다.

## 로컬 실행 방법

저장소 폴더에서 `python -m http.server 8000 --directory dist` 실행 후 http://localhost:8000 을 엽니다. 설치나 빌드가 필요 없습니다. Node.js 사용 시 `node serve.cjs`도 가능합니다.

- `dist/`: 웹페이지 코드와 참고 이미지
- `design-basis.json`, `patent-evidence.json`: 출처와 설계 가정
- `REV-L.md`: 최신 보기 링크·결합 현가 검토 / `REV-K.md`: 벨트·손 검토
- `RENDERING.md`: 렌더링 구조와 검증 한계
- `tests/`: 계산·기구학·렌더링 검사

기존 배포: https://friday-amr-lab.flowy-luck-1047.chatgpt.site/ (소유자 접근 설정 유지). GitHub Pages 실행 주소: https://hsh3167.github.io/holiday/

공식 참고: https://holiday-robotics.com/product 및 https://holiday-robotics.com/ko/blog/hands-we-left-behind . 참고 이미지의 권리는 각 원저작자에게 있습니다. 별도의 이미지 재사용 라이선스를 부여하지 않습니다.

원본 소스 커밋: `819007bbcceea4901e2745c1f4e53eb940b58fba` (Rev K). 이전일: 2026-11-04 한국시간. Rev K 원본에서 보기 링크와 결합 현가 모델을 Rev L로 갱신했습니다. 참고 이미지는 원본을 유지합니다. 수식·코드 검사 결과가 실물 강도·수명·공차 검증을 의미하지는 않습니다.

---

## 이전 리비전 기록

아래는 Rev I까지의 기존 기록입니다. 최신 상태는 위 설명과 `REV-K.md`를 우선합니다.

# FRIDAY · Full Body Workbench / Rev I

Existing private Site, updated in place. Independent engineering reconstruction based on official photographs, user-provided public-video stills, official introduction metadata and explicit design assumptions. This is a preliminary detailed design, not manufacturer CAD or released fabrication data.

## Revision I suspension/contact review

- Added an independent equivalent vertical-support model. This is an explicit alternative hypothesis to the unconfirmed rigid bogie; enabling it hides/deactivates that bogie calculation. The photo-observed coils remain the geometry basis, not a confirmed actual suspension topology.
- Solve 3 body-plane coordinates by enumerating unilateral support branches: air/tire for drives and rear, and air/rebound-stop/spring/bump-stop for each front caster. Preloaded front coils act in series with tire stiffness. Preload is internal at the rebound stop and excess load bypasses the coil at the bump stop.
- Current mass/CG comes from the full-body analysis. An optional forward equivalent acceleration shifts the vertical-load application point by −ax*CGz/g. This is quasi-static load transfer, not a transient or impact simulation; CG horizontal coordinates are held fixed against body tilt. Warn above5 degrees.
- Candidate coil: wire4.5, mean diameter42, active5.5 / total7.5 turns, G79000N/mm2 → k9.94N/mm. Preload60N; free85mm and stroke35mm; tires350/180/250N/mm for drive/front/rear. These inputs and a14mm free-extension trim are assumptions, not measured supplier data. Compute solid-length reserve and Wahl stress without a fatigue allowable.
- A15mm left-front ground rise with the earlier25mm/75mm candidate causes bump-stop contact and zero left-drive force. The35mm/85mm candidate maintains five loaded supports in that same assumed case. This does not establish real FRIDAY terrain capability.
- Moved candidate camera height135→150mm to separate the conservative full-360-degree/full-stroke reservation. The moving envelope has about12.9mm separating-axis gap in the default case; the static guide gap remains a separate check. A negative envelope gap is a conservative overlap, not a confirmed exact collision.
- Caster wheel/fork yaw changes nominal contact XY with20/16mm trail, updates support hull, and renders relative suspension stroke, coils, travel-stop reservations and local terrain patches. The main3D view fixes the chassis at the current-load flat reference; the side diagram shows body-motion differences at3x displacement. Rigid tire geometry does not model rubber deformation.
- Added cases, individual terrain and steering controls, one-cycle360-degree animation, force/stroke/stop-state table, spring budget and forward-motion traction estimate. Baseline arm/waist gravity loads and optical FOV remain on the nominal frame/plane.
- `node tests/ride.test.cjs`:50 equilibrium cases,150 independent energy-gradient checks, force/moment balance, contact/stop transitions, candidate comparisons, trail circles and finite geometry. Existing camera, hand, arm, battery and waist tests remain.

## Revision H mobile camera detail

- Replaced the old parallel camera bodies and erroneous local-Y lens axes with two front-corner window assemblies. Optics use local +X, transformed by Rz(side*yaw) Ry(down). Outward mounting is a photo interpretation; ±25° yaw, 0° tilt, positions and FOV are candidate values, not calibrated extrinsics.
- Official robot privacy policy lists one mobile stereo camera system among eight total camera systems. Two visible windows are not counted as two stereo systems; their mapping remains unknown. Interior apertures are silhouettes, not selected sensor hardware.
- Added manual pitch brackets, upper-frame attachment plates, trunnion/slot/hard-stop reservations, bezel openings, generic apertures and R25 rear harness loops. Dimensions, fasteners, datum and alignment goal are proposed.
- Interactive yaw, tilt, optical center, FOV, depth and recess controls drive geometry, the coordinate register, ground-plane clipping and opening-edge clearance. No actual sensor range or certified obstacle-detection claim.
- Candidate center moved from inset35/Y±160 to inset20/Y±130 after detecting overlap with existing caster reservations. The UI reproduces the old conflict. 3D OBB separating-axis gaps test the housing/plate/ears against fixed caster reservations, not a full swept CAD assembly.
- Initial view now focuses on the base camera change; all previous body and hand modes remain available. Source photo and original 60.4-second frame sit alongside the new review.
- Numerical tests independently verify rotations, mirrored fields, ground clipping, sample visibility, analytic ray intersection and deliberate aperture clipping failures.

## Revision G hand detail

- The official 2026-10-16 article describes the current hand as a hybrid: torso-powered hydraulic flexion, spring extension and small palm motors for spreading. Single-acting cylinders sit dorsally, preserving the palmar tactile surface. The HTML shell omitted the body; the public site bundle contains the published Markdown, which was read without executing it.
- One shared 20R hand design, mirrored bilaterally. Proposed allocation: four fingers with 3 hydraulic flexion axes + 1 electric spread axis each; thumb with 2 hydraulic flexion and 2 electric opposition/spread axes. The resulting 14H + 6E allocation is our hypothesis, not a published manufacturer axis map.
- Dorsal round cylinders, clevis pins, cranks and return-spring reservations are connected to the finger kinematics. Palmar contact pads and dorsal palm motors are separate component groups.
- Selected-finger statics use a fingertip-normal load and exact pin geometry: the cylinder lever is d(length)/d(angle). Cylinder bore candidates are 6/5.5/4 mm with 12/10/7 mm reserved stroke with an assumed 6 mm seal/piston/guide stack; dimensions are not measured from the source photo.
- Volume-command input inverts the cylinder geometry through ideal area/stroke conservation. Required pressure, hose loss, line compression, master stroke/force, screw-motor torque and passive unloaded spring-return time are calculated separately. No full transient fluid simulation or contact solver.
- Motor/screw/master-cylinder displacement sources are a chosen proposal; the manufacturer has not disclosed the complete remote fluid circuit.
- The 500 g hand mass allocation is a budget, not CAD/selected-part mass. It matches the existing analysis hand mass at a 25 kg upper-body budget.
- `node tests/hand.test.cjs` validates 27 cylinder lever/inverse cases, 42 independent fingertip Jacobian/work checks, pressure and stiction limits, hose scaling and mirrored geometry.

## Revision F evidence corrections

- Withdraw the previous rear-center battery interpretation. Put the observed bay at robot-left +Y above the drive-wheel/motor region; +X remains base front, independent of torso yaw.
- Model a 230X × 80Y × 150Z mm reservation at (-70, +165, 240) mm, vertical guides, tray, handle and connector reservation. These are estimates, not measured fabrication dimensions.
- Manufacturer official LinkedIn confirms two independently swappable packs; a second mirrored right bay is explicitly translucent and provisional. 14S4P applies to the labeled internal-photo pack only.
- Pack presence changes AMR mass and CG; lifting preview changes geometry only. Default AMR 76 kg includes assumed 4 kg per pack.
- Official torso-generated hydraulic hand force is reflected in two reserved torso volumes and schematic arm routing. Circuit, master actuator count, pump/valve architecture, pressure and tube diameters remain unknown.

## Applied scope

- Five-wheel basis: 2 central drive wheels, 2 front sprung casters, 1 rear central caster.
- Photo-based exposed coils, black suspension caps, ribbed chassis and 14S4P battery retaining bar.
- Revised central chassis crossmembers, left-side t6 battery tray and vertical guides, independent rear caster support, t20 root plate, bolts and candidate flanges.
- Waist chain: pitch Y → pitch Y → pitch Y → local roll X → local yaw Z. Initial 5-DoF waist is official; exact axis topology remains a design hypothesis.
- Root height 340 mm, lower/upper link lengths 360/300 mm and neck offsets 55/65/25 mm. All dimensions are estimates.
- Four pose presets, five independent angle sliders, link/mass inputs, full/base/waist/upper scopes, enlarged viewer, semitransparent covers, axis and harness layers.
- Chest spine and shoulder bridge, two 7R arms (Y–X–Z–Y–Z–Y–X), two-axis neck, oval head and a shared bilateral 20-axis hybrid hand design with a bulk grip helper. The candidate 20-DoF hybrid mechanism is now modeled; manufacturer-specific internal topology remains unconfirmed.
- Arm lengths 235/240 mm plus 65 mm wrist, shoulder offsets Y ±205 / Z +330 mm; neck +405 mm above waist. Straight posture reaches the official 1,760 mm height datum. All axis locations and link lengths remain design proposals.
- Four upper-body poses, 14 arm sliders, two head sliders, upper-body scope, joint-coordinate register and pose-dependent upper-body CG.
- Rigid forward kinematics, joint-coordinate register, gravity torque and an explicitly preliminary ×1.5 static sizing column.
- Mass/CG and nominal five-contact support hull. No dynamic tip prediction or certified payload claim. Upper-body assumed split is torso 43.2%, head 8.8%, each arm 22%, each hand 2%; at 25 kg this yields 10.8/2.2/5.5×2/0.5×2 kg. This is a design mass budget, not a measured manufacturer breakdown.
- Hand-attached payload points with total-mass conservation, adjustable left/right share and local load offset; the old waist-relative equivalent mode remains selectable.
- Per-axis arm gravity torque split into self-weight and payload, configurable static factor, seven shared candidate ratios and assumed efficiency; output/motor-shaft review values and shoulder aggregate reaction.
- 480 deterministic angle samples per arm shown in XZ/XY projections, without collision/obstacle/singularity filtering.
- Arm harness reservation paths, actuator envelope/attachment review table, live model load summary and extended JSON export.
- Existing drive sizing, sagittal bogie reaction review, source/photo notes, patent register and JSON export remain available.

## Evidence and revision distinction

See `design-basis.json` for source facts, observations and assumptions. The official 2025 introduction description states a 24 kg, 5-DoF waist on a historical 115 kg robot. The current product page lists 125 kg and 64 total DoF. We do not assume that all historical module masses or topology are unchanged. The extra current DoF is not assigned to an invented joint.

The YouTube stream remained unavailable, but the official product page MP4 https://public.hday.io/site/hero/product.mp4 was playable and downloaded through the browser media UI. Unmodified frames at 60.4 and 62 seconds verify the left drive-wheel-side bay, hinged handle and upward removal. Original internal black 14S4P and current green swap pack are not assumed to be the same revision or format. Hidden drivetrain and exact axes are not presented as visually confirmed.

The battery's 14S4P label means 56 cells. Chemistry, cell format, voltage, Ah and Wh are not inferred. Base/waist/upper masses of 76/24/25 kg are an analysis partition summing to 125 kg, not a measured manufacturer BOM.

## Numerical validation

`node tests/mechanism.test.cjs` checks rigid link lengths in six postures, 30 independent finite-difference potential-energy/torque comparisons, upright zero gravity yaw torque, inside/outside support-hull cases, the upright 1,760 mm body-height datum, bilateral arm lengths and upper-body CG response to arm movement.

`node tests/arm-loads.test.cjs` adds 56 independent arm energy/torque comparisons, mass and force balance, a 620 mm analytic payload lever, motor conversion and workspace sample checks.

`node tests/battery.test.cjs` checks robot-left placement, installed/removed pack mass and lateral CG, invariant mass in the geometry-only lift preview, and deliberate motor/track packaging failures.

No dependencies or build step. `dist/` is the static hosting directory. Serve through the Sites preview helper. Geometry uses lightweight canvas projection, not a physics engine. Numerical modeling is in `dist/mechanism.js`; the main viewer is `dist/app.js`; waist controls are `dist/details.js`; upper-body geometry and controls are `dist/upper-body.js` and `dist/upper-controls.js`.

## Limits

No exhaustive self-collision check, FEA, fatigue, bearing/gearbox selection, joint inertia, emergency braking or tolerance release has been completed. Motor-shaft values use an assumed forward torque conversion, not a holding-brake/backdrive model or continuous motor rating. Angle ranges and material/fastener dimensions are proposal values. The support polygon uses nominal wheel contact locations; caster swivel, suspension compliance and transients require separate analysis.
