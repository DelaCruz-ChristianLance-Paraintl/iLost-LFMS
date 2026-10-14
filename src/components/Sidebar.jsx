import { useEffect, useRef, useState } from 'react'

import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  FileWarning,
  PackageCheck,
  Search,
  ScanSearch,
  History,
  UserRound,
  LogOut,
} from 'lucide-react'

import { supabase } from '../lib/supabaseClient'
import ConfirmDialog from './ConfirmDialog'
import { useLoading } from './Loadingprovider'
import { useToast } from './useToast'

function Sidebar({ page, setPage }) {
  const sidebarRef = useRef(null)
  const { withLoading, reloadApp } = useLoading()
  const notify = useToast()

  const [collapsed, setCollapsed] = useState(
    () =>
      window.matchMedia('(max-width: 700px)').matches ||
      window.localStorage.getItem('sidebar-collapsed') === 'true'
  )

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

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
      document.removeEventListener(
        'pointerdown',
        collapseOnOutsidePointer
      )
    }
  }, [collapsed])

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current

      window.localStorage.setItem(
        'sidebar-collapsed',
        String(next)
      )

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
    await withLoading(async () => {
      const { error } = await supabase.auth.signOut()

      if (error) {
        notify({
          type: 'error',
          title: 'Log out failed',
          description: error.message,
        })
        return
      }

      window.sessionStorage.removeItem('ilost-page')
      setPage('home')
    }, 'signout')
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
        aria-label={
          collapsed ? 'Expand sidebar' : 'Collapse sidebar'
        }
        aria-expanded={!collapsed}
        title={
          collapsed ? 'Expand sidebar' : 'Collapse sidebar'
        }
      >
        {collapsed ? (
          <PanelLeftOpen size={19} />
        ) : (
          <PanelLeftClose size={19} />
        )}
      </button>

      <button
        type="button"
        className="sidebar-brand"
        onClick={() => reloadApp()}
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
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </button>

        <button
          className={`sidebar-link ${
            page === 'report-lost' ? 'active' : ''
          }`}
          onClick={() => navigateTo('report-lost')}
        >
          <FileWarning size={18} />
          <span>Report Lost Item</span>
        </button>

        <button
          className={`sidebar-link ${
            page === 'report-found' ? 'active' : ''
          }`}
          onClick={() => navigateTo('report-found')}
        >
          <PackageCheck size={18} />
          <span>Report Found Item</span>
        </button>

        <button
          className={`sidebar-link ${
            page === 'browse' ? 'active' : ''
          }`}
          onClick={() => navigateTo('browse')}
        >
          <Search size={18} />
          <span>Browse Items</span>
        </button>

        <button
          className={`sidebar-link ${
            page === 'find-missing' ? 'active' : ''
          }`}
          onClick={() => navigateTo('find-missing')}
        >
          <ScanSearch size={18} />
          <span>Find My Missing Items</span>
        </button>

        <button
          className={`sidebar-link ${
            page === 'history' ? 'active' : ''
          }`}
          onClick={() => navigateTo('history')}
        >
          <History size={18} />
          <span>History</span>
        </button>

        <button
          className={`sidebar-link ${
            page === 'account' ? 'active' : ''
          }`}
          onClick={() => navigateTo('account')}
        >
          <UserRound size={18} />
          <span>Account</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button
          className="sidebar-logout"
          onClick={() => setLogoutDialogOpen(true)}
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>

      <ConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        title="Log Out?"
        description="Are you sure you want to log out of your iLost account?"
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleLogout}
      />
    </aside>
  )
}

export default Sidebar