import styles from '../styles/ThemeToggle.module.css'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onChange: (theme: 'light' | 'dark') => void
}

const ThemeToggle = ({ theme, onChange }: ThemeToggleProps) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>Тема</label>
      <button
        className={styles.toggle}
        onClick={() => onChange(theme === 'light' ? 'dark' : 'light')}
        aria-label={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'} тему`}
        title={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'} тему`}
      >
        <span className={styles.text}>{theme === 'light' ? 'Day' : 'Night'}</span>
      </button>
    </div>
  )
}

export default ThemeToggle
