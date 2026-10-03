import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function ItemImagePreview({
  src,
  alt,
  className,
  imageClassName,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef(null)
  const closeRef = useRef(null)
  const scrollPositionRef = useRef(0)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const trigger = triggerRef.current
    const previousOverflow = document.body.style.overflow
    scrollPositionRef.current = window.scrollY
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      window.scrollTo(0, scrollPositionRef.current)
      trigger?.focus({ preventScroll: true })
    }
  }, [isOpen])

  return (
    <>
      <div className={`${className} item-image-preview`}>
        {src ? (
          <>
            <img
              src={src}
              alt={alt}
              className={imageClassName}
            />
            <button
              ref={triggerRef}
              type="button"
              className="item-image-preview-trigger"
              onClick={(event) => {
                event.stopPropagation()
                scrollPositionRef.current = window.scrollY
                setIsOpen(true)
              }}
              aria-label={`See image: ${alt}`}
            >
              <span>See Image</span>
            </button>
          </>
        ) : (
          <div className="item-image-placeholder">
            No Image
          </div>
        )}
      </div>

      {isOpen && createPortal(
        <div
          className="item-image-lightbox"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false)
            }
          }}
        >
          <div
            className="item-image-lightbox-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Image preview: ${alt}`}
          >
            <button
              ref={closeRef}
              type="button"
              className="item-image-lightbox-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close image preview"
            >
              ×
            </button>
            <img
              src={src}
              alt={alt}
              className="item-image-lightbox-image"
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default ItemImagePreview
