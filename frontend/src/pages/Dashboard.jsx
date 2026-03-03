import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Card from '../components/Card'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import styles from './Dashboard.module.css'

const DASHBOARD_CACHE_KEY = 'hrms-dashboard-cache'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let cancelled = false

    // Try to show cached data instantly (from previous successful visit)
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
        // Only show hard error if we had no cached data
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

  return (
    <div>
      <h1 className={styles.pageTitle}>
        Dashboard
        {refreshing && <span className={styles.refreshing}> (Refreshing data...)</span>}
      </h1>
      <div className={styles.grid}>
        <Card title="Total Employees">
          <p className={styles.bigNumber}>{total_employees}</p>
        </Card>
        <Card title="Total Attendance Records">
          <p className={styles.bigNumber}>{total_attendance_records}</p>
        </Card>
      </div>
      <Card title="Present days per employee">
        {present_days_per_employee.length === 0 ? (
          <p className={styles.muted}>No attendance marked yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Present days</th>
              </tr>
            </thead>
            <tbody>
              {present_days_per_employee.map((row) => (
                <tr key={row.employee_id}>
                  <td>{row.emp_id ?? row.employee_id}</td>
                  <td>{row.name ?? '—'}</td>
                  <td>{row.present_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
