import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Layers,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  RotateCw,
} from "lucide-react"
import { useWorkspace } from "./workspace-context"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToLbrn } from "circuit-json-to-lbrn"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { generateLightBurnSvg } from "lbrnts"
import { useState, useEffect, useRef } from "react"
export function PreviewCanvas() {
  const { circuitData, lbrnOptions } = useWorkspace()
  const [svgToPreview, setSvgToPreview] = useState<"lbrn" | "pcb">("lbrn")
  const [lbrnSvg, setLbrnSvg] = useState<string>("")
  const [pcbSvg, setPcbSvg] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoom, setZoom] = useState(1)

  // Generate SVGs when circuit data or options change
  useEffect(() => {
    if (!circuitData) {
      setLbrnSvg("")
      setPcbSvg("")
      return
    }

    const generateSvgs = async () => {
      setIsGenerating(true)
      try {
        // Generate LBRN SVG
        const lbrnProject = convertCircuitJsonToLbrn(
          circuitData.json as CircuitJson,
          lbrnOptions,
        )
        const lbrnSvgResult = generateLightBurnSvg(lbrnProject)
        setLbrnSvg(String(lbrnSvgResult))

        // Generate PCB SVG
        const pcbSvgResult = convertCircuitJsonToPcbSvg(
          circuitData.json as CircuitJson,
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
  }, [circuitData, lbrnOptions])
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => setZoom((z) => z * 1.2)
  const handleZoomOut = () => setZoom((z) => Math.max(0.1, z / 1.2))
  const handleFitToScreen = () => {
    setZoom(1)
    setPanX(0)
    setPanY(0)
  }
  const handleRotate = () => {
    // TODO: implement rotation if needed
  }
  const handleSideBySide = () => {
    // TODO: implement side by side view
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x)
      setPanY(e.clientY - dragStart.y)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((z) => Math.max(0.1, z * delta))
  }
  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Canvas Header */}
      <div className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
        <Badge variant="outline" className="gap-1.5 bg-background">
          <Layers className="size-3" />2 Layers
        </Badge>
        <Badge
          variant="outline"
          className="gap-1.5 bg-primary/10 text-primary border-primary/30"
        >
          <ZoomIn className="size-3" />
          {Math.round(zoom * 100)}%
        </Badge>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Zoom In"
            onClick={handleZoomIn}
          >
            <ZoomIn className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Zoom Out"
            onClick={handleZoomOut}
          >
            <ZoomOut className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Fit to Screen"
            onClick={handleFitToScreen}
          >
            <Maximize2 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Rotate"
            onClick={handleRotate}
          >
            <RotateCw className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Side by Side"
            onClick={handleSideBySide}
          >
            <Grid3x3 className="size-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={svgToPreview === "lbrn" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSvgToPreview("lbrn")}
          >
            LBRN
          </Button>
          <Button
            variant={svgToPreview === "pcb" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSvgToPreview("pcb")}
          >
            PCB
          </Button>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground font-mono">
          120.0 × 80.0 mm
        </span>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative">
        <Card
          ref={containerRef}
          className="w-full h-full bg-white border-0 shadow-none relative overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: `
               linear-gradient(to right, oklch(0.75 0.01 250) 1px, transparent 1px),
               linear-gradient(to bottom, oklch(0.75 0.01 250) 1px, transparent 1px)
             `,
              backgroundSize: "20px 20px",
            }}
          />
          {/* PCB Preview Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="origin-center"
              style={{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              }}
            >
              {isGenerating ? (
                <div className="text-center text-muted-foreground">
                  <div className="size-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
                  <p>Generating {svgToPreview.toUpperCase()} preview...</p>
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: svgToPreview === "lbrn" ? lbrnSvg : pcbSvg,
                  }}
                />
              )}
            </div>
          </div>

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <Badge className="bg-background/90 backdrop-blur-sm border-border">
              {circuitData ? circuitData.fileName : "circuit-board-v2.json"}
            </Badge>
            <Badge
              variant="outline"
              className="bg-background/90 backdrop-blur-sm gap-1.5"
            >
              <Move className="size-3" />
              Pan & Zoom
            </Badge>
          </div>
        </Card>

        {/* Empty State Instructions */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-md text-center">
          <p className="text-sm text-muted-foreground">
            Use scroll to zoom • Click and drag to pan • Toggle layers in the
            left panel
          </p>
        </div>
      </div>
    </div>
  )
}
