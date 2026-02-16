import React, { useState, useRef, useCallback } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  ChevronDown,
  Cpu,
  Layers,
  Plus,
  Settings,
  Trash2,
  Upload,
} from "lucide-react"
import { type LaserProfile, LaserProfileDialog } from "./laser-profile-dialog"
import { NumericControl } from "./numeric-control"
import { useWorkspace } from "./workspace-context"

const LASER_PROFILES_STORAGE_KEY = "pcb-burn:laser-profiles"

const builtInLaserProfiles: Record<string, LaserProfile> = {
  "Omni X 6W 150x150": {
    copper: { speed: 300, numPasses: 1, frequency: 20, pulseWidth: 1 },
    board: { speed: 20, numPasses: 1, frequency: 20, pulseWidth: 1 },
  },
  Default: {
    copper: {
      speed: 300,
      numPasses: 100,
      frequency: 20000,
      pulseWidth: 1,
    },
    board: {
      speed: 20,
      numPasses: 100,
      frequency: 20000,
      pulseWidth: 1,
    },
  },
}

export function SettingsPanel() {
  const {
    circuitJson,
    lbrnFileContent,
    lbrnOptions,
    setLbrnOptions,
    processCircuitFile,
    isConverting,
    error,
  } = useWorkspace()
  const [isDragOver, setIsDragOver] = useState(false)

  const [panelWidth, setPanelWidth] = useState(360) // Default width in pixels
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const [selectedProfile, setSelectedProfile] = useState<string>("Default")
  const [customProfiles, setCustomProfiles] = useState<
    Record<string, LaserProfile>
  >({})
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [profilesLoaded, setProfilesLoaded] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const [profilePendingDelete, setProfilePendingDelete] = useState<
    string | null
  >(null)

  const laserProfiles = React.useMemo(
    () => ({ ...builtInLaserProfiles, ...customProfiles }),
    [customProfiles],
  )

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

  React.useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const storedProfiles = window.localStorage.getItem(
        LASER_PROFILES_STORAGE_KEY,
      )
      if (!storedProfiles) return
      const parsedProfiles = JSON.parse(storedProfiles) as Record<
        string,
        LaserProfile
      >
      if (parsedProfiles && typeof parsedProfiles === "object") {
        setCustomProfiles(parsedProfiles)
      }
    } catch (err) {
      console.warn("Failed to load laser profiles", err)
    } finally {
      setProfilesLoaded(true)
    }
  }, [])

  React.useEffect(() => {
    if (!profilesLoaded) return
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(
        LASER_PROFILES_STORAGE_KEY,
        JSON.stringify(customProfiles),
      )
    } catch (err) {
      console.warn("Failed to save laser profiles", err)
    }
  }, [customProfiles, profilesLoaded])

  React.useEffect(() => {
    if (laserProfiles[selectedProfile]) return
    setSelectedProfile("Default")
  }, [laserProfiles, selectedProfile])

  React.useEffect(() => {
    if (!isProfileMenuOpen) return
    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current) return
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isProfileMenuOpen])

  const handleSaveProfile = (name: string, profile: LaserProfile) => {
    setCustomProfiles((prev) => ({
      ...prev,
      [name]: profile,
    }))
    setLbrnOptions({
      ...lbrnOptions,
      laserProfile: {
        copper: { ...profile.copper },
        board: { ...profile.board },
      },
    })
    setSelectedProfile(name)
  }

  const handleDeleteProfile = (profileName: string) => {
    setCustomProfiles((prev) => {
      const { [profileName]: _, ...rest } = prev
      return rest
    })
    if (selectedProfile === profileName) {
      const fallbackProfile = builtInLaserProfiles.Default
      setLbrnOptions({
        ...lbrnOptions,
        laserProfile: {
          copper: { ...fallbackProfile.copper },
          board: { ...fallbackProfile.board },
        },
      })
      setSelectedProfile("Default")
    }
  }

  const initialProfile = React.useMemo(
    () => ({
      copper: {
        speed: lbrnOptions.laserProfile?.copper?.speed ?? 300,
        numPasses: lbrnOptions.laserProfile?.copper?.numPasses ?? 100,
        frequency: lbrnOptions.laserProfile?.copper?.frequency ?? 20000,
        pulseWidth: lbrnOptions.laserProfile?.copper?.pulseWidth ?? 1,
      },
      board: {
        speed: lbrnOptions.laserProfile?.board?.speed ?? 20,
        numPasses: lbrnOptions.laserProfile?.board?.numPasses ?? 100,
        frequency: lbrnOptions.laserProfile?.board?.frequency ?? 20000,
        pulseWidth: lbrnOptions.laserProfile?.board?.pulseWidth ?? 1,
      },
    }),
    [lbrnOptions.laserProfile],
  )

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
          {/* Conversion Status */}
          <div className="w-full bg-muted/30 px-3 text-xs justify-center flex">
            {!circuitJson && (
              <div className="text-muted-foreground">
                Upload a circuit file to start LBRN generation.
              </div>
            )}

            {circuitJson && isConverting && (
              <div className="flex items-center gap-2 text-foreground">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                Converting to LBRN...
              </div>
            )}

            {circuitJson && !isConverting && lbrnFileContent && !error && (
              <div className="flex items-center gap-2 text-primary">
                <span className="size-2 rounded-full bg-primary" />
                LBRN file generated successfully.
              </div>
            )}

            {error && <div className="text-destructive">{error}</div>}
          </div>
        </div>
      </div>

      {/* Advanced Settings Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="size-4" />
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
            value={lbrnOptions.copperCutFillMargin ?? 0}
            onChange={(value) =>
              setLbrnOptions({ ...lbrnOptions, copperCutFillMargin: value })
            }
            label="Copper Fill Margin"
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
            <div className="flex justify-end gap-1.5  " ref={profileMenuRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                  className="flex items-center justify-between gap-2 px-2 py-1 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-w-16 max-w-44 w-44"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  <span className="truncate">{selectedProfile}</span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-1 z-20 w-64 max-h-60 overflow-auto rounded-md border border-border bg-background shadow-md">
                    <div className="py-1">
                      {Object.keys(laserProfiles).map((profileName) => {
                        const isSelected = profileName === selectedProfile
                        const isProtectedProfile =
                          Object.prototype.hasOwnProperty.call(
                            builtInLaserProfiles,
                            profileName,
                          )
                        return (
                          <div
                            key={profileName}
                            className="flex items-center hover:bg-muted gap-2"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                loadLaserProfile(profileName)
                                setIsProfileMenuOpen(false)
                              }}
                              className={`flex-1 text-left py-1.5 text-sm px-2 focus:outline-none ${
                                isSelected ? "font-medium underline" : ""
                              }`}
                            >
                              <span className="truncate">{profileName}</span>
                            </button>
                            {!isProtectedProfile && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setProfilePendingDelete(profileName)
                                  setIsProfileMenuOpen(false)
                                }}
                                className="shrink-0 p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                aria-label={`Delete ${profileName}`}
                              >
                                <Trash2 className="size-4 text-red-500 hover:text-red-700 hover:scale-105 transition-all mr-2" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsProfileDialogOpen(true)}
                className="inline-flex size-7 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Add new laser profile"
              >
                <Plus className="size-4" />
              </button>
            </div>
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
              value={lbrnOptions.laserProfile?.copper?.pulseWidth ?? 1}
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
              min={1}
              unit="ns"
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
              value={lbrnOptions.laserProfile?.board?.pulseWidth ?? 1}
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
              min={1}
              unit="ns"
            />
          </div>
        </div>
      </div>

      <Dialog
        open={profilePendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setProfilePendingDelete(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete laser profile?</DialogTitle>
            <DialogDescription>
              This will permanently remove “{profilePendingDelete}”. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setProfilePendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-500 text-destructive-foreground hover:bg-red-800"
              onClick={() => {
                if (!profilePendingDelete) return
                handleDeleteProfile(profilePendingDelete)
                setProfilePendingDelete(null)
                setIsProfileMenuOpen(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LaserProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        initialProfile={initialProfile}
        existingProfileNames={Object.keys(laserProfiles)}
        onSave={handleSaveProfile}
      />
    </div>
  )
}
