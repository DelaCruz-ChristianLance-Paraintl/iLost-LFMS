import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react'
import './UserManual.css'

import landingPageImage from '../../images/landing-page.png'
import registrationImage from '../../images/registration.png'
import dashboardImage from '../../images/dashboard.png'
import reportLostImage from '../../images/report-lost.png'
import reportFoundImage from '../../images/report-found.png'
import browseItemsImage from '../../images/browse-items.png'
import findMatchesImage from '../../images/find-matches.png'
import historyImage from '../../images/history.png'
import accountImage from '../../images/account.png'

const manualSteps = [
  {
    title: 'Landing Page',
    image: landingPageImage,
    alt: 'iLost landing page with the sign-in form',
    instructions:
      'Sign in with your registered email and password. Choose Sign Up to create an account or Forgot Password to request a reset link.',
  },
  {
    title: 'Creating an Account',
    image: registrationImage,
    alt: 'iLost account registration form',
    instructions:
      'Enter your name, email, contact number, and user type. Students also provide their program, year level, and section. Create a password of at least six characters, confirm it, then submit the form.',
  },
  {
    title: 'Dashboard',
    image: dashboardImage,
    alt: 'iLost user dashboard with summary information and navigation',
    instructions:
      'Use the dashboard shortcuts or sidebar to report items, browse listings, check possible matches, view history, and manage your account.',
  },
  {
    title: 'Reporting a Lost Item',
    image: reportLostImage,
    alt: 'iLost form for reporting a lost item',
    instructions:
      'Choose the item category and subcategory, enter its name and details, then provide where and when it was lost. Add a photo or description if helpful, review the confirmation, and submit.',
  },
  {
    title: 'Reporting a Found Item',
    image: reportFoundImage,
    alt: 'iLost form for reporting a found item',
    instructions:
      'Choose the item category and subcategory, enter its name and details, then provide where and when it was found. Add a photo or description if helpful, review the confirmation, and submit.',
  },
  {
    title: 'Browsing Items',
    image: browseItemsImage,
    alt: 'iLost Browse Items page showing item listings and search filters',
    instructions:
      'Open Browse Items from the sidebar. Search by a term, choose a category, or leave the filters clear to view the available listings.',
  },
  {
    title: 'Finding Possible Matches',
    image: findMatchesImage,
    alt: 'iLost page for reviewing possible matches for reported lost items',
    instructions:
      'Open Find My Missing Items, choose one of your lost reports, and select View Matches. Review the possible found-item matches; a suggested match is not proof of ownership.',
  },
  {
    title: 'History',
    image: historyImage,
    alt: 'iLost History page showing item reports and claim entries',
    instructions:
      'Open History from the sidebar to review your item reports and eligible claim entries. Use the search and category filters to narrow the list.',
  },
  {
    title: 'Managing Your Account',
    image: accountImage,
    alt: 'iLost Account page with personal information and profile editing controls',
    instructions:
      'Open Account to review your information. Select Edit Profile to update editable details, then Save Changes; select Cancel to discard your edits.',
  },
]

const adminManualSteps = [
  {
    title: 'Admin Overview',
    alt: 'Guidance for the iLost administrator overview',
    instructions:
      'Use Admin Overview to review current claim, user, and item totals with activity charts. Select View on a chart to open its related management section.',
  },
  {
    title: 'Reviewing Claims',
    alt: 'Guidance for reviewing iLost ownership claims',
    instructions:
      'Open User Claims to compare a claimant’s explanation and identifying details with the found-item report. Review the information carefully before choosing an available claim action and confirming it.',
  },
  {
    title: 'Monitoring Items',
    alt: 'Guidance for monitoring lost and found item reports',
    instructions:
      'Open Items Overview to review lost and found reports. Use the available search and filters to locate reports and inspect their recorded details.',
  },
  {
    title: 'Viewing Registered Users',
    alt: 'Guidance for viewing registered iLost users',
    instructions:
      'Open System Users to browse registered account information. Use the search controls to find a user by the available profile details.',
  },
  {
    title: 'Managing Your Admin Account',
    alt: 'Guidance for managing the administrator account',
    instructions:
      'Open Admin Account to review your own profile and update editable details. Use the sidebar Log Out control when you are finished.',
  },
]

const transitionDuration = 360

