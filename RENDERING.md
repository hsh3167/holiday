# Rev J — viewer rendering

The viewer now uses WebGL 2 with persistent, batched triangle and line buffers.
The existing estimated packaging geometry and engineering calculations remain
the source of positions. Changing the view only updates GPU uniforms; changing
model inputs invalidates the scene cache. Transparent faces are depth sorted
separately. Part picking projects cached polygons only when clicked.

Rendering requests coalesce into one animation frame. Auto quality reduces
resolution during pointer movement and returns to a sharper image after motion
ends. Sharp and speed modes, a six megapixel buffer budget, actual buffer
dimensions, and a fullscreen control are available. Cylinder segmentation is
increased. Annotation and GPU projections use the same orthographic transform.
WebGL unavailability or context loss selects the Canvas fallback.

`node tests/renderer.test.cjs` checks scene reuse, model invalidation, all five
scopes, input coalescing, GPU/annotation projection agreement, and CPU fallback.
The GL test uses a mock API; it does not validate driver shader compilation,
visual appearance, GPU timings, or actual browser interaction. No browser
automation tool was available for this revision, so those remain unverified.
No measured FPS or speedup is claimed. Rendering changes do not improve the
accuracy of the inferred mechanical dimensions or the original source photos.
