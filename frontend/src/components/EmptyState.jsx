import styles from './EmptyState.module.css'

export default function EmptyState({ message = 'No data yet.' }) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.text}>{message}</p>
    </div>
  )
}
