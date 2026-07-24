export const LIGHTBURN_COLORS: Record<number, string> = {
  0: "#000000",
  1: "#0000FF",
  2: "#FF0000",
  3: "#00FF00",
  4: "#FFFF00",
  5: "#FF8000",
  6: "#00FFFF",
  7: "#FF00FF",
  8: "#C0C0C0",
  9: "#808080",
  10: "#800000",
  11: "#008000",
  12: "#000080",
  13: "#808000",
  14: "#800080",
  15: "#008080",
  16: "#A0A0A0",
  17: "#8080C0",
  18: "#FFC0C0",
  19: "#0080FF",
  20: "#FF0080",
  21: "#00FF80",
  22: "#FF8040",
  23: "#FFC0FF",
  24: "#FF80C0",
  30: "#F36926",
}

export type ExistingCutSetting = {
  index: number
  name: string
  type: string
}

const getCutSettingChildValue = (cutSetting: Element, tagName: string) =>
  cutSetting.getElementsByTagName(tagName).item(0)?.getAttribute("Value")

export const getExistingCutSettings = (xml: string | undefined) => {
  if (!xml || typeof window === "undefined") return []

  const doc = new DOMParser().parseFromString(xml, "application/xml")
  if (doc.querySelector("parsererror")) return []

  return Array.from(doc.getElementsByTagName("CutSetting"))
    .flatMap((cutSetting): ExistingCutSetting[] => {
      const type = cutSetting.getAttribute("type") ?? "Cut"
      const index = Number(getCutSettingChildValue(cutSetting, "index"))
      const name = getCutSettingChildValue(cutSetting, "name")
      if (!Number.isFinite(index) || !name) return []

      return [{ index, name, type }]
    })
    .sort((a, b) => a.index - b.index)
}

const normalizeSvgColor = (value: string | null) => value?.toUpperCase()

export const applyCutSettingVisibility = (
  svg: string,
  hiddenCutIndexes: number[],
) => {
  if (!svg || hiddenCutIndexes.length === 0 || typeof window === "undefined") {
    return svg
  }

  const hiddenColors = new Set(
    hiddenCutIndexes
      .map((index) => LIGHTBURN_COLORS[index])
      .filter(Boolean)
      .map((color) => color.toUpperCase()),
  )
  if (hiddenColors.size === 0) return svg

  const doc = new DOMParser().parseFromString(svg, "image/svg+xml")
  if (doc.querySelector("parsererror")) return svg

  for (const element of Array.from(doc.querySelectorAll("[stroke], [fill]"))) {
    const stroke = normalizeSvgColor(element.getAttribute("stroke"))
    const fill = normalizeSvgColor(element.getAttribute("fill"))
    if (
      (stroke && hiddenColors.has(stroke)) ||
      (fill && hiddenColors.has(fill))
    ) {
      element.setAttribute("display", "none")
    }
  }

  return new XMLSerializer().serializeToString(doc.documentElement)
}
