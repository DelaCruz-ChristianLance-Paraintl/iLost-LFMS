import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'

import Sidebar from '../components/Sidebar'

function Dashboard({ setPage }) {
  const [fullName, setFullName] = useState('User')
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    recovered: 0,
    unclaimed: 0,
  })

  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')

  useEffect(() => {
    const getDashboardData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        setStatsLoading(false)
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

      const { data: items, error: itemsError } = await supabase
  .from('items')
  .select('*')



      if (itemsError) {
        setStatsError(
          'Unable to load system statistics.'
        )
        setStatsLoading(false)
        return
      }

      const lost = items.filter(
        (item) => item.type === 'lost'
      ).length

      const found = items.filter(
        (item) => item.type === 'found'
      ).length

      const recovered = items.filter(
        (item) => item.status === 'returned'
      ).length

      const unclaimed = items.filter(
        (item) => item.status !== 'returned'
      ).length

      setStats({
        lost,
        found,
        recovered,
        unclaimed,
      })

      setStatsLoading(false)
    }

    getDashboardData()
  }, [])

  return (
    <div className="dashboard-layout">
      <Sidebar
        page="dashboard"
        setPage={setPage}
      />

      <main className="dashboard-main">
        <section className="dashboard-content">
          
          <section className="dashboard-welcome">
            <div className="dashboard-welcome-overlay">
            <p className="eyebrow">Bulacan State University (Lost & Found) </p>

            <h1>
              Welcome, {loading ? '...' : fullName}.
            </h1>

            <p>
              Together, we can bring lost items home.
            
          
            </p>
            </div>
          </section>

          

          <section className="dashboard-overview">
            
  {statsError ? (
              <div className="overview-placeholder">
                <p>{statsError}</p>
              </div>
            ) : (
              <div className="overview-stats">
              
            <div className="stat-card">
  <div className="stat-card-icon">
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 8.5 12 4 3 8.5" />
    <path d="M3 8.5v7L12 20l9-4.5v-7" />
    <path d="M12 20v-8" />
    <path d="m7.5 6.25 9 4.5" />
  </svg>
</div>

  <div className="stat-card-content">
    <span>ITEMS LOST</span>
    <strong>
      {statsLoading ? '...' : stats.lost}
    </strong>
    <p>Reported lost items</p>
  </div>

  <div className="stat-card-arrow">→</div>
</div>

                
<div className="stat-card">
  <div className="stat-card-icon">
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
</div>

  <div className="stat-card-content">
    <span>ITEMS FOUND</span>
    <strong>
      {statsLoading ? '...' : stats.found}
    </strong>
    <p>Reported found items</p>
  </div>

  <div className="stat-card-arrow">→</div>
</div>

<div className="stat-card">
  <div className="stat-card-icon">
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
</div>

  <div className="stat-card-content">
    <span>ITEMS RECOVERED</span>
    <strong>
      {statsLoading ? '...' : stats.recovered}
    </strong>
    <p>Successfully returned items</p>
  </div>

  <div className="stat-card-arrow">→</div>
</div>

  <div className="stat-card">
  <div className="stat-card-icon">
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7v5l3 2" />
  </svg>
</div>

  <div className="stat-card-content">
    <span>ITEMS UNCLAIMED</span>
    <strong>
      {statsLoading ? '...' : stats.unclaimed}
    </strong>
    <p>
      Items not yet returned
    </p>
  </div>

  <div className="stat-card-arrow">→</div>
</div>

              </div>

              
            )}
          </section>

          <section className="dashboard-actions">
  <div className="section-heading quick-reports-heading">
    <p className="eyebrow">QUICK ACTIONS</p>
  </div>

  <button
    className="dashboard-action-card dashboard-action-lost"
    onClick={() => setPage('report-lost')}
  >
    <div className="action-card-title">
      <span className="action-card-icon">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l5 5" />
        </svg>
      </span>

      <h2>Report Lost Item</h2>
    </div>

    <p>Find help for your lost belongings.</p>

    <span className="card-arrow">→</span>
  </button>

  <button
    className="dashboard-action-card dashboard-action-found"
    onClick={() => setPage('report-found')}
  >
    <div className="action-card-title">
      <span className="action-card-icon">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 8.5L12 4l8 4.5v8L12 21l-8-4.5v-8z" />
          <path d="M4 8.5l8 4.5 8-4.5" />
          <path d="M12 13v8" />
          <path d="M8 6.2l8 4.5" />
        </svg>
      </span>

      <h2>Report Found Item</h2>
    </div>

    <p>Help reunite items with their owners.</p>

    <span className="card-arrow">→</span>
  </button>
  </section>

  <section className="dashboard-reports">
  <div className="section-heading">
    <p className="eyebrow">RECENT ACTIVITY</p>
    <h2>Recent Reports</h2>
  </div>

  <div className="reports-list">
    <div className="report-card">
  <div className="report-column report-item">
    <div className="report-item-icon">
      <div className="report-thumbnail-placeholder"></div>
    </div>
    <div>
      <span>ITEM</span>
      <strong>Black Backpack</strong>
    </div>
  </div>

  <div className="report-column">
    <span>TYPE</span>
<strong>Bag</strong>
  </div>

  <div className="report-column">
    <span>STATUS</span>
    <strong className="report-status unclaimed">Unclaimed</strong>
  </div>

  <div className="report-column">
    <span>DATE REPORTED</span>
    <strong>September 26, 2026</strong>
  </div>

  <div className="report-arrow">›</div>
</div>

<div className="report-card">
  <div className="report-column report-item">
    <div className="report-item-icon">
      <div className="report-thumbnail-placeholder"></div>
    </div>
    <div>
      <span>ITEM</span>
      <strong>Student ID</strong>
    </div>
  </div>

  <div className="report-column">
    <span>TYPE</span>
<strong>ID</strong>
  </div>

  <div className="report-column">
    <span>STATUS</span>
    <strong className="report-status unclaimed">Unclaimed</strong>
  </div>

  <div className="report-column">
    <span>DATE REPORTED</span>
    <strong>September 25, 2026</strong>
  </div>

  <div className="report-arrow">›</div>
</div>

<div className="report-card">
  <div className="report-column report-item">
    <div className="report-item-icon">
      <div className="report-thumbnail-placeholder"></div>
    </div>
    <div>
      <span>ITEM</span>
      <strong>Brown Wallet</strong>
    </div>
  </div>

  <div className="report-column">
    <span>TYPE</span>
<strong>wallet</strong>
  </div>

  <div className="report-column">
    <span>STATUS</span>
    <strong className="report-status returned">Returned</strong>
  </div>

  <div className="report-column">
    <span>DATE REPORTED</span>
    <strong>September 24, 2026</strong>
  </div>

  <div className="report-arrow">›</div>
</div>

<div className="report-card">
  <div className="report-column report-item">
    <div className="report-item-icon">
      <div className="report-thumbnail-placeholder"></div>
    </div>
    <div>
      <span>ITEM</span>
      <strong>pink tumbler</strong>
    </div>
  </div>

  <div className="report-column">
    <span>TYPE</span>
<strong>Bottle/tumbler</strong>
  </div>

  <div className="report-column">
    <span>STATUS</span>
    <strong className="report-status returned">Returned</strong>
  </div>

  <div className="report-column">
    <span>DATE REPORTED</span>
    <strong>September 23, 2026</strong>
  </div>

  <div className="report-arrow">›</div>
</div>

</div>
</section>

</section>

</main>
    </div>
  )
}

export default Dashboard