import { cn } from "@/utils"
import { ChevronDown, Eye, EyeOff, Layers } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  type ExistingCutSetting,
  LIGHTBURN_COLORS,
} from "../helpers/lightburn-cut-settings"

type CuttingLayersVisibilityMenuProps = {
  cutSettings: ExistingCutSetting[]
  hiddenCutIndexes: number[]
  onHideAll: () => void
  onSelectCutIndex: (cutIndex: number) => void
  onShowAll: () => void
}

export function CuttingLayersVisibilityMenu({
  cutSettings,
  hiddenCutIndexes,
  onHideAll,
  onSelectCutIndex,
  onShowAll,
}: CuttingLayersVisibilityMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const visibleCutSettingCount = cutSettings.length - hiddenCutIndexes.length

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedMenu = menuRef.current?.contains(target)
      const clickedButton = buttonRef.current?.contains(target)
      if (!clickedMenu && !clickedButton) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return

    const updatePosition = () => {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
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
  }, [isOpen])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors shrink-0 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        ref={buttonRef}
        disabled={cutSettings.length === 0}
      >
        {visibleCutSettingCount}/{cutSettings.length} Cutting layers
        <Layers className="size-3" />
        <ChevronDown
          className={cn(
            "size-3 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-10 w-72 rounded-md border border-border bg-background shadow-md p-2"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            <div className="px-2 pb-1 text-xs font-medium text-muted-foreground">
              Visualize Cutting Layers
            </div>
            <div className="grid grid-cols-2 gap-1 pb-1">
              <button
                type="button"
                onClick={onShowAll}
                className="inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Eye className="size-3.5" />
                Show All
              </button>
              <button
                type="button"
                onClick={onHideAll}
                className="inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <EyeOff className="size-3.5" />
                Hide All
              </button>
            </div>
            <div className="max-h-72 overflow-auto">
              {cutSettings.map((cutSetting) => {
                const isVisible = !hiddenCutIndexes.includes(cutSetting.index)
                const color = LIGHTBURN_COLORS[cutSetting.index] ?? "#000000"

                return (
                  <button
                    key={cutSetting.index}
                    type="button"
                    onClick={() => onSelectCutIndex(cutSetting.index)}
                    className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-pressed={isVisible}
                  >
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded ${
                        isVisible ? "text-foreground" : "text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    >
                      {isVisible ? (
                        <Eye className="size-3.5" />
                      ) : (
                        <EyeOff className="size-3.5" />
                      )}
                    </span>
                    <span
                      className="size-3.5 shrink-0 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {cutSetting.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
