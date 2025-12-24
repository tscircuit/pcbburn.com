import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { ArrowRight, Zap, FileUp, Eye } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="size-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              PCBBurn
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="https://tscircuit.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              tscircuit
            </Link>
            <Link
              to="/features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              to="https://docs.tscircuit.com/category/intro"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
            <Link
              to="https://github.com/tscircuit/pcbburn.com"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Github
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              className="transition-all hover:opacity-80"
              size="sm"
              asChild
            >
              <Link to="/workspace">
                Get Started <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full bg-primary/10 border border-primary text-sm text-primary">
            <Zap className="size-3.5" />
            <span className="font-medium">tscircuit PCB Laser Cutting</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            Upload & Burn PCBs
            <span className="block text-primary mt-2">In Seconds</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            Convert tscircuit Circuit JSON and KiCad files to LBRN format with
            precision. Preview layers, adjust laser parameters, and export
            ready-to-cut files for professional results.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="w-full sm:w-auto transition-all hover:opacity-80"
              asChild
            >
              <Link to="/workspace">
                Start Converting <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent"
              asChild
            >
              <Link to="/demo">View Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/50 transition-colors">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileUp className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Drag & Drop Upload</h3>
            <p className="text-muted-foreground leading-relaxed">
              Support for Circuit JSON and KiCad formats. Simply drag your files
              or click to browse. Instant validation and preview.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-accent/50 transition-colors">
            <div className="size-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Eye className="size-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Live Preview</h3>
            <p className="text-muted-foreground leading-relaxed">
              Interactive canvas with zoom, pan, and layer controls. See exactly
              how your PCB will burn before exporting.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/50 transition-colors">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Precision Control</h3>
            <p className="text-muted-foreground leading-relaxed">
              Fine-tune laser speed, power, passes, and margins. Save presets
              for consistent results across projects.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Ready to start burning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto text-balance">
            Join makers and professionals using PCBBurn (powered by tscircuit)
            for precision laser cutting.
          </p>
          <Button className="transition-all hover:opacity-80" size="lg" asChild>
            <Link to="/workspace">
              Launch Workspace <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded bg-primary flex items-center justify-center">
                  <Zap className="size-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">PCBBurn</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional PCB laser cutting conversion tool built with
                tscircuit.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/features"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/changelog"
                    className="hover:text-foreground transition-colors"
                  >
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/docs"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/guides"
                    className="hover:text-foreground transition-colors"
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="hover:text-foreground transition-colors"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>Powered by tscircuit • Professional PCB laser cutting</p>
            <p>&copy; 2025 PCBBurn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
