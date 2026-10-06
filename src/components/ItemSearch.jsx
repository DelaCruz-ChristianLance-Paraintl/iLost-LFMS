import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

const getDefaultCategory = (item) => item?.category

const getItemSearchText = (item) => [
  item?.item_name,
  item?.category,
  item?.subcategory,
  item?.brand,
  item?.model,
  item?.color,
  item?.size,
  item?.description,
  item?.location,
  item?.type,
  item?.status,
]
  .filter(Boolean)
  .join(' ')

function ItemSearch({
  items,
  onSearch,
  getCategory = getDefaultCategory,
  getSearchText = getItemSearchText,
  label = 'items',
  placeholder = 'Search by item name or details',
  showCategory = true,
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  const categories = useMemo(
    () => [...new Set(items.map(getCategory).filter(Boolean))]
      .sort((first, second) => String(first).localeCompare(String(second))),
    [getCategory, items]
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    const normalizedQuery = query.trim().toLocaleLowerCase()

    onSearch(items.filter((item) => {
      const categoryMatches = !category ||
        String(getCategory(item) || '').toLocaleLowerCase() ===
          category.toLocaleLowerCase()
      const queryMatches = !normalizedQuery ||
        String(getSearchText(item) || '')
          .toLocaleLowerCase()
          .includes(normalizedQuery)

      return categoryMatches && queryMatches
    }))
  }

  return (
    <form className="item-search" onSubmit={handleSubmit}>
      <label className="item-search-field item-search-query">
        <span>Search {label}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
        />
      </label>

      {showCategory && (
        <label className="item-search-field">
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((itemCategory) => (
              <option key={itemCategory} value={itemCategory}>
                {itemCategory}
              </option>
            ))}
          </select>
        </label>
      )}

      <button className="item-search-button" type="submit">
        <Search size={17} aria-hidden="true" />
        Search
      </button>
    </form>
  )
}

export default ItemSearch
