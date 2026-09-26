import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'

import Sidebar from '../components/Sidebar'

function BrowseItems({ setPage }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const getItems = async () => {
      const { data, error: itemsError } = await supabase
        .from('items')
        .select('id, type, category, photo_url, status')
        .order('created_at', { ascending: false })

      if (itemsError) {
        setError('Unable to load reported items.')
      } else {
        setItems(data || [])
      }

      setLoading(false)
    }

    getItems()
  }, [])

  return (
    <div className="dashboard-layout">
      <Sidebar
        page="browse"
        setPage={setPage}
      />

      <main className="dashboard-main">
        <section className="dashboard-content">

          <section className="browse-header">
            <p className="eyebrow">BROWSE ITEMS</p>

            <h1>Lost & Found Items</h1>

            <p>
              Browse reported items without exposing identifying details.
            </p>
          </section>

          <section className="browse-items">

            {loading ? (
              <div className="empty-state">
                <p>Loading reported items...</p>
              </div>

            ) : error ? (
              <div className="empty-state">
                <p>{error}</p>
              </div>

            ) : items.length === 0 ? (
              <div className="empty-state">
                <p>No reported items yet.</p>

                <span>
                  Lost and found reports will appear here.
                </span>
              </div>

            ) : (
              <div className="browse-list">

                {items.map((item) => (
                  <article
                    className="browse-card"
                    key={item.id}
                  >

                    <div className="browse-card-image">

                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt="Reported item"
                          className="browse-item-image"
                        />
                      ) : (
                        <div className="browse-image-placeholder">
                          No Image
                        </div>
                      )}

                    </div>

                    <div className="browse-card-content">

                      <span
                        className={`report-type ${item.type}`}
                      >
                        {item.type === 'lost'
                          ? 'LOST'
                          : 'FOUND'}
                      </span>

                      <h3>{item.category}</h3>

                      <p className="browse-category">
                        Category
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

export default BrowseItems