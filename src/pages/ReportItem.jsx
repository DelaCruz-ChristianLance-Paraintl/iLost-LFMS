import { useState } from 'react'

import { supabase } from '../lib/supabaseClient'

import Sidebar from '../components/Sidebar'

const categoryOptions = {
  Electronics: [
    'Mobile Phone',
    'Laptop',
    'Tablet',
    'Earphones / Headphones',
    'Charger / Cable',
    'Power Bank',
    'Calculator',
    'USB / Flash Drive',
    'Smartwatch',
    'Other Electronics',
  ],
  Clothing: [
    'Shirt',
    'Pants',
    'Shorts',
    'Jacket',
    'Uniform',
    'Shoes',
    'Cap / Hat',
    'Other Clothing',
  ],
  Bags: [
    'Backpack',
    'Laptop Bag',
    'Shoulder Bag',
    'Sling Bag',
    'Tote Bag',
    'Pouch',
    'Other Bag',
  ],
  'School Supplies': [
    'Notebook',
    'Binder',
    'Folder',
    'Pen',
    'Pencil',
    'Ruler',
    'Art Materials',
    'Stapler',
    'Other School Supply',
  ],
  'Wallets & Money': [
    'Wallet',
    'Coin Purse',
    'Cash',
    'ATM / Bank Card',
    'Other',
  ],
  Keys: [
    'House Key',
    'Motorcycle Key',
    'Car Key',
    'Padlock Key',
    'Keychain',
    'Other Key',
  ],
  'IDs & Documents': [
    'Student ID',
    'Government ID',
    "Driver's License",
    'School Document',
    'Certificate',
    'Notes / Reviewer',
    'Other Document',
  ],
  Accessories: [
    'Watch',
    'Bracelet',
    'Necklace',
    'Ring',
    'Eyeglasses',
    'Sunglasses',
    'Other Accessory',
  ],
  'Personal Items': [
    'Umbrella',
    'Water Bottle',
    'Tumbler',
    'Cosmetic Case',
    'Hygiene Item',
    'Medicine Container',
    'Other Personal Item',
  ],
  Others: [
    'Other Item',
  ],
}

const colorOptions = [
  'Black',
  'White',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Brown',
  'Pink',
  'Purple',
  'Gold',
  'Silver',
  'Multicolor',
  'Other',
]

const sizeOptions = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'Other',
]

const electronicsBrands = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'OPPO',
  'Vivo',
  'Huawei',
  'Realme',
  'Infinix',
  'Tecno',
  'Google',
  'Other',
  'No Brand',
]

const laptopBrands = [
  'Acer',
  'ASUS',
  'Dell',
  'HP',
  'Lenovo',
  'Apple',
  'MSI',
  'Huawei',
  'Microsoft',
  'Other',
  'No Brand',
]

const generalBrands = [
  'Nike',
  'Adidas',
  'Puma',
  'Jansport',
  'Herschel',
  'Uniqlo',
  'Other',
  'No Brand',
]

const getBrandOptions = (category, subcategory) => {
  if (
    category === 'Electronics' &&
    ['Mobile Phone', 'Tablet', 'Smartwatch'].includes(subcategory)
  ) {
    return electronicsBrands
  }

  if (category === 'Electronics' && subcategory === 'Laptop') {
    return laptopBrands
  }

  if (
    category === 'Bags' ||
    category === 'Clothing' ||
    category === 'Accessories'
  ) {
    return generalBrands
  }

  return []
}

const shouldShowBrand = (category) => {
  return [
    'Electronics',
    'Clothing',
    'Bags',
    'School Supplies',
    'Wallets & Money',
    'Accessories',
    'Personal Items',
  ].includes(category)
}

const shouldShowModel = (category, subcategory) => {
  return (
    category === 'Electronics' &&
    ['Mobile Phone', 'Laptop', 'Tablet', 'Smartwatch'].includes(subcategory)
  )
}

const shouldShowColor = (category) => {
  return [
    'Electronics',
    'Clothing',
    'Bags',
    'School Supplies',
    'Wallets & Money',
    'Keys',
    'Accessories',
    'Personal Items',
    'Others',
  ].includes(category)
}

