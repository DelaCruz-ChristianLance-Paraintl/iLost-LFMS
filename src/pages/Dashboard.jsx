import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'

import Sidebar from '../components/Sidebar'

function Dashboard({ setPage, profile }) {
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    recovered: 0,
    unclaimed: 0,
  })

  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')

  useEffect(() => {
    const getDashboardStats = async () => {
      const {
        data: items,
        error: itemsError,
      } = await supabase
        .from('items')
        .select('type, status')

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

    getDashboardStats()
  }, [])

  const fullName =
    profile?.full_name || 'User'

  return (
    <div className="dashboard-layout">
      <Sidebar
        page="dashboard"
        setPage={setPage}
      />

      <main className="dashboard-main">
        <section className="dashboard-content">

          <section className="dashboard-welcome">
            <p className="eyebrow">
              OVERVIEW
            </p>

            <h1>
              Welcome, {fullName}.
            </h1>

            <p>
              Here's an overview of the campus lost and found system.
            </p>
          </section>

          <section className="dashboard-actions">
            <button
              className="dashboard-action-card dashboard-action-card-lost"
              onClick={() =>
                setPage('report-lost')
              }
            >
              <div className="dashboard-action-copy">
                <span className="dashboard-action-number">01</span>

                <h2>
                  Report Lost Item
                </h2>

                <p>
                  Report what you lost around campus.
                </p>
              </div>

              <img
                className="dashboard-action-image"
                src="/magnifying.png"
                alt=""
                aria-hidden="true"
              />
            </button>

            <button
              className="dashboard-action-card dashboard-action-card-found"
              onClick={() =>
                setPage('report-found')
              }
            >
              <div className="dashboard-action-copy">
                <span className="dashboard-action-number">02</span>

                <h2>
                  Report Found Item
                </h2>

                <p>
                  Report an item you found on campus.
                </p>
              </div>

              <img
                className="dashboard-action-image"
                src="/bulb.png"
                alt=""
                aria-hidden="true"
              />
            </button>
          </section>

          <section className="dashboard-overview">
            <div className="section-heading">
              <p className="eyebrow">
                SYSTEM SUMMARY
              </p>

              <h2>
                Lost & Found Overview
              </h2>
            </div>

            {statsError ? (
              <div className="overview-placeholder">
                <p>
                  {statsError}
                </p>
              </div>
            ) : (
              <div className="overview-stats">

                <div className="stat-card">
                  <span>
                    ITEMS LOST
                  </span>

                  <strong>
                    {statsLoading
                      ? '...'
                      : stats.lost}
                  </strong>

                  <p>
                    Reported lost items
                  </p>
                </div>

                <div className="stat-card">
                  <span>
                    ITEMS FOUND
                  </span>

                  <strong>
                    {statsLoading
                      ? '...'
                      : stats.found}
                  </strong>

                  <p>
                    Reported found items
                  </p>
                </div>

                <div className="stat-card">
                  <span>
                    ITEMS RECOVERED
                  </span>

                  <strong>
                    {statsLoading
                      ? '...'
                      : stats.recovered}
                  </strong>

                  <p>
                    Successfully returned items
                  </p>
                </div>

                <div className="stat-card">
                  <span>
                    ITEMS UNCLAIMED
                  </span>

                  <strong>
                    {statsLoading
                      ? '...'
                      : stats.unclaimed}
                  </strong>

                  <p>
                    Items not yet returned
                  </p>
                </div>

              </div>
            )}
          </section>

        </section>
      </main>
    </div>
  )
}

export default Dashboard