import styles from './Loading.module.css'

export default function Loading() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <p className={styles.text}>Loading...</p>
    </div>
  )
}
