import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useWorkspace } from "./workspace-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function WorkspaceToolbar() {
  const { lbrnFileContent } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [filename, setFilename] = useState("circuit.lbrn")

  const handleExport = () => {
    if (!lbrnFileContent) return
    setOpen(true)
  }

  const handleConfirmExport = () => {
    if (!lbrnFileContent) return

    const finalFilename = filename.endsWith(".lbrn")
      ? filename
      : `${filename}.lbrn`

    const blob = new Blob([lbrnFileContent.xml], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = finalFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-transparent mr-2"
        onClick={handleExport}
        disabled={!lbrnFileContent}
      >
        <Download className="size-4" />
        <span className="hidden sm:inline">Export LBRN</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export LBRN File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="filename" className="text-right">
                File name
              </label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmExport}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
