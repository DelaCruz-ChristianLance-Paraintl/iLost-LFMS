import { useState } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { supabase } from '../lib/supabaseClient'

function Sidebar({ page, setPage }) {
  const [collapsed, setCollapsed] = useState(
    () =>
      window.matchMedia('(max-width: 700px)').matches ||
      window.localStorage.getItem('sidebar-collapsed') === 'true'
  )

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current
      window.localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  const navigateTo = (target) => {
    const scrollPosition = {
      top: 0,
      left: 0,
      behavior: 'instant',
    }

    window.scrollTo(scrollPosition)
    document.documentElement.scrollTo(scrollPosition)
    document.body.scrollTo(scrollPosition)
    document.getElementById('root')?.scrollTo(scrollPosition)
    document.querySelector('.dashboard-main')?.scrollTo(scrollPosition)

    if (window.matchMedia('(max-width: 700px)').matches) {
      setCollapsed(true)
      window.localStorage.setItem('sidebar-collapsed', 'true')
    }

    setPage(target)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setPage('home')
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
      </button>

    <button
      type="button"
      className="sidebar-brand"
        onClick={() => navigateTo('dashboard')}
      aria-label="Go to iLost overview"
    >
      <img
        src={`${import.meta.env.BASE_URL}ilost.png`}
        alt="iLost"
        className="sidebar-logo"
        fetchPriority="high"
      />
    </button>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${
            page === 'dashboard' ? 'active' : ''
          }`}
          onClick={() => navigateTo('dashboard')}
        >
          Overview
        </button>

        <button
          className={`sidebar-link ${
            page === 'report-lost' ? 'active' : ''
          }`}
          onClick={() => navigateTo('report-lost')}
        >
          Report Lost Item
        </button>

        <button
          className={`sidebar-link ${
            page === 'report-found' ? 'active' : ''
          }`}
          onClick={() => navigateTo('report-found')}
        >
          Report Found Item
        </button>

        <button
          className={`sidebar-link ${
            page === 'browse' ? 'active' : ''
          }`}
          onClick={() => navigateTo('browse')}
        >
          Browse Items
        </button>

        <button
          className={`sidebar-link ${
            page === 'find-missing' ? 'active' : ''
          }`}
          onClick={() => navigateTo('find-missing')}
        >
          Find My Missing Items
        </button>

        <button
          className={`sidebar-link ${
            page === 'history' ? 'active' : ''
          }`}
          onClick={() => navigateTo('history')}
        >
          History
        </button>

        <button
          className={`sidebar-link ${
            page === 'account' ? 'active' : ''
          }`}
          onClick={() => navigateTo('account')}
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