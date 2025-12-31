import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Layers,
  Move,
  ZoomIn,
  Columns2,
  RotateCcwSquare,
  RotateCwSquare,
} from "lucide-react"
import { useWorkspace } from "./workspace-context"
import { useState, useRef } from "react"
import { useSvgGeneration, useSvgTransform } from "../hooks/preview-hooks"
export function PreviewCanvas() {
  const { circuitJson, lbrnOptions } = useWorkspace()
  const [svgToPreview, setSvgToPreview] = useState<"lbrn" | "pcb">("lbrn")
  const { lbrnSvg, pcbSvg, isGenerating } = useSvgGeneration({
    circuitJson,
    lbrnOptions,
  })

  const lbrnSvgDivRef = useRef<HTMLDivElement>(null)
  const pcbSvgDivRef = useRef<HTMLDivElement>(null)

  const { transform, ref } = useSvgTransform({
    svgToPreview,
    lbrnSvgDivRef,
    pcbSvgDivRef,
  })

  const currentMatrix = transform

  const handleRotate = () => {
    // TODO: implement rotation if needed
  }
  const handleSideBySide = () => {
    // TODO: implement side by side view
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
          {Math.round(currentMatrix.a * 100)}%
        </Badge>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Rotate Left"
            onClick={handleRotate}
          >
            <RotateCcwSquare className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Rotate Right"
            onClick={handleRotate}
          >
            <RotateCwSquare className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Side by Side"
            onClick={handleSideBySide}
          >
            <Columns2 className="size-3.5" />
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
          ref={ref}
          className="w-full h-full border-0 shadow-none relative overflow-hidden"
          style={{
            backgroundColor: svgToPreview === "pcb" ? "black" : "white",
          }}
        >
          {/* PCB Preview Content */}
          <div
            ref={svgToPreview === "lbrn" ? lbrnSvgDivRef : pcbSvgDivRef}
            style={{
              transformOrigin: "0 0",
            }}
            className="absolute inset-0"
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

          {/* Overlay Info */}
          <div className="absolute bottom-4 text-muted-foreground right-4 flex items-center">
            <Badge
              variant="outline"
              className="bg-background/50 text-muted-foreground backdrop-blur-sm gap-1.5"
            >
              <Move className="size-3 text-muted-foreground" />
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
