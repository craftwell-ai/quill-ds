# aspect-ratio (component)

Constrains any child to a fixed width-to-height ratio — a CSS-only box, most often used to reserve space for images, video embeds, and thumbnails.

### When to use
- You're placing an image, video, or embed that must keep a consistent shape (16:9, 1:1, 4:3) regardless of its container's width, and want to reserve that space before the media loads.

### Reach for instead
- **resizable** — when the box's size needs to be user-adjustable by dragging, not fixed to a mathematical ratio.

### Rules
- **Do:** Pass `ratio` as a width ÷ height fraction (e.g. `16 / 9`, `1`, `4 / 3`) so the value reads as the actual proportion. **Don't:** Hardcode the decimal by hand (`1.7777777777777777`) — the fraction form documents itself and is what every story here uses.
- **Do:** Pair an `<img>` child with `object-cover w-full h-full` (as WithImage does) so the image fills the box and crops instead of distorting or overflowing. **Don't:** Drop a raw `<img>` in with no sizing classes — the browser renders it at its own natural proportions and it spills past the ratio box.

### Accessibility
- AspectRatio itself renders a plain `<div>` with no semantics of its own — accessibility (alt text on an image, captions on a video) comes entirely from whatever child you put inside it.

