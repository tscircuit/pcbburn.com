import { useState, useEffect, type RefObject } from "react"
import { useMouseMatrixTransform } from "use-mouse-matrix-transform"
import { toString as transformToString } from "transformation-matrix"
import { convertCircuitJsonToLbrn } from "circuit-json-to-lbrn"
import { generateLightBurnSvg } from "lbrnts"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import type { CircuitJson } from "circuit-json"
import type { ConvertCircuitJsonToLbrnOptions } from "circuit-json-to-lbrn"

export function useSvgGeneration({
  circuitJson,
  lbrnOptions,
}: {
  circuitJson: CircuitJson | null
  lbrnOptions: ConvertCircuitJsonToLbrnOptions
}) {
  const [lbrnSvg, setLbrnSvg] = useState("")
  const [pcbSvg, setPcbSvg] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!circuitJson) {
      setLbrnSvg("")
      setPcbSvg("")
      return
    }

    const generateSvgs = async () => {
      setIsGenerating(true)
      try {
        // Generate LBRN SVG
        const lbrnProject = convertCircuitJsonToLbrn(
          circuitJson as CircuitJson,
          lbrnOptions,
        )
        const lbrnSvgResult = generateLightBurnSvg(lbrnProject, {
          width: 800,
          height: 600,
        })
        setLbrnSvg(String(lbrnSvgResult))

        // Generate PCB SVG
        const pcbSvgResult = convertCircuitJsonToPcbSvg(
          circuitJson as CircuitJson,
        )
        setPcbSvg(String(pcbSvgResult))
      } catch (err) {
        console.error("Failed to generate SVGs:", err)
        setLbrnSvg("")
        setPcbSvg("")
      } finally {
        setIsGenerating(false)
      }
    }

    generateSvgs()
  }, [circuitJson, lbrnOptions])

  return { lbrnSvg, pcbSvg, isGenerating }
}

export function useSvgTransform({
  svgToPreview,
  lbrnSvgDivRef,
  pcbSvgDivRef,
}: {
  svgToPreview: "lbrn" | "pcb"
  lbrnSvgDivRef: RefObject<HTMLDivElement | null>
  pcbSvgDivRef: RefObject<HTMLDivElement | null>
}) {
  const hookResult = useMouseMatrixTransform({
    enabled: true,
  })

  useEffect(() => {
    const activeRef = svgToPreview === "lbrn" ? lbrnSvgDivRef : pcbSvgDivRef
    if (activeRef.current && hookResult.transform) {
      activeRef.current.style.transform = transformToString(
        hookResult.transform,
      )
    }
  }, [hookResult.transform, svgToPreview, lbrnSvgDivRef, pcbSvgDivRef])

  return { transform: hookResult.transform, ref: hookResult.ref }
}
