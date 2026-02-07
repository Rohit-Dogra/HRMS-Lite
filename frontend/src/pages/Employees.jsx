import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import styles from './Employees.module.css'

export default function Employees() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ employee_id: '', full_name: '', email: '', department: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const load = () => {
    setError(null)
    api.employees.list()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.employee_id.trim() || !form.full_name.trim() || !form.email.trim() || !form.department.trim()) {
      setFormError('All fields are required.')
      return
    }
    setSubmitting(true)
    api.employees.create(form)
      .then(() => {
        setForm({ employee_id: '', full_name: '', email: '', department: '' })
        load()
      })
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
    <div>
      <h1 className={styles.pageTitle}>Employees</h1>

      <Card title="Add employee">
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label>Employee ID</label>
            <input
              value={form.employee_id}
              onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
              placeholder="e.g. EMP001"
              required
            />
          </div>
          <div className={styles.row}>
            <label>Full name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Full name"
              required
            />
          </div>
          <div className={styles.row}>
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@company.com"
              required
            />
          </div>
          <div className={styles.row}>
            <label>Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              placeholder="e.g. Engineering"
              required
            />
          </div>
          {formError && <p className={styles.formError}>{formError}</p>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add employee'}</Button>
        </form>
      </Card>

      <Card title="All employees">
        {list.length === 0 ? (
          <EmptyState message="No employees yet. Add one above." />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.employee_id}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>
                      <Button variant="danger" onClick={() => handleDelete(emp.id)} disabled={deletingId === emp.id}>
                        {deletingId === emp.id ? 'Deleting...' : 'Delete'}
                      </Button>
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
