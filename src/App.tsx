import { useState, useEffect } from 'react'
import styles from './styles/App.module.css'
import type { RawData, LineType, Theme } from './types'
import Dropdown from './components/Dropdown'
import ThemeToggle from './components/ThemeToggle'
import ChartContainer from './components/ChartContainer'

function App() {
  // Состояние для данных из data.json
  const [data, setData] = useState<RawData | null>(null)
  
  // Состояние для ошибки загрузки
  const [error, setError] = useState<string | null>(null)
  
  // Состояние для выбранной вариации (одна вариация или все)
  const [selectedVariation, setSelectedVariation] = useState<string>('all')
  
  // Состояние для временного диапазона ('day' по умолчанию)
  const [timeRange, setTimeRange] = useState<'day' | 'week'>('day')
  
  // Состояние для типа линии
  const [lineType, setLineType] = useState<LineType>('monotone')
  
  // Состояние для темы
  const [theme, setTheme] = useState<Theme>('light')

  // Загрузка данных из data.json при монтировании компонента
  useEffect(() => {
    // Используем import.meta.env.BASE_URL для правильного пути в production
    const dataPath = `${import.meta.env.BASE_URL}data.json`
    
    fetch(dataPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((jsonData: RawData) => {
        setData(jsonData)
        // По умолчанию выбираем все вариации
        setSelectedVariation('all')
      })
      .catch((error) => {
        console.error('Ошибка загрузки данных:', error)
        console.error('Попытка загрузить из:', dataPath)
        setError(`Не удалось загрузить данные: ${error.message}`)
      })
  }, [])

  // Применяем тему к документу
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  if (error) {
    return (
      <div className={styles.app}>
        <div style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>
          <h2>Ошибка</h2>
          <p>{error}</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Проверьте консоль браузера для подробностей
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={styles.app}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Загрузка...
        </div>
      </div>
    )
  }

  // Опции для выпадающих списков
  const variationOptions = [
    { value: 'all', label: 'Все вариации' },
    ...data.variations.map((variation) => ({
      value: variation.id !== undefined ? String(variation.id) : '0',
      label: variation.name,
    }))
  ]

  const timeRangeOptions = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя' },
  ]

  const lineTypeOptions = [
    { value: 'monotone', label: 'Плавная' },
    { value: 'linear', label: 'Линейная' },
    { value: 'step', label: 'Ступенчатая' },
    { value: 'stepBefore', label: 'Ступень до' },
    { value: 'stepAfter', label: 'Ступень после' },
  ]

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>A/B Chart</h1>
      <div className={styles.controls}>
        <Dropdown
          label="Вариация"
          options={variationOptions}
          value={selectedVariation}
          onChange={setSelectedVariation}
        />
        <Dropdown
          label="Период"
          options={timeRangeOptions}
          value={timeRange}
          onChange={(value) => setTimeRange(value as 'day' | 'week')}
        />
        <Dropdown
          label="Тип линии"
          options={lineTypeOptions}
          value={lineType}
          onChange={(value) => setLineType(value as LineType)}
        />
        <ThemeToggle theme={theme} onChange={setTheme} />
      </div>
      <div className={styles.chartWrapper}>
        <ChartContainer
          data={data}
          selectedVariation={selectedVariation}
          timeRange={timeRange}
          lineType={lineType}
        />
      </div>
    </div>
  )
}

export default App
