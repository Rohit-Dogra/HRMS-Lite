import { useState, useEffect } from 'react'
import styles from './Loading.module.css'

export default function Loading() {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <p className={styles.text}>{slow ? 'Backend is waking up, please wait…' : 'Loading...'}</p>
    </div>
  )
}