function UserManual({ isAdmin = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [transition, setTransition] = useState(null)
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const triggerRef = useRef(null)
  const transitionTimeoutRef = useRef(null)
  const touchStartXRef = useRef(null)
  const stepIndexRef = useRef(stepIndex)
  const transitionRef = useRef(false)
  const navigateRef = useRef(null)
  const steps = isAdmin ? adminManualSteps : manualSteps
  const visibleIndex = transition?.to ?? stepIndex
  const lastStep = visibleIndex === steps.length - 1

  useEffect(() => {
    manualSteps.forEach(({ image }) => {
      const preloadImage = new Image()
      preloadImage.src = image
    })
  }, [])

  const navigateTo = useCallback((nextIndex, direction) => {
    if (
      transitionRef.current ||
      nextIndex < 0 ||
      nextIndex >= steps.length ||
      nextIndex === stepIndex
    ) {
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStepIndex(nextIndex)
      return
    }

    setTransition({
      from: stepIndex,
      to: nextIndex,
      direction,
    })
    transitionRef.current = true
    transitionTimeoutRef.current = window.setTimeout(() => {
      setStepIndex(nextIndex)
      setTransition(null)
      transitionRef.current = false
    }, transitionDuration)
  }, [stepIndex, steps.length])

  useLayoutEffect(() => {
    stepIndexRef.current = stepIndex
    navigateRef.current = navigateTo
  }, [navigateTo, stepIndex])

  useLayoutEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    const trigger = triggerRef.current
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        navigateRef.current?.(stepIndexRef.current + 1, 1)
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        navigateRef.current?.(stepIndexRef.current - 1, -1)
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusableElements = dialogRef.current.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousRootOverflow
      document.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(transitionTimeoutRef.current)
      transitionRef.current = false
      trigger?.focus()
    }
  }, [isOpen])

  const closeManual = () => setIsOpen(false)

  const handleTouchStart = (event) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event) => {
    const startX = touchStartXRef.current
    const endX = event.changedTouches[0]?.clientX
    touchStartXRef.current = null

    if (startX === null || endX === undefined || transition) return
    const distance = endX - startX

    if (Math.abs(distance) >= 55) {
      navigateTo(stepIndex + (distance < 0 ? 1 : -1), distance < 0 ? 1 : -1)
    }
  }

  const renderSlide = (slideIndex, className = '') => {
    const step = steps[slideIndex]

    return (
      <div
        key={slideIndex}
        className={`user-manual-slide ${className}`}
        aria-hidden={
          slideIndex !== (transition ? transition.to : stepIndex)
        }
      >
        <div className="user-manual-step">
          <p className="user-manual-step-count">
            {slideIndex === (transition ? transition.to : stepIndex) && (
              <span id="user-manual-step-count">
                {slideIndex + 1} of {steps.length}
              </span>
            )}
          </p>
          <h3>{step.title}</h3>
          <p className="user-manual-instructions">{step.instructions}</p>
        </div>

        <div className="user-manual-image-frame">
          {step.image ? (
            <img
              src={step.image}
              alt={step.alt}
              className="user-manual-image"
              draggable="false"
            />
          ) : (
            <div
              className="user-manual-admin-note"
              role="img"
              aria-label={step.alt}
            >
              <BookOpen size={28} aria-hidden="true" />
              <span>Administrator workspace</span>
              <p>Use the admin sidebar to open this section.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const openManual = () => {
    setStepIndex(0)
    setTransition(null)
    transitionRef.current = false
    setIsOpen(true)
  }

  return createPortal(
    <>
      <button
        ref={triggerRef}
        className="user-manual-trigger"
        type="button"
        aria-label={isAdmin ? 'Open Admin User Guide' : 'Open User Guide'}
        title={isAdmin ? 'Admin User Guide' : 'User Guide'}
        onClick={openManual}
      >
        <BookOpen size={21} aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          className="user-manual-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeManual()
          }}
        >
          <section
            ref={dialogRef}
            className="user-manual-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-manual-title"
            aria-describedby="user-manual-step-count"
          >
            <header className="user-manual-header">
              <div>
                <p className="user-manual-eyebrow">iLost guide</p>
                <h2 id="user-manual-title">User Guide</h2>
              </div>
              <button
                ref={closeButtonRef}
                className="user-manual-close"
                type="button"
                aria-label="Close User Guide"
                onClick={closeManual}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            <div
              className={`user-manual-stage${transition ? ' is-transitioning' : ''}`}
              aria-live="polite"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {transition ? (
                <>
                  {renderSlide(
                    transition.from,
                    `is-leaving ${
                      transition.direction > 0 ? 'to-left' : 'to-right'
                    }`
                  )}
                  {renderSlide(
                    transition.to,
                    `is-entering ${
                      transition.direction > 0 ? 'from-right' : 'from-left'
                    }`
                  )}
                </>
              ) : (
                renderSlide(stepIndex, 'is-current')
              )}
            </div>

            <footer className="user-manual-footer">
              <button
                className="user-manual-previous"
                type="button"
                disabled={stepIndex === 0 || Boolean(transition)}
                aria-label="Go to previous step"
                onClick={() => navigateTo(stepIndex - 1, -1)}
              >
                <ChevronLeft size={17} aria-hidden="true" />
                Previous
              </button>
              <div className="user-manual-dots" aria-hidden="true">
                {steps.map((step, index) => (
                  <span
                    key={step.title}
                    className={index === visibleIndex ? 'is-active' : ''}
                  />
                ))}
              </div>
              <button
                className="user-manual-next"
                type="button"
                disabled={Boolean(transition)}
                aria-label={lastStep ? 'Finish User Guide' : 'Go to next step'}
                onClick={() => {
                  if (lastStep) {
                    closeManual()
                  } else {
                    navigateTo(stepIndex + 1, 1)
                  }
                }}
              >
                {lastStep ? 'Finish' : 'Next'}
                {!lastStep && <ChevronRight size={17} aria-hidden="true" />}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>,
    document.body
  )
}

export default UserManual
