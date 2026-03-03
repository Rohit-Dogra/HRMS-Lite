import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import styles from './Attendance.module.css'

const EMPLOYEES_CACHE_KEY = 'hrms-employees-cache'
const ATTENDANCE_CACHE_KEY = 'hrms-attendance-records-cache'

export default function Attendance() {
  const [employees, setEmployees] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [filterEmpId, setFilterEmpId] = useState('')
  const [form, setForm] = useState({ employee_id: '', date: new Date().toISOString().slice(0, 10), status: 'Present' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [empRecords, setEmpRecords] = useState([])
  const [loadingEmp, setLoadingEmp] = useState(false)

  const loadEmployees = () => api.employees.list().then((res) => {
    setEmployees(res)
    try {
      localStorage.setItem(EMPLOYEES_CACHE_KEY, JSON.stringify(res))
    } catch {
      // ignore storage errors
    }
  })
  const loadRecords = () => {
    const params = {}
    if (fromDate) params.fromDate = fromDate
    if (toDate) params.toDate = toDate
    if (filterEmpId) params.employee_id = filterEmpId
    return api.attendance.list(params).then((res) => {
      setRecords(res)
      // Only cache the unfiltered initial table
      if (!fromDate && !toDate && !filterEmpId) {
        try {
          localStorage.setItem(ATTENDANCE_CACHE_KEY, JSON.stringify(res))
        } catch {
          // ignore storage errors
        }
      }
    })
  }

  useEffect(() => {
    let cancelled = false
    // Try to show cached data instantly on first visit
    try {
      const cachedEmployees = localStorage.getItem(EMPLOYEES_CACHE_KEY)
      const cachedRecords = localStorage.getItem(ATTENDANCE_CACHE_KEY)
      if (cachedEmployees) {
        const parsedEmp = JSON.parse(cachedEmployees)
        if (parsedEmp && !cancelled) setEmployees(parsedEmp)
      }
      if (cachedRecords) {
        const parsedRec = JSON.parse(cachedRecords)
        if (parsedRec && !cancelled) {
          setRecords(parsedRec)
          setLoading(false)
        }
      }
    } catch {
      // ignore cache errors
    }

    Promise.all([loadEmployees(), loadRecords()])
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!fromDate && !toDate && !filterEmpId) return
    loadRecords().catch(() => {})
  }, [fromDate, toDate, filterEmpId])

  const handleMarkAttendance = (e) => {
    e.preventDefault()
    setFormError('')
    const eid = form.employee_id
    if (!eid || !form.date) {
      setFormError('Select an employee and date.')
      return
    }
    setSubmitting(true)
    api.attendance.mark({ employee_id: eid, date: form.date, status: form.status })
      .then(() => {
        setForm((f) => ({ ...f, date: new Date().toISOString().slice(0, 10), status: 'Present' }))
        loadRecords()
        if (selectedEmployeeId === eid) {
          api.attendance.listByEmployee(eid).then(setEmpRecords)
        }
      })
      .catch((e) => setFormError(e.message))
      .finally(() => setSubmitting(false))
  }

  const loadEmployeeAttendance = () => {
    const id = selectedEmployeeId
    if (!id) { setEmpRecords([]); return }
    setLoadingEmp(true)
    api.attendance.listByEmployee(id)
      .then(setEmpRecords)
      .catch(() => setEmpRecords([]))
      .finally(() => setLoadingEmp(false))
  }

  const handleDeleteRecord = (id) => {
    if (!window.confirm('Delete this attendance record?')) return
    api.attendance.delete(id).then(() => { loadRecords(); loadEmployeeAttendance() })
  }

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  return (
    <div>
      <h1 className={styles.pageTitle}>Attendance</h1>

      <Card title="Mark attendance">
        <form className={styles.form} onSubmit={handleMarkAttendance}>
          <div className={styles.row}>
            <label>Employee</label>
            <select
              value={form.employee_id}
              onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
              required
            >
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.employee_id} – {e.full_name}</option>
              ))}
            </select>
          </div>
          <div className={styles.row}>
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
          <div className={styles.row}>
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          {formError && <p className={styles.formError}>{formError}</p>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Mark attendance'}</Button>
        </form>
      </Card>

      <Card title="Filter attendance">
        <div className={styles.filters}>
          <div className={styles.filterRow}>
            <label>From date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className={styles.filterRow}>
            <label>To date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className={styles.filterRow}>
            <label>Employee</label>
            <select value={filterEmpId} onChange={(e) => setFilterEmpId(e.target.value)}>
              <option value="">All</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.employee_id} – {e.full_name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="View by employee">
        <div className={styles.selectRow}>
          <select
            value={selectedEmployeeId}
            onChange={(e) => { setSelectedEmployeeId(e.target.value); setEmpRecords([]); }}
          >
            <option value="">Select employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.employee_id} – {e.full_name}</option>
            ))}
          </select>
          <Button variant="secondary" onClick={loadEmployeeAttendance} disabled={!selectedEmployeeId || loadingEmp}>
            {loadingEmp ? 'Loading...' : 'Load attendance'}
          </Button>
        </div>
        {empRecords.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {empRecords.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td><span className={r.status === 'Present' ? styles.present : styles.absent}>{r.status}</span></td>
                    <td><Button variant="danger" onClick={() => handleDeleteRecord(r.id)}>Delete</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="All attendance records">
        {records.length === 0 ? (
          <EmptyState message="No attendance records yet. Mark attendance above." />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{r.employee_emp_id} – {r.employee_name}</td>
                    <td>{r.date}</td>
                    <td><span className={r.status === 'Present' ? styles.present : styles.absent}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
