import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/useToast'
import Sidebar from '../components/Sidebar'
import UserManual from '../components/UserManual'
import { Badge } from '../components/ui/badge'
import ItemSearch from '../components/ItemSearch'

function History({ setPage }) {
  const notify = useToast()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState(null)
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
        notify({
          type: 'error',
          title: 'Report history could not be loaded',
          description: 'Unable to load your reports.',
        })
        setLoading(false)
        return
      }

      const { data: claimData, error: claimError } = await supabase
        .from('claims')
        .select(`
          id,
          status,
          created_at,
          item:items!claims_item_id_fkey (
            id,
            type,
            item_name,
            category,
            description,
            location,
            date,
            time,
            status
          )
        `)
        .eq('claimant_id', user.id)
        .in('status', ['approved', 'completed'])

      if (claimError) {
        setError('Unable to load your approved claims.')
        notify({
          type: 'error',
          title: 'Claim history could not be loaded',
          description: 'Unable to load your approved claims.',
        })
        setLoading(false)
        return
      }

      const approvedClaimHistory = (claimData || []).map((claim) => ({
        ...(claim.item || {}),
        id: `claim-${claim.id}`,
        type: claim.item?.type || 'found',
        item_name: claim.item?.item_name || 'Claimed item',
        category: claim.item?.category || 'Details unavailable',
        description: claim.item?.description || null,
        location: claim.item?.location || 'Details unavailable',
        date: claim.item?.date || null,
        time: claim.item?.time || null,
        status: claim.status === 'completed' ? 'returned' : 'claimed',
        created_at: claim.created_at,
        isClaimedItem: true,
        itemDetailsUnavailable: !claim.item,
      }))

      setReports(
        [...(data || []), ...approvedClaimHistory].sort(
          (first, second) =>
            new Date(second.created_at) - new Date(first.created_at)
        )
      )

      setLoading(false)
    }

    getReports()
  }, [notify])

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
        <UserManual />
        <section className="dashboard-content">
        <Badge
          variant="ghost"
          onClick={() => setPage('dashboard')}
          className="group mb-5 cursor-pointer gap-2 rounded-full border border-[#8E2A63]/20 bg-[#8E2A63]/[0.06] px-4 py-2 text-sm font-semibold text-[#8E2A63] transition-all duration-200 hover:border-[#8E2A63]/40 hover:bg-[#FBE4F0] hover:text-[#650033]"
        >
          <span className="text-base transition-transform duration-200 group-hover:-translate-x-0.5">
            ←
          </span>
          Back
        </Badge>

          <section className="dashboard-welcome page-welcome history-header">
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
                  Your lost and found reports and approved claims will appear here.
                </span>
              </div>
            ) : (
              <>
              <ItemSearch
                items={reports}
                onSearch={setFilteredReports}
                label="reports"
                placeholder="Search item name or details"
              />
              {filteredReports?.length === 0 ? (
                <div className="empty-state">
                  <p>No reports match your search.</p>
                  <span>Try another item name or category.</span>
                </div>
              ) : (
              <div className="reports-list">
                {(filteredReports ?? reports).map((report) => (
                  <article
                    className="report-card"
                    key={report.id}
                  >
                    <div className="report-card-top">
                      <div>
                        <span
                          className={`report-type ${report.type}`}
                        >
                          {report.isClaimedItem
                            ? 'CLAIMED'
                            : report.type === 'lost'
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
                      {report.itemDetailsUnavailable && (
                        <p role="status">
                          Item details are restricted by database access policies.
                          Apply the claim access migration to show them here.
                        </p>
                      )}

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
              </>
            )}
          </section>
        </section>
      </main>
    </div>
  )
}

export default History