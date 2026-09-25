import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Dashboard() {
  const [fullName, setFullName] = useState('User')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setFullName(data.full_name)
      }

      setLoading(false)
    }

    getProfile()
  }, [])

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <div className="brand">
          <span className="brand-mark">i</span>
          <span className="brand-name">Lost</span>
        </div>

        <button className="dashboard-logout">
          Log Out
        </button>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-welcome">
          <p className="eyebrow">MY DASHBOARD</p>

          <h1>
            Welcome, {loading ? '...' : fullName}.
          </h1>

          <p>
            Find your lost item or help return one to its owner.
          </p>
        </section>

        <section className="dashboard-actions">
          <button className="dashboard-action-card">
            <span>01</span>
            <h2>Report Lost Item</h2>
            <p>
              Report something you lost around campus.
            </p>
          </button>

          <button className="dashboard-action-card">
            <span>02</span>
            <h2>Report Found Item</h2>
            <p>
              Report an item you found on campus.
            </p>
          </button>
        </section>

        <section className="dashboard-reports">
          <div className="section-heading">
            <p className="eyebrow">ACTIVITY</p>
            <h2>My Reports</h2>
          </div>

          <div className="empty-state">
            <p>No reports yet.</p>
            <span>
              Your lost and found reports will appear here.
            </span>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard