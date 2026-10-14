import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/useToast'
import { useLoading } from '../components/Loadingprovider'

import AdminSidebar from '../components/AdminSidebar'
import UserManual from '../components/UserManual'
import { Badge } from '../components/ui/badge'
import ConfirmDialog from '../components/ConfirmDialog'
import ItemSearch from '../components/ItemSearch'

function AdminClaims({ setPage }) {
  const notify = useToast()
  const { flash } = useLoading()
  const [claims, setClaims] = useState([])
  const [filteredClaims, setFilteredClaims] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [processingId, setProcessingId] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  const loadClaims = async () => {
    setLoading(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setPage('login')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      setPage('dashboard')
      return
    }

    const { data, error } = await supabase
      .from('claims')
      .select(`
        id,
        item_id,
        claimant_id,
        message,
        status,
        created_at,
        verified_at,
        claimant:profiles!claims_claimant_id_fkey (
          full_name,
          email,
          contact_number,
          program,
          year_level,
          section
        ),
        item:items!claims_item_id_fkey (
          id,
          item_name,
          type,
          category,
          subcategory,
          brand,
          model,
          color,
          size,
          description,
          distinctive_details,
          location,
          date,
          time,
          status
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
      notify({
        type: 'error',
        title: 'Claims could not be loaded',
        description: error.message,
      })
    } else {
      setClaims(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadClaims()
  }, [])

  const parseClaimMessage = (message) => {
    if (!message) {
      return {
        reason: '',
        location: '',
        date: '',
        details: '',
        additionalInfo: '',
      }
    }

    const getSection = (label) => {
      const start = message.indexOf(label)

      if (start === -1) {
        return ''
      }

      const contentStart = start + label.length
      const remaining = message.slice(contentStart)

      const nextSection = remaining.search(
        /\n\n[A-Za-z ]+:\n/
      )

      if (nextSection === -1) {
        return remaining.trim()
      }

      return remaining.slice(0, nextSection).trim()
    }

    return {
      reason: getSection(
        'Why I believe this is my item:\n'
      ),
      location: getSection(
        'Where I lost it:\n'
      ),
      date: getSection(
        'When I lost it:\n'
      ),
      details: getSection(
        'Private identifying details:\n'
      ),
      additionalInfo: getSection(
        'Additional information:\n'
      ),
    }
  }

  const executeApprove = async (claim) => {
    setProcessingId(claim.id)
    setMessage('')

    const { error: claimError } = await supabase
      .from('claims')
      .update({
        status: 'approved',
        verified_at: new Date().toISOString(),
      })
      .eq('id', claim.id)

    if (claimError) {
      setMessage(claimError.message)
      notify({
        type: 'error',
        title: 'Claim approval failed',
        description: claimError.message,
      })
      setProcessingId(null)
      return
    }

    const { error: itemError } = await supabase
      .from('items')
      .update({
        status: 'claimed',
      })
      .eq('id', claim.item_id)

    if (itemError) {
      await supabase
        .from('claims')
        .update({
          status: 'pending',
          verified_at: null,
        })
        .eq('id', claim.id)

      setMessage(itemError.message)
      notify({
        type: 'error',
        title: 'Claim approval failed',
        description: itemError.message,
      })
      setProcessingId(null)
      return
    }

    const successMessage =
      'Claim approved. The claimant may now proceed to the LSC for physical handover.'
    setMessage(successMessage)
    notify({
      type: 'success',
      title: 'Claim approved',
      description: successMessage,
    })

    setProcessingId(null)

    setFilteredClaims(null)
    await loadClaims()
  }

  const executeReject = async (claim) => {
    setProcessingId(claim.id)
    setMessage('')

    const { error } = await supabase
      .from('claims')
      .update({
        status: 'rejected',
      })
      .eq('id', claim.id)

    if (error) {
      setMessage(error.message)
      notify({
        type: 'error',
        title: 'Claim rejection failed',
        description: error.message,
      })
      setProcessingId(null)
      return
    }

    setMessage('Claim rejected.')
    notify({
      type: 'success',
      title: 'Claim rejected',
      description: 'The claim was rejected successfully.',
    })
    setProcessingId(null)

    setFilteredClaims(null)
    await loadClaims()
  }

  const executeHandover = async (claim) => {
    setProcessingId(claim.id)
    setMessage('')

    const { error: itemError } = await supabase
      .from('items')
      .update({
        status: 'returned',
      })
      .eq('id', claim.item_id)

    if (itemError) {
      setMessage(itemError.message)
      notify({
        type: 'error',
        title: 'Handover could not be confirmed',
        description: itemError.message,
      })
      setProcessingId(null)
      return
    }

    const { error: claimError } = await supabase
      .from('claims')
      .update({
        status: 'completed',
      })
      .eq('id', claim.id)

    if (claimError) {
      await supabase
        .from('items')
        .update({
          status: 'claimed',
        })
        .eq('id', claim.item_id)

      setMessage(claimError.message)
      notify({
        type: 'error',
        title: 'Handover could not be confirmed',
        description: claimError.message,
      })
      setProcessingId(null)
      return
    }

    const successMessage =
      'Handover confirmed. The item has been marked as returned and the claim completed.'
    setMessage(successMessage)
    notify({
      type: 'success',
      title: 'Handover confirmed',
      description: successMessage,
    })

    setProcessingId(null)

    setFilteredClaims(null)
    await loadClaims()
  }

  const handleApprove = (claim) => {
    setConfirmation({ action: 'approve', claim })
  }

  const handleReject = (claim) => {
    setConfirmation({ action: 'reject', claim })
  }

  const handleHandover = (claim) => {
    setConfirmation({ action: 'handover', claim })
  }

  const confirmationDetails = confirmation
    ? {
        approve: {
          title: 'Approve this claim?',
          description:
            `Approve ${confirmation.claim.claimant?.full_name || 'this claimant'}'s claim for ` +
            `${confirmation.claim.item?.item_name || 'this item'}? ` +
            'The claim will be approved and the item marked as claimed.',
          confirmLabel: 'Approve Claim',
          destructive: false,
          action: executeApprove,
        },
        reject: {
          title: 'Reject this claim?',
          description:
            `Reject ${confirmation.claim.claimant?.full_name || 'this claimant'}'s claim for ` +
            `${confirmation.claim.item?.item_name || 'this item'}? ` +
            'This will close the claim as rejected.',
          confirmLabel: 'Reject Claim',
          destructive: true,
          action: executeReject,
        },
        handover: {
          title: 'Confirm item handover?',
          description:
            `Confirm that ${confirmation.claim.claimant?.full_name || 'the claimant'} has physically received ` +
            `${confirmation.claim.item?.item_name || 'this item'}? ` +
            'The item will be marked returned and the claim completed.',
          confirmLabel: 'Confirm Handover',
          destructive: false,
          action: executeHandover,
        },
      }[confirmation.action]
    : null

  const confirmClaimAction = () => {
    if (!confirmation || !confirmationDetails) {
      return
    }

    const { claim } = confirmation
    const { action } = confirmationDetails
    setConfirmation(null)
    void action(claim)
  }

  const formatClaimReference = (value) => {
    const safeValue = Number.isFinite(value) ? Math.max(1, value) : 1
    return `MC-${String(safeValue).padStart(4, '0')}`
  }

  const claimNumbers = new Map(
    [...claims]
      .sort((first, second) => {
        const dateComparison = (first.created_at || '').localeCompare(
          second.created_at || ''
        )

        return dateComparison || first.id.localeCompare(second.id)
      })
      .map((claim, index) => [
        claim.id,
        formatClaimReference(index + 1),
      ])
  )

  return (
    <div className="dashboard-layout">

      <AdminSidebar
        page="admin-claims"
        setPage={setPage}
      />

      <main className="dashboard-main">
        <UserManual isAdmin />
        <section className="dashboard-content">
        <Badge
          variant="ghost"
          onClick={() => flash('back', () => setPage('admin-dashboard'))}
          className="group mb-5 cursor-pointer gap-2 rounded-full border border-[#8E2A63]/20 bg-[#8E2A63]/[0.06] px-4 py-2 text-sm font-semibold text-[#8E2A63] transition-all duration-200 hover:border-[#8E2A63]/40 hover:bg-[#FBE4F0] hover:text-[#650033]"
        >
          <span className="text-base transition-transform duration-200 group-hover:-translate-x-0.5">
            ←
          </span>
          Back
        </Badge>


          <section className="dashboard-welcome">
            <p className="eyebrow">
              ADMINISTRATION
            </p>

            <h1>
              Claim Review
            </h1>

            <p>
              Review and verify ownership claims submitted through iLost.
            </p>
          </section>

          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

          <section className="admin-section">

            <div className="section-heading">
              <p className="eyebrow admin-label-pill admin-label-pill-red">
                CLAIMS
              </p>

              <h2>
                Submitted Claims
              </h2>
            </div>

            {loading ? (
              <p>
                Loading claims...
              </p>
            ) : claims.length === 0 ? (
              <div className="admin-empty-state">
                <h3>
                  No claims yet.
                </h3>

                <p>
                  Submitted claims will appear here for administrator review.
                </p>
              </div>
            ) : (
              <>
              <ItemSearch
                items={claims}
                onSearch={setFilteredClaims}
                getCategory={(claim) => claim.item?.category}
                getSearchText={(claim) => [
                  claim.item?.item_name,
                  claim.item?.category,
                  claim.item?.subcategory,
                  claim.item?.brand,
                  claim.item?.model,
                  claim.item?.color,
                  claim.item?.size,
                  claim.item?.description,
                  claim.item?.location,
                  claim.status,
                  claim.claimant?.full_name,
                  claim.claimant?.email,
                  claim.message,
                ].filter(Boolean).join(' ')}
                label="claims"
                placeholder="Search item name or claimant"
              />
              {filteredClaims?.length === 0 ? (
                <div className="admin-empty-state">
                  <h3>No claims match your search.</h3>
                  <p>Try another item name or category.</p>
                </div>
              ) : (
              <div className="admin-claims-list">

                {(filteredClaims ?? claims).map((claim) => {
                  const parsed = parseClaimMessage(
                    claim.message
                  )
                  const claimant = claim.claimant
                  const item = claim.item
                  const comparisonRows = [
                    {
                      label: 'Claimant profile',
                      claimant: (
                        <>
                          <strong>{claimant?.full_name || 'Unknown claimant'}</strong>
                          <span>{claimant?.email || 'No email provided'}</span>
                          <span>{claimant?.contact_number || 'No contact number provided'}</span>
                          <span>
                            {[claimant?.program, claimant?.year_level, claimant?.section]
                              .filter(Boolean)
                              .join(' · ') || 'No academic details provided'}
                          </span>
                        </>
                      ),
                      item: (
                        <>
                          <strong>{item?.item_name || 'Unknown item'}</strong>
                          <span>
                            {[item?.category, item?.subcategory]
                              .filter(Boolean)
                              .join(' · ') || 'No category provided'}
                          </span>
                          <span>
                            {[item?.brand, item?.model, item?.color, item?.size]
                              .filter(Boolean)
                              .join(' · ') || 'No additional item attributes recorded'}
                          </span>
                        </>
                      ),
                    },
                    {
                      label: 'Item identification',
                      claimant: parsed.reason || 'No explanation provided.',
                      item: item?.description || 'No item description recorded.',
                    },
                    {
                      label: 'Location',
                      claimant: parsed.location || 'No location provided.',
                      item: item?.location || 'No found location recorded.',
                    },
                    {
                      label: 'Date and time',
                      claimant: parsed.date || 'No date provided.',
                      item: [
                        item?.date,
                        item?.time,
                      ].filter(Boolean).join(' · ') || 'No date or time recorded.',
                    },
                    {
                      label: 'Distinctive details',
                      claimant: parsed.details || 'No private identifying details provided.',
                      item: item?.distinctive_details || 'No distinctive item details recorded.',
                    },
                    ...(parsed.additionalInfo
                      ? [{
                          label: 'Additional information',
                          claimant: parsed.additionalInfo,
                          item: 'No corresponding additional-information field in the item record.',
                        }]
                      : []),
                  ]

                  return (
                    <article
                      key={claim.id}
                      className="admin-claim-card"
                    >

                      <div className="admin-claim-header">

                        <div>
                          <p className="eyebrow admin-label-pill admin-label-pill-red">
                            {claimNumbers.get(claim.id)}
                          </p>

                          <h3>
                            {claim.item?.item_name ||
                              'Unknown Item'}
                          </h3>
                        </div>

                        <span
                          className={`claim-status claim-status-${claim.status}`}
                        >
                          {claim.status}
                        </span>

                      </div>

                      <details className="admin-claim-comparison" open>
                        <summary>
                          <span>
                            <strong>Evidence comparison</strong>
                            <small>Compare the claimant’s answers with the found-item record.</small>
                          </span>
                          <span className="admin-comparison-toggle">
                            <span className="comparison-show-label">Show details</span>
                            <span className="comparison-hide-label">Hide details</span>
                          </span>
                        </summary>

                        <div className="admin-comparison-table-wrap">
                          <table className="admin-comparison-table">
                            <thead>
                              <tr>
                                <th scope="col">Evidence</th>
                                <th scope="col">Claimant’s submission</th>
                                <th scope="col">Found item record</th>
                              </tr>
                            </thead>
                            <tbody>
                              {comparisonRows.map((row) => (
                                <tr key={row.label}>
                                  <th scope="row">{row.label}</th>
                                  <td>{row.claimant}</td>
                                  <td>{row.item}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>

                      <div className="admin-claim-footer">

                        <p>
                          Submitted:{' '}
                          {new Date(
                            claim.created_at
                          ).toLocaleString()}
                        </p>

                        {claim.status === 'approved' && (
                          <p>
                            Approved:{' '}
                            {claim.verified_at
                              ? new Date(
                                  claim.verified_at
                                ).toLocaleString()
                              : 'Not recorded'}
                          </p>
                        )}

                        {claim.status === 'pending' && (
                          <div className="admin-claim-actions">

                            <button
                              type="button"
                              className="admin-reject-button"
                              disabled={
                                processingId === claim.id
                              }
                              onClick={() =>
                                handleReject(claim)
                              }
                            >
                              {processingId === claim.id
                                ? 'Processing...'
                                : 'Reject Claim'}
                            </button>

                            <button
                              type="button"
                              className="admin-approve-button"
                                style={{
                                  backgroundColor: '#D1006F',
                                  borderColor: '#D1006F',
                                  color: '#FFFFFF',
                                }}
                              disabled={
                                processingId === claim.id
                              }
                              onClick={() =>
                                handleApprove(claim)
                              }
                            >
                              {processingId === claim.id
                                ? 'Processing...'
                                : 'Approve Claim'}
                            </button>

                          </div>
                        )}

                        {claim.status === 'approved' && (
                          <div className="admin-claim-actions">

                            <div className="claim-approved-notice">

                              <strong>
                                Claim approved.
                              </strong>

                              <span>
                                Confirm only after the claimant has
                                physically received the item.
                              </span>

                            </div>

                            <button
                              type="button"
                              className="admin-approve-button"
                              style={{
                                backgroundColor: '#D1006F',
                                borderColor: '#D1006F',
                                color: '#FFFFFF',
                              }}
                              onClick={() => {
                                handleHandover(claim)
                              }}
                            >
                              {processingId === claim.id
                                ? 'Processing...'
                                : 'Confirm Handover'}
                            </button>

                          </div>
                        )}

                        {claim.status === 'completed' && (
                          <div className="claim-approved-notice">

                            <strong>
                              Item returned successfully.
                            </strong>

                            <span>
                              Physical handover has been confirmed and
                              the claim is completed.
                            </span>

                          </div>
                        )}

                        {claim.status === 'rejected' && (
                          <div className="claim-rejected-notice">

                            <strong>
                              Claim rejected.
                            </strong>

                            <span>
                              This claim is no longer pending
                              administrator review.
                            </span>

                          </div>
                        )}

                      </div>

                    </article>
                  )
                })}

              </div>
            )}
              </>
            )}

          </section>

        </section>
      </main>

      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmation(null)
          }
        }}
        title={confirmationDetails?.title || ''}
        description={confirmationDetails?.description || ''}
        confirmLabel={confirmationDetails?.confirmLabel || 'Confirm'}
        destructive={confirmationDetails?.destructive}
        onConfirm={confirmClaimAction}
      />
    </div>
  )
}

export default AdminClaims