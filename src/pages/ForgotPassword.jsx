import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function ForgotPassword({ setPage }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleResetRequest = async (e) => {
    e.preventDefault()

    setMessage('')
    setSuccess(false)
    setLoading(true)

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

    if (error) {
      setMessage(error.message)
    } else {
      setSuccess(true)
      setMessage(
        'If an account exists for this email, a password reset link has been sent. Please check your inbox.'
      )
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
            <img
                src="/ilost.png"
                alt="iLost"
                className="auth-logo"
            />
            </div>

        <h1>Forgot Password?</h1>

        <p className="auth-description">
          Enter your registered email address and we'll send
          you a secure password reset link.
        </p>

        <form onSubmit={handleResetRequest}>
          <div className="form-group">
            <label htmlFor="reset-email">
              Email Address
            </label>

            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your registered email"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? 'Sending Reset Link...'
              : 'Send Reset Link'}
          </button>
        </form>

        {message && (
          <p
            className={`auth-message ${
              success
                ? 'auth-message-success'
                : 'auth-message-error'
            }`}
          >
            {message}
          </p>
        )}

        <p className="auth-footer">
          Remember your password?{' '}

          <button
            type="button"
            onClick={() => setPage('home')}
          >
            Back to Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword