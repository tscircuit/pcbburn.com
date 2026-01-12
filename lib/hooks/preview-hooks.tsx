import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToLbrn } from "circuit-json-to-lbrn"
import type { ConvertCircuitJsonToLbrnOptions } from "circuit-json-to-lbrn"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { generateLightBurnSvg } from "lbrnts"
import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  type Matrix,
  toString as transformToString,
} from "transformation-matrix"
import { useMouseMatrixTransform } from "use-mouse-matrix-transform"
import { IDENTITY_MATRIX, computeFitTransform } from "../helpers/svg-transform"

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
        const lbrnSvgResult = generateLightBurnSvg(lbrnProject)
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
  lbrnContainerRef,
  pcbContainerRef,
  lbrnSvg,
  pcbSvg,
  isSideBySide = false,
}: {
  svgToPreview: "lbrn" | "pcb"
  lbrnSvgDivRef: RefObject<HTMLDivElement | null>
  pcbSvgDivRef: RefObject<HTMLDivElement | null>
  lbrnContainerRef: RefObject<HTMLElement | null>
  pcbContainerRef: RefObject<HTMLElement | null>
  lbrnSvg: string
  pcbSvg: string
  isSideBySide?: boolean
}) {
  // Track whether we've computed the initial fit for each view
  const [lbrnInitialized, setLbrnInitialized] = useState(false)
  const [pcbInitialized, setPcbInitialized] = useState(false)

  // Store computed fit transforms to pass as initialTransform
  const [lbrnInitialTransform, setLbrnInitialTransform] =
    useState<Matrix>(IDENTITY_MATRIX)
  const [pcbInitialTransform, setPcbInitialTransform] =
    useState<Matrix>(IDENTITY_MATRIX)

  // Pass initialTransform to the hook - this sets the starting point for mouse interactions
  const lbrnHookResult = useMouseMatrixTransform({
    enabled: svgToPreview === "lbrn" || isSideBySide,
    initialTransform: lbrnInitialTransform,
  })

  const pcbHookResult = useMouseMatrixTransform({
    enabled: svgToPreview === "pcb" || isSideBySide,
    initialTransform: pcbInitialTransform,
  })

  // Compute and set initial fit transform for LBRN when SVG content changes
  useLayoutEffect(() => {
    if (!lbrnSvg || lbrnInitialized) return

    // Use requestAnimationFrame to ensure SVG is rendered in DOM
    const frameId = requestAnimationFrame(() => {
      const svgDiv = lbrnSvgDivRef.current
      const container = lbrnContainerRef.current
      if (!svgDiv || !container) return

      const svgElement = svgDiv.querySelector("svg")
      if (!svgElement) return

      const fitTransform = computeFitTransform(svgElement, container)
      setLbrnInitialTransform(fitTransform)
      lbrnHookResult.setTransform(fitTransform)
      setLbrnInitialized(true)
    })

    return () => cancelAnimationFrame(frameId)
  }, [
    lbrnSvg,
    lbrnSvgDivRef,
    lbrnContainerRef,
    lbrnInitialized,
    lbrnHookResult,
  ])

  // Compute and set initial fit transform for PCB when SVG content changes
  useLayoutEffect(() => {
    if (!pcbSvg || pcbInitialized) return

    const frameId = requestAnimationFrame(() => {
      const svgDiv = pcbSvgDivRef.current
      const container = pcbContainerRef.current
      if (!svgDiv || !container) return

      const svgElement = svgDiv.querySelector("svg")
      if (!svgElement) return

      const fitTransform = computeFitTransform(svgElement, container)
      setPcbInitialTransform(fitTransform)
      pcbHookResult.setTransform(fitTransform)
      setPcbInitialized(true)
    })

    return () => cancelAnimationFrame(frameId)
  }, [pcbSvg, pcbSvgDivRef, pcbContainerRef, pcbInitialized, pcbHookResult])

  // Track previous values to detect changes
  const prevLbrnSvg = useRef(lbrnSvg)
  const prevPcbSvg = useRef(pcbSvg)
  const prevIsSideBySide = useRef(isSideBySide)
  const prevSvgToPreview = useRef(svgToPreview)

  // Reset initialization when SVG content or view mode changes
  useEffect(() => {
    const lbrnSvgChanged = prevLbrnSvg.current !== lbrnSvg
    const pcbSvgChanged = prevPcbSvg.current !== pcbSvg
    const viewModeChanged = prevIsSideBySide.current !== isSideBySide
    // When switching between single views (lbrn <-> pcb), the container size changes
    // so we need to recompute the fit transform for the newly active view
    const singleViewChanged =
      !isSideBySide && prevSvgToPreview.current !== svgToPreview

    if (lbrnSvgChanged || viewModeChanged) {
      setLbrnInitialized(false)
    }
    if (pcbSvgChanged || viewModeChanged) {
      setPcbInitialized(false)
    }
    // When switching single views, reset the view we're switching TO
    if (singleViewChanged) {
      if (svgToPreview === "lbrn") {
        setLbrnInitialized(false)
      } else {
        setPcbInitialized(false)
      }
    }

    prevLbrnSvg.current = lbrnSvg
    prevPcbSvg.current = pcbSvg
    prevIsSideBySide.current = isSideBySide
    prevSvgToPreview.current = svgToPreview
  })

  // Apply transforms from the mouse hook directly
  useLayoutEffect(() => {
    if (lbrnSvgDivRef.current && lbrnHookResult.transform) {
      lbrnSvgDivRef.current.style.transform = transformToString(
        lbrnHookResult.transform,
      )
    }
    if (pcbSvgDivRef.current && pcbHookResult.transform) {
      pcbSvgDivRef.current.style.transform = transformToString(
        pcbHookResult.transform,
      )
    }
  }, [
    lbrnHookResult.transform,
    pcbHookResult.transform,
    lbrnSvgDivRef,
    pcbSvgDivRef,
  ])

  return {
    ref: svgToPreview === "lbrn" ? lbrnHookResult.ref : pcbHookResult.ref,
    lbrnRef: lbrnHookResult.ref,
    pcbRef: pcbHookResult.ref,
  }
}
