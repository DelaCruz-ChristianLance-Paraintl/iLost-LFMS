import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'

import AdminSidebar from '../components/AdminSidebar'

function AdminDashboard({ setPage, profile }) {
  const [fullName, setFullName] = useState(
    profile?.full_name || 'Administrator'
  )
  const [loading, setLoading] = useState(!profile)
  const [authorized, setAuthorized] = useState(
    profile?.role === 'admin'
  )
  const [counts, setCounts] = useState({
    claims: 0,
    users: 0,
    items: 0,
  })
  const [countsLoading, setCountsLoading] = useState(true)
  const [countsError, setCountsError] = useState('')
  const [realtimeError, setRealtimeError] = useState('')

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setPage('login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      if (error || !data || data.role !== 'admin') {
        setPage('dashboard')
        return
      }

      setFullName(data.full_name || 'Administrator')
      setAuthorized(true)
      setLoading(false)
    }

    checkAdmin()
  }, [setPage])

  useEffect(() => {
    if (!authorized) {
      return
    }

    let isActive = true

    const loadCounts = async () => {
      const [claimsResult, usersResult, itemsResult] = await Promise.all([
        supabase.from('claims').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('items').select('id', { count: 'exact', head: true }),
      ])

      if (!isActive) {
        return
      }

      const error =
        claimsResult.error || usersResult.error || itemsResult.error

      if (error) {
        setCountsError('Unable to load the Overview counts.')
      } else {
        setCounts({
          claims: claimsResult.count ?? 0,
          users: usersResult.count ?? 0,
          items: itemsResult.count ?? 0,
        })
        setCountsError('')
      }

      setCountsLoading(false)
    }

    void loadCounts()

    const channel = supabase
      .channel('admin-overview-counts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'claims' },
        loadCounts
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        loadCounts
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        loadCounts
      )
      .subscribe((status) => {
        if (isActive) {
          if (['CHANNEL_ERROR', 'TIMED_OUT'].includes(status)) {
            setRealtimeError('Live count updates are unavailable.')
          } else if (status === 'SUBSCRIBED') {
            setRealtimeError('')
          }
        }
      })

    return () => {
      isActive = false
      void supabase.removeChannel(channel)
    }
  }, [authorized])

  if (loading) {
    return (
      <div className="dashboard-layout">
        <AdminSidebar
          page="admin-dashboard"
          setPage={setPage}
        />

        <main className="dashboard-main">
          <section className="dashboard-content">
            <p>Loading admin dashboard...</p>
          </section>
        </main>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="dashboard-layout">

      <AdminSidebar
        page="admin-dashboard"
        setPage={setPage}
      />

      <main className="dashboard-main">
        <section className="dashboard-content">

          <section className="dashboard-welcome">
            <p className="eyebrow">
              ADMINISTRATION
            </p>

            <h1>
              Welcome, {fullName}.
            </h1>

            <p>
              Manage the iLost campus lost and found system.
            </p>
          </section>

          <section className="dashboard-overview">

            <div className="section-heading">
              <p className="eyebrow admin-label-pill admin-label-pill-red">
                ADMIN PANEL
              </p>

              <h2>
                System Management
              </h2>
            </div>

            <div className="overview-stats admin-overview-stats">
              <button
                className="stat-card admin-stat-card"
                onClick={() => setPage('admin-claims')}
              >
                <span className="admin-stat-title">Current claims</span>
                <span className="admin-stat-divider" aria-hidden="true" />
                <strong>
                  {countsLoading || countsError ? '—' : counts.claims}
                </strong>
                <span className="admin-stat-divider" aria-hidden="true" />
                <span className="admin-stat-description">
                  Submitted claims of all users.
                </span>
              </button>

              <button
                className="stat-card admin-stat-card"
                onClick={() => setPage('admin-users')}
              >
                <span className="admin-stat-title">Registered users</span>
                <span className="admin-stat-divider" aria-hidden="true" />
                <strong>
                  {countsLoading || countsError ? '—' : counts.users}
                </strong>
                <span className="admin-stat-divider" aria-hidden="true" />
                <span className="admin-stat-description">
                  Accounts registered in the system.
                </span>
              </button>

              <button
                className="stat-card admin-stat-card"
                onClick={() => setPage('admin-items')}
              >
                <span className="admin-stat-title">Reported items</span>
                <span className="admin-stat-divider" aria-hidden="true" />
                <strong>
                  {countsLoading || countsError ? '—' : counts.items}
                </strong>
                <span className="admin-stat-divider" aria-hidden="true" />
                <span className="admin-stat-description">
                  Lost and found reports on record.
                </span>
              </button>
            </div>
            {(countsError || realtimeError) && (
              <p className="admin-overview-counts-message" role="status">
                {countsError || realtimeError}
              </p>
            )}
          </section>

        </section>
      </main>
    </div>
  )
}

export default AdminDashboard