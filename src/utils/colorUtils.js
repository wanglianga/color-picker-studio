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

export function getApplicableFontSizes(ratio) {
  const result = {
    normalText: { pass: false, minSize: null, note: '' },
    largeText: { pass: false, minSize: null, note: '' },
    boldText: { pass: false, minSize: null, note: '' },
    iconGraphic: { pass: false, note: '' }
  }

  if (ratio >= 7) {
    result.normalText = { pass: true, minSize: '14px', note: '任意字号均适用' }
    result.largeText = { pass: true, minSize: '18px', note: '任意字号均适用' }
    result.boldText = { pass: true, minSize: '14px', note: '任意字号均适用' }
    result.iconGraphic = { pass: true, note: '完全适用' }
  } else if (ratio >= 4.5) {
    result.normalText = { pass: true, minSize: '14px', note: '普通文本达标' }
    result.largeText = { pass: true, minSize: '18px', note: '大文本完全适用' }
    result.boldText = { pass: true, minSize: '14px', note: '粗体文本完全适用' }
    result.iconGraphic = { pass: true, note: '完全适用' }
  } else if (ratio >= 3) {
    result.normalText = { pass: false, minSize: null, note: '普通文本不达标，仅适用于装饰性文字' }
    result.largeText = { pass: true, minSize: '18px (粗体) / 24px', note: '仅适用于大字号文本' }
    result.boldText = { pass: true, minSize: '14px', note: '粗体文本基本适用' }
    result.iconGraphic = { pass: true, note: '适用于大图标和图形元素' }
  } else {
    result.normalText = { pass: false, minSize: null, note: '不推荐用于任何正文文本' }
    result.largeText = { pass: false, minSize: null, note: '大文本也不达标' }
    result.boldText = { pass: false, minSize: null, note: '粗体文本也不达标' }
    result.iconGraphic = { pass: false, note: '仅适用于非关键视觉元素' }
  }

  return result
}

export function getNotRecommendedScenarios(ratio) {
  const scenarios = []

  if (ratio < 7) {
    scenarios.push({
      level: ratio >= 4.5 ? 'warning' : 'danger',
      text: 'AAA 级无障碍合规场景',
      detail: '无法满足最高等级的无障碍标准要求'
    })
  }

  if (ratio < 4.5) {
    scenarios.push({
      level: 'danger',
      text: '正文段落文字',
      detail: '长时间阅读会造成视觉疲劳，不适合用作文章正文'
    })
    scenarios.push({
      level: 'danger',
      text: '表单输入提示',
      detail: '用户可能无法清晰辨认输入框标签和错误提示'
    })
  }

  if (ratio < 3) {
    scenarios.push({
      level: 'danger',
      text: '按钮和可点击元素',
      detail: '用户可能无法辨识按钮文字，影响交互操作'
    })
    scenarios.push({
      level: 'danger',
      text: '导航菜单文字',
      detail: '导航是关键操作入口，低对比度会严重影响可用性'
    })
    scenarios.push({
      level: 'danger',
      text: '数据表格内容',
      detail: '表格数据需要精确阅读，低对比度易导致信息误读'
    })
    scenarios.push({
      level: 'warning',
      text: '品牌色大面积使用',
      detail: '建议仅用于小面积点缀或图形元素'
    })
  }

  if (scenarios.length === 0) {
    scenarios.push({
      level: 'success',
      text: '当前对比度满足所有主流场景',
      detail: '可放心用于正文、标题、按钮、导航等各类场景'
    })
  }

  return scenarios
}

