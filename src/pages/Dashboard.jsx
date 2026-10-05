import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { supabase } from '../lib/supabaseClient'
import {
  buildCompleteTimeBuckets,
  getTimeBucketKey,
} from '../lib/chartTimeBuckets'
import Sidebar from '../components/Sidebar'

const chartSeries = {
  lost: {
    label: 'Items Lost',
    color: '#D1006F',
    interpretation: 'reported lost items',
  },
  found: {
    label: 'Items Found',
    color: '#8E2A63',
    interpretation: 'reported found items',
  },
  recovered: {
    label: 'Items Recovered',
    color: '#650033',
    interpretation: 'successfully returned items',
  },
  unclaimed: {
    label: 'Items Unclaimed',
    color: '#D9B65D',
    interpretation: 'items not yet returned',
  },
}

function formatDay(dateString) {
  const date = new Date(`${dateString}T00:00:00`)

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatWeek(dateString) {
  const date = new Date(`${dateString}T00:00:00`)

  return `Week of ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`
}

function formatMonth(dateString) {
  const date = new Date(`${dateString}T00:00:00`)

  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function buildChartData(items, timeScale) {
  const grouped = {}

  items.forEach((item) => {
    if (!item.date) {
      return
    }

    const key = getTimeBucketKey(item.date, timeScale)

    if (!key) {
      return
    }

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        lost: 0,
        found: 0,
        recovered: 0,
        unclaimed: 0,
      }
    }

    if (item.type === 'lost') {
      grouped[key].lost += 1
    }

    if (item.type === 'found') {
      grouped[key].found += 1
    }

    if (item.status === 'returned') {
      grouped[key].recovered += 1
    }

    if (item.status !== 'returned') {
      grouped[key].unclaimed += 1
    }
  })

  const minimumBuckets =
    timeScale === 'weeks' ? 8 : timeScale === 'months' ? 5 : 1

  return buildCompleteTimeBuckets(
    items.map((item) => item.date),
    timeScale,
    minimumBuckets
  ).map((date) => {
    const item = grouped[date] || {
      date,
      lost: 0,
      found: 0,
      recovered: 0,
      unclaimed: 0,
    }
    let label = item.date

    if (timeScale === 'days') {
      label = formatDay(item.date)
    }

    if (timeScale === 'weeks') {
      label = formatWeek(item.date)
    }

    if (timeScale === 'months') {
      label = formatMonth(item.date)
    }

    return {
      ...item,
      label,
    }
  })
}

function DashboardChartTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="dashboard-chart-tooltip">
      <p className="dashboard-chart-tooltip-title">
        {label}
      </p>

      <div className="dashboard-chart-tooltip-items">
        {payload.map((entry) => {
          const series = chartSeries[entry.dataKey]

          if (!series) {
            return null
          }

          const value = Number(entry.value) || 0
          const unit =
            value === 1 ? series.interpretation.replace('items', 'item') : series.interpretation

          return (
            <div
              key={entry.dataKey}
              className="dashboard-chart-tooltip-row"
            >
              <span
                className="dashboard-chart-tooltip-dot"
                style={{
                  backgroundColor: series.color,
                }}
              />

              <span className="dashboard-chart-tooltip-label">
                {series.label}
              </span>

              <strong>
                {value}
              </strong>

              <small>
                {unit}
              </small>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Dashboard({ setPage, profile }) {
  const [items, setItems] = useState([])

  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    recovered: 0,
    unclaimed: 0,
  })

  const [timeScale, setTimeScale] = useState('days')
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')

  useEffect(() => {
    const getDashboardStats = async () => {
      setStatsLoading(true)
      setStatsError('')

      const {
        data: dashboardItems,
        error: itemsError,
      } = await supabase
        .from('items')
        .select('type, status, date')
        .order('date', { ascending: true })

      if (itemsError) {
        setStatsError(
          'Unable to load system statistics.'
        )
        setStatsLoading(false)
        return
      }

      const safeItems = dashboardItems || []

      const lost = safeItems.filter(
        (item) => item.type === 'lost'
      ).length

      const found = safeItems.filter(
        (item) => item.type === 'found'
      ).length

      const recovered = safeItems.filter(
        (item) => item.status === 'returned'
      ).length

      const unclaimed = safeItems.filter(
        (item) => item.status !== 'returned'
      ).length

      setItems(safeItems)

      setStats({
        lost,
        found,
        recovered,
        unclaimed,
      })

      setStatsLoading(false)
    }

    getDashboardStats()
  }, [])

  const chartData = useMemo(
    () => buildChartData(items, timeScale),
    [items, timeScale]
  )

  const fullName = profile?.full_name || 'User'

  return (
    <div className="dashboard-layout">
      <Sidebar
        page="dashboard"
        setPage={setPage}
      />

      <main className="dashboard-main">
        <section className="dashboard-content">

          <section className="dashboard-welcome">
            <p className="eyebrow">
              OVERVIEW
            </p>

            <h1>
              Welcome, {fullName}.
            </h1>

            <p>
              Here's an overview of the campus lost and found system.
            </p>
          </section>

          <section className="dashboard-actions">

            <button
              className="dashboard-action-card dashboard-action-card-lost"
              onClick={() => setPage('report-lost')}
            >
              <div className="dashboard-action-copy">
                <span className="dashboard-action-number">
                  01
                </span>

                <h2>
                  Report Lost Item
                </h2>

                <p>
                  Report what you lost around campus.
                </p>
              </div>

              <img
                className="dashboard-action-image"
                src="/magnifying.png"
                alt=""
                aria-hidden="true"
              />
            </button>

            <button
              className="dashboard-action-card dashboard-action-card-found"
              onClick={() => setPage('report-found')}
            >
              <div className="dashboard-action-copy">
                <span className="dashboard-action-number">
                  02
                </span>

                <h2>
                  Report Found Item
                </h2>

                <p>
                  Report an item you found on campus.
                </p>
              </div>

              <img
                className="dashboard-action-image"
                src="/bulb.png"
                alt=""
                aria-hidden="true"
              />
            </button>

          </section>

          <section className="dashboard-overview">

            <div className="section-heading dashboard-chart-heading">
              <div>
                <p className="eyebrow dashboard-chart-eyebrow">
                  SYSTEM SUMMARY
                </p>

                <h2>
                  Lost & Found Overview
                </h2>

                <p className="dashboard-chart-description">
                  Reported items grouped by the selected time scale.
                </p>
              </div>

              <div className="dashboard-chart-controls">
                <label htmlFor="dashboard-time-scale">
                  View by
                </label>

                <select
                  id="dashboard-time-scale"
                  value={timeScale}
                  onChange={(event) =>
                    setTimeScale(event.target.value)
                  }
                  aria-label="Select chart time scale"
                >
                  <option value="days">
                    Days
                  </option>

                  <option value="weeks">
                    Weeks
                  </option>

                  <option value="months">
                    Months
                  </option>
                </select>
              </div>
            </div>

            {statsError ? (
              <div className="overview-placeholder">
                <p>
                  {statsError}
                </p>
              </div>
            ) : statsLoading ? (
              <div className="dashboard-chart-loading">
                Loading system statistics...
              </div>
            ) : chartData.length === 0 ? (
              <div className="dashboard-chart-empty">
                <h3>
                  No item reports yet
                </h3>

                <p>
                  Reported lost and found items will appear here.
                </p>
              </div>
            ) : (
              <div className="dashboard-chart-card">

                <div className="dashboard-chart-current">
                  <span>
                    Current totals
                  </span>

                  <div className="dashboard-current-values">
                    <span>
                      <strong>
                        {stats.lost}
                      </strong>{' '}
                      Lost
                    </span>

                    <span>
                      <strong>
                        {stats.found}
                      </strong>{' '}
                      Found
                    </span>

                    <span>
                      <strong>
                        {stats.recovered}
                      </strong>{' '}
                      Recovered
                    </span>

                    <span>
                      <strong>
                        {stats.unclaimed}
                      </strong>{' '}
                      Unclaimed
                    </span>
                  </div>
                </div>

                <div className="dashboard-chart-wrapper">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <AreaChart
                      data={chartData}
                      margin={{
                        top: 12,
                        right: 16,
                        left: 0,
                        bottom: 8,
                      }}
                    >
                      <defs>

                        <linearGradient
                          id="ilostLostGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#D1006F"
                            stopOpacity={0.28}
                          />

                          <stop
                            offset="95%"
                            stopColor="#D1006F"
                            stopOpacity={0.02}
                          />
                        </linearGradient>

                        <linearGradient
                          id="ilostFoundGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8E2A63"
                            stopOpacity={0.24}
                          />

                          <stop
                            offset="95%"
                            stopColor="#8E2A63"
                            stopOpacity={0.02}
                          />
                        </linearGradient>

                        <linearGradient
                          id="ilostRecoveredGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#650033"
                            stopOpacity={0.20}
                          />

                          <stop
                            offset="95%"
                            stopColor="#650033"
                            stopOpacity={0.02}
                          />
                        </linearGradient>

                        <linearGradient
                          id="ilostUnclaimedGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#D9B65D"
                            stopOpacity={0.20}
                          />

                          <stop
                            offset="95%"
                            stopColor="#D9B65D"
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
                        tickMargin={12}
                        minTickGap={24}
                        tick={{
                          fill: '#756B72',
                          fontSize: 11,
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        width={34}
                        tick={{
                          fill: '#756B72',
                          fontSize: 11,
                        }}
                      />

                      <Tooltip
                        cursor={{
                          stroke: '#8E2A63',
                          strokeDasharray: '4 4',
                        }}
                        content={
                          <DashboardChartTooltip />
                        }
                      />

                      <Legend
                        verticalAlign="bottom"
                        height={42}
                        iconType="circle"
                        formatter={(value) =>
                          chartSeries[value]?.label || value
                        }
                        wrapperStyle={{
                          fontSize: '11px',
                          color: '#756B72',
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="lost"
                        stroke="#D1006F"
                        fill="url(#ilostLostGradient)"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{
                          r: 4,
                          strokeWidth: 2,
                          fill: '#ffffff',
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="found"
                        stroke="#8E2A63"
                        fill="url(#ilostFoundGradient)"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{
                          r: 4,
                          strokeWidth: 2,
                          fill: '#ffffff',
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="recovered"
                        stroke="#650033"
                        fill="url(#ilostRecoveredGradient)"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{
                          r: 4,
                          strokeWidth: 2,
                          fill: '#ffffff',
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="unclaimed"
                        stroke="#D9B65D"
                        fill="url(#ilostUnclaimedGradient)"
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

                <p className="dashboard-chart-note">
                  Hover over the chart to view the reported status for each period.
                </p>

              </div>
            )}

          </section>

        </section>
      </main>
    </div>
  )
}

export default Dashboard