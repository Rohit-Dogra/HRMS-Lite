import styles from './Button.module.css'

export default function Button({ children, variant = 'primary', type = 'button', disabled, className = '', ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${styles.btn} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
