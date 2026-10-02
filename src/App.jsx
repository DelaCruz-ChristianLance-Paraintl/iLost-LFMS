import './App.css'

import { useEffect, useState } from 'react'

import { supabase } from './lib/supabaseClient'

import CampusIllustration from './components/CampusIllustration'
import CircuitBackground from './components/CircuitBackground'

import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import ReportItem from './pages/ReportItem'
import History from './pages/History'
import BrowseItems from './pages/BrowseItems'
import FindMyMissingItems from './pages/FindMyMissingItems'
import AdminDashboard from './pages/AdminDashboard'
import AdminClaims from './pages/AdminClaims'
import AdminItems from './pages/AdminItems'
import AdminUsers from './pages/AdminUsers'
import Account from './pages/Account'

function App() {
  const [page, setPage] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [profile, setProfile] = useState(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loginMessage, setLoginMessage] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const recoveryInUrl =
      window.location.hash.includes('type=recovery') ||
      new URLSearchParams(
        window.location.search
      ).get('type') === 'recovery'

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setPage('reset-password')
          setCheckingSession(false)
        }
      }
    )

    const restoreSession = () => {
      if (recoveryInUrl) {
        setPage('reset-password')
        setCheckingSession(false)
        return
      }

      setPage('home')
      setCheckingSession(false)
    }

    restoreSession()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLandingLogin = async (e) => {
    e.preventDefault()

    setLoginMessage('')
    setLoginLoading(true)

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      setLoginMessage(error.message)
    } else {
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        setLoginMessage(
          'Unable to load your account information.'
        )
      } else {
        setProfile(profile)

        if (profile.role === 'admin') {
          setPage('admin-dashboard')
        } else {
          setPage('dashboard')
        }
      }
    }

    setLoginLoading(false)
  }

  if (checkingSession) {
    return null
  }

  if (page === 'login') {
    return <Login setPage={setPage} />
  }

  if (page === 'reset-password') {
    return <ResetPassword setPage={setPage} />
  }

  if (page === 'dashboard') {
    return (
      <Dashboard
        setPage={setPage}
        profile={profile}
      />
    )
  }

  if (page === 'report-lost') {
    return (
      <ReportItem
        key="report-lost"
        type="lost"
        setPage={setPage}
      />
    )
  }

  if (page === 'report-found') {
    return (
      <ReportItem
        key="report-found"
        type="found"
        setPage={setPage}
      />
    )
  }

  if (page === 'find-missing') {
    return (
      <FindMyMissingItems
        setPage={setPage}
      />
    )
  }

  if (page === 'history') {
    return <History setPage={setPage} />
  }

  if (page === 'browse') {
    return <BrowseItems setPage={setPage} />
  }

  if (page === 'admin-dashboard') {
    return (
      <AdminDashboard
        setPage={setPage}
        profile={profile}
      />
    )
  }

  if (page === 'admin-claims') {
    return (
      <AdminClaims
        setPage={setPage}
      />
    )
  }

  if (page === 'admin-items') {
    return (
      <AdminItems
        setPage={setPage}
      />
    )
  }

  if (page === 'admin-users') {
    return (
      <AdminUsers
        setPage={setPage}
      />
    )
  }

  if (page === 'account') {
    return (
      <Account
        setPage={setPage}
        profile={profile}
      />
    )
  }

  return (
    <div className="landing-page">

      {/* LEFT PANEL */}
      <section className="landing-brand-panel">

        <div className="landing-brand">



          <div className="landing-logo">
            <img
              src="/ilost.png"
              alt="iLost"
              className="landing-logo-image"
            />
          </div>

          <h1>
            Lost it? Find it back.
          </h1>

          <p className="landing-campus">
            Bulacan State University - Meneses Campus
          </p>

          <p className="landing-tagline">
            "Connecting students and campus administrators
            <br />
            to return what matters most."
          </p>

        </div>

        {/* CAMPUS ILLUSTRATION */}
        <div className="campus-illustration">


          {/* // <div className="illustration-map">
          //   <div className="map-pin pin-one"></div>
          //   <div className="map-pin pin-two"></div>
          //   <div className="map-route route-one"></div>
          //   <div className="map-route route-two"></div>
          // </div>

          // <div className="campus-platform">

          //   <div className="campus-building building-left">
          //     <div className="building-window"></div>
          //     <div className="building-window"></div>
          //     <div className="building-window"></div>
          //   </div>

          //   <div className="campus-building building-center">
          //     <div className="building-screen">
          //       <span>iLost</span>
          //       <div className="screen-line"></div>
          //       <div className="screen-line short"></div>
          //     </div>
          //   </div>

          //   <div className="campus-building building-right">
          //     <div className="building-window"></div>
          //     <div className="building-window"></div>
          //   </div>

          //   <div className="illustration-tree tree-one">
          //     <span></span>
          //   </div>

          //   <div className="illustration-tree tree-two">
          //     <span></span>
          //   </div>

          //   <div className="illustration-person person-one">
          //     <span className="person-head"></span>
          //     <span className="person-body"></span>
          //   </div>

          //   <div className="illustration-person person-two">
          //     <span className="person-head"></span>
          //     <span className="person-body"></span>
          //   </div>

          //   <div className="illustration-person person-three">
          //     <span className="person-head"></span>
          //     <span className="person-body"></span>
          //   </div>

          // </div>

          // <div className="illustration-label label-found">
          //   <span className="label-icon">
          //     +
          //   </span>
          //   Found Item
          // </div>

          // <div className="illustration-label label-lost">
          //   <span className="label-icon">
          //     i
          //   </span>
          //   Lost Item
          // </div> */}

          <CampusIllustration />
        </div>

        {/* BOTTOM INFORMATION */}
        <div className="network-info">

          <div className="network-dot"></div>

          <div>
            <strong>
              Campus Recovery Network
            </strong>

            <p>
              Real-time assistance
              <span>•</span>
              Location-aware
              <span>•</span>
              Integrated campus-wide recovery
            </p>
          </div>

        </div>

      </section>

      {/* RIGHT PANEL */}
      <section className="landing-login-panel">

        <CircuitBackground />


        {/* LOGIN CARD */}
        <div
          className={`landing-login-card${
            page === 'register' || page === 'forgot-password'
              ? ' landing-login-card-form'
              : ''
          }`}
        >
          {page === 'register' ? (
            <div className="landing-card-scroll">
              <Register setPage={setPage} embedded />
            </div>
          ) : page === 'forgot-password' ? (
            <div className="landing-card-scroll">
              <ForgotPassword setPage={setPage} embedded />
            </div>
          ) : (
            <>

          <div className="login-card-heading">
            <h2>
              Welcome to <span>iLost</span>
            </h2>
          </div>

          <form onSubmit={handleLandingLogin}>

            {/* LOGIN FIELDS BOX */}
            <div className="landing-login-fields">

              {/* EMAIL */}
              <div className="landing-field-group">
                <label htmlFor="landing-email">Email</label>
                <div className="landing-field">
                  <input
                    id="landing-email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="landing-field-group">
                <label htmlFor="landing-password">Password</label>
                <div className="landing-field">
                  <input
                    id="landing-password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="eye-button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"
                      />
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
              </div>

            </div>

            {/* OPTIONS */}
            <div className="login-options">

              <label className="remember-option">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                onClick={() => {
                  setLoginMessage('')
                  setPage('forgot-password')
                }}
              >
                Forgot Password?
              </button>

            </div>

            {/* ERROR */}
            {loginMessage && (
              <p className="landing-login-message">
                {loginMessage}
              </p>
            )}

            {/* SIGN IN */}
            <button
              type="submit"
              className="landing-signin-button"
              disabled={loginLoading}
            >
              {loginLoading
                ? 'Signing In...'
                : 'Sign In'}
            </button>

            {/* REGISTER */}
            <p className="landing-register-link">

              Don't have an account?

              <button
                type="button"
                onClick={() =>
                  setPage('register')
                }
              >
                Sign Up
              </button>

            </p>

          </form>

          {/* SECURITY NOTICE */}
          <div className="login-security">

            <span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="10"
                  rx="2"
                />

                <path
                  d="M8 10V7a4 4 0 0 1 8 0v3"
                />
              </svg>
            </span>

            Secure access for Meneses Campus students and staff.

          </div>
            </>
          )}

        </div>

      </section>

    </div>
  )
}

export default App