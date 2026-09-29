import { supabase } from '../lib/supabaseClient'

function Sidebar({ page, setPage }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setPage('home')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">i</span>
        <span className="brand-name">Lost</span>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${
            page === 'dashboard' ? 'active' : ''
          }`}
          onClick={() => setPage('dashboard')}
        >
          Overview
        </button>

        <button
          className={`sidebar-link ${
            page === 'report-lost' ? 'active' : ''
          }`}
          onClick={() => setPage('report-lost')}
        >
          Report Lost Item
        </button>

        <button
          className={`sidebar-link ${
            page === 'report-found' ? 'active' : ''
          }`}
          onClick={() => setPage('report-found')}
        >
          Report Found Item
        </button>

        <button
          className={`sidebar-link ${
            page === 'browse' ? 'active' : ''
          }`}
          onClick={() => setPage('browse')}
        >
          Browse Items
        </button>

        <button
          className={`sidebar-link ${
            page === 'find-missing' ? 'active' : ''
          }`}
          onClick={() => setPage('find-missing')}
        >
          Find My Missing Items
        </button>

        <button
          className={`sidebar-link ${
            page === 'history' ? 'active' : ''
          }`}
          onClick={() => setPage('history')}
        >
          History
        </button>

        <button
          className={`sidebar-link ${
            page === 'account' ? 'active' : ''
          }`}
          onClick={() => setPage('account')}
        >
          Account
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar