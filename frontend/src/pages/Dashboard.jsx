import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Card from '../components/Card'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import styles from './Dashboard.module.css'

const DASHBOARD_CACHE_KEY = 'hrms-dashboard-cache'

function initials(name) {
  if (!name || name === '—') return '?'
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let cancelled = false

    try {
      const cached = localStorage.getItem(DASHBOARD_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (!cancelled && parsed) {
          setData(parsed)
          setLoading(false)
        }
      }
    } catch {
      // ignore cache errors
    }

    setRefreshing(true)
    api.stats.dashboard()
      .then((res) => {
        if (cancelled) return
        setData(res)
        try {
          localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(res))
        } catch {
          // ignore storage errors
        }
      })
      .catch((e) => {
        if (cancelled) return
        setError((prev) => (data || localStorage.getItem(DASHBOARD_CACHE_KEY) ? prev : e.message))
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
          setRefreshing(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  if (loading) return <Loading />
  if (error && !data) return <ErrorState message={error} onRetry={() => window.location.reload()} />
  if (!data) return <ErrorState message="Failed to load dashboard data" onRetry={() => window.location.reload()} />

  const { total_employees, total_attendance_records, present_days_per_employee } = data
  const maxDays = Math.max(...present_days_per_employee.map((r) => r.present_days), 1)

  return (
    <div className={styles.dash}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        {refreshing && (
          <div className={styles.refreshBadge}>
            <span className={styles.pulse} />
            <span>Refreshing…</span>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className={styles.statLabel}>Total employees</div>
          <div className={styles.statNumber}>{total_employees}</div>
          <div className={`${styles.statDelta} ${styles.statDeltaGreen}`}>Active workforce</div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className={styles.statLabel}>Attendance records</div>
          <div className={styles.statNumber}>{total_attendance_records.toLocaleString()}</div>
          <div className={`${styles.statDelta} ${styles.statDeltaBlue}`}>All time logs</div>
        </div>
      </div>

      {/* Attendance table */}
      <Card>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Attendance by employee</span>
          <span className={styles.cardMeta}>{present_days_per_employee.length} members</span>
        </div>

        {present_days_per_employee.length === 0 ? (
          <p className={styles.muted}>No attendance marked yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Present days</th>
              </tr>
            </thead>
            <tbody>
              {present_days_per_employee.map((row) => {
                const name = row.name ?? '—'
                const pct = Math.round((row.present_days / maxDays) * 100)
                return (
                  <tr key={row.employee_id}>
                    <td>
                      <div className={styles.empCell}>
                        <span className={styles.avatar}>{initials(name)}</span>
                        {name}
                      </div>
                    </td>
                    <td>
                      <span className={styles.empId}>{row.emp_id ?? row.employee_id}</span>
                    </td>
                    <td>
                      <div className={styles.daysBarWrap}>
                        <div className={styles.daysBarBg}>
                          <div className={styles.daysBarFill} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={styles.daysNum}>{row.present_days}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}