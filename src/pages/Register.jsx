import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'

import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/useToast'
import ConfirmDialog from '../components/ConfirmDialog'

function Register({ setPage, embedded = false }) {
  const notify = useToast()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [userType, setUserType] = useState('')
  const [program, setProgram] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [section, setSection] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [showVerification, setShowVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown === 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(seconds - 1, 0))
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [resendCooldown])

  const resetMessages = () => {
    setMessage('')
    setMessageType('')
    setVerificationError('')
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    resetMessages()

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

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.')
      setMessageType('error')

      notify({
        type: 'error',
        title: 'Password is too short',
        description: 'Password must be at least 6 characters long.',
      })

      return
    }

    setConfirmOpen(true)
  }

  const createAccount = async () => {
    setLoading(true)
    resetMessages()

    const trimmedEmail = email.trim().toLowerCase()

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          contact_number: contactNumber.trim(),
          user_type: userType,
          program: userType === 'Student' ? program.trim() : null,
          year_level: userType === 'Student' ? yearLevel : null,
          section: userType === 'Student' ? section.trim() : null,
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
      When email confirmation is enabled, Supabase returns
      the newly created user without an active session.

      The email address is kept so the OTP can be verified
      through supabase.auth.verifyOtp().
    */
    if (data?.user && !data?.session) {
      setRegisteredEmail(trimmedEmail)
      setVerificationCode('')
      setVerificationError('')
      setResendCooldown(60)
      setShowVerification(true)

      // Clear registration fields that are no longer needed.
      setFullName('')
      setContactNumber('')
      setUserType('')
      setProgram('')
      setYearLevel('')
      setSection('')
      setPassword('')
      setConfirmPassword('')

      notify({
        type: 'success',
        title: 'Verification code sent',
        description: 'Check your email for your iLost verification code.',
      })

      setLoading(false)
      return
    }

    /*
      This branch only happens if email confirmation is disabled
      and Supabase immediately creates an authenticated session.
    */
    setMessage('Registration successful. You can now sign in.')
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
    setProgram('')
    setYearLevel('')
    setSection('')
    setPassword('')
    setConfirmPassword('')

    setLoading(false)
  }

  const handleVerifyEmail = async (e) => {
  e.preventDefault()

  const trimmedCode = verificationCode.trim()

  if (!trimmedCode) {
    setVerificationError('Please enter the verification code.')
    return
  }

  if (!/^\d{8}$/.test(trimmedCode)) {
    setVerificationError('Please enter the 8-digit verification code.')
    return
  }

  setVerifying(true)
  setVerificationError('')
  setMessage('')

  const { error } = await supabase.auth.verifyOtp({
    email: registeredEmail,
    token: trimmedCode,
    type: 'email',
  })

  if (error) {
    setVerificationError('Invalid or expired verification code.')

    notify({
      type: 'error',
      title: 'Verification failed',
      description: 'The verification code is invalid or expired.',
    })

    setVerifying(false)
    return
  }

  // OTP verification succeeded.
  // Supabase creates an authenticated session after verifyOtp().
  // Sign out so the user must manually sign in from the Sign In page.
  await supabase.auth.signOut()

  setVerifying(false)
  setShowVerification(false)
  setVerificationCode('')
  setRegisteredEmail('')
  setResendCooldown(0)

  setEmail('')
  setPassword('')
  setConfirmPassword('')

  notify({
    type: 'success',
    title: 'Email verified',
    description: 'Your iLost account is ready. Please sign in.',
  })

  // Return to the landing page where the Sign In form is displayed.
  setPage('home')
}

  const handleResendCode = async () => {
    if (!registeredEmail) {
      setVerificationError('No email address is available for verification.')
      return
    }

    if (resendCooldown > 0 || resending) {
      return
    }

    setResending(true)
    setVerificationError('')
    setMessage('')

    const { error } = await supabase.auth.resend({
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
      description: 'Check your email for the new code.',
    })

    setResending(false)
  }

  const handleChangeEmail = () => {
    setShowVerification(false)
    setRegisteredEmail('')
    setVerificationCode('')
    setVerificationError('')
    setResendCooldown(0)
    setMessage('')
    setMessageType('')
  }

  return (
    <div className={embedded ? 'landing-auth-content' : 'auth-page'}>
      <div className={`auth-card${embedded ? ' landing-auth-inner' : ''}`}>

        <div className="auth-brand">
          <img
            src="/ilost.png"
            alt="iLost"
            className="register-brand-logo"
          />
        </div>

        {!showVerification ? (
          <>
            <h1>
              Create your account
            </h1>

            <p className="auth-description">
              Join iLost to report and recover lost items around campus.
            </p>

            <form onSubmit={handleRegister}>

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

              <div className="form-group">
                <label htmlFor="registerEmail">
                  Email
                </label>

                <input
                  id="registerEmail"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">
                  Contact Number
                </label>

                <input
                  id="contactNumber"
                  type="tel"
                  value={contactNumber}
                  onChange={(e) =>
                    setContactNumber(e.target.value)
                  }
                  placeholder="Enter your contact number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="userType">
                  User Type
                </label>

                <select
                  id="userType"
                  value={userType}
                  onChange={(e) => {
                    const selectedUserType = e.target.value
                    setUserType(selectedUserType)

                    if (selectedUserType !== 'Student') {
                      setProgram('')
                      setYearLevel('')
                      setSection('')
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

              {userType === 'Student' && (
                <>
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

                      <option value="Graduate">
                        Graduate
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="section">
                      Section
                    </label>

                    <input
                      id="section"
                      type="text"
                      value={section}
                      onChange={(e) =>
                        setSection(e.target.value)
                      }
                      placeholder="Example: BSCPE-4A"
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="registerPassword">
                  Password
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="registerPassword"
                    type={showPassword ? 'text' : 'password'}
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
                    onClick={() =>
                      setShowPassword((visible) => !visible)
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    aria-pressed={showPassword}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                      <circle cx="12" cy="12" r="2.5" />
                      {!showPassword && <path d="M4 4l16 16" />}
                    </svg>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="eye-button"
                    onClick={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                    aria-pressed={showConfirmPassword}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                      <circle cx="12" cy="12" r="2.5" />
                      {!showConfirmPassword && (
                        <path d="M4 4l16 16" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >
                {loading
                  ? 'Creating account...'
                  : 'Create Account'}
              </button>

            </form>

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
            <h1>
              Verify your email
            </h1>

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
                {resending || resendCooldown > 0 ? (
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
                disabled={verifying || resending}
              >
                Use a different email
              </button>

            </div>

            <p className="auth-footer">
              Already verified?{' '}

              <button
                type="button"
                onClick={() => setPage('home')}
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
              onClick={() => setPage('home')}
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