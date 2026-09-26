function Sidebar({ page, setPage }) {
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
            page === 'history' ? 'active' : ''
          }`}
          onClick={() => setPage('history')}
        >
          History
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-logout">
          Log Out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar