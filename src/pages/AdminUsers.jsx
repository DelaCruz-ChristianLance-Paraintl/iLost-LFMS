import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/useToast'

import AdminSidebar from '../components/AdminSidebar'
import UserManual from '../components/UserManual'
import { Badge } from '../components/ui/badge'
import ItemSearch from '../components/ItemSearch'

function AdminUsers({ setPage }) {
  const notify = useToast()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState(null)
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
      notify({
        type: 'error',
        title: 'Users could not be loaded',
        description: error.message,
      })
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
        <UserManual isAdmin />
        <section className="dashboard-content">
        <Badge
          variant="ghost"
          onClick={() => setPage('admin-dashboard')}
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

              <p className="eyebrow admin-label-pill admin-label-pill-red">
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
              <>
              <ItemSearch
                items={users}
                onSearch={setFilteredUsers}
                getSearchText={(user) => [
                  user.full_name,
                  user.email,
                  user.contact_number,
                  user.program,
                  user.year_level,
                  user.section,
                  user.role,
                ].filter(Boolean).join(' ')}
                label="users"
                placeholder="Search name, email, or program"
                showCategory={false}
              />
              {filteredUsers?.length === 0 ? (
                <div className="admin-empty-state">
                  <h3>No users match your search.</h3>
                  <p>Try another name, email, or program.</p>
                </div>
              ) : (
              <div className="admin-users-list">

                {(filteredUsers ?? users).map((user) => (
                  <article
                    key={user.id}
                    className="admin-user-card"
                  >

                    <div className="admin-user-header">

                      <div>

                        <p className="eyebrow admin-label-pill admin-label-pill-red">
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
              </>
            )}

          </section>

        </section>
      </main>

    </div>
  )
}

export default AdminUsers