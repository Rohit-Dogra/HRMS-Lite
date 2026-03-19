import { Outlet, NavLink } from 'react-router-dom'
import styles from './Layout.module.css'

const navItems = [
  { to: '/', end: true, label: 'Dashboard' },
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
]

export default function Layout({ children }) {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoDot} />
          HRMS Lite
        </NavLink>

        <nav className={styles.nav}>
          {navItems.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.active : ''].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
{/* 
        <div className={styles.avatarBtn} aria-label="Account">AK</div> */}
      </header>

      <main className={styles.main}>
        {children || <Outlet />}
      </main>
    </div>
  )
}