const shouldShowSize = (category, subcategory) => {
  if (category === 'Clothing') return true

  if (
    category === 'Bags' &&
    [
      'Backpack',
      'Laptop Bag',
      'Shoulder Bag',
      'Sling Bag',
      'Tote Bag',
      'Pouch',
    ].includes(subcategory)
  ) {
    return true
  }

  return false
}

function ReportItem({ type, setPage }) {
  const [form, setForm] = useState({
    itemName: '',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    color: '',
    size: '',
    description: '',
    distinctiveDetails: '',
    location: '',
    date: '',
    time: '',
  })

  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isLost = type === 'lost'

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
  }

  const handleCategoryChange = (event) => {
    setForm({
      ...form,
      category: event.target.value,
      subcategory: '',
      brand: '',
      model: '',
      color: '',
      size: '',
    })
  }

  const handlePhotoChange = (event) => {
    const selectedFile = event.target.files?.[0]

    setError('')
    setMessage('')

    if (!selectedFile) {
      setPhoto(null)
      return
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file.')
      event.target.value = ''
      setPhoto(null)
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (selectedFile.size > maxSize) {
      setError('Photo must be 5 MB or smaller.')
      event.target.value = ''
      setPhoto(null)
      return
    }

    setPhoto(selectedFile)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to submit a report.')
      setLoading(false)
      return
    }

    let photoPath = null

    /*
      Upload the photo first.
      The path is stored in items.photo_url.
    */
    if (photo) {
      const fileExtension = photo.name.split('.').pop()?.toLowerCase() || 'jpg'

      const fileName = `${crypto.randomUUID()}.${fileExtension}`

      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(filePath, photo, {
          cacheControl: '3600',
          upsert: false,
          contentType: photo.type,
        })

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`)
        setLoading(false)
        return
      }

      photoPath = filePath
    }

    const { error: insertError } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        type,
        item_name: form.itemName,
        category: form.category,
        subcategory: form.subcategory,
        brand: form.brand || null,
        model: form.model || null,
        color: form.color || null,
        size: form.size || null,
        description: form.description || null,
        distinctive_details: form.distinctiveDetails || null,
        location: form.location,
        date: form.date,
        time: form.time || null,
        photo_url: photoPath,
        status: 'reported',
      })

    if (insertError) {
      if (photoPath) {
        await supabase.storage
          .from('item-photos')
          .remove([photoPath])
      }

      setError(insertError.message)
      setLoading(false)
      return
    }

    setMessage(
      `${isLost ? 'Lost' : 'Found'} item reported successfully.`
    )

    setForm({
      itemName: '',
      category: '',
      subcategory: '',
      brand: '',
      model: '',
      color: '',
      size: '',
      description: '',
      distinctiveDetails: '',
      location: '',
      date: '',
      time: '',
    })

    setPhoto(null)

    const fileInput = document.getElementById('itemPhoto')

    if (fileInput) {
      fileInput.value = ''
    }

    setLoading(false)
  }

  const brandOptions = getBrandOptions(
    form.category,
    form.subcategory
  )

  return (
    <div className="dashboard-layout">

      <Sidebar
        page={isLost ? 'report-lost' : 'report-found'}
        setPage={setPage}
      />

      <main className="dashboard-main">

        <section className="dashboard-content">

          <section className="report-header">

            <p className="eyebrow">
              NEW REPORT
            </p>

            <h1>
              Report {isLost ? 'Lost' : 'Found'} Item
            </h1>

            <p>
              Provide the details below so the item can be added
              to the campus lost and found records.
            </p>

          </section>

          <form
            className="report-form"
            onSubmit={handleSubmit}
          >

            {/* ITEM NAME */}

            <div className="form-group">

              <label htmlFor="itemName">
                Item Name
              </label>

              <input
                id="itemName"
                name="itemName"
                type="text"
                placeholder="e.g. Samsung Galaxy A15"
                value={form.itemName}
                onChange={handleChange}
                required
              />

            </div>


            {/* PHOTO */}

            <div className="form-group">

              <label htmlFor="itemPhoto">
                Item Photo
              </label>

              <input
                id="itemPhoto"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />

              <small>
                Optional. Upload an image of the item, up to 5 MB.
              </small>

              {photo && (
                <small>
                  Selected: {photo.name}
                </small>
              )}

            </div>


            {/* CATEGORY */}

            <div className="form-group">

              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                required
              >

                <option value="">
                  Select a category
                </option>

                {Object.keys(categoryOptions).map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}

              </select>

            </div>


            {/* SUBCATEGORY */}

            {form.category && (
              <div className="form-group">

                <label htmlFor="subcategory">
                  Subcategory
                </label>

                <select
                  id="subcategory"
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select a subcategory
                  </option>

                  {categoryOptions[form.category].map((subcategory) => (
                    <option
                      key={subcategory}
                      value={subcategory}
                    >
                      {subcategory}
                    </option>
                  ))}

                </select>

              </div>
            )}


            {/* BRAND */}

            {form.subcategory && shouldShowBrand(form.category) && (
              <div className="form-group">

                <label htmlFor="brand">
                  Brand
                </label>

                {brandOptions.length > 0 ? (

                  <select
                    id="brand"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select a brand
                    </option>

                    {brandOptions.map((brand) => (
                      <option
                        key={brand}
                        value={brand}
                      >
                        {brand}
                      </option>
                    ))}

                  </select>

                ) : (

                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    placeholder="Enter brand or leave blank"
                    value={form.brand}
                    onChange={handleChange}
                  />

                )}

              </div>
            )}


            {/* MODEL */}

            {form.subcategory &&
              shouldShowModel(form.category, form.subcategory) && (
                <div className="form-group">

                  <label htmlFor="model">
                    Model
                  </label>

                  <input
                    id="model"
                    name="model"
                    type="text"
                    placeholder="e.g. Galaxy A15"
                    value={form.model}
                    onChange={handleChange}
                  />

                </div>
              )}


            {/* COLOR */}

            {form.subcategory &&
              shouldShowColor(form.category) && (
                <div className="form-group">

                  <label htmlFor="color">
                    Color
                  </label>

                  <select
                    id="color"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select a color
                    </option>

                    {colorOptions.map((color) => (
                      <option
                        key={color}
                        value={color}
                      >
                        {color}
                      </option>
                    ))}

                  </select>

                </div>
              )}


            {/* SIZE */}

            {form.subcategory &&
              shouldShowSize(form.category, form.subcategory) && (
                <div className="form-group">

                  <label htmlFor="size">
                    Size
                  </label>

                  <select
                    id="size"
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select a size
                    </option>

                    {sizeOptions.map((size) => (
                      <option
                        key={size}
                        value={size}
                      >
                        {size}
                      </option>
                    ))}

                  </select>

                </div>
              )}


            {/* DESCRIPTION */}

            <div className="form-group">

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                placeholder="Provide a general description of the item."
                value={form.description}
                onChange={handleChange}
                rows="5"
              />

            </div>


            {/* DISTINCTIVE DETAILS */}

            <div className="form-group">

              <label htmlFor="distinctiveDetails">
                Distinctive Details
              </label>

              <textarea
                id="distinctiveDetails"
                name="distinctiveDetails"
                placeholder="Describe private details that can help verify ownership."
                value={form.distinctiveDetails}
                onChange={handleChange}
                rows="5"
              />

              <small>
                These details are kept private and may be used during claim verification.
              </small>

            </div>


            {/* LOCATION */}

            <div className="form-group">

              <label htmlFor="location">
                {isLost
                  ? 'Where did you lose it?'
                  : 'Where did you find it?'}
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Engineering Building, 2nd Floor"
                value={form.location}
                onChange={handleChange}
                required
              />

            </div>


            {/* DATE */}

            <div className="form-group">

              <label htmlFor="date">
                {isLost ? 'Date Lost' : 'Date Found'}
              </label>

              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />

            </div>


            {/* TIME */}

            <div className="form-group">

              <label htmlFor="time">
                Estimated Time {isLost ? 'Lost' : 'Found'}
              </label>

              <input
                id="time"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
              />

            </div>


            {/* MESSAGES */}

            {message && (
              <p className="form-success">
                {message}
              </p>
            )}

            {error && (
              <p className="form-error">
                {error}
              </p>
            )}


            {/* SUBMIT */}

            <button
              className="report-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Submitting...'
                : 'Submit Report'}
            </button>

          </form>

        </section>

      </main>

    </div>
  )
}

export default ReportItem