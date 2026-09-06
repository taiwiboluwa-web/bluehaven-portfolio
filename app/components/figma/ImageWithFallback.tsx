import React, { useEffect, useState } from 'react'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt, style, className, onError, ...rest } = props
  const [didError, setDidError] = useState(false)

  // Slideshow/gallery components reuse this component while changing `src`.
  // A previous failed image must not poison the next image.
  useEffect(() => {
    setDidError(false)
  }, [src])

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    setDidError(true)
    onError?.(event)
  }

  if (didError) {
    // Preserve the element footprint without exposing the browser's native
    // broken-image UI, white error card, or alt text over the design.
    return (
      <div
        className={className}
        style={{ ...style, visibility: 'hidden' }}
        aria-hidden="true"
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  )
}
