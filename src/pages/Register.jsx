import { useEffect, useRef, useState } from 'react'

import { Check, ChevronDown, LoaderCircle, X } from 'lucide-react'

import { supabase } from '../lib/supabaseClient'

import { useToast } from '../components/useToast'

import ConfirmDialog from '../components/ConfirmDialog'

function PasswordRequirement({ valid, text }) {
  return (
    <div
      className={`password-requirement ${valid ? 'valid' : 'invalid'}`}
    >
      <span
        className="password-requirement-icon"
        aria-hidden="true"
      >
        {valid ? <Check size={12} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
      </span>

      <span className="password-requirement-text">
        {text}
      </span>
    </div>
  )
}

function Register({ setPage, embedded = false }) {
  const notify = useToast()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  const [userType, setUserType] = useState('')

  const [studentNumber, setStudentNumber] = useState('')
  const [program, setProgram] = useState('')
  const [yearLevel, setYearLevel] = useState('')

  const [sectionNumber, setSectionNumber] = useState('')
  const [sectionLetter, setSectionLetter] = useState('')
  const [section, setSection] = useState('')
  const [sectionOpen, setSectionOpen] = useState(false)

  const sectionPickerRef = useRef(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [showVerification, setShowVerification] =
    useState(false)

  const [registeredEmail, setRegisteredEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationError, setVerificationError] =
    useState('')

  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Email availability states
  const [emailChecking, setEmailChecking] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [emailChecked, setEmailChecked] = useState(false)

  /*
   * ============================================================
   * SECTION PICKER
   * ============================================================
   */

  useEffect(() => {
    if (sectionNumber && sectionLetter) {
      setSection(`${sectionNumber} - ${sectionLetter}`)
    } else {
      setSection('')
    }
  }, [sectionNumber, sectionLetter])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sectionPickerRef.current &&
        !sectionPickerRef.current.contains(event.target)
      ) {
        setSectionOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  const handleSectionNumberSelect = (value) => {
    setSectionNumber(value)

    if (sectionLetter) {
      setSection(`${value} - ${sectionLetter}`)
    }
  }

  const handleSectionLetterSelect = (value) => {
    setSectionLetter(value)

    if (sectionNumber) {
      setSection(`${sectionNumber} - ${value}`)
    }
  }

  /*
   * ============================================================
   * RESEND COOLDOWN
   * ============================================================
   */

  useEffect(() => {
    if (resendCooldown === 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      setResendCooldown((seconds) =>
        Math.max(seconds - 1, 0)
      )
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [resendCooldown])

  /*
   * ============================================================
   * PASSWORD REQUIREMENTS
   * ============================================================
   */

  const passwordRequirements = {
    firstLetterUppercase: /^[A-Z]/.test(password),
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9\s]/.test(password),
    noSpaces: !/\s/.test(password),
  }

  const passwordIsValid =
    passwordRequirements.firstLetterUppercase &&
    passwordRequirements.minLength &&
    passwordRequirements.hasLowercase &&
    passwordRequirements.hasNumber &&
    passwordRequirements.hasSpecial &&
    passwordRequirements.noSpaces

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword

  /*
   * ============================================================
   * MESSAGES
   * ============================================================
   */

  const resetMessages = () => {
    setMessage('')
    setMessageType('')
    setVerificationError('')
  }

  /*
   * ============================================================
   * EMAIL AVAILABILITY
   * ============================================================
   */

  const checkEmailAvailability = async (
    emailToCheck = email
  ) => {
    const trimmedEmail = emailToCheck.trim().toLowerCase()

    if (!trimmedEmail) {
      setEmailExists(false)
      setEmailChecked(false)
      return false
    }

    setEmailChecking(true)
    setEmailChecked(false)

    const { data, error } = await supabase.rpc(
      'check_email_exists',
      {
        check_email: trimmedEmail,
      }
    )

    if (error) {
      console.error(
        'Email availability check failed:',
        error
      )

      setEmailChecking(false)
      setEmailChecked(false)

      return null
    }

    const exists = Boolean(data)

    setEmailExists(exists)
    setEmailChecked(true)
    setEmailChecking(false)

    return exists
  }

  const handleEmailChange = (e) => {
    const value = e.target.value

    setEmail(value)

    setEmailExists(false)
    setEmailChecked(false)

    if (!value.trim()) {
      setEmailChecking(false)
    }
  }

  const handleEmailBlur = async () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      return
    }

    await checkEmailAvailability(trimmedEmail)
  }

  /*
   * ============================================================
   * REGISTER
   * ============================================================
   */

  const handleRegister = async (e) => {
    e.preventDefault()

    resetMessages()

    if (!passwordIsValid) {
      setMessage(
        'Please meet all password requirements before continuing.'
      )

      setMessageType('error')

      notify({
        type: 'error',
        title: 'Password requirements not met',
        description:
          'Please complete all password requirements.',
      })

      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      setMessageType('error')

      notify({
        type: 'error',
        title: 'Check your password',
        description: 'Passwords do not match.',
      })

      return
    }

    const trimmedEmail = email.trim().toLowerCase()

    const exists =
      await checkEmailAvailability(trimmedEmail)

    if (exists === true) {
      setMessage(
        'This email is already registered. Please use a different email or sign in.'
      )

      setMessageType('error')

      notify({
        type: 'error',
        title: 'Email already registered',
        description:
          'Please use a different email or sign in to your existing account.',
      })

      return
    }

    if (exists === null) {
      setMessage(
        'We could not check this email right now. Please try again.'
      )

      setMessageType('error')

      notify({
        type: 'error',
        title: 'Could not check email',
        description:
          'Please check your connection and try again.',
      })

      return
    }

    setConfirmOpen(true)
  }

  /*
   * ============================================================
   * CREATE ACCOUNT
   * ============================================================
   */

  const createAccount = async () => {
    setLoading(true)
    resetMessages()

    const trimmedEmail = email.trim().toLowerCase()

    const exists =
      await checkEmailAvailability(trimmedEmail)

    if (exists === true) {
      setLoading(false)

      setMessage(
        'This email is already registered. Please use a different email or sign in.'
      )

      setMessageType('error')

      notify({
        type: 'error',
        title: 'Email already registered',
        description:
          'Please use a different email or sign in to your existing account.',
      })

      return
    }

    if (exists === null) {
      setLoading(false)

      setMessage(
        'We could not check this email right now. Please try again.'
      )

      setMessageType('error')

      notify({
        type: 'error',
        title: 'Could not check email',
        description:
          'Please check your connection and try again.',
      })

      return
    }

    const { data, error } =
      await supabase.auth.signUp({
        email: trimmedEmail,
        password,

        options: {
          data: {
            full_name: fullName.trim(),

            contact_number:
              contactNumber.trim() || null,

            user_type: userType,

            student_number:
              userType === 'Student'
                ? studentNumber.trim()
                : null,

            program:
              userType === 'Student'
                ? program.trim()
                : null,

            year_level:
              userType === 'Student'
                ? yearLevel
                : null,

            section:
              userType === 'Student'
                ? section.trim()
                : null,
          },
        },
      })

    if (error) {
      setMessage(error.message)
      setMessageType('error')

      notify({
        type: 'error',
        title: 'Account creation failed',
        description: error.message,
      })

      setLoading(false)

      return
    }

    /*
     * Email confirmation is enabled.
     * Supabase returns the newly created user
     * without an active session.
     */

    if (data?.user && !data?.session) {
      setRegisteredEmail(trimmedEmail)

      setVerificationCode('')
      setVerificationError('')
      setResendCooldown(60)

      setShowVerification(true)

      // Clear registration fields
      setFullName('')
      setContactNumber('')
      setUserType('')
      setStudentNumber('')
      setProgram('')
      setYearLevel('')
      setSectionNumber('')
      setSectionLetter('')
      setSection('')
      setSectionOpen(false)
      setPassword('')
      setConfirmPassword('')

      notify({
        type: 'success',
        title: 'Verification code sent',
        description:
          'Check your email for your iLost verification code.',
      })

      setLoading(false)

      return
    }

    /*
     * This branch only happens when email confirmation
     * is disabled and Supabase immediately creates
     * an authenticated session.
     */

    setMessage(
      'Registration successful. You can now sign in.'
    )

    setMessageType('success')

    notify({
      type: 'success',
      title: 'Account created',
      description: 'You can now sign in.',
    })

    setFullName('')
    setEmail('')
    setContactNumber('')
    setUserType('')
    setStudentNumber('')
    setProgram('')
    setYearLevel('')
    setSectionNumber('')
    setSectionLetter('')
    setSection('')
    setSectionOpen(false)
    setPassword('')
    setConfirmPassword('')
    setEmailExists(false)
    setEmailChecked(false)

    setLoading(false)
  }

  /*
   * ============================================================
   * VERIFY EMAIL
   * ============================================================
   */

  const handleVerifyEmail = async (e) => {
    e.preventDefault()

    const trimmedCode = verificationCode.trim()

    if (!trimmedCode) {
      setVerificationError(
        'Please enter the verification code.'
      )

      return
    }

    if (!/^\d{8}$/.test(trimmedCode)) {
      setVerificationError(
        'Please enter the 8-digit verification code.'
      )

      return
    }

    setVerifying(true)
    setVerificationError('')
    setMessage('')

    const { error } =
      await supabase.auth.verifyOtp({
        email: registeredEmail,
        token: trimmedCode,
        type: 'email',
      })

    if (error) {
      setVerificationError(
        'Invalid or expired verification code.'
      )

      notify({
        type: 'error',
        title: 'Verification failed',
        description:
          'The verification code is invalid or expired.',
      })

      setVerifying(false)

      return
    }

    await supabase.auth.signOut()

    setVerifying(false)
    setShowVerification(false)
    setVerificationCode('')
    setRegisteredEmail('')
    setResendCooldown(0)

    setEmail('')
    setPassword('')
    setConfirmPassword('')

    setEmailExists(false)
    setEmailChecked(false)

    notify({
      type: 'success',
      title: 'Email verified',
      description:
        'Your iLost account is ready. Please sign in.',
    })

    setPage('home')
  }

  /*
   * ============================================================
   * RESEND VERIFICATION
   * ============================================================
   */

  const handleResendCode = async () => {
    if (!registeredEmail) {
      setVerificationError(
        'No email address is available for verification.'
      )

      return
    }

    if (resendCooldown > 0 || resending) {
      return
    }

    setResending(true)
    setVerificationError('')
    setMessage('')

    const { error } =
      await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
      })

    if (error) {
      setVerificationError(
        'The verification code could not be sent. Please try again later.'
      )

      notify({
        type: 'error',
        title: 'Code could not be sent',
        description: error.message,
      })

      setResending(false)

      return
    }

    setResendCooldown(60)

    notify({
      type: 'success',
      title: 'New verification code sent',
      description:
        'Check your email for the new code.',
    })

    setResending(false)
  }

  /*
   * ============================================================
   * CHANGE EMAIL
   * ============================================================
   */

  const handleChangeEmail = () => {
    setShowVerification(false)

    setRegisteredEmail('')
    setVerificationCode('')
    setVerificationError('')
    setResendCooldown(0)

    setMessage('')
    setMessageType('')

    setEmailExists(false)
    setEmailChecked(false)
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div
      className={
        embedded
          ? 'landing-auth-content'
          : 'auth-page'
      }
    >
      {/* ======================================================
          LOCAL REGISTER STYLES
          ====================================================== */}

      <style>{`
        .register-form-shell {
          width: 100%;
        }

        /*
         * Consistent enterprise form sizing
         */
        .register-form-shell .form-group input,
        .register-form-shell .form-group select,
        .register-form-shell .password-input-wrapper {
          width: 100%;
          box-sizing: border-box;
        }

        .register-form-shell .form-group input,
        .register-form-shell .form-group select {
          min-height: 46px;
          height: 46px;
          box-sizing: border-box;
        }

        /*
         * ------------------------------------------------------
         * OPTIONAL LABEL
         * ------------------------------------------------------
         */

        .register-optional-label {
          color: #756b72;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.01em;
          margin-left: 5px;
        }

        /*
         * ------------------------------------------------------
         * CUSTOM SECTION PICKER
         * ------------------------------------------------------
         */

        .section-picker {
          position: relative;
          width: 100%;
        }

        .section-picker-trigger {
          width: 100%;
          height: 46px;
          min-height: 46px;
          padding: 0 13px 0 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          border: 1px solid #dcd2d8;
          border-radius: 8px;
          background: #ffffff;

          color: #2b252a;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;

          cursor: pointer;
          text-align: left;

          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease;
        }

        .section-picker-trigger:hover {
          border-color: rgba(209, 0, 111, 0.45);
          background: #fffafd;
        }

        .section-picker-trigger.open {
          border-color: #d1006f;
          box-shadow:
            0 0 0 3px rgba(209, 0, 111, 0.09),
            0 5px 18px rgba(101, 0, 51, 0.07);
        }

        .section-picker-placeholder {
          color: #756b72;
          font-weight: 400;
        }

        .section-picker-value {
          color: #2b252a;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .section-picker-chevron {
          color: #756b72;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .section-picker-chevron.open {
          transform: rotate(180deg);
          color: #d1006f;
        }

        .section-picker-panel {
          position: absolute;
          z-index: 50;
          top: calc(100% + 7px);
          left: 0;
          right: 0;

          padding: 9px;

          border: 1px solid #e5dbe1;
          border-radius: 10px;

          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.99),
              rgba(250, 248, 250, 0.99)
            );

          box-shadow:
            0 16px 35px rgba(43, 37, 42, 0.13),
            0 3px 10px rgba(101, 0, 51, 0.06);

          animation: section-picker-enter 0.16s ease-out;
        }

        @keyframes section-picker-enter {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.99);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .section-picker-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;

          padding: 4px 3px 8px;

          color: #756b72;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .section-picker-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .section-picker-column {
          height: 174px;
          overflow-y: auto;

          padding: 4px;

          border: 1px solid #eee5ea;
          border-radius: 8px;

          background: #ffffff;

          scrollbar-width: thin;
          scrollbar-color: #c9b6c1 transparent;
        }

        .section-picker-column::-webkit-scrollbar {
          width: 5px;
        }

        .section-picker-column::-webkit-scrollbar-track {
          background: transparent;
        }

        .section-picker-column::-webkit-scrollbar-thumb {
          background: #c9b6c1;
          border-radius: 10px;
        }

        .section-picker-option {
          width: 100%;
          min-height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 0;
          border-radius: 6px;

          background: transparent;
          color: #40373d;

          font-family: inherit;
          font-size: 13px;
          font-weight: 500;

          cursor: pointer;

          transition:
            background 0.15s ease,
            color 0.15s ease,
            transform 0.15s ease;
        }

        .section-picker-option:hover {
          background: #fbe4f0;
          color: #98004f;
        }

        .section-picker-option.selected {
          background:
            linear-gradient(
              135deg,
              #d1006f,
              #98004f
            );

          color: #ffffff;
          font-weight: 700;

          box-shadow:
            0 4px 10px rgba(209, 0, 111, 0.20);
        }

        .section-picker-hint {
          margin-top: 8px;
          padding: 0 2px;

          color: #756b72;
          font-size: 10.5px;
          line-height: 1.4;
          text-align: center;
        }

        /*
         * ------------------------------------------------------
         * PASSWORD REQUIREMENTS
         * ------------------------------------------------------
         */

        .password-requirements {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;

          margin-top: 9px;
          margin-bottom: 2px;
          padding: 11px;

          border: 1px solid #eadfe5;
          border-radius: 9px;

          background:
            linear-gradient(
              145deg,
              #ffffff 0%,
              #fcf8fa 100%
            );

          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            0 4px 13px rgba(101, 0, 51, 0.035);
        }

        .password-requirement {
          min-height: 31px;

          display: flex;
          align-items: center;
          gap: 8px;

          padding: 6px 8px;

          border: 1px solid transparent;
          border-radius: 7px;

          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.25;

          transition:
            color 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        /*
         * NOT SATISFIED = RED
         */

        .password-requirement.invalid {
          color: #b42318;
          background: #fff5f4;
          border-color: #f2d2cf;
        }

        .password-requirement.invalid .password-requirement-icon {
          color: #b42318;
          background: #fde5e3;
          border-color: #f2c5c1;
        }

        /*
         * SATISFIED = GREEN
         */

        .password-requirement.valid {
          color: #24733a;
          background: #f2fbf4;
          border-color: #cdebd4;
          box-shadow:
            0 2px 7px rgba(46, 125, 50, 0.045);
        }

        .password-requirement.valid .password-requirement-icon {
          color: #24733a;
          background: #dff3e3;
          border-color: #bfe2c7;
        }

        .password-requirement-icon {
          width: 18px;
          height: 18px;
          min-width: 18px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          border: 1px solid;
          border-radius: 50%;

          transition:
            color 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .password-requirement.valid
          .password-requirement-icon {
          transform: scale(1.04);
        }

        .password-requirement-text {
          min-width: 0;
        }

        /*
         * ------------------------------------------------------
         * PASSWORD INPUT
         * ------------------------------------------------------
         */

        .register-form-shell
          .password-input-wrapper {
          position: relative;
        }

        .register-form-shell
          .password-input-wrapper
          input {
          padding-right: 47px;
        }

        .register-form-shell
          .eye-button {
          position: absolute;
          top: 50%;
          right: 7px;

          width: 34px;
          height: 34px;

          transform: translateY(-50%);

          display: inline-flex;
          align-items: center;
          justify-content: center;

          border: 0;
          border-radius: 7px;

          background: transparent;
          color: #756b72;

          cursor: pointer;

          transition:
            background 0.15s ease,
            color 0.15s ease;
        }

        .register-form-shell
          .eye-button:hover {
          background: #fbe4f0;
          color: #98004f;
        }

        .register-form-shell
          .eye-button:focus-visible {
          outline: 2px solid rgba(209, 0, 111, 0.35);
          outline-offset: 1px;
        }

        .register-form-shell
          .eye-button svg {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /*
         * ------------------------------------------------------
         * EMAIL STATUS
         * ------------------------------------------------------
         */

        .register-email-status {
          min-height: 20px;
          margin-top: 6px;
          font-size: 12px;
          line-height: 1.4;
        }

        .register-email-status-checking {
          color: #756b72;
        }

        .register-email-status-available {
          color: #2e7d32;
          font-weight: 600;
        }

        .register-email-status-exists {
          display: block;
          color: #b42318;
          font-weight: 600;
          line-height: 1.4;
        }

        /*
         * ------------------------------------------------------
         * RESPONSIVE
         * ------------------------------------------------------
         */

        @media (max-width: 600px) {
          .password-requirements {
            grid-template-columns: 1fr;
          }

          .section-picker-column {
            height: 165px;
          }
        }
      `}</style>

      <div
        className={`auth-card${
          embedded ? ' landing-auth-inner' : ''
        }`}
      >
        <div className="auth-brand">
          <img
            src="/ilost.png"
            alt="iLost"
            className="register-brand-logo"
          />
        </div>

        {!showVerification ? (
          <>
            <h1>Create your account</h1>

            <p className="auth-description">
              Join iLost to report and recover lost items around campus.
            </p>

            <form
              className="register-form-shell"
              onSubmit={handleRegister}
            >
              {/* =================================================
                  FULL NAME
                  ================================================= */}

              <div className="form-group">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* =================================================
                  EMAIL
                  ================================================= */}

              <div className="form-group">
                <label htmlFor="registerEmail">
                  Email
                </label>

                <input
                  id="registerEmail"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="Enter your email"
                  required
                  aria-describedby="email-status"
                />

                <div
                  id="email-status"
                  className="register-email-status"
                >
                  {emailChecking && (
                    <span className="register-email-status-checking">
                      Checking email availability...
                    </span>
                  )}

                  {!emailChecking &&
                    emailChecked &&
                    !emailExists && (
                      <span className="register-email-status-available">
                        ✓ Email is available
                      </span>
                    )}

                  {!emailChecking &&
                    emailChecked &&
                    emailExists && (
                      <span className="register-email-status-exists">
                        ⚠ This email is already registered.
                        <br />
                        Please use a different email or sign in.
                      </span>
                    )}
                </div>
              </div>

              {/* =================================================
                  CONTACT NUMBER
                  ================================================= */}

              <div className="form-group">
                <label htmlFor="contactNumber">
                  Contact Number
                  <span className="register-optional-label">
                    (Optional)
                  </span>
                </label>

                <input
                  id="contactNumber"
                  type="tel"
                  value={contactNumber}
                  onChange={(e) =>
                    setContactNumber(e.target.value)
                  }
                  placeholder="Enter your contact number"
                />
              </div>

              {/* =================================================
                  USER TYPE
                  ================================================= */}

              <div className="form-group">
                <label htmlFor="userType">
                  User Type
                </label>

                <select
                  id="userType"
                  value={userType}
                  onChange={(e) => {
                    const selectedUserType =
                      e.target.value

                    setUserType(selectedUserType)

                    if (
                      selectedUserType !== 'Student'
                    ) {
                      setStudentNumber('')
                      setProgram('')
                      setYearLevel('')
                      setSectionNumber('')
                      setSectionLetter('')
                      setSection('')
                      setSectionOpen(false)
                    }
                  }}
                  required
                >
                  <option value="">
                    Select user type
                  </option>

                  <option value="Student">
                    Student
                  </option>

                  <option value="Faculty">
                    Faculty
                  </option>

                  <option value="Staff">
                    Staff
                  </option>
                </select>
              </div>

              {/* =================================================
                  STUDENT DETAILS
                  ================================================= */}

              {userType === 'Student' && (
                <>
                  {/* Student Number */}

                  <div className="form-group">
                    <label htmlFor="studentNumber">
                      Student Number
                    </label>

                    <input
                      id="studentNumber"
                      type="text"
                      value={studentNumber}
                      onChange={(e) =>
                        setStudentNumber(e.target.value)
                      }
                      placeholder="Enter your student number"
                      required
                    />
                  </div>

                  {/* Program */}

                  <div className="form-group">
                    <label htmlFor="program">
                      Program
                    </label>

                    <input
                      id="program"
                      type="text"
                      value={program}
                      onChange={(e) =>
                        setProgram(e.target.value)
                      }
                      placeholder="Example: BS Computer Engineering"
                      required
                    />
                  </div>

                  {/* Year Level */}

                  <div className="form-group">
                    <label htmlFor="yearLevel">
                      Year Level
                    </label>

                    <select
                      id="yearLevel"
                      value={yearLevel}
                      onChange={(e) =>
                        setYearLevel(e.target.value)
                      }
                      required
                    >
                      <option value="">
                        Select year level
                      </option>

                      <option value="1st Year">
                        1st Year
                      </option>

                      <option value="2nd Year">
                        2nd Year
                      </option>

                      <option value="3rd Year">
                        3rd Year
                      </option>

                      <option value="4th Year">
                        4th Year
                      </option>
                    </select>
                  </div>

                  {/* =================================================
                      SECTION CUSTOM DROPDOWN
                      ================================================= */}

                  <div className="form-group">
                    <label htmlFor="sectionPicker">
                      Section
                    </label>

                    <div
                      className="section-picker"
                      ref={sectionPickerRef}
                    >
                      <button
                        id="sectionPicker"
                        type="button"
                        className={`section-picker-trigger ${
                          sectionOpen ? 'open' : ''
                        }`}
                        onClick={() =>
                          setSectionOpen(
                            (open) => !open
                          )
                        }
                        aria-haspopup="listbox"
                        aria-expanded={sectionOpen}
                      >
                        {section ? (
                          <span className="section-picker-value">
                            {section}
                          </span>
                        ) : (
                          <span className="section-picker-placeholder">
                            Select section
                          </span>
                        )}

                        <ChevronDown
                          size={17}
                          className={`section-picker-chevron ${
                            sectionOpen ? 'open' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      {sectionOpen && (
                        <div className="section-picker-panel">
                          <div className="section-picker-header">
                            <span>
                              Year
                            </span>

                            <span>
                              Section
                            </span>
                          </div>

                          <div className="section-picker-columns">
                            {/* Number column */}

                            <div
                              className="section-picker-column"
                              role="listbox"
                              aria-label="Section number"
                            >
                              {['1', '2', '3', '4'].map(
                                (number) => (
                                  <button
                                    key={number}
                                    type="button"
                                    className={`section-picker-option ${
                                      sectionNumber ===
                                      number
                                        ? 'selected'
                                        : ''
                                    }`}
                                    onClick={() =>
                                      handleSectionNumberSelect(
                                        number
                                      )
                                    }
                                    role="option"
                                    aria-selected={
                                      sectionNumber ===
                                      number
                                    }
                                  >
                                    {number}
                                  </button>
                                )
                              )}
                            </div>

                            {/* Letter column */}

                            <div
                              className="section-picker-column"
                              role="listbox"
                              aria-label="Section letter"
                            >
                              {[
                                'A',
                                'B',
                                'C',
                                'D',
                                'E',
                              ].map((letter) => (
                                <button
                                  key={letter}
                                  type="button"
                                  className={`section-picker-option ${
                                    sectionLetter ===
                                    letter
                                      ? 'selected'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    handleSectionLetterSelect(
                                      letter
                                    )
                                  }
                                  role="option"
                                  aria-selected={
                                    sectionLetter ===
                                    letter
                                  }
                                >
                                  {letter}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="section-picker-hint">
                          Select your Year & Section.
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="hidden"
                      name="section"
                      value={section}
                      required
                    />
                  </div>
                </>
              )}

              {/* =================================================
                  PASSWORD
                  ================================================= */}

              <div className="form-group">
                <label htmlFor="registerPassword">
                  Password
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="registerPassword"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="eye-button"
                    onClick={() => {
                      setShowPassword((visible) => {
                        const nextVisible =
                          !visible

                        /*
                         * When Password is closed,
                         * Confirm Password also closes.
                         */
                        if (!nextVisible) {
                          setShowConfirmPassword(
                            false
                          )
                        }

                        return nextVisible
                      })
                    }}
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    aria-pressed={showPassword}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                      />

                      {!showPassword && (
                        <path d="M4 4l16 16" />
                      )}
                    </svg>
                  </button>
                </div>

                {/* Password requirements */}

                <div className="password-requirements">
                  <PasswordRequirement
                    valid={
                      passwordRequirements.firstLetterUppercase
                    }
                    text="First letter is uppercase"
                  />

                  <PasswordRequirement
                    valid={
                      passwordRequirements.minLength
                    }
                    text="At least 8 characters"
                  />

                  <PasswordRequirement
                    valid={
                      passwordRequirements.hasLowercase
                    }
                    text="Contains a lowercase letter"
                  />

                  <PasswordRequirement
                    valid={
                      passwordRequirements.hasNumber
                    }
                    text="Contains a number"
                  />

                  <PasswordRequirement
                    valid={
                      passwordRequirements.hasSpecial
                    }
                    text="Contains a special character"
                  />

                  <PasswordRequirement
                    valid={
                      passwordRequirements.noSpaces
                    }
                    text="No spaces"
                  />
                </div>
              </div>

              {/* =================================================
                  CONFIRM PASSWORD
                  ================================================= */}

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="eye-button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (visible) => !visible
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                    aria-pressed={
                      showConfirmPassword
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                      />

                      {!showConfirmPassword && (
                        <path d="M4 4l16 16" />
                      )}
                    </svg>
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <div
                    className="password-requirements"
                    style={{
                      marginTop: '8px',
                      marginBottom: '0',
                      gridTemplateColumns:
                        '1fr',
                    }}
                  >
                    <PasswordRequirement
                      valid={passwordsMatch}
                      text="Passwords match"
                    />
                  </div>
                )}
              </div>

              {/* =================================================
                  CREATE ACCOUNT
                  ================================================= */}

              <button
                type="submit"
                className="auth-button"
                disabled={
                  loading ||
                  emailChecking ||
                  emailExists
                }
              >
                {loading
                  ? 'Creating account...'
                  : emailExists
                    ? 'Email Already Registered'
                    : 'Create Account'}
              </button>
            </form>

            {/* =================================================
                CONFIRM DIALOG
                ================================================= */}

            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Create your iLost account?"
              description={`Create an account for ${email.trim()}? Check your details before continuing. You may need to verify your email before signing in.`}
              confirmLabel="Create Account"
              onConfirm={() => {
                setConfirmOpen(false)
                void createAccount()
              }}
            />

            {message && (
              <p
                className={`auth-message ${
                  messageType === 'success'
                    ? 'auth-message-success'
                    : 'auth-message-error'
                }`}
              >
                {message}
              </p>
            )}
          </>
        ) : (
          <>
            {/* =================================================
                EMAIL VERIFICATION
                ================================================= */}

            <h1>Verify your email</h1>

            <p className="auth-description">
              We sent an 8-digit verification code to
              <br />
              <strong>{registeredEmail}</strong>
            </p>

            <form onSubmit={handleVerifyEmail}>
              <div className="form-group">
                <label htmlFor="verificationCode">
                  Verification Code
                </label>

                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 8)
                    )

                    setVerificationError('')
                  }}
                  placeholder="Enter 8-digit code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  required
                  autoFocus
                />
              </div>

              {verificationError && (
                <p className="auth-message auth-message-error">
                  {verificationError}
                </p>
              )}

              <button
                type="submit"
                className="auth-button"
                disabled={
                  verifying ||
                  verificationCode.length !== 8
                }
              >
                {verifying
                  ? 'Verifying...'
                  : 'Verify Email'}
              </button>
            </form>

            <div className="auth-confirmation-actions">
              <button
                type="button"
                className="auth-resend-button"
                onClick={handleResendCode}
                disabled={
                  resending ||
                  resendCooldown > 0
                }
                aria-busy={
                  resending ||
                  resendCooldown > 0
                }
              >
                {resending ||
                resendCooldown > 0 ? (
                  <>
                    <LoaderCircle
                      size={14}
                      aria-hidden="true"
                      className="auth-resend-spinner"
                    />

                    <span>
                      {resending
                        ? 'Sending...'
                        : `Resend available in ${resendCooldown}s`}
                    </span>
                  </>
                ) : (
                  'Resend Verification Code'
                )}
              </button>

              <button
                type="button"
                className="auth-resend-button"
                onClick={handleChangeEmail}
                disabled={
                  verifying ||
                  resending
                }
              >
                Use a different email
              </button>
            </div>

            <p className="auth-footer">
              Already verified?{' '}

              <button
                type="button"
                onClick={() =>
                  setPage('home')
                }
              >
                Sign In
              </button>
            </p>
          </>
        )}

        {!showVerification && (
          <p className="auth-footer">
            Already have an account?{' '}

            <button
              type="button"
              onClick={() =>
                setPage('home')
              }
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default Register