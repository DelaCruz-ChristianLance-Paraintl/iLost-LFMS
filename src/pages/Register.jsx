import { useState } from 'react'

import { supabase } from '../lib/supabaseClient'

function Register({ setPage }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [userType, setUserType] = useState('')
  const [program, setProgram] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [section, setSection] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()

    setMessage('')
    setMessageType('')

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      setMessageType('error')
      return
    }

    if (password.length < 6) {
      setMessage(
        'Password must be at least 6 characters long.'
      )
      setMessageType('error')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: fullName.trim(),
          contact_number: contactNumber.trim(),
          user_type: userType,
          program: program.trim(),
          year_level: yearLevel,
          section: section.trim(),
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setMessageType('error')
      setLoading(false)
      return
    }

    /*
      When email confirmation is enabled, Supabase normally
      returns a user without an active session.

      We keep the message generic because Supabase may
      intentionally hide whether an email already belongs
      to an existing account.
    */
    if (data?.user && !data?.session) {
      setMessage(
        'Registration submitted. Please check your email to confirm your account.'
      )
      setMessageType('success')
    } else {
      setMessage(
        'Registration successful. You can now sign in.'
      )
      setMessageType('success')
    }

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

  const handleResendConfirmation = async () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setMessage(
        'Enter your email address first before resending the confirmation email.'
      )
      setMessageType('error')
      return
    }

    setMessage('')
    setMessageType('')
    setResending(true)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    if (error) {
      setMessage(error.message)
      setMessageType('error')
    } else {
      setMessage(
        'A new confirmation email has been sent. Please check your inbox.'
      )
      setMessageType('success')
    }

    setResending(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <span className="brand-mark">
            i
          </span>

          <span className="brand-name">
            Lost
          </span>
        </div>

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
              onChange={(e) =>
                setUserType(e.target.value)
              }
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

          <div className="form-group">
            <label htmlFor="registerPassword">
              Password
            </label>

            <input
              id="registerPassword"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm your password"
              required
            />
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

        <div className="auth-confirmation-actions">
          <button
            type="button"
            className="auth-resend-button"
            onClick={handleResendConfirmation}
            disabled={resending}
          >
            {resending
              ? 'Resending...'
              : 'Resend Confirmation Email'}
          </button>
        </div>

          <p className="auth-footer">
            Already have an account?{' '}

            <button
              type="button"
              onClick={() => setPage('home')}
            >
              Log In
            </button>
          </p>

      </div>
    </div>
  )
}

export default Register