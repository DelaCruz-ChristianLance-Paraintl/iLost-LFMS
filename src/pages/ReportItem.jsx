import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Sidebar from '../components/Sidebar'

function ReportItem({ type, setPage }) {
const [form, setForm] = useState({
  itemName: '',
  category: '',
  description: '',
  location: '',
  date: '',
  time: '',
})

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isLost = type === 'lost'

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to submit a report.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        type: type,
        item_name: form.itemName,
        category: form.category,
        description: form.description,
        location: form.location,
        date: form.date,
        time: form.time || null,
        status: 'reported',
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setMessage(
      `${isLost ? 'Lost' : 'Found'} item reported successfully.`
    )

    setForm({
    itemName: '',
    category: '',
    description: '',
    location: '',
    date: '',
    time: '',
    })

    setLoading(false)
  }

return (
  <div className="dashboard-layout">
    <Sidebar
      page={isLost ? 'report-lost' : 'report-found'}
      setPage={setPage}
    />

    <main className="dashboard-main">
      <section className="dashboard-content">
        <section className="report-header">
          <p className="eyebrow">NEW REPORT</p>

          <h1>
            Report {isLost ? 'Lost' : 'Found'} Item
          </h1>

          <p>
            Provide the details below so the item can be added
            to the campus lost and found records.
          </p>
        </section>

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="itemName">Item Name</label>

            <input
              id="itemName"
              name="itemName"
              type="text"
              placeholder="e.g. Black wallet"
              value={form.itemName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Documents">Documents</option>
              <option value="Wallet">Wallet</option>
              <option value="Keys">Keys</option>
              <option value="Clothing">Clothing</option>
              <option value="School Supplies">School Supplies</option>
              <option value="Accessories">Accessories</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              name="description"
              placeholder="Describe the item and any identifying details."
              value={form.description}
              onChange={handleChange}
              rows="5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">
              {isLost ? 'Where did you lose it?' : 'Where did you find it?'}
            </label>

            <input
              id="location"
              name="location"
              type="text"
              placeholder="e.g. Engineering Building, 2nd Floor"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">
              {isLost ? 'Date Lost' : 'Date Found'}
            </label>

            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">
              Estimated Time {isLost ? 'Lost' : 'Found'}
            </label>

            <input
              id="time"
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
            />
          </div>

          {message && (
            <p className="form-success">
              {message}
            </p>
          )}

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <button
            className="report-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </section>
    </main>
  </div>
)
}

export default ReportItem