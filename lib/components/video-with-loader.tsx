import React, { useState } from "react"
import { cn } from "../utils"
import { Spinner } from "./ui/spinner"

interface VideoWithLoaderProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string
  className?: string
  showLoaderUntilCanPlay?: boolean
}

const VideoWithLoader = React.forwardRef<
  HTMLVideoElement,
  VideoWithLoaderProps
>(
  (
    {
      src,
      className,
      showLoaderUntilCanPlay = true,
      onCanPlay,
      onError,
      children,
      ...props
    },
    ref,
  ) => {
    const [isLoading, setIsLoading] = useState(showLoaderUntilCanPlay)
    const [hasError, setHasError] = useState(false)

    const handleCanPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      setIsLoading(false)
      onCanPlay?.(e)
    }

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      setIsLoading(false)
      setHasError(true)
      onError?.(e)
    }

    return (
      <div className="relative w-full h-full">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-xl z-10">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading video...</p>
            </div>
          </div>
        )}
        <video
          ref={ref}
          className={cn(
            "block w-full h-full transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className,
          )}
          onCanPlay={handleCanPlay}
          onError={handleError}
          {...props}
        >
          <source src={src} type="video/mp4" />
          {children}
        </video>
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-xl">
            <span className="text-sm text-muted-foreground">
              Failed to load video
            </span>
          </div>
        )}
      </div>
    )
  },
)

VideoWithLoader.displayName = "VideoWithLoader"

export { VideoWithLoader }
