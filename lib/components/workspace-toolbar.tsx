import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useWorkspace } from "./workspace-context"

export function WorkspaceToolbar() {
  const { lbrnFileContent } = useWorkspace()

  const handleExport = () => {
    if (!lbrnFileContent) return

    const blob = new Blob([lbrnFileContent.xml], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "circuit.lbrn"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-transparent"
        onClick={handleExport}
        disabled={!lbrnFileContent}
      >
        <Download className="size-4" />
        <span className="hidden sm:inline">Export LBRN</span>
      </Button>
    </div>
  )
}
