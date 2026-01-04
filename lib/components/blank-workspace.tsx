import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileUp, Zap, ArrowRight, CircuitBoard } from "lucide-react"
import { useWorkspace } from "./workspace-context"

export function BlankWorkspace() {
  const { processCircuitFile, processCircuitDrop } = useWorkspace()
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      await processCircuitFile(file)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
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
    await processCircuitDrop(e.dataTransfer)
  }

  return (
    <div className="h-full bg-muted/10 flex flex-col overflow-y-auto">
      <div className="max-w-sm md:max-w-4xl w-full space-y-2 mx-auto p-2 md:p-4">
        {/* Header */}
        <div className="text-center space-y-2 md:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full bg-primary/10 border border-primary text-sm text-primary">
            <Zap className="size-3.5" />
            <span className="font-medium">Circuit to LBRN Converter</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
            Convert Your Circuit
            <span className="block text-primary">to Laser-Ready Files</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-xl md:max-w-2xl mx-auto">
            Upload your Circuit JSON or KiCad file to start converting it into
            LBRN format for precise PCB laser cutting. Supports Circuit JSON
            from tscircuit and KiCad files.
          </p>
        </div>

        {/* Upload Area */}
        <Card
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`p-6 border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isDragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.kicad_pcb"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center py-4 px-2 space-y-2 md:py-8 md:px-4 md:space-y-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="size-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                {isDragOver
                  ? "Drop your Circuit JSON or KiCad file here"
                  : "Upload Circuit JSON or KiCad file"}
              </h3>
              <p className="text-muted-foreground">
                Drag & drop your file here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .json files from tscircuit or KiCad files
              </p>
            </div>
            <Button size="lg" className="gap-2 pointer-events-none">
              <FileUp className="size-4" />
              Choose File
            </Button>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-2 md:gap-4">
          <Card className="p-4 text-center space-y-2 hover:border-primary/50 transition-colors">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <FileUp className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold">Upload File</h3>
            <p className="text-sm text-muted-foreground">
              Import your circuit designs from circuit JSON or KiCad exports.
            </p>
          </Card>

          <Card className="p-4 text-center space-y-2 hover:border-primary/50 transition-colors">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <CircuitBoard className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold">Convert to LBRN</h3>
            <p className="text-sm text-muted-foreground">
              Automatically convert traces, pads, and solder mask into
              LightBurn-ready format.
            </p>
          </Card>

          <Card className="p-4 text-center space-y-2 hover:border-primary/50 transition-colors">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <Zap className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold">Laser Cut</h3>
            <p className="text-sm text-muted-foreground">
              Export LBRN files for laser PCB fabrication ablation.
            </p>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="p-2 md:p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Quick Start Guide</h3>
            </div>

            <div className="space-y-2 pl-2">
              <div className="flex items-start gap-3 group">
                <div className="size-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Prepare Your Design</h4>
                  <p className="text-sm text-muted-foreground">
                    Export as Circuit JSON or KiCad File
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="size-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Upload & Convert</h4>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to upload your file
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="size-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Customize & Export</h4>
                  <p className="text-sm text-muted-foreground">
                    Adjust settings and export as LBRN for laser cutting
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <FileUp className="size-4 mr-2" />
                View Example Files
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowRight className="size-4 mr-2" />
                Documentation
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
