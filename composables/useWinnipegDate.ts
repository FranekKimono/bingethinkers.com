const WINNIPEG_TIME_ZONE = 'America/Winnipeg'

function getWinnipegDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: WINNIPEG_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('Could not determine the current Winnipeg date')
  }

  return `${year}-${month}-${day}`
}

function dateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function useWinnipegDate() {
  // Nuxt serializes this key into the payload, so server and client render the
  // same calendar date during hydration even when a static page is a day old.
  const hydrationDateKey = useState('winnipeg-date', () => getWinnipegDateKey())
  const date = ref(dateFromKey(hydrationDateKey.value))

  function refresh() {
    date.value = dateFromKey(getWinnipegDateKey())
  }

  return { date, refresh }
}
