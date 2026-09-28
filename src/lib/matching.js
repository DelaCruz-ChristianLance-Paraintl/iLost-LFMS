const supportingFields = [
  'brand',
  'model',
  'color',
  'size',
]

const hasValue = (value) => {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

const normalize = (value) => {
  if (!hasValue(value)) return ''
  return String(value).trim().toLowerCase()
}

export const getMatchLevel = (lostItem, foundItem) => {
  const categoryMatch =
    normalize(lostItem.category) === normalize(foundItem.category)

  const subcategoryMatch =
    normalize(lostItem.subcategory) === normalize(foundItem.subcategory)

  const matchedSupportingFields = []
  const mismatchedSupportingFields = []
  const comparableSupportingFields = []

  supportingFields.forEach((field) => {
    const lostValue = normalize(lostItem[field])
    const foundValue = normalize(foundItem[field])

    if (!lostValue || !foundValue) {
      return
    }

    comparableSupportingFields.push(field)

    if (lostValue === foundValue) {
      matchedSupportingFields.push(field)
    } else {
      mismatchedSupportingFields.push(field)
    }
  })

  // Neither core field matches.
  if (!categoryMatch && !subcategoryMatch) {
    return {
      level: 'No Match',
      rank: 0,
      categoryMatch,
      subcategoryMatch,
      matchedSupportingFields,
      mismatchedSupportingFields,
    }
  }

  // Only one of the two core fields matches.
  if (!categoryMatch || !subcategoryMatch) {
    return {
      level: 'Less Possible Match',
      rank: 1,
      categoryMatch,
      subcategoryMatch,
      matchedSupportingFields,
      mismatchedSupportingFields,
    }
  }

  // Category and subcategory both match.
  // If two or more supporting fields match and none conflict,
  // treat it as a strong match.
  if (
    matchedSupportingFields.length >= 2 &&
    mismatchedSupportingFields.length === 0
  ) {
    return {
      level: 'Strong Match',
      rank: 4,
      categoryMatch,
      subcategoryMatch,
      matchedSupportingFields,
      mismatchedSupportingFields,
    }
  }

  // Core fields match and there is useful supporting evidence,
  // but there are some missing or conflicting details.
  if (
    matchedSupportingFields.length >= 2 ||
    (
      matchedSupportingFields.length >= 1 &&
      mismatchedSupportingFields.length <= 1
    )
  ) {
    return {
      level: 'Likely Match',
      rank: 3,
      categoryMatch,
      subcategoryMatch,
      matchedSupportingFields,
      mismatchedSupportingFields,
    }
  }

  // Category and subcategory match, but there is little
  // or no additional supporting evidence.
  return {
    level: 'Possible Match',
    rank: 2,
    categoryMatch,
    subcategoryMatch,
    matchedSupportingFields,
    mismatchedSupportingFields,
  }
}

export const findMatches = (lostItem, foundItems) => {
  return foundItems
    .map((foundItem) => {
      const result = getMatchLevel(lostItem, foundItem)

      return {
        ...foundItem,
        matchLevel: result.level,
        matchRank: result.rank,
        categoryMatch: result.categoryMatch,
        subcategoryMatch: result.subcategoryMatch,
        matchedSupportingFields: result.matchedSupportingFields,
        mismatchedSupportingFields: result.mismatchedSupportingFields,
      }
    })
    .filter((item) => item.matchRank > 0)
    .sort((a, b) => b.matchRank - a.matchRank)
}