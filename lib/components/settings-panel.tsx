import React, { useState, useRef, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Settings, Zap, Upload, Cpu, Layers, Target } from "lucide-react"
import { useWorkspace } from "./workspace-context"

export function SettingsPanel() {
  const {
    circuitJson,
    lbrnFileContent,
    lbrnOptions,
    setLbrnOptions,
    convertToLbrn,
    processCircuitFile,
    isConverting,
    error,
  } = useWorkspace()
  const [isDragOver, setIsDragOver] = useState(false)

  const [panelWidth, setPanelWidth] = useState(360) // Default width in pixels
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Laser profile presets
  const laserProfiles = {
    "Omni X 6W 150x150": {
      copper: { speed: 300, numPasses: 1, frequency: 20, pulseWidth: 0.000001 },
      board: { speed: 20, numPasses: 1, frequency: 20, pulseWidth: 0.000001 },
    },
    Default: {
      copper: {
        speed: 300,
        numPasses: 100,
        frequency: 20000,
        pulseWidth: 0.000001,
      },
      board: {
        speed: 20,
        numPasses: 100,
        frequency: 20000,
        pulseWidth: 0.000001,
      },
    },
  }

  const [selectedProfile, setSelectedProfile] = useState<string>("Default")

  // Resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return

      const rect = panelRef.current.getBoundingClientRect()
      const newWidth = e.clientX - rect.left
      const clampedWidth = Math.max(360, Math.min(512, newWidth)) // min-w-80 = 320px, but using 360px for more space
      setPanelWidth(clampedWidth)
    },
    [isResizing],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "ew-resize"
      document.body.style.userSelect = "none"
    } else {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // Load laser profile preset
  const loadLaserProfile = (profileName: string) => {
    const profile = laserProfiles[profileName as keyof typeof laserProfiles]
    if (profile) {
      setLbrnOptions({
        ...lbrnOptions,
        laserProfile: {
          copper: { ...profile.copper },
          board: { ...profile.board },
        },
      })
      setSelectedProfile(profileName)
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      await processCircuitFile(file)
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processCircuitFile(files[0])
    }
  }
  // Helper function to create toggle buttons
  const ToggleButton = ({
    value,
    onChange,
    label,
  }: {
    value: boolean
    onChange: (value: boolean) => void
    label: string
  }) => (
    <div className="flex items-center justify-between min-w-0">
      <span className="text-sm truncate">{label}</span>
      <Button
        variant={value ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(!value)}
        className="w-16"
      >
        {value ? "On" : "Off"}
      </Button>
    </div>
  )

  // Helper function for numeric controls
  const NumericControl = ({
    value,
    onChange,
    label,
    min = 0,
    unit = "",
  }: {
    value: number
    onChange: (value: number) => void
    label: string
    min?: number
    unit?: string
  }) => {
    const [inputValue, setInputValue] = useState(value.toString())

    React.useEffect(() => {
      setInputValue(value.toString())
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
    }

    const handleInputBlur = () => {
      const numericValue = parseFloat(inputValue)
      if (Number.isNaN(numericValue) || numericValue < min) {
        // Reset to original value if invalid
        setInputValue(value.toString())
      } else {
        // Commit the valid value
        onChange(Math.max(min, numericValue))
      }
    }

    return (
      <div className="flex items-center justify-between">
        <span className="text-sm">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="text-xs w-24 text-center border border-input bg-background rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {unit && (
            <span className="text-xs text-muted-foreground w-6">{unit}</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={panelRef}
      className="px-4 pb-4 space-y-6 overflow-auto border-r border-border relative"
      style={{ width: `${panelWidth}px` }}
    >
      {/* Resize handle overlay */}
      <div
        className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize bg-transparent hover:bg-border/50 transition-colors"
        onMouseDown={handleMouseDown}
      />
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="size-5" />
        <h3 className="font-semibold text-lg">PCB Burn Settings</h3>
      </div>

      {/* Circuit File Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="size-4" />
          <h4 className="text-sm font-medium">Circuit File</h4>
        </div>
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
              accept=".json,.kicad_pcb"
              onChange={handleFileUpload}
              className="hidden"
              id="circuit-file"
            />
            <label htmlFor="circuit-file" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="size-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {circuitJson
                      ? "Change Circuit File"
                      : "Upload Circuit File"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports .json and .kicad_pcb files
                  </p>
                </div>
              </div>
            </label>
          </div>
          <Button
            onClick={() => convertToLbrn()}
            disabled={!circuitJson || isConverting || !!lbrnFileContent}
            size="sm"
            className="w-full gap-2"
          >
            <Zap className="size-4" />
            {isConverting
              ? "Converting..."
              : lbrnFileContent
                ? "LBRN Generated"
                : "Generate LBRN"}
          </Button>
          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>
      </div>

      <Separator />

      {/* Basic Settings Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="size-4" />
          <h4 className="text-sm font-medium">Basic Settings</h4>
        </div>
        <div className="space-y-3 pl-6">
          <ToggleButton
            value={lbrnOptions.includeCopper ?? true}
            onChange={(value) =>
              setLbrnOptions({ ...lbrnOptions, includeCopper: value })
            }
            label="Include Copper"
          />
          <ToggleButton
            value={lbrnOptions.includeSoldermask ?? false}
            onChange={(value) =>
              setLbrnOptions({ ...lbrnOptions, includeSoldermask: value })
            }
            label="Include Soldermask"
          />
          {/* Layer Selection */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Layers</span>
            <div className="flex gap-1">
              <Button
                variant={
                  (lbrnOptions.includeLayers ?? ["top", "bottom"]).includes(
                    "top",
                  )
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="w-16"
                onClick={() =>
                  setLbrnOptions({
                    ...lbrnOptions,
                    includeLayers: (
                      lbrnOptions.includeLayers ?? ["top", "bottom"]
                    ).includes("top")
                      ? (lbrnOptions.includeLayers ?? ["top", "bottom"]).filter(
                          (l: "top" | "bottom") => l !== "top",
                        )
                      : [
                          ...(lbrnOptions.includeLayers ?? ["top", "bottom"]),
                          "top",
                        ],
                  })
                }
              >
                Top
              </Button>
              <Button
                variant={
                  (lbrnOptions.includeLayers ?? ["top", "bottom"]).includes(
                    "bottom",
                  )
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="w-16"
                onClick={() =>
                  setLbrnOptions({
                    ...lbrnOptions,
                    includeLayers: (
                      lbrnOptions.includeLayers ?? ["top", "bottom"]
                    ).includes("bottom")
                      ? (lbrnOptions.includeLayers ?? ["top", "bottom"]).filter(
                          (l: "top" | "bottom") => l !== "bottom",
                        )
                      : [
                          ...(lbrnOptions.includeLayers ?? ["top", "bottom"]),
                          "bottom",
                        ],
                  })
                }
              >
                Bottom
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Advanced Settings Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="size-4" />
          <h4 className="text-sm font-medium">Advanced Settings</h4>
        </div>
        <div className="space-y-3 pl-6">
          <NumericControl
            value={lbrnOptions.laserSpotSize ?? 0.005}
            onChange={(value) =>
              setLbrnOptions({ ...lbrnOptions, laserSpotSize: value })
            }
            label="Laser Spot Size"
            min={0.001}
            unit="mm"
          />
          <NumericControl
            value={lbrnOptions.traceMargin ?? 0}
            onChange={(value) =>
              setLbrnOptions({ ...lbrnOptions, traceMargin: value })
            }
            label="Trace Margin"
            min={0}
            unit="mm"
          />
          <NumericControl
            value={lbrnOptions.globalCopperSoldermaskMarginAdjustment ?? 0}
            onChange={(value) =>
              setLbrnOptions({
                ...lbrnOptions,
                globalCopperSoldermaskMarginAdjustment: value,
              })
            }
            label="Soldermask Margin"
            min={-Infinity}
            unit="mm"
          />
          <NumericControl
            value={lbrnOptions.solderMaskMarginPercent ?? 0}
            onChange={(value) =>
              setLbrnOptions({
                ...lbrnOptions,
                solderMaskMarginPercent: value,
              })
            }
            label="Soldermask Margin Percent"
            min={-Infinity}
            unit="%"
          />

          {/* Origin Controls */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Origin Offset
            </div>
            <NumericControl
              value={lbrnOptions.origin?.x ?? 0}
              onChange={(value) =>
                setLbrnOptions({
                  ...lbrnOptions,
                  origin: { x: value, y: lbrnOptions.origin?.y ?? 0 },
                })
              }
              label="Origin X"
              min={-Infinity}
              unit="mm"
            />
            <NumericControl
              value={lbrnOptions.origin?.y ?? 0}
              onChange={(value) =>
                setLbrnOptions({
                  ...lbrnOptions,
                  origin: { x: lbrnOptions.origin?.x ?? 0, y: value },
                })
              }
              label="Origin Y"
              min={-Infinity}
              unit="mm"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Laser Profile Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="size-4" />
          <h4 className="text-sm font-medium">Laser Profile Settings</h4>
        </div>
        <div className="space-y-4 pl-6 border-l border-border">
          {/* Profile Selection */}
          <div className="flex items-center justify-between min-w-0">
            <span className="text-sm truncate">Laser Profile</span>
            <select
              value={selectedProfile}
              onChange={(e) => loadLaserProfile(e.target.value)}
              className="px-2 py-1 text-sm border mr-5 border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-w-16 max-w-44"
            >
              {Object.keys(laserProfiles).map((profileName) => (
                <option key={profileName} value={profileName}>
                  {profileName}
                </option>
              ))}
            </select>
          </div>

          {/* Copper Settings */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Copper Cutting
            </div>
            <NumericControl
              value={lbrnOptions.laserProfile?.copper?.speed ?? 300}
              onChange={(value) =>
                setLbrnOptions({
                  ...lbrnOptions,
                  laserProfile: {
                    ...lbrnOptions.laserProfile,
                    copper: {
                      ...lbrnOptions.laserProfile?.copper,
                      speed: value,
                    },
                  },
                })
              }
              label="Speed"
              min={1}
              unit="mm/s"
            />
            <NumericControl
              value={lbrnOptions.laserProfile?.copper?.numPasses ?? 100}
              onChange={(value) =>
                setLbrnOptions({
                  ...lbrnOptions,
                  laserProfile: {
                    ...lbrnOptions.laserProfile,
                    copper: {
                      ...lbrnOptions.laserProfile?.copper,
                      numPasses: value,
                    },
                  },
                })
              }
              label="Passes"
              min={1}
              unit=" "
            />
            <NumericControl
              value={lbrnOptions.laserProfile?.copper?.frequency ?? 20000}
              onChange={(value) =>
                setLbrnOptions({
                  ...lbrnOptions,
                  laserProfile: {
                    ...lbrnOptions.laserProfile,
                    copper: {
                      ...lbrnOptions.laserProfile?.copper,
                      frequency: value,
                    },
                  },
                })
              }
              label="Frequency"
              min={1000}
              unit="kHz"
            />
            <NumericControl
              value={lbrnOptions.laserProfile?.copper?.pulseWidth ?? 0.000001}
              onChange={(value) =>
                setLbrnOptions({
                  ...lbrnOptions,
                  laserProfile: {
                    ...lbrnOptions.laserProfile,
                    copper: {
                      ...lbrnOptions.laserProfile?.copper,
                      pulseWidth: value,
                    },
                  },
                })
              }
              label="Pulse Width"
              min={0.0000001}
              unit="s"
            />
          </div>

          <Separator />

          {/* Board Settings */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Board Cutting
            </div>
            <NumericControl
              value={lbrnOptions.laserProfile?.board?.speed ?? 20}
              onChange={(value) =>
                setLbrnOptions({
                  ...lbrnOptions,
                  laserProfile: {
                    ...lbrnOptions.laserProfile,
                    board: { ...lbrnOptions.laserProfile?.board, speed: value },
                  },
                })
              }
              label="Speed"
              min={1}
              unit="mm/s"
            />
            <NumericControl
              value={lbrnOptions.laserProfile?.board?.numPasses ?? 100}
              onChange={(value) =>
                setLbrnOptions({
                  ...lbrnOptions,
                  laserProfile: {
                    ...lbrnOptions.laserProfile,
                    board: {
                      ...lbrnOptions.laserProfile?.board,
                      numPasses: value,
                    },
                  },
                })
              }
              label="Passes"
              min={1}
              unit=" "
            />
            <NumericControl
              value={lbrnOptions.laserProfile?.board?.frequency ?? 20000}
              onChange={(value) =>
                setLbrnOptions({
                  ...lbrnOptions,
                  laserProfile: {
                    ...lbrnOptions.laserProfile,
                    board: {
                      ...lbrnOptions.laserProfile?.board,
                      frequency: value,
                    },
                  },
                })
              }
              label="Frequency"
              min={1000}
              unit="kHz"
            />
            <NumericControl
              value={lbrnOptions.laserProfile?.board?.pulseWidth ?? 0.000001}
              onChange={(value) =>
                setLbrnOptions({
                  ...lbrnOptions,
                  laserProfile: {
                    ...lbrnOptions.laserProfile,
                    board: {
                      ...lbrnOptions.laserProfile?.board,
                      pulseWidth: value,
                    },
                  },
                })
              }
              label="Pulse Width"
              min={0.0000001}
              unit="s"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
