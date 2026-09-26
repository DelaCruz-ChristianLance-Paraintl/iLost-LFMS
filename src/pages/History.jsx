import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'
import Sidebar from '../components/Sidebar'

function History({ setPage }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const getReports = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error: reportError } = await supabase
        .from('items')
        .select(
          'id, type, item_name, category, description, location, date, time, status, created_at'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (reportError) {
        setError('Unable to load your reports.')
      } else {
        setReports(data || [])
      }

      setLoading(false)
    }

    getReports()
  }, [])

  const formatDate = (date) => {
    if (!date) {
      return ''
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    )
  }

  const formatTime = (time) => {
    if (!time) {
      return ''
    }

    const [hours, minutes] = time.split(':')
    const date = new Date()

    date.setHours(Number(hours), Number(minutes), 0, 0)

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatStatus = (status) => {
    if (!status) {
      return 'Unknown'
    }

    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        page="history"
        setPage={setPage}
      />

      <main className="dashboard-main">
        <section className="dashboard-content">
          <section className="history-header">
            <p className="eyebrow">HISTORY</p>

            <h1>My Reports</h1>

            <p>
              View the lost and found reports you have submitted.
            </p>
          </section>

          <section className="dashboard-reports">
            {loading ? (
              <div className="empty-state">
                <p>Loading your reports...</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <p>{error}</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="empty-state">
                <p>No reports yet.</p>

                <span>
                  Your lost and found reports will appear here.
                </span>
              </div>
            ) : (
              <div className="reports-list">
                {reports.map((report) => (
                  <article
                    className="report-card"
                    key={report.id}
                  >
                    <div className="report-card-top">
                      <div>
                        <span
                          className={`report-type ${report.type}`}
                        >
                          {report.type === 'lost'
                            ? 'LOST'
                            : 'FOUND'}
                        </span>

                        <h3>{report.item_name}</h3>
                      </div>

                      <span className="report-status">
                        {formatStatus(report.status)}
                      </span>
                    </div>

                    <div className="report-card-details">
                      <p>
                        <strong>Category:</strong>{' '}
                        {report.category}
                      </p>

                      <p>
                        <strong>Location:</strong>{' '}
                        {report.location}
                      </p>

                      <p>
                        <strong>Date:</strong>{' '}
                        {formatDate(report.date)}
                        {report.time &&
                          ` · ${formatTime(report.time)}`}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  )
}

export default History