import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/utils"
import {
  ChevronDown,
  Layers,
  Maximize,
  Move,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useSvgGeneration, useSvgTransform } from "../hooks/preview-hooks"
import { useWorkspace } from "./workspace-context"
export function PreviewCanvas() {
  const { circuitJson, lbrnOptions, isProcessingFile, setLbrnOptions } =
    useWorkspace()
  const [viewMode, setViewMode] = useState<"lbrn" | "pcb" | "both">("lbrn")
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false)
  const { lbrnSvg, pcbSvg, isGenerating } = useSvgGeneration({
    circuitJson,
    lbrnOptions,
    viewMode,
  })

  const lbrnSvgDivRef = useRef<HTMLDivElement>(null)
  const pcbSvgDivRef = useRef<HTMLDivElement>(null)
  const layerMenuRef = useRef<HTMLDivElement>(null)
  const layerButtonRef = useRef<HTMLButtonElement>(null)
  const [layerMenuPosition, setLayerMenuPosition] = useState({
    top: 0,
    left: 0,
  })
  // Container refs for computing fit-to-viewport transforms
  const lbrnContainerRef = useRef<HTMLDivElement>(null)
  const pcbContainerRef = useRef<HTMLDivElement>(null)

  const { ref, lbrnRef, pcbRef, zoomIn, zoomOut, fitToScreen } =
    useSvgTransform({
      svgToPreview: viewMode === "both" ? "lbrn" : viewMode,
      viewMode,
      lbrnSvgDivRef,
      pcbSvgDivRef,
      lbrnContainerRef,
      pcbContainerRef,
      lbrnSvg,
      pcbSvg,
      circuitJson,
      isSideBySide: viewMode === "both",
    })

  useEffect(() => {
    if (!isLayerMenuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedMenu = layerMenuRef.current?.contains(target)
      const clickedButton = layerButtonRef.current?.contains(target)
      if (!clickedMenu && !clickedButton) {
        setIsLayerMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLayerMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isLayerMenuOpen])

  useLayoutEffect(() => {
    if (!isLayerMenuOpen || !layerButtonRef.current) return

    const updatePosition = () => {
      if (!layerButtonRef.current) return
      const rect = layerButtonRef.current.getBoundingClientRect()
      setLayerMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
      })
    }

    updatePosition()

    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [isLayerMenuOpen])

  const includeLayers = lbrnOptions.includeLayers ?? []
  const layerCount = includeLayers.length

  const toggleLayer = (layer: "top" | "bottom") => {
    const isSelected = includeLayers.includes(layer)
    if (isSelected && includeLayers.length === 1) return

    const nextLayers = isSelected
      ? includeLayers.filter((item) => item !== layer)
      : [...includeLayers, layer]

    setLbrnOptions({ includeLayers: nextLayers })
  }

  // Show loading screen when processing file but no circuit yet
  if (!circuitJson && isProcessingFile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="size-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Loading circuit...</p>
          <div className="w-64 mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full animate-pulse"
                style={{
                  width: "100%",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Canvas Header */}
      <div className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-2 md:px-4 gap-2 md:gap-3 shrink-0 overflow-x-hidden md:overflow-x-auto subtle-scrollbar relative  overflow-visible">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLayerMenuOpen((open) => !open)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors shrink-0 whitespace-nowrap"
            aria-haspopup="menu"
            aria-expanded={isLayerMenuOpen}
            ref={layerButtonRef}
          >
            <Layers className="size-3" />
            {layerCount} {layerCount === 1 ? "Layer" : "Layers"}
            <ChevronDown
              className={cn(
                "size-3 text-muted-foreground transition-transform",
                isLayerMenuOpen && "rotate-180",
              )}
            />
          </button>
          {isLayerMenuOpen &&
            createPortal(
              <div
                ref={layerMenuRef}
                className="fixed z-10 w-48 rounded-md border border-border bg-background shadow-md p-2"
                style={{
                  top: layerMenuPosition.top,
                  left: layerMenuPosition.left,
                }}
              >
                <div className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                  Include Layers
                </div>
                <label className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer">
                  <span className="text-sm">Top</span>
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={includeLayers.includes("top")}
                    onChange={() => toggleLayer("top")}
                    disabled={
                      includeLayers.length === 1 &&
                      includeLayers.includes("top")
                    }
                    aria-label="Toggle top layer"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer">
                  <span className="text-sm">Bottom</span>
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={includeLayers.includes("bottom")}
                    onChange={() => toggleLayer("bottom")}
                    disabled={
                      includeLayers.length === 1 &&
                      includeLayers.includes("bottom")
                    }
                    aria-label="Toggle bottom layer"
                  />
                </label>
                <div className="px-2 pt-1 text-[11px] text-muted-foreground">
                  At least one layer must stay enabled.
                </div>
              </div>,
              document.body,
            )}
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Zoom Out"
            onClick={zoomOut}
            disabled={!circuitJson || isGenerating}
          >
            <ZoomOut className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Zoom In"
            onClick={zoomIn}
            disabled={!circuitJson || isGenerating}
          >
            <ZoomIn className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Fit to Screen"
            onClick={fitToScreen}
            disabled={!circuitJson || isGenerating}
          >
            <Maximize className="size-3.5" />
          </Button>
        </div>
        <div className="inline-flex items-center rounded-lg bg-muted p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("lbrn")}
            className={cn(
              "rounded-md px-4 h-8 transition-all",
              viewMode === "lbrn" &&
                "bg-primary text-primary-foreground shadow-sm",
            )}
          >
            LBRN
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("pcb")}
            className={cn(
              "rounded-md px-4 h-8 transition-all",
              viewMode === "pcb" &&
                "bg-primary text-primary-foreground shadow-sm",
            )}
          >
            PCB
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("both")}
            className={cn(
              "rounded-md px-4 h-8 transition-all",
              viewMode === "both" &&
                "bg-primary text-primary-foreground shadow-sm",
            )}
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
                  ref={(node) => {
                    // Assign to both refs: mouse handler and container for fit calculation
                    lbrnRef.current = node
                    ;(
                      lbrnContainerRef as React.MutableRefObject<HTMLDivElement | null>
                    ).current = node
                  }}
                  className="flex-1 border-0 shadow-none relative overflow-hidden cursor-grab"
                  style={{
                    backgroundColor: "white",
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <div
                    ref={lbrnSvgDivRef}
                    style={{
                      transformOrigin: "0 0",
                      userSelect: "none",
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
                  <div
                    className="absolute bottom-4 text-muted-foreground right-4 flex items-center"
                    style={{ userSelect: "none" }}
                  >
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
                  ref={(node) => {
                    pcbRef.current = node
                    ;(
                      pcbContainerRef as React.MutableRefObject<HTMLDivElement | null>
                    ).current = node
                  }}
                  className="flex-1 border-0 shadow-none relative overflow-hidden border-l cursor-grab"
                  style={{
                    backgroundColor: "black",
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <div
                    ref={pcbSvgDivRef}
                    style={{
                      transformOrigin: "0 0",
                      userSelect: "none",
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
                  <div
                    className="absolute bottom-4 text-muted-foreground right-4 flex items-center"
                    style={{ userSelect: "none" }}
                  >
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
            ref={(node) => {
              // Assign to the active view's refs
              ref.current = node
              if (viewMode === "lbrn") {
                ;(
                  lbrnContainerRef as React.MutableRefObject<HTMLDivElement | null>
                ).current = node
              } else {
                ;(
                  pcbContainerRef as React.MutableRefObject<HTMLDivElement | null>
                ).current = node
              }
            }}
            className="w-full h-full border-0 shadow-none relative overflow-hidden cursor-grab"
            style={{
              backgroundColor: viewMode === "pcb" ? "black" : "white",
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* PCB Preview Content */}
            <div
              ref={viewMode === "lbrn" ? lbrnSvgDivRef : pcbSvgDivRef}
              style={{
                transformOrigin: "0 0",
                userSelect: "none",
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
            <div
              className="absolute bottom-4 text-muted-foreground right-4 flex items-center"
              style={{ userSelect: "none" }}
            >
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
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-md text-center"
          style={{ userSelect: "none" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <p className="text-sm text-muted-foreground">
            Use scroll to zoom • Click and drag to pan • Toggle layers in the
            left panel
          </p>
        </div>
      </div>
    </div>
  )
}
