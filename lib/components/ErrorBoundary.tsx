import React from "react"

type Props = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

type State = {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Keep console logging for debugging; replace with telemetry if needed
    console.error("Unhandled UI error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-6 text-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="max-w-md text-sm opacity-80">
            An unexpected error occurred while rendering this section. You can
            try resetting it below.
          </p>
          {this.state.error && (
            <pre className="max-w-full overflow-auto rounded bg-black/5 p-3 text-left text-xs">
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded border px-4 py-2 text-sm hover:bg-black/5"
          >
            Reset section
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
