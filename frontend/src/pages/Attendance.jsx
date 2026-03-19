import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Card from '../components/Card'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import styles from './Attendance.module.css'

const EMPLOYEES_CACHE_KEY = 'hrms-employees-cache'
const ATTENDANCE_CACHE_KEY = 'hrms-attendance-records-cache'

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

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
    try { localStorage.setItem(EMPLOYEES_CACHE_KEY, JSON.stringify(res)) } catch { }
  })

  const loadRecords = () => {
    const params = {}
    if (fromDate) params.fromDate = fromDate
    if (toDate) params.toDate = toDate
    if (filterEmpId) params.employee_id = filterEmpId
    return api.attendance.list(params).then((res) => {
      setRecords(res)
      if (!fromDate && !toDate && !filterEmpId) {
        try { localStorage.setItem(ATTENDANCE_CACHE_KEY, JSON.stringify(res)) } catch { }
      }
    })
  }

  useEffect(() => {
    let cancelled = false
    try {
      const cachedEmp = localStorage.getItem(EMPLOYEES_CACHE_KEY)
      const cachedRec = localStorage.getItem(ATTENDANCE_CACHE_KEY)
      if (cachedEmp && !cancelled) setEmployees(JSON.parse(cachedEmp) || [])
      if (cachedRec && !cancelled) { setRecords(JSON.parse(cachedRec) || []); setLoading(false) }
    } catch { }
    Promise.all([loadEmployees(), loadRecords()])
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!fromDate && !toDate && !filterEmpId) return
    loadRecords().catch(() => { })
  }, [fromDate, toDate, filterEmpId])

  const handleMarkAttendance = (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.employee_id || !form.date) { setFormError('Select an employee and date.'); return }
    setSubmitting(true)
    api.attendance.mark({ employee_id: form.employee_id, date: form.date, status: form.status })
      .then(() => {
        setForm((f) => ({ ...f, date: new Date().toISOString().slice(0, 10), status: 'Present' }))
        loadRecords()
        if (selectedEmployeeId === form.employee_id) {
          api.attendance.listByEmployee(form.employee_id).then(setEmpRecords)
        }
      })
      .catch((e) => setFormError(e.message))
      .finally(() => setSubmitting(false))
  }

  const loadEmployeeAttendance = () => {
    if (!selectedEmployeeId) { setEmpRecords([]); return }
    setLoadingEmp(true)
    api.attendance.listByEmployee(selectedEmployeeId)
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
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Attendance</h1>
        {records.length > 0 && (
          <span className={styles.countBadge}>{records.length} records</span>
        )}
      </div>

      {/* Mark attendance */}
      <Card>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Mark attendance</span>
        </div>
        <div className={styles.cardBody}>
          <form onSubmit={handleMarkAttendance}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="att-emp">Employee</label>
                <select
                  id="att-emp"
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
              <div className={styles.field}>
                <label htmlFor="att-date">Date</label>
                <input
                  id="att-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="att-status">Status</label>
                <select
                  id="att-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            {formError && <p className={styles.formError}>{formError}</p>}

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              <CheckIcon />
              {submitting ? 'Saving…' : 'Mark attendance'}
            </button>
          </form>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Filter records</span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.filterGrid}>
            <div className={styles.field}>
              <label>From date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>To date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Employee</label>
              <select value={filterEmpId} onChange={(e) => setFilterEmpId(e.target.value)}>
                <option value="">All employees</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.employee_id} – {e.full_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* View by employee */}
      <Card>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>View by employee</span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.selectRow}>
            <div className={styles.field} style={{ flex: 1, minWidth: 200 }}>
              <select
                value={selectedEmployeeId}
                onChange={(e) => { setSelectedEmployeeId(e.target.value); setEmpRecords([]) }}
              >
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.employee_id} – {e.full_name}</option>
                ))}
              </select>
            </div>
            <button
              className={styles.outlineBtn}
              onClick={loadEmployeeAttendance}
              disabled={!selectedEmployeeId || loadingEmp}
            >
              {loadingEmp ? 'Loading…' : 'Load attendance'}
            </button>
          </div>

          {empRecords.length > 0 && (
            <table className={styles.table} style={{ marginTop: '1rem' }}>
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
                    <td>
                      <StatusBadge status={r.status} styles={styles} />
                    </td>
                    <td>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteRecord(r.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* All records */}
      <Card>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>All attendance records</span>
        </div>
        {records.length === 0 ? (
          <EmptyState message="No attendance records yet. Mark attendance above." />
        ) : (
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
                  <td>
                    <div className={styles.empCell}>
                      <span className={styles.avatar}>{initials(r.employee_name)}</span>
                      <div>
                        <div className={styles.empName}>{r.employee_name}</div>
                        <div className={styles.empId}>{r.employee_emp_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.dateCell}>{r.date}</td>
                  <td>
                    <StatusBadge status={r.status} styles={styles} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

function StatusBadge({ status, styles }) {
  const isPresent = status === 'Present'
  return (
    <span className={isPresent ? styles.present : styles.absent}>
      <span className={isPresent ? styles.dotPresent : styles.dotAbsent} />
      {status}
    </span>
  )
}