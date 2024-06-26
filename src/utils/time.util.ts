const DATE_UNITS = {
  day: 86400,
  hour: 3600,
  minute: 60,
  second: 1
}

type TDateUnits = keyof typeof DATE_UNITS

const getSecondsDiff = (timestamp: number) => (Date.now() - timestamp) / 1000

const getUnitAndValueDate = (secondsElapsed: number, type: 'timeAgo' | 'unlockTime') => {
  let newValue = 0
  let newUnit = 'second'

  const mode = type === 'timeAgo' ? (secondsElapsed: number, secondsInUnit: number) => secondsElapsed >= secondsInUnit : (secondsElapsed: number, secondsInUnit: number) => secondsElapsed <= secondsInUnit

  for (const [unit, secondsInUnit] of Object.entries(DATE_UNITS)) {
    if (mode(secondsElapsed, secondsInUnit) || unit === 'second') {
      const value = Math.floor(secondsElapsed / secondsInUnit) * -1
      newValue = value
      newUnit = unit
      break
    }
  }

  return { newValue, newUnit }
}

export const getTimeAgo = (timestamp: number) => {
  const rtf = new Intl.RelativeTimeFormat('es')

  const secondsElapsed = getSecondsDiff(timestamp)
  const { newValue, newUnit } = getUnitAndValueDate(secondsElapsed, 'timeAgo')
  return rtf.format(newValue, newUnit as TDateUnits)
}

export const getUnlockTime = (timestamp: number) => {
  const rtf = new Intl.RelativeTimeFormat('es')

  const secondsElapsed = getSecondsDiff(timestamp)
  const { newValue, newUnit } = getUnitAndValueDate(secondsElapsed, 'unlockTime')
  return rtf.format(newValue, newUnit as TDateUnits)
}