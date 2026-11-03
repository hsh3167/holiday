# Rev L — front-caster / wheel-motor bogie candidate

The user identifies a link between the front caster and wheel motor in the
supplied internal photograph. The former default independent-support mode hid
the old bogie geometry. Rev L adopts a left/right rigid bogie candidate by
default; each drive wheel, motor housing and front caster shares one Y-pivot
transform. The rear center caster remains chassis mounted. The full hidden
connection, pivot and any left/right cross-coupling are not established.

The candidate pivot is 47% of the drive-to-straight-caster contact span, at
Z135 mm; pin diameter20, bush OD50, paired arm thickness9 and motor adapter
thickness8 mm are proposed envelopes. Two cheeks connect the motor front-face
adapter, pivot bush and caster kingpin carrier. The coil acts between chassis
and bogie. Its upper/lower articulated seats are a design proposal. A fixed
vertical caster guide is removed in this mode to avoid imposing incompatible
prismatic and revolute constraints. Caster swivel remains a separate axis.

A five-coordinate vertical equilibrium couples body heave/pitch/roll and the
two spring-seat strokes. Tire contact is unilateral; coils are preloaded and
have complementary hard-stop reactions. Both whole-body force/moment balance
and each bogie's moment balance are checked. Spring force is not identified
with caster ground reaction. The prior independent-support mode remains an
explicit comparison. Pivot percentage, terrain and spring inputs update both
analysis and view. Pivot height changes geometry only in the first-order model.

Rendering uses exact rigid rotations relative to the same-load flat baseline;
force equilibrium uses first-order vertical lever motion and nominal XY contact
points. Body angles over5 degrees or absolute bogie angles over10 degrees warn.
No large-angle contact recomputation, inertia, damping, separate unsprung mass,
link weight redistribution, impacts or tipping trajectories are modeled. The
original total mass and CG budgets remain in force.

Camera reservations enclose the rotating full-swivel wheel/fork box analytically
across the candidate coil stroke; a positive SAT gap is not an exact closest
distance. This does not qualify link, motor, strut, battery or whole-robot swept
clearance. Materials, bearings, pin fatigue and release tolerances are not sized.

Validation adds60 coupled terrain/load/pivot cases,300 independent finite-
difference potential-energy/KKT checks, hard stops and wheel lift, force and
moment balance, shared-transform distance invariance and dense independent
samples within the analytic swept box. Former independent-support tests remain.
