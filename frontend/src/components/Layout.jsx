import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.logo}>HRMS Lite</NavLink>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : '')}>Dashboard</NavLink>
          <NavLink to="/employees" className={({ isActive }) => (isActive ? styles.active : '')}>Employees</NavLink>
          <NavLink to="/attendance" className={({ isActive }) => (isActive ? styles.active : '')}>Attendance</NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        {children || <Outlet />}
      </main>
    </div>
  )
}
