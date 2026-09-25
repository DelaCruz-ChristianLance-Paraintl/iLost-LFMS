import './App.css'
import { useState } from 'react'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const [page, setPage] = useState('home')

if (page === 'register') {
  return <Register />
}

if (page === 'login') {
  return <Login setPage={setPage} />
}

if (page === 'dashboard') {
  return <Dashboard />
}

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span className="brand-mark">i</span>
          <span className="brand-name">Lost</span>
        </div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#how-it-works">How It Works</a>
<button
  className="nav-login"
  onClick={() => setPage('login')}
>
  Log In
</button>
        </nav>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-content">
            <p className="eyebrow">
              BULACAN STATE UNIVERSITY · MENESES CAMPUS
            </p>

            <h1>
              Lost it?
              <span> Find it back.</span>
            </h1>

            <p className="hero-description">
              A simple way to report, search, and recover lost and found items
              around the campus.
            </p>

            <div className="hero-actions">
              <button className="primary-button">
                Report Lost Item
              </button>

              <button className="secondary-button">
                Report Found Item
              </button>
            </div>
          </div>

          <div className="search-card">
            <p className="search-label">
              Looking for something?
            </p>

            <div className="search-box">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                placeholder="Search for an item..."
                aria-label="Search for an item"
              />

              <button>Search</button>
            </div>

            <div className="quick-filters">
              <button>Item</button>
              <button>Category</button>
              <button>Location</button>
              <button>Date</button>
            </div>
          </div>
        </section>

        <section
          className="how-section"
          id="how-it-works"
        >
          <div className="section-heading">
            <p className="eyebrow">
              HOW IT WORKS
            </p>

            <h2>From lost to found.</h2>

            <p>
              iLost connects people who lost items with those who found them,
              while keeping the return process verified.
            </p>
          </div>

          <div className="steps">
            <div className="step-card">
              <span className="step-number">01</span>

              <h3>Report</h3>

              <p>
                Report an item you lost or found with its basic details.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">02</span>

              <h3>Search</h3>

              <p>
                Search and filter reported items to find a possible match.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">03</span>

              <h3>Claim</h3>

              <p>
                Submit a claim request when you believe an item belongs to you.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">04</span>

              <h3>Verify</h3>

              <p>
                An administrator verifies ownership before the item is
                returned.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="brand">
          <span className="brand-mark">i</span>
          <span className="brand-name">Lost</span>
        </div>

        <p>Lost it? Find it back.</p>
      </footer>
    </div>
  )
}

export default App