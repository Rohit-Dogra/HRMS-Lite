import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Card from '../components/Card'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    api.stats.dashboard()
      .then((res) => { if (!cancelled) setData(res) })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />
  if (!data) return <ErrorState message="Failed to load dashboard data" onRetry={() => window.location.reload()} />

  const { total_employees, total_attendance_records, present_days_per_employee } = data

  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard</h1>
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
