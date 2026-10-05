const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function parseDateKey(dateString) {
  const dateKey = dateString?.slice(0, 10)

  if (!dateKey || !DATE_KEY_PATTERN.test(dateKey)) {
    return null
  }

  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

function formatDateKey(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

export function getTimeBucketKey(dateString, timeScale) {
  const date = parseDateKey(dateString)

  if (!date) {
    return ''
  }

  if (timeScale === 'weeks') {
    const daysFromMonday = (date.getUTCDay() + 6) % 7
    date.setUTCDate(date.getUTCDate() - daysFromMonday)
  } else if (timeScale === 'months') {
    date.setUTCDate(1)
  }

  return formatDateKey(date)
}

export function buildCompleteTimeBuckets(dateStrings, timeScale, minimumCount = 1) {
  const recordedBuckets = dateStrings
    .map((dateString) => getTimeBucketKey(dateString, timeScale))
    .filter(Boolean)
    .sort()

  if (recordedBuckets.length === 0) {
    return []
  }

  const firstRecordedBucket = recordedBuckets[0]
  const latestRecordedBucket = recordedBuckets[recordedBuckets.length - 1]
  const firstDate = parseDateKey(firstRecordedBucket)
  const latestDate = parseDateKey(latestRecordedBucket)
  const earliestDate = new Date(latestDate)
  const minimumBuckets = Math.max(1, minimumCount)

  for (let index = 1; index < minimumBuckets; index += 1) {
    if (timeScale === 'weeks') {
      earliestDate.setUTCDate(earliestDate.getUTCDate() - 7)
    } else if (timeScale === 'months') {
      earliestDate.setUTCMonth(earliestDate.getUTCMonth() - 1)
    } else {
      earliestDate.setUTCDate(earliestDate.getUTCDate() - 1)
    }
  }

  const startDate =
    firstRecordedBucket < formatDateKey(earliestDate)
      ? firstDate
      : earliestDate
  const buckets = []
  const currentDate = new Date(startDate)

  while (currentDate <= latestDate) {
    buckets.push(formatDateKey(currentDate))

    if (timeScale === 'weeks') {
      currentDate.setUTCDate(currentDate.getUTCDate() + 7)
    } else if (timeScale === 'months') {
      currentDate.setUTCMonth(currentDate.getUTCMonth() + 1)
    } else {
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
  }

  return buckets
}
