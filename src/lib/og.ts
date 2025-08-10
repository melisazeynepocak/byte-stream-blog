export function generateOgImageDataUrl(title: string, subtitle = "TeknoBlog") {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const ctx = canvas.getContext('2d')!

  // background
  ctx.fillStyle = '#0a0f1a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // gradient bar
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0)
  grad.addColorStop(0, '#3b82f6')
  grad.addColorStop(1, '#06b6d4')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, 12)

  // title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 64px Inter, Arial, sans-serif'
  const lines = wrapText(ctx, title, 1100)
  lines.forEach((line, i) => ctx.fillText(line, 48, 180 + i * 80))

  // subtitle
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = '28px Inter, Arial, sans-serif'
  ctx.fillText(subtitle, 48, 560)

  return canvas.toDataURL('image/png')
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    const { width } = ctx.measureText(test)
    if (width > maxWidth) {
      if (line) lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}
