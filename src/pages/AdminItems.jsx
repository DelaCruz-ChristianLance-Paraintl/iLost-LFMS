import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/useToast'
import { useLoading } from '../components/Loadingprovider'

import AdminSidebar from '../components/AdminSidebar'
import UserManual from '../components/UserManual'
import ItemImagePreview from '../components/ItemImagePreview'
import { Badge } from '../components/ui/badge'
import ItemSearch from '../components/ItemSearch'

function AdminItems({ setPage }) {
  const { flash } = useLoading()
  const notify = useToast()
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState(null)
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

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (
      profileError ||
      profile?.role !== 'admin'
    ) {
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
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      setMessage(error.message)
      notify({
        type: 'error',
        title: 'Items could not be loaded',
        description: error.message,
      })
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
            .createSignedUrl(
              item.photo_url,
              3600
            )

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

      <AdminSidebar
        page="admin-items"
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
              Item Management
            </h1>

            <p>
              View and monitor all lost and found item reports.
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
              <>
              <ItemSearch items={items} onSearch={setFilteredItems} />
              {filteredItems?.length === 0 ? (
                <div className="admin-empty-state">
                  <h3>No items match your search.</h3>
                  <p>Try another item name or category.</p>
                </div>
              ) : (
              <div className="admin-items-list">

                {(filteredItems ?? items).map((item) => (
                  <article
                    key={item.id}
                    className="admin-item-card"
                  >

                    <ItemImagePreview
                      className="admin-item-photo"
                      imageClassName="admin-item-photo-image"
                      src={item.photoSignedUrl}
                      alt={item.item_name}
                    />

                    <div className="admin-item-header">

                      <div>

                        <p
                          className={`eyebrow admin-label-pill ${
                            item.type === 'lost'
                              ? 'admin-label-pill-red'
                              : 'admin-label-pill-green'
                          }`}
                        >
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
              </>
            )}

          </section>

        </section>
      </main>

    </div>
  )
}

export default AdminItems