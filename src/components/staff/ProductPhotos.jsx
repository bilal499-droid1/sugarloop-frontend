import { useEffect, useState } from 'react'
import { FaCamera, FaTimes } from 'react-icons/fa'
import { checkProductImage, removeStaffProductImage, uploadProductImage } from '../../lib/staffApi'
import { PRODUCT_IMAGE_MAX_COUNT, PRODUCT_IMAGE_TYPES } from '../../lib/staffConstants'

const thumbClass =
  'relative w-20 h-20 shrink-0 rounded-lg border border-border-light overflow-hidden bg-black/[0.03]'

/** A photo waiting for its product to exist. Its preview is a blob URL, released on the way out. */
function PendingThumb({ file, onRemove, disabled }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className={thumbClass}>
      {src && <img src={src} alt="" className="w-full h-full object-cover" />}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Do not upload ${file.name}`}
        className="absolute top-1 right-1 w-5 h-5 inline-flex items-center justify-center rounded-full border-none bg-black/70 text-white text-[0.6rem] cursor-pointer disabled:opacity-50"
      >
        <FaTimes aria-hidden="true" />
      </button>
    </div>
  )
}

/**
 * A product's photographs.
 *
 * Two modes, because the upload needs somewhere to put the file. The object's key is
 * prefixed with the product's id — that is what stops one product claiming another's
 * photo — so a product that does not exist yet cannot have an upload:
 *
 * - **No `product`** (the New product form): photos are only *chosen* here. They wait in
 *   `pending`, held by the form, and are sent as soon as the product has been saved.
 * - **A `product`** (editing, or a product just created): each photo uploads the moment it
 *   is picked, and Remove deletes it for real — the file as well as the row.
 *
 * The first photo is the one the menu shows. There is no reordering: removing the first
 * promotes the next.
 */
export default function ProductPhotos({
  product,
  pending,
  onPendingChange,
  onProductChange,
  disabled,
}) {
  const [busy, setBusy] = useState(false)
  const [removingKey, setRemovingKey] = useState(null)
  const [confirmKey, setConfirmKey] = useState(null)
  const [problems, setProblems] = useState([])

  const images = product?.images ?? []
  const count = images.length + (product ? 0 : pending.length)
  const room = PRODUCT_IMAGE_MAX_COUNT - count
  const locked = disabled || busy || removingKey !== null

  const handlePick = async (event) => {
    const picked = Array.from(event.target.files ?? [])
    // Cleared so picking the same file again after removing it still fires a change.
    event.target.value = ''
    if (picked.length === 0) return

    const found = []
    const accepted = []
    let overflowed = false
    for (const file of picked) {
      const problem = checkProductImage(file)
      if (problem) found.push(problem)
      else if (accepted.length < room) accepted.push(file)
      else overflowed = true
    }
    if (overflowed) found.push(`A product can have at most ${PRODUCT_IMAGE_MAX_COUNT} photos.`)

    setProblems(found)
    setConfirmKey(null)

    if (accepted.length === 0) return

    if (!product) {
      onPendingChange([...pending, ...accepted])
      return
    }

    setBusy(true)
    let latest = product
    try {
      for (const file of accepted) {
        try {
          latest = await uploadProductImage(latest.id, file)
          onProductChange(latest)
        } catch (error) {
          // Stops at the first failure: the next file would most likely fail the same way
          // (no bucket, no credentials, no CORS rule) and repeat the same message.
          setProblems((current) => [
            ...current,
            `${file.name}: ${error?.message ?? 'Could not upload.'}`,
          ])
          break
        }
      }
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async (image) => {
    // Deleting takes the file out of the bucket too, so it asks twice.
    if (confirmKey !== image.publicId) {
      setConfirmKey(image.publicId)
      return
    }

    setConfirmKey(null)
    setRemovingKey(image.publicId)
    setProblems([])
    try {
      onProductChange(await removeStaffProductImage(product.id, image.publicId))
    } catch (error) {
      setProblems([error?.message ?? 'Could not remove that photo.'])
    } finally {
      setRemovingKey(null)
    }
  }

  return (
    <div className="mt-3">
      <span className="font-display font-medium text-xs text-text-body">Photos</span>

      <div className="mt-1.5 flex flex-wrap gap-2">
        {images.map((image, index) => {
          const confirming = confirmKey === image.publicId
          return (
            <div key={image.publicId} className={thumbClass}>
              <img
                src={image.url}
                alt={image.alt}
                className={`w-full h-full object-cover ${
                  removingKey === image.publicId ? 'opacity-40' : ''
                }`}
              />
              {index === 0 && (
                <span className="absolute bottom-0 left-0 px-1.5 rounded-tr bg-black/70 font-display text-[0.6rem] font-semibold text-white">
                  Menu
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(image)}
                disabled={locked}
                aria-label={confirming ? 'Confirm: delete this photo' : 'Remove this photo'}
                className={`absolute top-1 right-1 inline-flex items-center justify-center rounded-full border-none text-white cursor-pointer disabled:opacity-50 ${
                  confirming
                    ? 'h-5 px-2 bg-[#a4443a] font-display text-[0.6rem] font-semibold'
                    : 'w-5 h-5 bg-black/70 text-[0.6rem]'
                }`}
              >
                {confirming ? 'Delete?' : <FaTimes aria-hidden="true" />}
              </button>
            </div>
          )
        })}

        {!product &&
          pending.map((file, index) => (
            <PendingThumb
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              file={file}
              disabled={locked}
              onRemove={() => onPendingChange(pending.filter((_, i) => i !== index))}
            />
          ))}

        {room > 0 && (
          <label
            className={`${thumbClass} flex flex-col items-center justify-center gap-1 border-dashed font-display text-[0.7rem] text-text-body ${
              locked
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:border-accent hover:text-accent'
            }`}
          >
            <FaCamera aria-hidden="true" />
            {busy ? 'Uploading…' : 'Add photo'}
            <input
              type="file"
              accept={PRODUCT_IMAGE_TYPES.join(',')}
              multiple
              disabled={locked}
              onChange={handlePick}
              className="sr-only"
              aria-label="Add photos"
            />
          </label>
        )}
      </div>

      <p className="mt-1.5 mb-0 text-[0.7rem] text-text-body/75">
        {product
          ? 'Photos upload as soon as you pick them. The first one is shown on the menu.'
          : 'They upload as soon as the product is created. The first one is shown on the menu.'}{' '}
        WebP, JPEG, PNG or AVIF, up to 5 MB each.
        {product?.legacyId != null &&
          images.length === 0 &&
          ' This item is showing the photos built into the site — adding one here replaces them.'}
      </p>

      {problems.map((message) => (
        <p key={message} className="mt-1 mb-0 font-display text-xs text-red-600" role="alert">
          {message}
        </p>
      ))}
    </div>
  )
}
