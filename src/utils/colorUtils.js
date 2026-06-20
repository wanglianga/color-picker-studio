export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

export function hslToRgb(h, s, l) {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

export function getContrastRatio(color1, color2) {
  const luminance1 = getRelativeLuminance(color1)
  const luminance2 = getRelativeLuminance(color2)
  
  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

export function getRelativeLuminance({ r, g, b }) {
  const sRGB = [r, g, b].map(c => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
}

export function getContrastLevel(ratio) {
  if (ratio >= 7) return { level: 'AAA', label: '极佳', color: '#4ade80' }
  if (ratio >= 4.5) return { level: 'AA', label: '良好', color: '#fbbf24' }
  if (ratio >= 3) return { level: 'AA Large', label: '达标(大文本)', color: '#f97316' }
  return { level: 'Fail', label: '不达标', color: '#ef4444' }
}

export function formatColor(color, format, alpha = 1) {
  switch (format) {
    case 'hex':
      return rgbToHex(color.r, color.g, color.b)
    case 'hexa':
      const a = Math.round(alpha * 255).toString(16).padStart(2, '0')
      return rgbToHex(color.r, color.g, color.b) + a
    case 'rgb':
      return `rgb(${color.r}, ${color.g}, ${color.b})`
    case 'rgba':
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
    case 'hsl':
      const hsl = rgbToHsl(color.r, color.g, color.b)
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    case 'hsla':
      const hsla = rgbToHsl(color.r, color.g, color.b)
      return `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${alpha})`
    default:
      return rgbToHex(color.r, color.g, color.b)
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function getColorName(r, g, b) {
  const hsl = rgbToHsl(r, g, b)
  
  const hueNames = [
    { name: '红色', min: 0, max: 15 },
    { name: '橙红', min: 15, max: 35 },
    { name: '橙色', min: 35, max: 55 },
    { name: '黄色', min: 55, max: 75 },
    { name: '黄绿', min: 75, max: 95 },
    { name: '绿色', min: 95, max: 145 },
    { name: '青绿', min: 145, max: 175 },
    { name: '青色', min: 175, max: 195 },
    { name: '天蓝', min: 195, max: 215 },
    { name: '蓝色', min: 215, max: 255 },
    { name: '靛蓝', min: 255, max: 275 },
    { name: '紫色', min: 275, max: 295 },
    { name: '紫红', min: 295, max: 330 },
    { name: '玫红', min: 330, max: 360 }
  ]

  let hueName = '灰色'
  if (hsl.s > 10) {
    for (const hn of hueNames) {
      if (hsl.h >= hn.min && hsl.h < hn.max) {
        hueName = hn.name
        break
      }
    }
  }

  let lightnessName = ''
  if (hsl.l < 15) lightnessName = '深'
  else if (hsl.l < 35) lightnessName = '暗'
  else if (hsl.l < 65) lightnessName = ''
  else if (hsl.l < 85) lightnessName = '浅'
  else lightnessName = '亮'

  if (hsl.s < 10) {
    if (hsl.l < 15) return '黑色'
    if (hsl.l > 85) return '白色'
    return lightnessName + '灰色'
  }

  return lightnessName + hueName
}
