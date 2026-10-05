// Resolve any CSS colour (rgb, oklch, color(), …) to opaque sRGB by painting it over a backdrop
// colour on a canvas and reading the pixel back. Painting over the surface is what composites a
// translucent tint the way the eye sees it.
export const compositeOver = (colour: string, backdrop: string): [number, number, number] => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d', { colorSpace: 'srgb', willReadFrequently: true })!
  context.fillStyle = backdrop
  context.fillRect(0, 0, 1, 1)
  context.fillStyle = colour
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
  return [red, green, blue]
}

export const contrastRatio = (first: [number, number, number], second: [number, number, number]) => {
  const luminance = (rgb: [number, number, number]) => {
    const [red, green, blue] = rgb.map((channel) => {
      const unit = channel / 255
      return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
  }
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

// The colour actually seen behind an element: every ancestor's background painted in order,
// since a page surface can sit under several translucent layers.
export const surfaceBehind = (element: Element): [number, number, number] => {
  const layers: string[] = []
  for (let node = element.parentElement; node; node = node.parentElement) layers.unshift(getComputedStyle(node).backgroundColor)
  return layers.reduce<[number, number, number]>((below, layer) => compositeOver(layer, `rgb(${below.join(' ')})`), [255, 255, 255])
}

// A wash such as `ai-wash` is a background image, which surfaceBehind cannot see. Its strongest point is the top, so the
// surface is built from the computed gradient's own first stop (no hard-coded alpha): a retuned wash is followed, and a
// host with no gradient fails loudly. A line measured against this is measured where it is hardest to see.
export const washedTop = (surface: [number, number, number], host: Element): [number, number, number] => {
  const image = getComputedStyle(host.closest('.ai-wash') ?? host).backgroundImage
  const firstStop = /^linear-gradient\((.+?) 0%,/.exec(image)
  if (!firstStop) throw new Error(`washedTop: no top-to-bottom wash on the host (${image})`)
  return compositeOver(firstStop[1], `rgb(${surface.join(' ')})`)
}
