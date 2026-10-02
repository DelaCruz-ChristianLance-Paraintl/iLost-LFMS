import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'

import Sidebar from '../components/Sidebar'
import { Badge } from '../components/ui/badge'

import { findMatches } from '../lib/matching'

function FindMyMissingItems({ setPage }) {
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
        setError(
          'You must be logged in to view your missing items.'
        )
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
        setError('Unable to load your lost items.')
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
        setError('Unable to load found items.')
        setLoading(false)
        return
      }

      const { data: claimData, error: claimError } = await supabase
        .from('claims')
        .select('item_id, status')
        .eq('claimant_id', user.id)

      if (claimError) {
        setError('Unable to load your claim history.')
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
  }, [])

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
  }

  const handleSubmitClaim = async (e) => {
    e.preventDefault()

    setClaimError('')

    setClaimSuccess('')

    if (!claimingItem) {
      setClaimError('Please select an item to claim.')
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
        } else {
          setClaimError(
            claimInsertError.message ||
              'Unable to submit your claim.'
          )
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

      setClaimMessage('')

      setClaimLocation('')

      setClaimDate('')

      setClaimDetails('')

      setClaimAdditionalInfo('')

      setTimeout(() => {
        setClaimingItem(null)
      }, 2500)
    } catch (claimSubmitError) {
      setClaimError(
        claimSubmitError.message ||
          'Something went wrong while submitting your claim.'
      )
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

        <section className="dashboard-content">
        <Badge
          variant="ghost"
          onClick={() => setPage('dashboard')}
          className="group mb-5 cursor-pointer gap-2 rounded-full border border-[#8E2A63]/20 bg-[#8E2A63]/[0.06] px-4 py-2 text-sm font-semibold text-[#8E2A63] transition-all duration-200 hover:border-[#8E2A63]/40 hover:bg-[#FBE4F0] hover:text-[#650033]"
        >
          <span className="text-base transition-transform duration-200 group-hover:-translate-x-0.5">
            ←
          </span>
          Back to Overview
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

                  <p className="eyebrow">
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
                  Close
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

                      {match.photoSignedUrl && (
                        <div className="match-card-image">
                          <img
                            src={match.photoSignedUrl}
                            alt="Found item"
                            className="match-item-image"
                          />
                        </div>
                      )}

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

                      <p className="eyebrow">
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

                  <div className="claim-privacy-note">

                    <strong>
                      Verification information
                    </strong>

                    <p>
                      Some identifying details about the found item
                      are kept private. Provide accurate information
                      that only the owner would reasonably know.
                    </p>

                  </div>

                  <form
                    className="claim-form"
                    onSubmit={handleSubmitClaim}
                  >

                    <div className="form-group">

                      <label htmlFor="claim-message">
                        Why do you believe this is your item?
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

                    <div className="form-group">

                      <label htmlFor="claim-location">
                        Where did you lose it?
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

                    <div className="form-group">

                      <label htmlFor="claim-details">
                        Private identifying details
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

                        <span>
                          {' '}
                          Optional
                        </span>

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

    </div>
  )
}

export default FindMyMissingItems