export const usage = {
  name: 'carousel',
  kind: 'component',
  summary: 'A horizontally or vertically scrolling item viewport built on Embla Carousel, with Previous/Next controls and keyboard arrow-key support.',
  useWhen: [
    'You need to page through a set of same-shaped items (cards, images) one view at a time within a constrained width.',
  ],
  alternatives: [
    { name: 'scroll-area', when: 'you just need an overflow-scrolling container, not paged navigation with Previous/Next controls and snap points.' },
    { name: 'tabs', when: 'the items are distinct named views the user picks by label, not a sequential set to page through.' },
  ],
  rules: [
    {
      id: 'always-pair-nav-controls',
      do: 'Render CarouselPrevious and CarouselNext alongside CarouselContent, as every story here does — they auto-disable at the first/last slide via canScrollPrev/canScrollNext.',
      dont: 'Ship CarouselContent with no visible Previous/Next controls — touch users can swipe, but mouse and keyboard users have no way to advance.',
      visual: true,
    },
    {
      id: 'basis-controls-items-per-view',
      do: 'Set a `basis-*` class on CarouselItem (as MultipleItems does with `basis-1/3`) to control how many items show at once.',
      dont: 'Leave every CarouselItem at the default `basis-full` when you actually want several items visible per view — each item fills the whole track instead.',
      visual: false,
    },
  ],
  a11y: [
    'Carousel renders `role="region"` with `aria-roledescription="carousel"` and a default `aria-label="carousel"` — pass your own `aria-label` when a page has more than one carousel, since the default isn\'t unique.',
    'CarouselItem renders `role="group"` with `aria-roledescription="slide"` on each item, so assistive tech announces position within the set the way native carousels do.',
    'Left/Right arrow keys scroll prev/next while focus is anywhere inside the carousel container; CarouselPrevious/CarouselNext disable via the native `disabled` attribute when there\'s nowhere left to scroll.',
  ],
  tokens: [],
}
