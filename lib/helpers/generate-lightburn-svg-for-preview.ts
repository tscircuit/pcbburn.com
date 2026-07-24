import { generateLightBurnSvg, type LightBurnProject, ShapeBase } from "lbrnts"

const TOOL_1_INDEX = 30
const PREVIEW_INDEX = 24
const PREVIEW_COLOR = "#FF80C0"
const TOOL_1_COLOR = "#F36926"

export const generateLightBurnSvgForPreview = (
  project: LightBurnProject,
): string => {
  const toolingShapes = project.children.filter(
    (child): child is ShapeBase =>
      child instanceof ShapeBase && child.cutIndex === TOOL_1_INDEX,
  )

  // lbrnts 0.0.22 supports native tool layers in the project model but its SVG
  // palette stops at C24. Borrow an unused preview color without changing the
  // exported LightBurn project.
  for (const shape of toolingShapes) {
    shape.cutIndex = PREVIEW_INDEX
  }

  try {
    return generateLightBurnSvg(project).replaceAll(PREVIEW_COLOR, TOOL_1_COLOR)
  } finally {
    for (const shape of toolingShapes) {
      shape.cutIndex = TOOL_1_INDEX
    }
  }
}
