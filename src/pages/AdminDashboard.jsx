import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { supabase } from '../lib/supabaseClient'
import AdminSidebar from '../components/AdminSidebar'
import {
  buildCompleteTimeBuckets,
  getTimeBucketKey,
} from '../lib/chartTimeBuckets'

const overviewCharts = [
  {
    key: 'claims',
    title: 'Current claims',
    description: 'Submitted claims over time.',
    unit: 'claims',
    color: '#D1006F',
    gradientId: 'adminClaimsGradient',
    page: 'admin-claims',
  },
  {
    key: 'users',
    title: 'Registered users',
    description: 'New account registrations over time.',
    unit: 'users',
    color: '#8E2A63',
    gradientId: 'adminUsersGradient',
    page: 'admin-users',
  },
  {
    key: 'items',
    title: 'Reported items',
    description: 'Lost and found reports over time.',
    unit: 'items',
    color: '#650033',
    gradientId: 'adminItemsGradient',
    page: 'admin-items',
  },
]

function formatTimeScaleLabel(dateString, timeScale) {
  const date = new Date(`${dateString}T00:00:00`)

  if (timeScale === 'weeks') {
    return `Week of ${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`
  }

  if (timeScale === 'months') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function buildChartData(records, timeScale) {
  const grouped = {}

  records.forEach((record) => {
    if (!record.created_at) {
      return
    }

    const key = getTimeBucketKey(record.created_at, timeScale)

    if (!key) {
      return
    }

    grouped[key] = (grouped[key] || 0) + 1
  })

  const minimumBuckets =
    timeScale === 'weeks' ? 8 : timeScale === 'months' ? 5 : 1

  return buildCompleteTimeBuckets(
    records.map((record) => record.created_at),
    timeScale,
    minimumBuckets
  ).map((date) => ({
    date,
    label: formatTimeScaleLabel(date, timeScale),
    count: grouped[date] || 0,
  }))
}

function AdminChartTooltip({ active, payload, label, unit, color }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const count = Number(payload[0].value) || 0

  return (
    <div className="dashboard-chart-tooltip">
      <p className="dashboard-chart-tooltip-title">{label}</p>
      <div className="dashboard-chart-tooltip-items">
        <div className="dashboard-chart-tooltip-row">
          <span
            className="dashboard-chart-tooltip-dot"
            style={{ backgroundColor: color }}
          />
          <span className="dashboard-chart-tooltip-label">
            {unit}
          </span>
          <strong>{count}</strong>
        </div>
      </div>
    </div>
  )
}

function AdminOverviewChart({
  chart,
  count,
  records,
  timeScale,
  loading,
  error,
  setPage,
}) {
  const chartData = useMemo(
    () => buildChartData(records, timeScale),
    [records, timeScale]
  )

  return (
    <article className="dashboard-chart-card admin-overview-chart-card">
      <div className="admin-overview-chart-header">
        <div>
          <h3>{chart.title}</h3>
          <p>{chart.description}</p>
        </div>

        <button
          className="admin-overview-chart-link"
          type="button"
          onClick={() => setPage(chart.page)}
        >
          View
        </button>
      </div>

      <div className="dashboard-chart-current admin-overview-chart-total">
        <span>Total {chart.unit}</span>
        <div className="dashboard-current-values">
          <strong>{loading || error ? '—' : count}</strong>
        </div>
      </div>

      {error ? (
        <div className="admin-overview-chart-message" role="status">
          {error}
        </div>
      ) : loading ? (
        <div className="admin-overview-chart-message">
          Loading chart...
        </div>
      ) : chartData.length === 0 ? (
        <div className="admin-overview-chart-message">
          No {chart.unit} to display yet.
        </div>
      ) : (
        <div className="dashboard-chart-wrapper admin-overview-chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 12,
                right: 12,
                left: -18,
                bottom: 8,
              }}
            >
              <defs>
                <linearGradient
                  id={chart.gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={chart.color}
                    stopOpacity={0.26}
                  />
                  <stop
                    offset="95%"
                    stopColor={chart.color}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="#E8DEE4"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={18}
                tick={{ fill: '#756B72', fontSize: 10 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={32}
                tick={{ fill: '#756B72', fontSize: 10 }}
              />
              <Tooltip
                cursor={{ stroke: chart.color, strokeDasharray: '4 4' }}
                content={
                  <AdminChartTooltip
                    unit={chart.unit}
                    color={chart.color}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={chart.color}
                fill={`url(#${chart.gradientId})`}
                strokeWidth={2.2}
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: '#ffffff',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  )
}

function AdminDashboard({ setPage, profile }) {
  const [fullName, setFullName] = useState(
    profile?.full_name || 'Administrator'
  )
  const [loading, setLoading] = useState(!profile)
  const [authorized, setAuthorized] = useState(
    profile?.role === 'admin'
  )
  const [counts, setCounts] = useState({
    claims: 0,
    users: 0,
    items: 0,
  })
  const [records, setRecords] = useState({
    claims: [],
    users: [],
    items: [],
  })
  const [timeScale, setTimeScale] = useState('days')
  const [countsLoading, setCountsLoading] = useState(true)
  const [countsError, setCountsError] = useState('')
  const [realtimeError, setRealtimeError] = useState('')

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setPage('login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      if (error || !data || data.role !== 'admin') {
        setPage('dashboard')
        return
      }

      setFullName(data.full_name || 'Administrator')
      setAuthorized(true)
      setLoading(false)
    }

    checkAdmin()
  }, [setPage])

  useEffect(() => {
    if (!authorized) {
      return
    }

    let isActive = true

    const loadOverview = async () => {
      const [
        claimsCountResult,
        usersCountResult,
        itemsCountResult,
        claimsResult,
        usersResult,
        itemsResult,
      ] = await Promise.all([
        supabase.from('claims').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('items').select('id', { count: 'exact', head: true }),
        supabase.from('claims').select('created_at').order('created_at'),
        supabase.from('profiles').select('created_at').order('created_at'),
        supabase.from('items').select('created_at').order('created_at'),
      ])

      if (!isActive) {
        return
      }

      const error =
        claimsCountResult.error ||
        usersCountResult.error ||
        itemsCountResult.error ||
        claimsResult.error ||
        usersResult.error ||
        itemsResult.error

      if (error) {
        setCountsError('Unable to load the Overview data.')
      } else {
        setCounts({
          claims: claimsCountResult.count ?? 0,
          users: usersCountResult.count ?? 0,
          items: itemsCountResult.count ?? 0,
        })
        setRecords({
          claims: claimsResult.data || [],
          users: usersResult.data || [],
          items: itemsResult.data || [],
        })
        setCountsError('')
      }

      setCountsLoading(false)
    }

    void loadOverview()

    const channel = supabase
      .channel('admin-overview-counts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'claims' },
        loadOverview
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        loadOverview
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        loadOverview
      )
      .subscribe((status) => {
        if (isActive) {
          if (['CHANNEL_ERROR', 'TIMED_OUT'].includes(status)) {
            setRealtimeError('Live count updates are unavailable.')
          } else if (status === 'SUBSCRIBED') {
            setRealtimeError('')
          }
        }
      })

    return () => {
      isActive = false
      void supabase.removeChannel(channel)
    }
  }, [authorized])

  if (loading) {
    return (
      <div className="dashboard-layout">
        <AdminSidebar
          page="admin-dashboard"
          setPage={setPage}
        />

        <main className="dashboard-main">
          <section className="dashboard-content">
            <p>Loading admin dashboard...</p>
          </section>
        </main>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="dashboard-layout">
      <AdminSidebar
        page="admin-dashboard"
        setPage={setPage}
      />

      <main className="dashboard-main">
        <section className="dashboard-content">
          <section className="dashboard-welcome">
            <p className="eyebrow">ADMINISTRATION</p>
            <h1>Welcome, {fullName}.</h1>
            <p>Manage the iLost campus lost and found system.</p>
          </section>

          <section className="dashboard-overview">
            <div className="section-heading dashboard-chart-heading">
              <div>
                <p className="eyebrow admin-label-pill admin-label-pill-red">
                  ADMIN PANEL
                </p>
                <h2>System Management</h2>
                <p className="dashboard-chart-description">
                  System activity grouped by the selected time scale.
                </p>
              </div>

              <div className="dashboard-chart-controls">
                <label htmlFor="admin-dashboard-time-scale">View by</label>
                <select
                  id="admin-dashboard-time-scale"
                  value={timeScale}
                  onChange={(event) => setTimeScale(event.target.value)}
                  aria-label="Select chart time scale"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>

            <div className="admin-overview-charts">
              {overviewCharts.map((chart) => (
                <AdminOverviewChart
                  key={chart.key}
                  chart={chart}
                  count={counts[chart.key]}
                  records={records[chart.key]}
                  timeScale={timeScale}
                  loading={countsLoading}
                  error={countsError}
                  setPage={setPage}
                />
              ))}
            </div>

            {realtimeError && (
              <p className="admin-overview-counts-message" role="status">
                {realtimeError}
              </p>
            )}
          </section>
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard
