import { expect, test } from "bun:test"
import { LightBurnProject, ShapePath } from "lbrnts"
import { generateLightBurnSvgForPreview } from "../lib/helpers/generate-lightburn-svg-for-preview"

const testSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">                                       
   <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />                                            
 </svg>`

test("svg snapshot example", async () => {
  // First run will create the snapshot
  // Subsequent runs will compare against the saved snapshot
  await expect(testSvg).toMatchSvgSnapshot(import.meta.path)
})

test("renders native T1 shapes in the preview palette", () => {
  const project = new LightBurnProject()
  const toolingShape = new ShapePath({
    cutIndex: 30,
    isClosed: true,
    verts: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
    ],
    prims: Array.from({ length: 5 }, () => ({ type: 0 })),
  })
  project.children.push(toolingShape)

  expect(generateLightBurnSvgForPreview(project)).toContain("#F36926")
  expect(toolingShape.cutIndex).toBe(30)
})
