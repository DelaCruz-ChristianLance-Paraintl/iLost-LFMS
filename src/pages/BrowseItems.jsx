import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'

import Sidebar from '../components/Sidebar'
import ItemImagePreview from '../components/ItemImagePreview'

import { Badge } from "../components/ui/badge";

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
              BROWSE ITEMS
            </p>

            <h1>
              Lost & Found Items
            </h1>

            <p>
              Browse reported items without exposing identifying details.
            </p>

          </section>

          <section className="browse-items">

            {loading ? (
              <div className="empty-state">
                <p>
                  Loading reported items...
                </p>
              </div>

            ) : error ? (
              <div className="empty-state">
                <p>
                  {error}
                </p>
              </div>

            ) : items.length === 0 ? (
              <div className="empty-state">

                <p>
                  No reported items yet.
                </p>

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

                    <ItemImagePreview
                      className="browse-card-image"
                      imageClassName="browse-item-image"
                      src={item.photoSignedUrl}
                      alt={`${item.type} item`}
                    />

                    <div className="browse-card-content">

                      <span
                        className={`report-type ${item.type}`}
                      >
                        {item.type === 'lost'
                          ? 'LOST'
                          : 'FOUND'}
                      </span>

                      <h3>
                        {item.category}
                      </h3>

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