import { useEffect, useRef, useState } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { supabase } from '../lib/supabaseClient'

function AdminSidebar({ page, setPage }) {
  const sidebarRef = useRef(null)
  const [collapsed, setCollapsed] = useState(
    () =>
      window.matchMedia('(max-width: 700px)').matches ||
      window.localStorage.getItem('sidebar-collapsed') === 'true'
  )

  useEffect(() => {
    if (collapsed) {
      return
    }

    const collapseOnOutsidePointer = (event) => {
      if (
        !window.matchMedia('(max-width: 700px)').matches ||
        !(event.target instanceof Node) ||
        sidebarRef.current?.contains(event.target)
      ) {
        return
      }

      setCollapsed(true)
      window.localStorage.setItem('sidebar-collapsed', 'true')
    }

    document.addEventListener('pointerdown', collapseOnOutsidePointer)

    return () => {
      document.removeEventListener('pointerdown', collapseOnOutsidePointer)
    }
  }, [collapsed])

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
    <aside
      ref={sidebarRef}
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
    >
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
        onClick={() => navigateTo('admin-dashboard')}
        aria-label="Go to admin overview"
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
            page === 'admin-dashboard' ? 'active' : ''
          }`}
          onClick={() => navigateTo('admin-dashboard')}
        >
          Overview
        </button>

        <button
          className={`sidebar-link ${
            page === 'admin-claims' ? 'active' : ''
          }`}
          onClick={() => navigateTo('admin-claims')}
        >
          Claims
        </button>

        <button
          className={`sidebar-link ${
            page === 'admin-users' ? 'active' : ''
          }`}
          onClick={() => navigateTo('admin-users')}
        >
          Users
        </button>

        <button
          className={`sidebar-link ${
            page === 'admin-items' ? 'active' : ''
          }`}
          onClick={() => navigateTo('admin-items')}
        >
          Items
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

export default AdminSidebar