// import { useState } from 'react'
// import { supabase } from '../lib/supabaseClient'

// function Register() {
//   const [fullName, setFullName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [confirmPassword, setConfirmPassword] = useState('')
//   const [message, setMessage] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleRegister = async (e) => {
//     e.preventDefault()
//     setMessage('')

//     if (password !== confirmPassword) {
//       setMessage('Passwords do not match.')
//       return
//     }

//     setLoading(true)

//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           full_name: fullName,
//         },
//       },
//     })

//     if (error) {
//       setMessage(error.message)
//     } else {
//       setMessage(
//         'Registration successful. Check your email if confirmation is required.'
//       )

//       setFullName('')
//       setEmail('')
//       setPassword('')
//       setConfirmPassword('')
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

//         <h1>Create your account</h1>

//         <p className="auth-description">
//           Join iLost to report and recover lost items around campus.
//         </p>

//         <form onSubmit={handleRegister}>
//           <div className="form-group">
//             <label htmlFor="fullName">Full Name</label>
//             <input
//               id="fullName"
//               type="text"
//               value={fullName}
//               onChange={(e) => setFullName(e.target.value)}
//               placeholder="Enter your full name"
//               required
//             />
//           </div>

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
//               placeholder="Create a password"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="confirmPassword">Confirm Password</label>
//             <input
//               id="confirmPassword"
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               placeholder="Confirm your password"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="auth-button"
//             disabled={loading}
//           >
//             {loading ? 'Creating account...' : 'Create Account'}
//           </button>
//         </form>

//         {message && (
//           <p className="auth-message">
//             {message}
//           </p>
//         )}

//         <p className="auth-footer">
//           Already have an account?{' '}
//           <button type="button">
//             Log In
//           </button>
//         </p>
//       </div>
//     </div>
//   )
// }

// export default Register


import { useState } from 'react'

import { supabase } from '../lib/supabaseClient'

function Register({ setPage }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
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
          <p className="auth-message">
            {message}
          </p>
        )}


        <p className="auth-footer">

          Already have an account?{' '}

          <button
            type="button"
            onClick={() =>
              setPage('login')
            }
          >
            Log In
          </button>

        </p>

      </div>

    </div>
  )
}

export default Register