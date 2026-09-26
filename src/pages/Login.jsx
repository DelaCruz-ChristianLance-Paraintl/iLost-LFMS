// import { useState } from 'react'
// import { supabase } from '../lib/supabaseClient'

// function Login({ setPage }) {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [message, setMessage] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleLogin = async (e) => {
//     e.preventDefault()
//     setMessage('')
//     setLoading(true)

//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })

//     if (error) {
//     setMessage(error.message)
//     } else {
//     setPage('dashboard')
//     }

//     setLoading(false)
//   }

//   return (
//     <div className="auth-page">
//       <div className="auth-card">
//         <div className="auth-brand">
//           <span className="brand-mark">i</span>
//           <span className="brand-name">Lost</span>
//         </div>

//         <h1>Welcome back</h1>

//         <p className="auth-description">
//           Log in to report, search, and recover lost items around campus.
//         </p>

//         <form onSubmit={handleLogin}>
//           <div className="form-group">
//             <label htmlFor="email">Email</label>

//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="password">Password</label>

//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter your password"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="auth-button"
//             disabled={loading}
//           >
//             {loading ? 'Logging in...' : 'Log In'}
//           </button>
//         </form>

//         {message && (
//           <p className="auth-message">
//             {message}
//           </p>
//         )}

//         <p className="auth-footer">
//           Don't have an account?{' '}
//           <button type="button">
//             Sign Up
//           </button>
//         </p>
//       </div>
//     </div>
//   )
// }

// export default Login



import { useState } from 'react'

import { supabase } from '../lib/supabaseClient'

function Login({ setPage }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    setMessage('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setPage('dashboard')
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
          Welcome back
        </h1>

        <p className="auth-description">
          Log in to report, search, and recover lost items around campus.
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

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