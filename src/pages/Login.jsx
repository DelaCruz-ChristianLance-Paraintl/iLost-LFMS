import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Login({ setPage, setProfile }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    setMessage('')
    setLoading(true)

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      setMessage(error.message)
    } else {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        setMessage('Unable to load your account information.')
      } else {
        setProfile(profile)
        setPage(profile.role === 'admin' ? 'admin-dashboard' : 'dashboard')
      }
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">i</span>
          <span className="brand-name">Lost</span>
        </div>

        <h1>Welcome back</h1>

        <p className="auth-description">
          Sign in to report, search, and recover lost items
          around campus.
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">
              Email Address
            </label>

            <input
              id="login-email"
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
            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Sign in'}
          </button>
        </form>

        {message && (
          <p className="auth-message auth-message-error">
            {message}
          </p>
        )}

        <div className="auth-recovery">
          <button
            type="button"
            onClick={() => setPage('forgot-password')}
          >
            Forgot Password?
          </button>
        </div>

        <p className="auth-footer">
          Don't have an account?{' '}

          <button
            type="button"
            onClick={() => setPage('register')}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login