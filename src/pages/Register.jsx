import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Register({ setPage }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [program, setProgram] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [section, setSection] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          contact_number: contactNumber,
          program,
          year_level: yearLevel,
          section,
        },
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage(
        'Registration successful. Check your email if confirmation is required.'
      )

      setFullName('')
      setEmail('')
      setContactNumber('')
      setProgram('')
      setYearLevel('')
      setSection('')
      setPassword('')
      setConfirmPassword('')
    }

    setLoading(false)
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
              onChange={(e) => setFullName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter your contact number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="program">
              Program
            </label>

            <input
              id="program"
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
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
              onChange={(e) => setYearLevel(e.target.value)}
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
              onChange={(e) => setSection(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-footer">
          Already have an account?{' '}

          <button
            type="button"
            onClick={() => setPage('login')}
          >
            Log In
          </button>
        </p>

      </div>
    </div>
  )
}

export default Register