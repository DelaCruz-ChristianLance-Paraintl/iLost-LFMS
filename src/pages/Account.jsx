import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/useToast'

import Sidebar from '../components/Sidebar'

import AdminSidebar from '../components/AdminSidebar'
import { Badge } from '../components/ui/badge'

function Account({ setPage, profile: initialProfile }) {
  const notify = useToast()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(initialProfile || null)

  const [fullName, setFullName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [program, setProgram] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [section, setSection] = useState('')

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      setError('')

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setPage('login')
        return
      }

      setUser(user)

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          full_name,
          email,
          contact_number,
          user_type,
          program,
          year_level,
          section,
          role,
          created_at
        `)
        .eq('id', user.id)
        .single()

      if (error || !data) {
        const message = 'Unable to load your account information.'
        setError(
          message
        )
        notify({
          type: 'error',
          title: 'Account information unavailable',
          description: message,
        })

        return
      }

      setProfile(data)

      setFullName(data.full_name || '')
      setContactNumber(data.contact_number || '')
      setProgram(data.program || '')
      setYearLevel(data.year_level || '')
      setSection(data.section || '')

    }

    loadProfile()
  }, [notify, setPage])

  const handleSave = async () => {
    setError('')
    setMessage('')

    if (!fullName.trim()) {
      const message = 'Full Name is required.'
      setError(message)
      notify({
        type: 'error',
        title: 'Profile could not be saved',
        description: message,
      })
      return
    }

    if (!user) {
      const message = 'User session not found.'
      setError(message)
      notify({
        type: 'error',
        title: 'Profile could not be saved',
        description: message,
      })
      return
    }

    setSaving(true)

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        contact_number: contactNumber.trim() || null,
        program: program.trim() || null,
        year_level: yearLevel || null,
        section: section.trim() || null,
      })
      .eq('id', user.id)
      .select(`
        full_name,
        email,
        contact_number,
        user_type,
        program,
        year_level,
        section,
        role,
        created_at
      `)
      .single()

    if (error) {
      const message = `Unable to update your profile: ${error.message}`
      setError(message)
      notify({
        type: 'error',
        title: 'Profile update failed',
        description: error.message,
      })

      setSaving(false)
      return
    }

    setProfile(data)

    setFullName(data.full_name || '')
    setContactNumber(data.contact_number || '')
    setProgram(data.program || '')
    setYearLevel(data.year_level || '')
    setSection(data.section || '')

    setEditing(false)

    const successMessage = 'Profile updated successfully.'
    setMessage(successMessage)
    notify({
      type: 'success',
      title: 'Profile updated',
      description: successMessage,
    })

    setSaving(false)
  }

  const handleCancel = () => {
    if (!profile) return

    setFullName(profile.full_name || '')
    setContactNumber(profile.contact_number || '')
    setProgram(profile.program || '')
    setYearLevel(profile.year_level || '')
    setSection(profile.section || '')

    setEditing(false)

    setError('')
    setMessage('')
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setError(`Unable to log out: ${error.message}`)
      notify({
        type: 'error',
        title: 'Log out failed',
        description: error.message,
      })
      return
    }
    notify({
      type: 'success',
      title: 'Logged out',
      description: 'You have been signed out successfully.',
    })
    setPage('home')
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="dashboard-layout">
      {isAdmin ? (
        <AdminSidebar
          page="account"
          setPage={setPage}
        />
      ) : (
        <Sidebar
          page="account"
          setPage={setPage}
        />
      )}

      <main className="dashboard-main">
        <section className="dashboard-content">
        <Badge
          variant="ghost"
          onClick={() =>
            setPage(isAdmin ? 'admin-dashboard' : 'dashboard')
          }
          className="group mb-5 cursor-pointer gap-2 rounded-full border border-[#8E2A63]/20 bg-[#8E2A63]/[0.06] px-4 py-2 text-sm font-semibold text-[#8E2A63] transition-all duration-200 hover:border-[#8E2A63]/40 hover:bg-[#FBE4F0] hover:text-[#650033]"
        >
          <span className="text-base transition-transform duration-200 group-hover:-translate-x-0.5">
            ←
          </span>
          Back
        </Badge>

          <section className="dashboard-welcome page-welcome account-welcome">
            <p className="eyebrow">
              ACCOUNT
            </p>

            <h1>
              Account Details
            </h1>

            <p>
              Manage your personal and campus account information.
            </p>
          </section>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {message && (
            <div className="form-success">
              {message}
            </div>
          )}

          <section className="account-card">
            <div className="account-card-header">
              <div>
                <p className="account-section-label">
                  PROFILE
                </p>

                <h2>
                  Personal Information
                </h2>
              </div>

              {!editing && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditing(true)
                    setError('')
                    setMessage('')
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="account-grid">
              <div className="account-field">
                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  disabled={!editing}
                />
              </div>

              <div className="account-field">
                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={
                    profile?.email ||
                    user?.email ||
                    ''
                  }
                  disabled
                />
              </div>

              <div className="account-field">
                <label>
                  Contact Number
                </label>

                <input
                  type="text"
                  value={contactNumber}
                  onChange={(event) =>
                    setContactNumber(
                      event.target.value
                    )
                  }
                  disabled={!editing}
                />
              </div>

              <div className="account-field">
                <label>
                  User Type
                </label>

                <select
                  value={profile?.user_type || ''}
                  disabled
                >
                  <option value="">
                    Not specified
                  </option>

                  <option value="Student">
                    Student
                  </option>

                  <option value="Faculty">
                    Faculty
                  </option>

                  <option value="Staff">
                    Staff
                  </option>
                </select>
              </div>

              <div className="account-field">
                <label>
                  Role
                </label>

                <input
                  type="text"
                  value={
                    profile?.role === 'admin'
                      ? 'Administrator'
                      : 'User'
                  }
                  disabled
                />
              </div>
            </div>
          </section>

          <section className="account-card">
            <div className="account-card-header">
              <div>
                <p className="account-section-label">
                  CAMPUS
                </p>

                <h2>
                  Campus Information
                </h2>
              </div>
            </div>

            <div className="account-grid">
              <div className="account-field">
                <label>
                  Program
                </label>

                <input
                  type="text"
                  value={program}
                  onChange={(event) =>
                    setProgram(event.target.value)
                  }
                  disabled={!editing}
                />
              </div>

              <div className="account-field">
                <label>
                  Year Level
                </label>

                <select
                  value={yearLevel}
                  onChange={(event) =>
                    setYearLevel(event.target.value)
                  }
                  disabled={!editing}
                >
                  <option value="">
                    Select year level
                  </option>

                  <option value="1st Year">
                    1st Year
                  </option>

                  <option value="2nd Year">
                    2nd Year
                  </option>

                  <option value="3rd Year">
                    3rd Year
                  </option>

                  <option value="4th Year">
                    4th Year
                  </option>

                  <option value="Graduate">
                    Graduate
                  </option>
                </select>
              </div>

              <div className="account-field">
                <label>
                  Section
                </label>

                <input
                  type="text"
                  value={section}
                  onChange={(event) =>
                    setSection(event.target.value)
                  }
                  disabled={!editing}
                />
              </div>

              <div className="account-field">
                <label>
                  Account Created
                </label>

                <input
                  type="text"
                  value={
                    profile?.created_at
                      ? new Date(
                          profile.created_at
                        ).toLocaleDateString()
                      : ''
                  }
                  disabled
                />
              </div>
            </div>
          </section>

          {editing && (
            <div className="account-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="account-save-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </div>
          )}

          <section className="account-logout-section">
            <div>
              <p className="account-section-label">
                SESSION
              </p>

              <h2>
                Sign Out
              </h2>

              <p>
                Sign out of your iLost account on this device.
              </p>
            </div>

            <button
              type="button"
              className="account-logout-button"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </section>
        </section>
      </main>
    </div>
  )
}

export default Account