export function generateContrastSuggestions(fgRgb, bgRgb, targetRatio = 4.5) {
  const suggestions = []
  const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b)
  const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b)
  const currentRatio = getContrastRatio(fgRgb, bgRgb)

  if (currentRatio >= targetRatio) {
    return []
  }

  const bgLuminance = getRelativeLuminance(bgRgb)
  const shouldDarken = bgLuminance > 0.5
  const shouldModifyFg = true
  const shouldModifyBg = true

  if (shouldModifyFg) {
    const steps = [5, 10, 15, 20, 25, 30]
    for (const step of steps) {
      let newL
      if (shouldDarken) {
        newL = Math.max(0, fgHsl.l - step)
      } else {
        newL = Math.min(100, fgHsl.l + step)
      }
      if (newL === fgHsl.l) continue
      const newRgb = hslToRgb(fgHsl.h, fgHsl.s, newL)
      const newRatio = getContrastRatio(newRgb, bgRgb)
      if (newRatio >= targetRatio) {
        suggestions.push({
          type: 'foreground',
          label: '微调文字色',
          originalHex: rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b),
          suggestedHex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
          suggestedRgb: newRgb,
          originalHsl: { ...fgHsl },
          suggestedHsl: { h: fgHsl.h, s: fgHsl.s, l: newL },
          ratio: newRatio,
          level: getContrastLevel(newRatio),
          change: shouldDarken ? `明度 -${step}%` : `明度 +${step}%`,
          preservesBrand: '色相和饱和度完全保留，仅调整明度'
        })
        break
      }
    }

    for (const step of steps) {
      let newL
      if (shouldDarken) {
        newL = Math.max(0, fgHsl.l - step)
      } else {
        newL = Math.min(100, fgHsl.l + step)
      }
      if (newL === fgHsl.l) continue
      const newS = Math.max(0, Math.min(100, fgHsl.s - step * 0.5))
      const newRgb = hslToRgb(fgHsl.h, newS, newL)
      const newRatio = getContrastRatio(newRgb, bgRgb)
      if (newRatio >= targetRatio) {
        const existingFg = suggestions.find(s => s.type === 'foreground')
        if (!existingFg || existingFg.ratio > newRatio + 0.5) {
          suggestions.push({
            type: 'foreground',
            label: '柔和调整文字色',
            originalHex: rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b),
            suggestedHex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
            suggestedRgb: newRgb,
            originalHsl: { ...fgHsl },
            suggestedHsl: { h: fgHsl.h, s: newS, l: newL },
            ratio: newRatio,
            level: getContrastLevel(newRatio),
            change: shouldDarken ? `明度 -${step}%, 饱和度 -${Math.round(step * 0.5)}%` : `明度 +${step}%, 饱和度 -${Math.round(step * 0.5)}%`,
            preservesBrand: '色相完全保留，柔和调整明度和饱和度，视觉差异更小'
          })
        }
        break
      }
    }
  }

  if (shouldModifyBg) {
    const steps = [5, 10, 15, 20, 25, 30]
    for (const step of steps) {
      let newL
      if (shouldDarken) {
        newL = Math.min(100, bgHsl.l + step)
      } else {
        newL = Math.max(0, bgHsl.l - step)
      }
      if (newL === bgHsl.l) continue
      const newRgb = hslToRgb(bgHsl.h, bgHsl.s, newL)
      const newRatio = getContrastRatio(fgRgb, newRgb)
      if (newRatio >= targetRatio) {
        suggestions.push({
          type: 'background',
          label: '微调背景色',
          originalHex: rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b),
          suggestedHex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
          suggestedRgb: newRgb,
          originalHsl: { ...bgHsl },
          suggestedHsl: { h: bgHsl.h, s: bgHsl.s, l: newL },
          ratio: newRatio,
          level: getContrastLevel(newRatio),
          change: shouldDarken ? `明度 +${step}%` : `明度 -${step}%`,
          preservesBrand: '色相和饱和度完全保留，仅调整背景明度'
        })
        break
      }
    }
  }

  if (suggestions.length === 0) {
    const extremeFgL = shouldDarken ? Math.max(0, fgHsl.l - 40) : Math.min(100, fgHsl.l + 40)
    const extremeFgRgb = hslToRgb(fgHsl.h, fgHsl.s, extremeFgL)
    const extremeFgRatio = getContrastRatio(extremeFgRgb, bgRgb)
    suggestions.push({
      type: 'foreground',
      label: '显著调整文字色',
      originalHex: rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b),
      suggestedHex: rgbToHex(extremeFgRgb.r, extremeFgRgb.g, extremeFgRgb.b),
      suggestedRgb: extremeFgRgb,
      originalHsl: { ...fgHsl },
      suggestedHsl: { h: fgHsl.h, s: fgHsl.s, l: extremeFgL },
      ratio: extremeFgRatio,
      level: getContrastLevel(extremeFgRatio),
      change: shouldDarken ? `明度 -40%` : `明度 +40%`,
      preservesBrand: extremeFgRatio >= targetRatio ? '色相完全保留，需较大幅度调整明度' : '色相保留，但对比度可能仍不足，建议更换配色方案'
    })
  }

  return suggestions
}

export function getReadabilityDescription(ratio) {
  if (ratio >= 7) {
    return {
      grade: '优秀',
      description: '对比度极佳，适合所有用户使用，包括视力障碍者',
      audience: '所有用户，包括色弱、老花眼等视力障碍人群',
      duration: '适合长时间阅读，不会造成视觉疲劳'
    }
  }
  if (ratio >= 4.5) {
    return {
      grade: '良好',
      description: '对比度良好，满足主流可访问性标准',
      audience: '绝大多数普通用户，不适合严重视力障碍者',
      duration: '适合中等时长阅读'
    }
  }
  if (ratio >= 3) {
    return {
      grade: '一般',
      description: '对比度偏低，仅满足大文本最低要求',
      audience: '视力较好的年轻用户',
      duration: '仅适合短时间浏览的标题或大字号内容'
    }
  }
  return {
    grade: '较差',
    description: '对比度不足，严重影响可读性',
    audience: '仅适合装饰性元素，不承载任何文字信息',
    duration: '不建议用于任何需要阅读的内容'
  }
}
