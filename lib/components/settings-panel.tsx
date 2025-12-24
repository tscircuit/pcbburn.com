import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Settings, Zap, Upload, FileUp, Check } from "lucide-react"
import { useWorkspace } from "./workspace-context"

type LbrnOptions = {
  includeCopper: boolean
  includeSoldermask: boolean
  includeSilkscreen: boolean
  includeLayers: Array<"top" | "bottom">
  laserSpotSize: number
  traceMargin: number
  origin?: { x: number; y: number }
}

export function SettingsPanel() {
  const {
    circuitData,
    setCircuitData,
    lbrnData,
    lbrnOptions,
    setLbrnOptions,
    convertToLbrn,
    isConverting,
    error,
  } = useWorkspace()
  const [isDragOver, setIsDragOver] = useState(false)
  const [draftOptions, setDraftOptions] = useState<LbrnOptions>(lbrnOptions)

  // Sync draft options when workspace options change
  React.useEffect(() => {
    setDraftOptions(lbrnOptions)
  }, [lbrnOptions])

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".json")) {
      alert("Please upload a JSON file")
      return
    }

    try {
      const text = await file.text()
      const json = JSON.parse(text)
      setCircuitData({
        json,
        fileName: file.name,
      })
    } catch (err) {
      alert("Invalid JSON file")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="size-4" />
        <h3 className="font-semibold">Settings</h3>
      </div>

      <Separator />

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-2">Circuit File</h4>
          <div className="space-y-2">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="circuit-file"
              />
              <label htmlFor="circuit-file" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="size-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {circuitData
                        ? "Change Circuit JSON"
                        : "Upload Circuit JSON"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop or click to browse
                    </p>
                  </div>
                </div>
              </label>
            </div>
            {circuitData && (
              <Badge variant="outline" className="gap-1.5">
                <FileUp className="size-3" />
                {circuitData.fileName}
              </Badge>
            )}
            <Button
              onClick={() => convertToLbrn()}
              disabled={!circuitData || isConverting || !!lbrnData}
              size="sm"
              className="w-full gap-2"
            >
              <Zap className="size-4" />
              {isConverting
                ? "Converting..."
                : lbrnData
                  ? "File Previewed"
                  : "Preview File"}
            </Button>
            {error && <div className="text-sm text-destructive">{error}</div>}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-2">LBRN Options</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Include Copper</span>
              <Button
                variant={draftOptions.includeCopper ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setDraftOptions((prev: LbrnOptions) => ({
                    ...prev,
                    includeCopper: !prev.includeCopper,
                  }))
                }
              >
                {draftOptions.includeCopper ? (
                  <Check className="size-3" />
                ) : (
                  "Off"
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Include Soldermask</span>
              <Button
                variant={draftOptions.includeSoldermask ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setDraftOptions((prev: LbrnOptions) => ({
                    ...prev,
                    includeSoldermask: !prev.includeSoldermask,
                  }))
                }
              >
                {draftOptions.includeSoldermask ? (
                  <Check className="size-3" />
                ) : (
                  "Off"
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Include Silkscreen</span>
              <Button
                variant={draftOptions.includeSilkscreen ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setDraftOptions((prev: LbrnOptions) => ({
                    ...prev,
                    includeSilkscreen: !prev.includeSilkscreen,
                  }))
                }
              >
                {draftOptions.includeSilkscreen ? (
                  <Check className="size-3" />
                ) : (
                  "Off"
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Layers</span>
              <div className="flex gap-1">
                <Button
                  variant={
                    draftOptions.includeLayers.includes("top")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setDraftOptions((prev: LbrnOptions) => ({
                      ...prev,
                      includeLayers: prev.includeLayers.includes("top")
                        ? prev.includeLayers.filter(
                            (l: "top" | "bottom") => l !== "top",
                          )
                        : [...prev.includeLayers, "top"],
                    }))
                  }
                >
                  Top
                </Button>
                <Button
                  variant={
                    draftOptions.includeLayers.includes("bottom")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setDraftOptions((prev: LbrnOptions) => ({
                      ...prev,
                      includeLayers: prev.includeLayers.includes("bottom")
                        ? prev.includeLayers.filter(
                            (l: "top" | "bottom") => l !== "bottom",
                          )
                        : [...prev.includeLayers, "bottom"],
                    }))
                  }
                >
                  Bottom
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Laser Spot Size</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    setDraftOptions((prev: LbrnOptions) => ({
                      ...prev,
                      laserSpotSize: Math.max(
                        0.001,
                        prev.laserSpotSize - 0.001,
                      ),
                    }))
                  }
                >
                  -
                </Button>
                <span className="text-xs w-12 text-center">
                  {draftOptions.laserSpotSize.toFixed(3)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    setDraftOptions((prev: LbrnOptions) => ({
                      ...prev,
                      laserSpotSize: prev.laserSpotSize + 0.001,
                    }))
                  }
                >
                  +
                </Button>
                <span className="text-xs text-muted-foreground">mm</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Trace Margin</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    setDraftOptions((prev: LbrnOptions) => ({
                      ...prev,
                      traceMargin: Math.max(0, prev.traceMargin - 0.1),
                    }))
                  }
                >
                  -
                </Button>
                <span className="text-xs w-12 text-center">
                  {draftOptions.traceMargin.toFixed(1)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    setDraftOptions((prev: LbrnOptions) => ({
                      ...prev,
                      traceMargin: prev.traceMargin + 0.1,
                    }))
                  }
                >
                  +
                </Button>
                <span className="text-xs text-muted-foreground">mm</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Origin X</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    setDraftOptions((prev: LbrnOptions) => ({
                      ...prev,
                      origin: {
                        x: (prev.origin?.x || 0) - 1,
                        y: prev.origin?.y || 0,
                      },
                    }))
                  }
                >
                  -
                </Button>
                <span className="text-xs w-12 text-center">
                  {draftOptions.origin?.x || 0}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    setDraftOptions((prev: LbrnOptions) => ({
                      ...prev,
                      origin: {
                        x: (prev.origin?.x || 0) + 1,
                        y: prev.origin?.y || 0,
                      },
                    }))
                  }
                >
                  +
                </Button>
                <span className="text-xs text-muted-foreground">mm</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Origin Y</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    setDraftOptions((prev: LbrnOptions) => ({
                      ...prev,
                      origin: {
                        x: prev.origin?.x || 0,
                        y: (prev.origin?.y || 0) - 1,
                      },
                    }))
                  }
                >
                  -
                </Button>
                <span className="text-xs w-12 text-center">
                  {draftOptions.origin?.y || 0}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    setDraftOptions((prev: LbrnOptions) => ({
                      ...prev,
                      origin: {
                        x: prev.origin?.x || 0,
                        y: (prev.origin?.y || 0) + 1,
                      },
                    }))
                  }
                >
                  +
                </Button>
                <span className="text-xs text-muted-foreground">mm</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-2">Actions</h4>
          <div className="space-y-3">
            <Button
              onClick={() => {
                setLbrnOptions(draftOptions)
                convertToLbrn()
              }}
              disabled={isConverting}
              size="sm"
              className="w-full gap-2"
              variant="default"
            >
              <Check className="size-4" />
              Apply Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
