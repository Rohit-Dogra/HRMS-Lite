import styles from './Card.module.css'

export default function Card({ title, children, className = '' }) {
  return (
    <section className={`${styles.card} ${className}`}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </section>
  )
}
