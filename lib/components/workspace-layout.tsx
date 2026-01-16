import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SettingsPanel } from "@/components/settings-panel"
import { PreviewCanvas } from "@/components/preview-canvas"
import { WorkspaceToolbar } from "@/components/workspace-toolbar"
import { WorkspaceProvider, useWorkspace } from "@/components/workspace-context"
import { BlankWorkspace } from "@/components/blank-workspace"
import { Zap, Menu, X } from "lucide-react"

export function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <WorkspaceProvider>
      <WorkspaceContent
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </WorkspaceProvider>
  )
}

export function WorkspaceContent({
  sidebarOpen,
  setSidebarOpen,
}: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  const { circuitJson, isProcessingFile, error } = useWorkspace()
  const navigate = useNavigate()

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center shrink-0">
        {circuitJson && !isProcessingFile && !error && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          className="flex items-center gap-2 p-0 h-auto cursor-pointer hover:bg-transparent hover:text-inherit"
          onClick={() => navigate("/")}
        >
          <div className="size-7 rounded  bg-primary flex items-center justify-center">
            <Zap className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">PCBBurn</span>
        </Button>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Workspace
        </span>
        <div className="flex-1" />
        <WorkspaceToolbar />
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Settings Panel - Only show when circuit is loaded and not processing and no error */}
        {circuitJson && !isProcessingFile && !error && (
          <>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-30 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            <aside
              className={`${
                sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
              } fixed subtle-scrollbar overflow-x-hidden md:relative z-40 w-fit md:w-fit md:min-w-72 md:max-w-lg h-[calc(100vh-3.5rem)] bg-card border-r border-border overflow-y-auto transition-transform duration-300 ease-in-out md:translate-x-0 md:shadow-none`}
            >
              <SettingsPanel />
            </aside>
          </>
        )}

        {/* Canvas Preview Area */}
        <main className="flex-1 overflow-hidden">
          {(circuitJson || isProcessingFile) && !error ? (
            <PreviewCanvas />
          ) : (
            <BlankWorkspace />
          )}
        </main>
      </div>
    </div>
  )
}
