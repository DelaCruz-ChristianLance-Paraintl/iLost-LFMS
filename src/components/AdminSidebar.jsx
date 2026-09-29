import { supabase } from '../lib/supabaseClient'

function AdminSidebar({ page, setPage }) {
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
            page === 'admin-dashboard' ? 'active' : ''
          }`}
          onClick={() => setPage('admin-dashboard')}
        >
          Overview
        </button>

        <button
          className={`sidebar-link ${
            page === 'admin-claims' ? 'active' : ''
          }`}
          onClick={() => setPage('admin-claims')}
        >
          Claims
        </button>

        <button
          className={`sidebar-link ${
            page === 'admin-users' ? 'active' : ''
          }`}
          onClick={() => setPage('admin-users')}
        >
          Users
        </button>

        <button
          className={`sidebar-link ${
            page === 'admin-items' ? 'active' : ''
          }`}
          onClick={() => setPage('admin-items')}
        >
          Items
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

export default AdminSidebar