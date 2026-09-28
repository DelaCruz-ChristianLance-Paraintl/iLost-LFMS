import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function AdminDashboard({ setPage }) {
  const [fullName, setFullName] = useState('Administrator')
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

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

      setFullName(data.full_name)
      setAuthorized(true)
      setLoading(false)
    }

    checkAdmin()
  }, [setPage])

  if (loading) {
    return (
      <div className="dashboard-layout">
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
      <main className="dashboard-main">
        <section className="dashboard-content">

          <section className="dashboard-welcome">
            <p className="eyebrow">ADMINISTRATION</p>

            <h1>
              Welcome, {fullName}.
            </h1>

            <p>
              Manage the iLost campus lost and found system.
            </p>
          </section>

          <section className="dashboard-overview">

            <div className="section-heading">
              <p className="eyebrow">ADMIN PANEL</p>
              <h2>System Management</h2>
            </div>

            <div className="overview-stats">

              <button
                className="stat-card"
                onClick={() => setPage('admin-claims')}
              >
                <span>CLAIMS</span>
                <strong>View</strong>
                <p>
                  Review submitted claims.
                </p>
              </button>

              <button
                className="stat-card"
                onClick={() => setPage('admin-users')}
              >
                <span>USERS</span>
                <strong>View</strong>
                <p>
                  Manage registered users.
                </p>
              </button>

              <button
                className="stat-card"
                onClick={() => setPage('admin-items')}
              >
                <span>ITEMS</span>
                <strong>View</strong>
                <p>
                  Manage reported items.
                </p>
              </button>

              <button
                className="stat-card"
                onClick={() => setPage('dashboard')}
              >
                <span>ACCOUNT</span>
                <strong>Exit</strong>
                <p>
                  Return to the user dashboard.
                </p>
              </button>

            </div>

          </section>

        </section>
      </main>
    </div>
  )
}

export default AdminDashboard