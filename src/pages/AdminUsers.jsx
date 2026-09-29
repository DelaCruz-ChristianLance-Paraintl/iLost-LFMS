import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'

import AdminSidebar from '../components/AdminSidebar'

function AdminUsers({ setPage }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setPage('login')
      return
    }

    const { data: profile, error: profileError } =
      await supabase
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
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        contact_number,
        program,
        year_level,
        section,
        role,
        created_at
      `)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      setMessage(error.message)
    } else {
      setUsers(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="dashboard-layout">

      <AdminSidebar
        page="admin-users"
        setPage={setPage}
      />

      <main className="dashboard-main">
        <section className="dashboard-content">

          <section className="dashboard-welcome">

            <p className="eyebrow">
              ADMINISTRATION
            </p>

            <h1>
              User Management
            </h1>

            <p>
              View registered users and their account information.
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
                USERS
              </p>

              <h2>
                Registered Users
              </h2>

            </div>

            {loading ? (
              <p>
                Loading users...
              </p>
            ) : users.length === 0 ? (
              <div className="admin-empty-state">

                <h3>
                  No users registered yet.
                </h3>

                <p>
                  Registered accounts will appear here.
                </p>

              </div>
            ) : (
              <div className="admin-users-list">

                {users.map((user) => (
                  <article
                    key={user.id}
                    className="admin-user-card"
                  >

                    <div className="admin-user-header">

                      <div>

                        <p className="eyebrow">
                          {user.role === 'admin'
                            ? 'ADMINISTRATOR'
                            : 'USER'}
                        </p>

                        <h3>
                          {user.full_name ||
                            'Unnamed User'}
                        </h3>

                        <p className="admin-user-email">
                          {user.email}
                        </p>

                      </div>

                      <span
                        className={`claim-status ${
                          user.role === 'admin'
                            ? 'claim-status-claimed'
                            : 'claim-status-reported'
                        }`}
                      >
                        {user.role}
                      </span>

                    </div>

                    <div className="admin-user-grid">

                      <div className="admin-detail-block">

                        <p className="admin-detail-label">
                          CONTACT
                        </p>

                        <p>
                          {user.contact_number ||
                            'Not provided'}
                        </p>

                      </div>

                      <div className="admin-detail-block">

                        <p className="admin-detail-label">
                          PROGRAM
                        </p>

                        <p>
                          {user.program ||
                            'Not provided'}
                        </p>

                      </div>

                      <div className="admin-detail-block">

                        <p className="admin-detail-label">
                          YEAR LEVEL
                        </p>

                        <p>
                          {user.year_level ||
                            'Not provided'}
                        </p>

                      </div>

                      <div className="admin-detail-block">

                        <p className="admin-detail-label">
                          SECTION
                        </p>

                        <p>
                          {user.section ||
                            'Not provided'}
                        </p>

                      </div>

                    </div>

                    <div className="admin-user-footer">

                      <p>
                        Account Created:{' '}
                        {new Date(
                          user.created_at
                        ).toLocaleString()}
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

export default AdminUsers