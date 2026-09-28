import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Sidebar from '../components/Sidebar'
import { findMatches } from '../lib/matching'

function FindMyMissingItems({ setPage }) {
  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true)
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to view your missing items.')
        setLoading(false)
        return
      }

      const { data: lostData, error: lostError } = await supabase
        .from('items')
        .select(
          'id, type, item_name, category, subcategory, brand, model, color, size, description, location, date, time, status'
        )
        .eq('user_id', user.id)
        .eq('type', 'lost')
        .order('created_at', { ascending: false })

      if (lostError) {
        setError('Unable to load your lost items.')
        setLoading(false)
        return
      }

      const { data: foundData, error: foundError } = await supabase
        .from('items')
        .select(
          'id, type, item_name, category, subcategory, brand, model, color, size, description, location, date, time, status'
        )
        .eq('type', 'found')
        .neq('status', 'returned')
        .order('created_at', { ascending: false })

      if (foundError) {
        setError('Unable to load found items.')
        setLoading(false)
        return
      }

      setLostItems(lostData || [])
      setFoundItems(foundData || [])

      setLoading(false)
    }

    loadItems()
  }, [])

const handleViewMatches = (item) => {
  const results = findMatches(item, foundItems)

  setSelectedItem(item)
  setMatches(results)

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

    return new Date(`${date}T00:00:00`).toLocaleDateString(
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

  return (
    <div className="dashboard-layout">
      <Sidebar
        page="find-missing"
        setPage={setPage}
      />

      <main className="dashboard-main">
        <section className="dashboard-content">

          <section className="browse-header">
            <p className="eyebrow">FIND MY MISSING ITEMS</p>

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
              <p>Loading your missing items...</p>
            </div>
          )}

          {!loading && error && (
            <div className="empty-state">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && lostItems.length === 0 && (
            <div className="empty-state">
              <p>You haven't reported any lost items yet.</p>

              <span>
                Lost items you report will appear here.
              </span>
            </div>
          )}

          {!loading && !error && lostItems.length > 0 && (
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
                        {item.brand || 'Brand not provided'}
                        {' · '}
                        {item.color || 'Color not provided'}
                      </p>

                      <span className="missing-item-date">
                        Reported {formatDate(item.date)}
                      </span>

                    </div>

                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleViewMatches(item)}
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
                  }}
                >
                  Close
                </button>

              </div>

              {matches.length === 0 ? (
                <div className="empty-state">
                  <p>No possible matches found.</p>

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
                          <strong>Category:</strong>{' '}
                          {match.category}
                        </p>

                        <p>
                          <strong>Subcategory:</strong>{' '}
                          {match.subcategory}
                        </p>

                        {match.brand && (
                          <p>
                            <strong>Brand:</strong>{' '}
                            {match.brand}
                          </p>
                        )}

                        {match.model && (
                          <p>
                            <strong>Model:</strong>{' '}
                            {match.model}
                          </p>
                        )}

                        {match.color && (
                          <p>
                            <strong>Color:</strong>{' '}
                            {match.color}
                          </p>
                        )}

                        {match.size && (
                          <p>
                            <strong>Size:</strong>{' '}
                            {match.size}
                          </p>
                        )}

                        <p>
                          <strong>Found at:</strong>{' '}
                          {match.location}
                        </p>

                        <p>
                          <strong>Date Found:</strong>{' '}
                          {formatDate(match.date)}
                        </p>

                      </div>

                      <div className="match-card-footer">

                        <p>
                          This is only a possible match.
                          Ownership must still be verified.
                        </p>

                        <button
                          className="primary-button"
                          type="button"
                        >
                          Submit Claim
                        </button>

                      </div>

                    </article>
                  ))}

                </div>
              )}

            </section>
          )}

        </section>
      </main>
    </div>
  )
}

export default FindMyMissingItems