import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/useToast'
import ConfirmDialog from '../components/ConfirmDialog'

function ResetPassword({ setPage }) {
  const notify = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()

    setMessage('')
    setSuccess(false)

    if (password.length < 6) {
      const message = 'Password must be at least 6 characters long.'
      setMessage(message)
      notify({
        type: 'error',
        title: 'Password is too short',
        description: message,
      })
      return
    }

    if (password !== confirmPassword) {
      const message = 'Passwords do not match.'
      setMessage(message)
      notify({
        type: 'error',
        title: 'Check your password',
        description: message,
      })
      return
    }

    setConfirmOpen(true)
  }

  const updatePassword = async () => {
    setLoading(true)
    const { error } =
      await supabase.auth.updateUser({
        password,
      })

    if (error) {
      setMessage(error.message)
      notify({
        type: 'error',
        title: 'Password update failed',
        description: error.message,
      })
    } else {
      setSuccess(true)
      const message = 'Your password has been successfully updated.'
      setMessage(message)
      notify({
        type: 'success',
        title: 'Password updated',
        description: message,
      })

      await supabase.auth.signOut()

      setTimeout(() => {
        setPage('login')
      }, 1200)
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

        <h1>Reset Password</h1>

        <p className="auth-description">
          Create a new password for your iLost account.
        </p>

        <form onSubmit={handlePasswordUpdate}>
          <div className="form-group">
            <label htmlFor="new-password">
              New Password
            </label>

            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your new password"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm your new password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || success}
          >
            {loading
              ? 'Updating Password...'
              : 'Update Password'}
          </button>
        </form>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Update your password?"
          description="Your current password will be replaced with the new password you entered. You will need to sign in again after it is updated."
          confirmLabel="Update Password"
          onConfirm={() => {
            setConfirmOpen(false)
            void updatePassword()
          }}
        />

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

        {!success && (
          <p className="auth-footer">
            Remember your password?{' '}

            <button
              type="button"
              onClick={() => setPage('login')}
            >
              Back to Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default ResetPassword