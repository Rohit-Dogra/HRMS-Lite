import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import styles from './Employees.module.css'

const EMPLOYEES_CACHE_KEY = 'hrms-employees-cache'

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Employees() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ employee_id: '', full_name: '', email: '', department: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const load = (options = { allowError: true }) => {
    setError(null)
    return api.employees.list()
      .then((res) => {
        setList(res)
        try { localStorage.setItem(EMPLOYEES_CACHE_KEY, JSON.stringify(res)) } catch { }
      })
      .catch((e) => { if (options.allowError) setError(e.message) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    try {
      const cached = localStorage.getItem(EMPLOYEES_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed) { setList(parsed); setLoading(false) }
      }
    } catch { }
    load({ allowError: !localStorage.getItem(EMPLOYEES_CACHE_KEY) })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.employee_id.trim() || !form.full_name.trim() || !form.email.trim() || !form.department.trim()) {
      setFormError('All fields are required.')
      return
    }
    setSubmitting(true)
    api.employees.create(form)
      .then(() => { setForm({ employee_id: '', full_name: '', email: '', department: '' }); load() })
      .catch((e) => setFormError(e.message))
      .finally(() => setSubmitting(false))
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this employee? Their attendance records will also be removed.')) return
    setDeletingId(id)
    api.employees.delete(id)
      .then(load)
      .catch((e) => alert(e.message))
      .finally(() => setDeletingId(null))
  }

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Employees</h1>
        {list.length > 0 && (
          <span className={styles.countBadge}>{list.length} total</span>
        )}
      </div>

      {/* Add employee form */}
      <Card>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Add employee</span>
        </div>
        <div className={styles.formBody}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="emp-id">Employee ID</label>
                <input
                  id="emp-id"
                  value={form.employee_id}
                  onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                  placeholder="e.g. EMP001"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="emp-name">Full name</label>
                <input
                  id="emp-name"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="emp-email">Email</label>
                <input
                  id="emp-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@company.com"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="emp-dept">Department</label>
                <input
                  id="emp-dept"
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  placeholder="e.g. Engineering"
                  required
                />
              </div>
            </div>

            {formError && (
              <p className={styles.formError}>{formError}</p>
            )}

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {submitting ? 'Adding…' : 'Add employee'}
            </button>
          </form>
        </div>
      </Card>

      {/* Employees table */}
      <Card>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>All employees</span>
        </div>

        {list.length === 0 ? (
          <EmptyState message="No employees yet. Add one above." />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className={styles.empCell}>
                        <span className={styles.avatar}>{initials(emp.full_name)}</span>
                        <div>
                          <div className={styles.empName}>{emp.full_name}</div>
                          <div className={styles.empEmail}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.empId}>{emp.employee_id}</span></td>
                    <td><span className={styles.deptBadge}>{emp.department}</span></td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(emp.id)}
                        disabled={deletingId === emp.id}
                      >
                        {deletingId === emp.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
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