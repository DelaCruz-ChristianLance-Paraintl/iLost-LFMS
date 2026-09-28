import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'

function AdminItems({ setPage }) {
  const [items, setItems] = useState([])

  const [loading, setLoading] = useState(true)

  const [message, setMessage] = useState('')

  const loadItems = async () => {
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
      .from('items')
      .select(`
        id,
        user_id,
        type,
        item_name,
        category,
        subcategory,
        brand,
        model,
        color,
        size,
        description,
        location,
        date,
        time,
        status,
        created_at,
        photo_url,
        reporter:profiles!items_user_id_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
    } else {
      const itemsWithPhotos = await Promise.all(
        (data || []).map(async (item) => {
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

      setItems(itemsWithPhotos)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadItems()
  }, [])

  return (
    <div className="dashboard-layout">
      <main className="dashboard-main">
        <section className="dashboard-content">

          <section className="dashboard-welcome">
            <p className="eyebrow">
              ADMINISTRATION
            </p>

            <h1>
              Item Management
            </h1>

            <p>
              View and monitor all lost and found item reports.
            </p>
          </section>

          <div className="admin-page-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage('admin-dashboard')}
            >
              Back to Admin Dashboard
            </button>
          </div>

          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

          <section className="admin-section">

            <div className="section-heading">
              <p className="eyebrow">
                ITEMS
              </p>

              <h2>
                Reported Items
              </h2>
            </div>

            {loading ? (
              <p>
                Loading items...
              </p>
            ) : items.length === 0 ? (
              <div className="admin-empty-state">

                <h3>
                  No items reported yet.
                </h3>

                <p>
                  Lost and found reports will appear here.
                </p>

              </div>
            ) : (
              <div className="admin-items-list">

                {items.map((item) => (
                  <article
                    key={item.id}
                    className="admin-item-card"
                  >

                    {item.photoSignedUrl && (
                      <div className="admin-item-photo">
                        <img
                          src={item.photoSignedUrl}
                          alt={item.item_name}
                        />
                      </div>
                    )}

                    <div className="admin-item-header">

                      <div>

                        <p className="eyebrow">
                          {item.type === 'lost'
                            ? 'LOST ITEM'
                            : 'FOUND ITEM'}
                        </p>

                        <h3>
                          {item.item_name}
                        </h3>

                      </div>

                      <span
                        className={`claim-status claim-status-${item.status}`}
                      >
                        {item.status}
                      </span>

                    </div>

                    <div className="admin-item-grid">

                      <div className="admin-detail-block">

                        <p className="admin-detail-label">
                          ITEM INFORMATION
                        </p>

                        <p>
                          <strong>
                            {item.category}
                          </strong>

                          {' / '}

                          {item.subcategory ||
                            'No subcategory'}
                        </p>

                        {item.brand && (
                          <p>
                            Brand: {item.brand}
                          </p>
                        )}

                        {item.model && (
                          <p>
                            Model: {item.model}
                          </p>
                        )}

                        {item.color && (
                          <p>
                            Color: {item.color}
                          </p>
                        )}

                        {item.size && (
                          <p>
                            Size: {item.size}
                          </p>
                        )}

                      </div>

                      <div className="admin-detail-block">

                        <p className="admin-detail-label">
                          REPORT DETAILS
                        </p>

                        <p>
                          Location: {item.location}
                        </p>

                        <p>
                          Date: {item.date}

                          {item.time
                            ? ` · ${item.time}`
                            : ''}
                        </p>

                        <p>
                          Reporter:{' '}

                          {item.reporter?.full_name ||
                            'Unknown'}
                        </p>

                        <p>
                          {item.reporter?.email ||
                            'No email'}
                        </p>

                      </div>

                    </div>

                    {item.description && (
                      <div className="admin-item-description">

                        <p className="admin-detail-label">
                          DESCRIPTION
                        </p>

                        <p>
                          {item.description}
                        </p>

                      </div>
                    )}

                    <div className="admin-item-footer">

                      <p>
                        Reported:{' '}

                        {new Date(
                          item.created_at
                        ).toLocaleString()}
                      </p>

                      <p>
                        Type:{' '}

                        {item.type === 'lost'
                          ? 'Lost'
                          : 'Found'}
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

export default AdminItems