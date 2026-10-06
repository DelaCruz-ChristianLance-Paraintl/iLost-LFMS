import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/useToast'

import Sidebar from '../components/Sidebar'
import { Badge } from '../components/ui/badge'
import ItemImagePreview from '../components/ItemImagePreview'
import ConfirmDialog from '../components/ConfirmDialog'

import { findMatches } from '../lib/matching'

function FindMyMissingItems({ setPage }) {
  const notify = useToast()
  const [lostItems, setLostItems] = useState([])

  const [foundItems, setFoundItems] = useState([])

  const [selectedItem, setSelectedItem] = useState(null)

  const [matches, setMatches] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [claimingItem, setClaimingItem] = useState(null)

  const [claimMessage, setClaimMessage] = useState('')

  const [claimLocation, setClaimLocation] = useState('')

  const [claimDate, setClaimDate] = useState('')

  const [claimDetails, setClaimDetails] = useState('')

  const [claimAdditionalInfo, setClaimAdditionalInfo] = useState('')

  const [claimLoading, setClaimLoading] = useState(false)
  const [claimConfirmOpen, setClaimConfirmOpen] = useState(false)

  const [claimError, setClaimError] = useState('')

  const [claimSuccess, setClaimSuccess] = useState('')
  const [userClaims, setUserClaims] = useState({})

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true)
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        const message = 'You must be logged in to view your missing items.'
        setError(message)
        notify({
          type: 'error',
          title: 'Missing items could not be loaded',
          description: message,
        })
        setLoading(false)
        return
      }

      const { data: lostData, error: lostError } =
        await supabase
          .from('items')
          .select(
            'id, type, item_name, category, subcategory, brand, model, color, size, description, location, date, time, status, photo_url'
          )
          .eq('user_id', user.id)
          .eq('type', 'lost')
          .order('created_at', { ascending: false })

      if (lostError) {
        const message = 'Unable to load your lost items.'
        setError(message)
        notify({
          type: 'error',
          title: 'Lost items could not be loaded',
          description: message,
        })
        setLoading(false)
        return
      }

      const { data: foundData, error: foundError } =
        await supabase
          .from('items')
          .select(
            'id, type, item_name, category, subcategory, brand, model, color, size, description, location, date, time, status, photo_url'
          )
          .eq('type', 'found')
          .eq('status', 'reported')
          .order('created_at', { ascending: false })

      if (foundError) {
        const message = 'Unable to load found items.'
        setError(message)
        notify({
          type: 'error',
          title: 'Found items could not be loaded',
          description: message,
        })
        setLoading(false)
        return
      }

      const { data: claimData, error: claimError } = await supabase
        .from('claims')
        .select('item_id, status')
        .eq('claimant_id', user.id)

      if (claimError) {
        const message = 'Unable to load your claim history.'
        setError(message)
        notify({
          type: 'error',
          title: 'Claim history could not be loaded',
          description: message,
        })
        setLoading(false)
        return
      }

      setUserClaims(
        Object.fromEntries(
          (claimData || []).map((claim) => [
            claim.item_id,
            claim.status,
          ])
        )
      )

      const lostItemsWithPhotos = await Promise.all(
        (lostData || []).map(async (item) => {
          if (!item.photo_url) {
            return {
              ...item,
              photoSignedUrl: null,
            }
          }

          const {
            data: signedUrlData,
            error: signedUrlError,
          } = await supabase.storage
            .from('item-photos')
            .createSignedUrl(item.photo_url, 3600)

          if (signedUrlError) {
            return {
              ...item,
              photoSignedUrl: null,
            }
          }

          return {
            ...item,
            photoSignedUrl:
              signedUrlData?.signedUrl || null,
          }
        })
      )

      const foundItemsWithPhotos = await Promise.all(
        (foundData || []).map(async (item) => {
          if (!item.photo_url) {
            return {
              ...item,
              photoSignedUrl: null,
            }
          }

          const {
            data: signedUrlData,
            error: signedUrlError,
          } = await supabase.storage
            .from('item-photos')
            .createSignedUrl(item.photo_url, 3600)

          if (signedUrlError) {
            return {
              ...item,
              photoSignedUrl: null,
            }
          }

          return {
            ...item,
            photoSignedUrl:
              signedUrlData?.signedUrl || null,
          }
        })
      )

      setLostItems(lostItemsWithPhotos)

      setFoundItems(foundItemsWithPhotos)

      setLoading(false)
    }

    loadItems()
  }, [notify, setPage])

  const handleViewMatches = (item) => {
    const results = findMatches(item, foundItems)

    setSelectedItem(item)

    setMatches(results)

    setClaimingItem(null)

    setClaimError('')

    setClaimSuccess('')

    setTimeout(() => {
      document
        .getElementById('match-results')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    }, 50)
  }

  const formatDate = (date) => {
    if (!date) return ''

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    )
  }

  const getMatchClass = (level) => {
    return level
      .toLowerCase()
      .replaceAll(' ', '-')
  }

  const handleOpenClaimForm = (match) => {
    if (userClaims[match.id]) {
      return
    }

    setClaimingItem(match)

    setClaimMessage('')

    setClaimLocation('')

    setClaimDate('')

    setClaimDetails('')

    setClaimAdditionalInfo('')

    setClaimError('')

    setClaimSuccess('')

    setTimeout(() => {
      document
        .getElementById('claim-form')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    }, 50)
  }

  const handleCancelClaim = () => {
    setClaimingItem(null)

    setClaimMessage('')

    setClaimLocation('')

    setClaimDate('')

    setClaimDetails('')

    setClaimAdditionalInfo('')

    setClaimError('')

    setClaimSuccess('')

    setTimeout(() => {
      document
        .getElementById('find-missing-content')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    }, 50)
  }

  const handleSubmitClaim = (event) => {
    event.preventDefault()
    setClaimConfirmOpen(true)
  }

  const submitClaim = async () => {
    setClaimError('')

    setClaimSuccess('')

    if (!claimingItem) {
      const message = 'Please select an item to claim.'
      setClaimError(message)
      notify({
        type: 'error',
        title: 'Claim could not be submitted',
        description: message,
      })
      return
    }

    if (
      !claimMessage.trim() ||
      !claimLocation.trim() ||
      !claimDate ||
      !claimDetails.trim()
    ) {
      setClaimError(
        'Please complete all required claim information.'
      )
      notify({
        type: 'error',
        title: 'Required information missing',
        description: 'Please complete all required claim information.',
      })
      return
    }

    setClaimLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setClaimError(
          'You must be logged in to submit a claim.'
        )
        notify({
          type: 'error',
          title: 'Claim could not be submitted',
          description: 'You must be logged in to submit a claim.',
        })

        setClaimLoading(false)

        return
      }

      const message = [
        `Why I believe this is my item:\n${claimMessage.trim()}`,

        `Where I lost it:\n${claimLocation.trim()}`,

        `When I lost it:\n${claimDate}`,

        `Private identifying details:\n${claimDetails.trim()}`,

        claimAdditionalInfo.trim()
          ? `Additional information:\n${claimAdditionalInfo.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n')

      const { error: claimInsertError } =
        await supabase
          .from('claims')
          .insert({
            item_id: claimingItem.id,
            claimant_id: user.id,
            message,
            status: 'pending',
          })

      if (claimInsertError) {
        if (claimInsertError.code === '23505') {
          setClaimError(
            'You have already submitted a claim for this item.'
          )
          notify({
            type: 'error',
            title: 'Claim already submitted',
            description: 'You have already submitted a claim for this item.',
          })
        } else {
          setClaimError(
            claimInsertError.message ||
              'Unable to submit your claim.'
          )
          notify({
            type: 'error',
            title: 'Claim could not be submitted',
            description:
              claimInsertError.message || 'Unable to submit your claim.',
          })
        }

        setClaimLoading(false)

        return
      }

      setUserClaims((currentClaims) => ({
        ...currentClaims,
        [claimingItem.id]: 'pending',
      }))

      setClaimSuccess(
        'Your claim has been submitted and is now pending verification.'
      )
      notify({
        type: 'success',
        title: 'Claim submitted',
        description: 'Your claim is now pending verification.',
      })

      setClaimMessage('')

      setClaimLocation('')

      setClaimDate('')

      setClaimDetails('')

      setClaimAdditionalInfo('')

      setClaimingItem(null)
      setClaimLoading(false)
      setPage('dashboard')
      return
    } catch (claimSubmitError) {
      const message =
        claimSubmitError.message ||
        'Something went wrong while submitting your claim.'
      setClaimError(message)
      notify({
        type: 'error',
        title: 'Claim could not be submitted',
        description: message,
      })
    }

    setClaimLoading(false)
  }

  return (
    <div className="dashboard-layout">

      <Sidebar
        page="find-missing"
        setPage={setPage}
      />

      <main className="dashboard-main">

        <section
          id="find-missing-content"
          className={`dashboard-content ${
            selectedItem ? 'match-mode' : ''
          } ${
            claimingItem ? 'claim-mode' : ''
          }`}
        >
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

          <section className="dashboard-welcome page-welcome browse-header">

            <p className="eyebrow">
              FIND MY MISSING ITEMS
            </p>

            <h1>
              Find Your Missing Items
            </h1>

            <p>
              Review possible matches based on the details
              you reported.
            </p>

          </section>

          {loading && (
            <div className="empty-state">
              <p>
                Loading your missing items...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="empty-state">
              <p>
                {error}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            lostItems.length === 0 && (
              <div className="empty-state">

                <p>
                  You haven't reported any lost items yet.
                </p>

                <span>
                  Lost items you report will appear here.
                </span>

              </div>
            )}

          {!loading &&
            !error &&
            lostItems.length > 0 && (
              <section className="missing-items-section">

                <div className="missing-item-list">

                  {lostItems.map((item) => (

                    <article
                      className="missing-item-card"
                      key={item.id}
                    >

                      <div className="missing-item-info">

                        <span className="report-type lost">
                          LOST
                        </span>

                        <h3>
                          {item.item_name}
                        </h3>

                        <p>
                          {item.category}
                          {' · '}
                          {item.subcategory}
                        </p>

                        <p>
                          {item.brand ||
                            'Brand not provided'}
                          {' · '}
                          {item.color ||
                            'Color not provided'}
                        </p>

                        <span className="missing-item-date">
                          Reported {formatDate(item.date)}
                        </span>

                      </div>

                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() =>
                          handleViewMatches(item)
                        }
                      >
                        View Matches
                      </button>

                    </article>

                  ))}

                </div>

              </section>
            )}

          {selectedItem && (

            <section
              id="match-results"
              className="match-results-section"
            >

              <div className="match-results-header">

                <div>

                  <p className="eyebrow claim-form-eyebrow">
                    MATCH RESULTS
                  </p>

                  <h2>
                    {selectedItem.item_name}
                  </h2>

                  <p>
                    {selectedItem.category}
                    {' · '}
                    {selectedItem.subcategory}
                  </p>

                </div>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setSelectedItem(null)
                    setMatches([])
                    setClaimingItem(null)
                    setClaimError('')

                    setClaimSuccess('')
                  }}
                >
                  Back
                </button>

              </div>

              {matches.length === 0 ? (

                <div className="empty-state">

                  <p>
                    No possible matches found.
                  </p>

                  <span>
                    You can check again later as new found items
                    are reported.
                  </span>

                </div>

              ) : (

                <div className="match-list">

                  {matches.map((match) => (

                    <article
                      className="match-card"
                      key={match.id}
                    >

                      <ItemImagePreview
                        className="match-card-image"
                        imageClassName="match-item-image"
                        src={match.photoSignedUrl}
                        alt={`Found item: ${match.item_name}`}
                      />

                      <div className="match-card-top">

                        <div>

                          <span className="report-type found">
                            FOUND
                          </span>

                          <h3>
                            {match.item_name}
                          </h3>

                        </div>

                        <span
                          className={`match-level ${getMatchClass(
                            match.matchLevel
                          )}`}
                        >
                          {match.matchLevel}
                        </span>

                      </div>

                      <div className="match-details">

                        <p>
                          <strong>
                            Category:
                          </strong>{' '}
                          {match.category}
                        </p>

                        <p>
                          <strong>
                            Subcategory:
                          </strong>{' '}
                          {match.subcategory}
                        </p>

                        {match.brand && (
                          <p>
                            <strong>
                              Brand:
                            </strong>{' '}
                            {match.brand}
                          </p>
                        )}

                        {match.model && (
                          <p>
                            <strong>
                              Model:
                            </strong>{' '}
                            {match.model}
                          </p>
                        )}

                        {match.color && (
                          <p>
                            <strong>
                              Color:
                            </strong>{' '}
                            {match.color}
                          </p>
                        )}

                        {match.size && (
                          <p>
                            <strong>
                              Size:
                            </strong>{' '}
                            {match.size}
                          </p>
                        )}

                        <p>
                          <strong>
                            Found at:
                          </strong>{' '}
                          {match.location}
                        </p>

                        <p>
                          <strong>
                            Date Found:
                          </strong>{' '}
                          {formatDate(match.date)}
                        </p>

                      </div>

                      <div className="match-card-footer">

                        <p>
                          This is only a possible match.
                          Ownership must still be verified.
                        </p>

                        {userClaims[match.id] ? (
                          <span className="claim-submission-status">
                            Claim {userClaims[match.id]}
                            {' · '}
                            You have already submitted for this item.
                          </span>
                        ) : (

                        <button
                          className="primary-button"
                          type="button"
                          onClick={() =>
                            handleOpenClaimForm(match)
                          }
                          style={{
                            backgroundColor: '#D1006F',
                            borderColor: '#D1006F',
                            color: '#FFFFFF',
                          }}
                        >
                          Submit Claim
                        </button>

                        )}

                      </div>

                    </article>

                  ))}

                </div>

              )}

              {claimingItem && (

                <section
                  id="claim-form"
                  className="claim-form-section"
                >

                  <div className="claim-form-header">

                    <div>

                      <p className="eyebrow claim-form-eyebrow">
                        SUBMIT CLAIM
                      </p>

                      <h2>
                        Claim {claimingItem.item_name}
                      </h2>

                      <p>
                        Provide information that can help verify
                        that this item belongs to you.
                      </p>

                    </div>

                    <button
                      className="secondary-button"
                      type="button"
                      onClick={handleCancelClaim}
                    >
                      Cancel
                    </button>

                  </div>

                  <form
                    className="claim-form"
                    onSubmit={handleSubmitClaim}
                  >

                    <div className="claim-form-guidance">
                      Fields marked <span aria-hidden="true">*</span> are required.
                    </div>

                    <div className="claim-form-grid">

                      <section
                        className="claim-form-step"
                        aria-labelledby="claim-details-heading"
                      >

                        <div className="claim-form-step-heading">
                          <span className="claim-form-step-number">1</span>
                          <div>
                            <h3 id="claim-details-heading">Claim details</h3>
                            <p>Tell us when and where you lost the item.</p>
                          </div>
                        </div>

                        <div className="form-group">

                          <label htmlFor="claim-message">
                            Why do you believe this is your item?
                            <span className="claim-required-marker" aria-hidden="true"> *</span>
                          </label>

                          <textarea
                            id="claim-message"
                            value={claimMessage}
                            onChange={(e) =>
                              setClaimMessage(e.target.value)
                            }
                            placeholder="Explain why you believe this item belongs to you."
                            rows="4"
                            required
                          />

                        </div>

                        <div className="claim-form-context-fields">

                          <div className="form-group">

                            <label htmlFor="claim-location">
                              Where did you lose it?
                              <span className="claim-required-marker" aria-hidden="true"> *</span>
                            </label>

                            <input
                              id="claim-location"
                              type="text"
                              value={claimLocation}
                              onChange={(e) =>
                                setClaimLocation(e.target.value)
                              }
                              placeholder="Example: Engineering Building, Room 204"
                              required
                            />

                          </div>

                          <div className="form-group">

                            <label htmlFor="claim-date">
                              When did you lose it?
                              <span className="claim-required-marker" aria-hidden="true"> *</span>
                            </label>

                            <input
                              id="claim-date"
                              type="date"
                              value={claimDate}
                              onChange={(e) =>
                                setClaimDate(e.target.value)
                              }
                              required
                            />

                          </div>

                        </div>

                      </section>

                      <section
                        className="claim-form-step"
                        aria-labelledby="claim-verification-heading"
                      >

                        <div className="claim-form-step-heading">
                          <span className="claim-form-step-number">2</span>
                          <div>
                            <h3 id="claim-verification-heading">Ownership verification</h3>
                            <p>Share identifying details to help us verify your claim.</p>
                          </div>
                        </div>

                        <div className="claim-privacy-note">

                          <strong>
                            Keep private details specific
                          </strong>

                          <p>
                            Some identifying details about the found item
                            are kept private. Include accurate information
                            that only the owner would reasonably know.
                          </p>

                        </div>

                        <div className="form-group">

                          <label htmlFor="claim-details">
                            Private identifying details
                            <span className="claim-required-marker" aria-hidden="true"> *</span>
                          </label>

                          <textarea
                            id="claim-details"
                            value={claimDetails}
                            onChange={(e) =>
                              setClaimDetails(e.target.value)
                            }
                            placeholder="Describe identifying details that were not shown in the match."
                            rows="5"
                            required
                          />

                        </div>

                        <div className="form-group">

                          <label htmlFor="claim-additional-info">
                            Additional information
                            <span className="claim-optional-marker">Optional</span>
                          </label>

                          <textarea
                            id="claim-additional-info"
                            value={claimAdditionalInfo}
                            onChange={(e) =>
                              setClaimAdditionalInfo(
                                e.target.value
                              )
                            }
                            placeholder="Add anything else that may help with verification."
                            rows="4"
                          />

                        </div>

                      </section>

                    </div>

                    {claimError && (
                      <div className="claim-message error">
                        {claimError}
                      </div>
                    )}

                    {claimSuccess && (
                      <div className="claim-message success">
                        {claimSuccess}
                      </div>
                    )}

                    <div className="claim-form-actions">

                      <button
                        className="secondary-button"
                        type="button"
                        onClick={handleCancelClaim}
                        disabled={claimLoading}
                      >
                        Cancel
                      </button>

<button
  className="primary-button"
  type="submit"
  disabled={claimLoading}
  style={{
    backgroundColor: '#D1006F',
    borderColor: '#D1006F',
    color: '#FFFFFF',
  }}
>
  {claimLoading
    ? 'Submitting Claim...'
    : 'Submit Claim'}
</button>

                    </div>

                  </form>

                </section>

              )}

            </section>

          )}

        </section>

      </main>

      <ConfirmDialog
        open={claimConfirmOpen}
        onOpenChange={setClaimConfirmOpen}
        title="Submit this item claim?"
        description={`Your claim for "${claimingItem?.item_name || 'this item'}" will be sent to administrators for verification. Make sure your ownership details are accurate.`}
        confirmLabel="Submit Claim"
        onConfirm={() => {
          setClaimConfirmOpen(false)
          void submitClaim()
        }}
      />
    </div>
  )
}

export default FindMyMissingItems