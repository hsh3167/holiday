# Rev K: belt hypothesis and hand detail

The annotated user base image shows two exposed toothed pulleys, a rear
region with teeth and a horizontal belt plane. The new selectable candidate
uses an input pulley, an idler and a lower yaw output. Their assignments and
hidden connections remain unconfirmed. The same J5 yaw moves to the base;
there are still five waist axes. The previous upper-yaw model remains available.

The 5 mm pitch, 36/120 tooth ratio, 15 mm width, 178-tooth length and 20:1
upstream reduction are review candidates, not manufacturer specifications or
selected catalogue hardware. Belt tension, nominal shaft loads and twist/bending
stress are reported without a tooth-capacity, fatigue or life acceptance claim.
An initial rectangular mounting table overlaps the battery reservations at
45 degrees. A circular 200 mm table and 140 mm yoke candidate replace it;
181 samples across +/-90 degrees give a minimum SAT separation of 4.57 mm
for the explicitly included table, yoke, motor and flange envelopes. This is
not a full robot clearance or tolerance result. Both mounting designs can be
compared. The original total mass budgets are retained, not recomputed from CAD.

Hand photos and the manufacturer's Korean article support hydraulic flexion,
spring opening, palm motor spreading, dorsal hardware, segmented contact
surfaces and hoses. Photos may show different revisions. The article includes
a cylinder for one finger joint; the previous blanket suggestion that assigning
joint cylinders was unsupported was too strong. Exact 14H/6E channel allocation
and the torso motor/screw/master circuit remain explicitly proposed.

Added geometry includes bilateral pin bushes, central coil and moving legs,
contact pads, piston/rod/seal/guide envelopes and an interactive cylinder cutaway.
Coil dimensions are visual reservations; the equivalent spring torque law is
independent. Selected-joint stresses and clearances are nominal checks, with
materials, seal details, wear and fatigue unqualified.

Validation: existing engineering regression tests, 40 independent energy-gradient
checks across both waist chains, belt path convergence and tension checks,
181 yaw samples against pack reservations, piston clearances and fixed rod
length, renderer cache regressions, HTML references, and browser controls/JSON
export. This cloud browser lacks WebGL2: visual QA exercised Canvas fallback,
not actual GPU performance. Ignore unrelated extension metadata logging errors.

Primary references:
- https://holiday-robotics.com/ko/blog/hands-we-left-behind
- https://www.gates.com/content/dam/documents-library/catalogs/powergrip-gt3-drive-design-manual-en.pdf
- Five user-supplied images reproduced unchanged under dist/assets/friday-*-user*.
