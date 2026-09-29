import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'

import AdminSidebar from '../components/AdminSidebar'

function AdminClaims({ setPage }) {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [processingId, setProcessingId] = useState(null)

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

  const handleApprove = async (claim) => {
    const confirmed = window.confirm(
      `Approve this claim for ${
        claim.claimant?.full_name || 'this claimant'
      }?\n\n` +
      `Item: ${
        claim.item?.item_name || 'Unknown item'
      }\n\n` +
      `This will mark the claim as approved and the item as claimed.`
    )

    if (!confirmed) {
      return
    }

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
      setProcessingId(null)
      return
    }

    setMessage(
      'Claim approved. The claimant may now proceed to the LSC for physical handover.'
    )

    setProcessingId(null)

    await loadClaims()
  }

  const handleReject = async (claim) => {
    const confirmed = window.confirm(
      `Reject this claim from ${
        claim.claimant?.full_name || 'this claimant'
      }?\n\n` +
      `Item: ${
        claim.item?.item_name || 'Unknown item'
      }\n\n` +
      `This action will mark the claim as rejected.`
    )

    if (!confirmed) {
      return
    }

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
      setProcessingId(null)
      return
    }

    setMessage('Claim rejected.')
    setProcessingId(null)

    await loadClaims()
  }

  const handleHandover = async (claim) => {
    const confirmed = window.confirm(
      `Confirm physical handover for ${
        claim.claimant?.full_name || 'this claimant'
      }?\n\n` +
      `Item: ${
        claim.item?.item_name || 'Unknown item'
      }\n\n` +
      `Only confirm this if the claimant has physically received the item.`
    )

    if (!confirmed) {
      return
    }

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
      setProcessingId(null)
      return
    }

    setMessage(
      'Handover confirmed. The item has been marked as returned and the claim completed.'
    )

    setProcessingId(null)

    await loadClaims()
  }

  return (
    <div className="dashboard-layout">

      <AdminSidebar
        page="admin-claims"
        setPage={setPage}
      />

      <main className="dashboard-main">
        <section className="dashboard-content">

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
              <p className="eyebrow">
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
              <div className="admin-claims-list">

                {claims.map((claim) => {
                  const parsed = parseClaimMessage(
                    claim.message
                  )

                  return (
                    <article
                      key={claim.id}
                      className="admin-claim-card"
                    >

                      <div className="admin-claim-header">

                        <div>
                          <p className="eyebrow">
                            CLAIM #{claim.id.slice(0, 8)}
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

                      <div className="admin-claim-grid">

                        <div className="admin-detail-block">

                          <p className="admin-detail-label">
                            CLAIMANT
                          </p>

                          <p>
                            <strong>
                              {claim.claimant?.full_name ||
                                'Unknown'}
                            </strong>
                          </p>

                          <p>
                            {claim.claimant?.email ||
                              'No email'}
                          </p>

                          <p>
                            {claim.claimant?.contact_number ||
                              'No contact number'}
                          </p>

                          <p>
                            {claim.claimant?.program ||
                              'No program'}
                            {' · '}
                            {claim.claimant?.year_level ||
                              'No year'}
                            {' · '}
                            {claim.claimant?.section ||
                              'No section'}
                          </p>

                        </div>

                        <div className="admin-detail-block">

                          <p className="admin-detail-label">
                            FOUND ITEM
                          </p>

                          <p>
                            <strong>
                              {claim.item?.item_name ||
                                'Unknown Item'}
                            </strong>
                          </p>

                          <p>
                            {claim.item?.category ||
                              'No category'}
                            {' / '}
                            {claim.item?.subcategory ||
                              'No subcategory'}
                          </p>

                          {claim.item?.brand && (
                            <p>
                              Brand: {claim.item.brand}
                            </p>
                          )}

                          {claim.item?.model && (
                            <p>
                              Model: {claim.item.model}
                            </p>
                          )}

                          {claim.item?.color && (
                            <p>
                              Color: {claim.item.color}
                            </p>
                          )}

                          {claim.item?.size && (
                            <p>
                              Size: {claim.item.size}
                            </p>
                          )}

                          <p>
                            Found at: {claim.item?.location}
                          </p>

                          <p>
                            Date: {claim.item?.date}
                            {claim.item?.time
                              ? ` · ${claim.item.time}`
                              : ''}
                          </p>

                        </div>

                      </div>

                      <div className="admin-claim-details">

                        <div>
                          <p className="admin-detail-label">
                            WHY THEY BELIEVE IT IS THEIRS
                          </p>

                          <p>
                            {parsed.reason ||
                              'No response provided.'}
                          </p>
                        </div>

                        <div>
                          <p className="admin-detail-label">
                            WHERE THEY LOST IT
                          </p>

                          <p>
                            {parsed.location ||
                              'No response provided.'}
                          </p>
                        </div>

                        <div>
                          <p className="admin-detail-label">
                            WHEN THEY LOST IT
                          </p>

                          <p>
                            {parsed.date ||
                              'No response provided.'}
                          </p>
                        </div>

                        <div className="private-detail">
                          <p className="admin-detail-label">
                            PRIVATE IDENTIFYING DETAILS
                          </p>

                          <p>
                            {parsed.details ||
                              'No response provided.'}
                          </p>
                        </div>

                        {parsed.additionalInfo && (
                          <div>
                            <p className="admin-detail-label">
                              ADDITIONAL INFORMATION
                            </p>

                            <p>
                              {parsed.additionalInfo}
                            </p>
                          </div>
                        )}

                      </div>

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
                              disabled={
                                processingId === claim.id
                              }
                              onClick={() =>
                                handleHandover(claim)
                              }
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

          </section>

        </section>
      </main>

    </div>
  )
}

export default AdminClaims