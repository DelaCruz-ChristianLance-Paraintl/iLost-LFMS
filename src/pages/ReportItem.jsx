import { useEffect, useRef, useState } from 'react'

import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/useToast'
import { Button } from '../components/ui/button'
import { Badge } from '@/components/ui/badge'
import Sidebar from '../components/Sidebar'
import ItemImagePreview from '../components/ItemImagePreview'
import ConfirmDialog from '../components/ConfirmDialog'



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

const inputClassName =
  'w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#263238] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#B83A4B] focus:ring-2 focus:ring-[#B83A4B]/10'

const selectClassName =
  'w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#263238] outline-none transition focus:border-[#B83A4B] focus:ring-2 focus:ring-[#B83A4B]/10'

const textareaClassName =
  'w-full resize-y rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm leading-6 text-[#263238] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#B83A4B] focus:ring-2 focus:ring-[#B83A4B]/10'

function Field({ label, htmlFor, required = false, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[#263238]"
      >
        {label}
        {required && (
          <span className="ml-1 text-[#B83A4B]">*</span>
        )}
      </label>

      {children}

      {hint && (
        <p className="text-xs leading-5 text-[#6B7280]">
          {hint}
        </p>
      )}
    </div>
  )
}

function SectionHeader({ number, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B83A4B]/10 text-sm font-semibold text-[#B83A4B]">
        {number}
      </div>

      <div>
        <h2 className="text-base font-semibold text-[#263238]">
          {title}
        </h2>

        <p className="mt-0.5 text-sm leading-5 text-[#6B7280]">
          {description}
        </p>
      </div>
    </div>
  )
}

function ReportItem({ type, setPage }) {
  const notify = useToast()
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
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('')
  const photoPreviewUrlRef = useRef('')
  const photoInputRef = useRef(null)
  const [isPhotoDragging, setIsPhotoDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isLost = type === 'lost'

  useEffect(() => () => {
    if (photoPreviewUrlRef.current) {
      URL.revokeObjectURL(photoPreviewUrlRef.current)
    }
  }, [])

  const clearSelectedPhoto = () => {
    if (photoPreviewUrlRef.current) {
      URL.revokeObjectURL(photoPreviewUrlRef.current)
      photoPreviewUrlRef.current = ''
    }

    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }

    setPhoto(null)
    setPhotoPreviewUrl('')
  }

  const handleRemovePhoto = () => {
    clearSelectedPhoto()
    setError('')
    setMessage('')
  }

  const openPhotoPicker = (event) => {
    if (
      event.target.closest('button') ||
      event.target.id === 'itemPhoto'
    ) {
      return
    }

    const input = photoInputRef.current

    if (input?.showPicker) {
      input.showPicker()
    } else {
      input?.click()
    }
  }

  const handleChoosePhoto = () => {
    const input = photoInputRef.current

    if (input?.showPicker) {
      input.showPicker()
    } else {
      input?.click()
    }
  }

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

  const handlePhotoFile = (selectedFile) => {
    setError('')
    setMessage('')

    if (!selectedFile) {
      return
    }

    if (!selectedFile.type.startsWith('image/')) {
      const message = 'Please select an image file.'
      setError(message)
      notify({
        type: 'error',
        title: 'Photo could not be added',
        description: message,
      })
      clearSelectedPhoto()
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (selectedFile.size > maxSize) {
      const message = 'Photo must be 5 MB or smaller.'
      setError(message)
      notify({
        type: 'error',
        title: 'Photo is too large',
        description: message,
      })
      clearSelectedPhoto()
      return
    }

    if (photoPreviewUrlRef.current) {
      URL.revokeObjectURL(photoPreviewUrlRef.current)
    }

    const previewUrl = URL.createObjectURL(selectedFile)
    photoPreviewUrlRef.current = previewUrl
    setPhotoPreviewUrl(previewUrl)
    setPhoto(selectedFile)
  }

  const handlePhotoChange = (event) => {
    handlePhotoFile(event.target.files?.[0])
    event.target.value = ''
  }

  const handlePhotoDragOver = (event) => {
    event.preventDefault()

    if (Array.from(event.dataTransfer.types).includes('Files')) {
      setIsPhotoDragging(true)
    }
  }

  const handlePhotoDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsPhotoDragging(false)
    }
  }

  const handlePhotoDrop = (event) => {
    event.preventDefault()
    setIsPhotoDragging(false)
    handlePhotoFile(event.dataTransfer.files?.[0])
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setConfirmOpen(true)
  }

  const submitReport = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const message = 'You must be logged in to submit a report.'
      setError(message)
      notify({
        type: 'error',
        title: 'Report could not be submitted',
        description: message,
      })
      setLoading(false)
      return
    }

    let photoPath = null

    if (photo) {
      const fileExtension =
        photo.name.split('.').pop()?.toLowerCase() || 'jpg'

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
        const message = `Photo upload failed: ${uploadError.message}`
        setError(message)
        notify({
          type: 'error',
          title: 'Photo upload failed',
          description: uploadError.message,
        })
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
      notify({
        type: 'error',
        title: 'Report could not be submitted',
        description: insertError.message,
      })
      setLoading(false)
      return
    }

    const successMessage =
      `${isLost ? 'Lost' : 'Found'} item reported successfully.`
    setMessage(successMessage)
    notify({
      type: 'success',
      title: 'Report submitted',
      description: successMessage,
    })

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

    clearSelectedPhoto()

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
        <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">

          <Badge
            variant="ghost"
            onClick={() => setPage('dashboard')}
            className="group mb-5 cursor-pointer gap-2 rounded-full border border-[#8E2A63]/20 bg-[#8E2A63]/[0.06] px-4 py-2 text-sm font-semibold text-[#8E2A63] transition-all duration-200 hover:border-[#8E2A63]/40 hover:bg-[#FBE4F0] hover:text-[#650033]"
          >
            <span className="text-base transition-transform duration-200 group-hover:-translate-x-0.5">
              ←
            </span>
            Back
          </Badge>

          {/* PAGE HEADER */}
          <header className="dashboard-welcome page-welcome report-welcome">

            <div className="mb-3 flex items-center gap-2">
              <span className="header-eyebrow-pill">
                NEW REPORT
              </span>

              <span className="h-1 w-1 rounded-full bg-[#D9B65D]" />

              <span className="text-xs font-medium text-[#6B7280]">
                {isLost ? 'Lost Item' : 'Found Item'}
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#263238] sm:text-3xl">
              Report {isLost ? 'Lost' : 'Found'} Item
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Provide accurate item details so iLost can organize the
              report and help connect lost belongings with their owners.
            </p>

          </header>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* ITEM DETAILS */}
            <section className="report-form-card rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_12px_rgba(38,50,56,0.04)] sm:p-7">
              <SectionHeader
                number="01"
                title="Item details"
                description="Start with the basic information that identifies the item."
              />

              <div className="grid gap-5 md:grid-cols-2">

                <div className="md:col-span-2">
                  <Field
                    label="Item Name"
                    htmlFor="itemName"
                    required
                    hint="Use the item's common name or model name."
                  >
                    <input
                      id="itemName"
                      name="itemName"
                      type="text"
                      placeholder="e.g. Samsung Galaxy A15"
                      value={form.itemName}
                      onChange={handleChange}
                      required
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <Field
                  label="Category"
                  htmlFor="category"
                  required
                >
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleCategoryChange}
                    required
                    className={selectClassName}
                  >
                    <option value="">
                      Select a category
                    </option>

                    {Object.keys(categoryOptions).map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                {form.category && (
                  <Field
                    label="Subcategory"
                    htmlFor="subcategory"
                    required
                  >
                    <select
                      id="subcategory"
                      name="subcategory"
                      value={form.subcategory}
                      onChange={handleChange}
                      required
                      className={selectClassName}
                    >
                      <option value="">
                        Select a subcategory
                      </option>

                      {categoryOptions[form.category].map(
                        (subcategory) => (
                          <option
                            key={subcategory}
                            value={subcategory}
                          >
                            {subcategory}
                          </option>
                        )
                      )}
                    </select>
                  </Field>
                )}

                {form.subcategory &&
                  shouldShowBrand(form.category) && (
                    <Field
                      label="Brand"
                      htmlFor="brand"
                      hint="Optional if the item has no recognizable brand."
                    >
                      {brandOptions.length > 0 ? (
                        <select
                          id="brand"
                          name="brand"
                          value={form.brand}
                          onChange={handleChange}
                          className={selectClassName}
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
                          className={inputClassName}
                        />
                      )}
                    </Field>
                  )}

                {form.subcategory &&
                  shouldShowModel(
                    form.category,
                    form.subcategory
                  ) && (
                    <Field
                      label="Model"
                      htmlFor="model"
                      hint="Include the specific model when known."
                    >
                      <input
                        id="model"
                        name="model"
                        type="text"
                        placeholder="e.g. Galaxy A15"
                        value={form.model}
                        onChange={handleChange}
                        className={inputClassName}
                      />
                    </Field>
                  )}

                {form.subcategory &&
                  shouldShowColor(form.category) && (
                    <Field
                      label="Color"
                      htmlFor="color"
                    >
                      <select
                        id="color"
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        className={selectClassName}
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
                    </Field>
                  )}

                {form.subcategory &&
                  shouldShowSize(
                    form.category,
                    form.subcategory
                  ) && (
                    <Field
                      label="Size"
                      htmlFor="size"
                    >
                      <select
                        id="size"
                        name="size"
                        value={form.size}
                        onChange={handleChange}
                        className={selectClassName}
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
                    </Field>
                  )}

              </div>
            </section>

            {/* PHOTO */}
            <section className="report-form-card rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_12px_rgba(38,50,56,0.04)] sm:p-7">
              <SectionHeader
                number="02"
                title="Item photo"
                description="A clear photo can make the item easier to recognize."
              />

              <div
                className={`report-photo-upload rounded-xl border border-dashed border-[#D1D5DB] bg-[#F7F9FC] p-6 text-center transition hover:border-[#B83A4B]/50 hover:bg-[#B83A4B]/[0.02] ${
                  photo ? 'has-photo' : ''
                } ${isPhotoDragging ? 'is-dragging' : ''}`}
                onClick={openPhotoPicker}
                onDragOver={handlePhotoDragOver}
                onDragLeave={handlePhotoDragLeave}
                onDrop={handlePhotoDrop}
              >
                <div className="mx-auto flex max-w-md flex-col items-center">

                  {photoPreviewUrl ? (
                    <ItemImagePreview
                      className="report-photo-preview"
                      imageClassName="report-photo-preview-image"
                      src={photoPreviewUrl}
                      alt="Selected item photo"
                    />
                  ) : (
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#B83A4B] shadow-sm ring-1 ring-[#E5E7EB]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="16"
                          rx="2"
                        />
                        <circle
                          cx="8.5"
                          cy="9"
                          r="1.5"
                        />
                        <path d="m21 15-4.5-4.5L7 20" />
                      </svg>
                    </div>
                  )}

                  <p className="text-sm font-medium text-[#263238]">
                    {photo
                      ? 'Photo selected'
                      : 'Upload a photo of the item'}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                    {isPhotoDragging
                      ? 'Drop your photo here.'
                      : photo
                      ? 'Click anywhere in this box to change your photo.'
                      : 'Drag and drop a photo here, or click anywhere in this box to choose one. JPG, PNG, or other image formats up to 5 MB.'}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#263238] shadow-sm transition hover:border-[#B83A4B] hover:text-[#B83A4B]"
                      onClick={handleChoosePhoto}
                    >
                      {photo ? 'Change Photo' : 'Choose Photo'}
                    </button>

                    {photo && (
                      <button
                        type="button"
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#E7C5D4] bg-white px-4 py-2 text-sm font-medium text-[#8E2A63] shadow-sm transition hover:border-[#8E2A63] hover:bg-[#FFF6FA]"
                        onClick={handleRemovePhoto}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>

                  <input
                    ref={photoInputRef}
                    id="itemPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="sr-only"
                    tabIndex={-1}
                  />

                  {photo && (
                    <p
                      role="status"
                      className="mt-3 max-w-full truncate text-xs font-medium text-[#26733F]"
                    >
                      Ready to upload: {photo.name}
                    </p>
                  )}

                </div>
              </div>
            </section>

            {/* DESCRIPTION */}
            <section className="report-form-card rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_12px_rgba(38,50,56,0.04)] sm:p-7">
              <SectionHeader
                number="03"
                title="Description"
                description="Add information that can help distinguish the item from similar reports."
              />

              <div className="space-y-5">

                <Field
                  label="General Description"
                  htmlFor="description"
                  hint="Describe the visible appearance, condition, or other useful information."
                >
                  <textarea
                    id="description"
                    name="description"
                    placeholder="e.g. Black smartphone with a clear protective case."
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className={textareaClassName}
                  />
                </Field>

                <div className="rounded-xl border border-[#D9B65D]/40 bg-[#D9B65D]/[0.06] p-4">

                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D9B65D]/15 text-[#8A6D1D]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M12 3 4 7v5c0 5 3.4 8.1 8 9 4.6-.9 8-4 8-9V7l-8-4Z" />
                        <path d="M9.5 12 11 13.5 14.5 10" />
                      </svg>
                    </div>

                    <h3 className="text-sm font-semibold text-[#5F4B12]">
                      Private verification details
                    </h3>
                  </div>

                  <p className="mb-4 text-xs leading-5 text-[#6B7280]">
                    Add details that should not be publicly revealed.
                    These can help verify whether a claimant is the
                    rightful owner.
                  </p>

                  <Field
                    label="Distinctive Details"
                    htmlFor="distinctiveDetails"
                  >
                    <textarea
                      id="distinctiveDetails"
                      name="distinctiveDetails"
                      placeholder="e.g. Small scratch near the camera, specific sticker, initials, or other private detail."
                      value={form.distinctiveDetails}
                      onChange={handleChange}
                      rows={4}
                      className={textareaClassName}
                    />
                  </Field>

                </div>
              </div>
            </section>

            {/* LOCATION AND DATE */}
            <section className="report-form-card rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_12px_rgba(38,50,56,0.04)] sm:p-7">
              <SectionHeader
                number="04"
                title="When and where"
                description="Provide the location and approximate time connected to the report."
              />

              <div className="grid gap-5 md:grid-cols-2">

                <div className="md:col-span-2">
                  <Field
                    label={
                      isLost
                        ? 'Where did you lose it?'
                        : 'Where did you find it?'
                    }
                    htmlFor="location"
                    required
                    hint="Use a specific campus location when possible."
                  >
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g. Engineering Building, 2nd Floor"
                      value={form.location}
                      onChange={handleChange}
                      required
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <Field
                  label={isLost ? 'Date Lost' : 'Date Found'}
                  htmlFor="date"
                  required
                >
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className={`${inputClassName} cursor-pointer`}
                  />
                </Field>

                <Field
                  label={
                    isLost
                      ? 'Estimated Time Lost'
                      : 'Estimated Time Found'
                  }
                  htmlFor="time"
                  hint="Optional if the exact time is unknown."
                >
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={handleChange}
                    className={`${inputClassName} cursor-pointer`}
                  />
                </Field>

              </div>
            </section>

            {/* MESSAGES */}
            {message && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                {message}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* FORM ACTIONS */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-5 sm:flex-row sm:items-center sm:justify-between">

              <Button
                type="button"
                variant="outline"
                onClick={() => setPage('dashboard')}
                className="h-10 rounded-lg border-[#E5E7EB] bg-white px-5 text-sm font-medium text-[#263238] hover:bg-[#F7F9FC]"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="h-10 rounded-lg bg-[#B83A4B] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#963040] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Submitting...'
                  : `Submit ${isLost ? 'Lost' : 'Found'} Report`}
              </Button>
            </div>

          </form>

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={`Submit this ${isLost ? 'lost' : 'found'} item report?`}
            description={`You are about to submit "${form.itemName.trim()}". Please make sure the report details are accurate before continuing.`}
            confirmLabel={`Submit ${isLost ? 'Lost' : 'Found'} Report`}
            onConfirm={() => {
              setConfirmOpen(false)
              void submitReport()
            }}
          />
        </div>
      </main>
    </div>
  )
}

export default ReportItem