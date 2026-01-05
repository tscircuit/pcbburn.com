import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Layers, Move, RotateCcwSquare, RotateCwSquare } from "lucide-react"
import { useWorkspace } from "./workspace-context"
import { useState, useRef } from "react"
import { useSvgGeneration, useSvgTransform } from "../hooks/preview-hooks"
export function PreviewCanvas() {
  const { circuitJson, lbrnOptions } = useWorkspace()
  const [viewMode, setViewMode] = useState<"lbrn" | "pcb" | "both">("lbrn")
  const { lbrnSvg, pcbSvg, isGenerating } = useSvgGeneration({
    circuitJson,
    lbrnOptions,
  })

  const lbrnSvgDivRef = useRef<HTMLDivElement>(null)
  const pcbSvgDivRef = useRef<HTMLDivElement>(null)

  const { ref, lbrnRef, pcbRef } = useSvgTransform({
    svgToPreview: viewMode === "both" ? "lbrn" : viewMode,
    lbrnSvgDivRef,
    pcbSvgDivRef,
    isSideBySide: viewMode === "both",
  })

  const handleRotate = () => {
    // TODO: implement rotation if needed
  }
  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Canvas Header */}
      <div className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
        <Badge variant="outline" className="gap-1.5 bg-background">
          <Layers className="size-3" />2 Layers
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
        </div>
        <div className="flex items-center gap-0 border border-border rounded-md p-1 bg-muted/20">
          <Button
            variant={viewMode === "lbrn" ? "default" : "ghost"}
            size="sm"
            className="rounded-r-none"
            onClick={() => setViewMode("lbrn")}
          >
            LBRN
          </Button>
          <Button
            variant={viewMode === "pcb" ? "default" : "ghost"}
            size="sm"
            className="rounded-none border-x"
            onClick={() => setViewMode("pcb")}
          >
            PCB
          </Button>
          <Button
            variant={viewMode === "both" ? "default" : "ghost"}
            size="sm"
            className="rounded-l-none"
            onClick={() => setViewMode("both")}
          >
            Both
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === "both" ? (
          <div className="flex flex-col h-full">
            <div className="flex flex-1">
              {/* LBRN Side */}
              <div className="flex flex-col flex-1">
                <div className="text-center py-1 bg-muted/10 mt-2  text-md font-medium">
                  LBRN
                </div>
                <Card
                  ref={lbrnRef}
                  className="flex-1 border-0 shadow-none relative overflow-hidden cursor-grab"
                  style={{
                    backgroundColor: "white",
                  }}
                >
                  <div
                    ref={lbrnSvgDivRef}
                    style={{
                      transformOrigin: "0 0",
                    }}
                    className="absolute inset-0"
                  >
                    {isGenerating ? (
                      <div className="text-center text-muted-foreground">
                        <div className="size-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
                        <p>Generating LBRN preview...</p>
                      </div>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: lbrnSvg,
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
              </div>

              {/* PCB Side */}
              <div className="flex flex-col flex-1">
                <div className="text-center py-1 bg-muted/10 mt-2 border-l text-md font-medium">
                  PCB
                </div>
                <Card
                  ref={pcbRef}
                  className="flex-1 border-0 shadow-none relative overflow-hidden border-l cursor-grab"
                  style={{
                    backgroundColor: "black",
                  }}
                >
                  <div
                    ref={pcbSvgDivRef}
                    style={{
                      transformOrigin: "0 0",
                    }}
                    className="absolute inset-0"
                  >
                    {isGenerating ? (
                      <div className="text-center text-muted-foreground">
                        <div className="size-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
                        <p>Generating PCB preview...</p>
                      </div>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: pcbSvg,
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
              </div>
            </div>
          </div>
        ) : (
          <Card
            ref={ref}
            className="w-full h-full border-0 shadow-none relative overflow-hidden cursor-grab"
            style={{
              backgroundColor: viewMode === "pcb" ? "black" : "white",
            }}
          >
            {/* PCB Preview Content */}
            <div
              ref={viewMode === "lbrn" ? lbrnSvgDivRef : pcbSvgDivRef}
              style={{
                transformOrigin: "0 0",
              }}
              className="absolute inset-0"
            >
              {isGenerating ? (
                <div className="text-center text-muted-foreground">
                  <div className="size-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
                  <p>Generating {viewMode.toUpperCase()} preview...</p>
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: viewMode === "lbrn" ? lbrnSvg : pcbSvg,
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
        )}

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
