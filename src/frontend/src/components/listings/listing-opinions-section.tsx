import type { JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { useAuth } from '../../hooks/use-auth'
import { readAuthSession } from '../../services/auth-session'
import { useErrorHandler } from '../../services/error-handler-context'
import {
  addListingOpinion,
  getListingOpinions,
} from '../../services/opinion-api'
import type { ListingOpinion } from '../../types/opinion'
import { ListingSection } from './listing-section'

type Props = {
  listingId: string
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

function StarRating({
  value,
  name,
  onChange,
  disabled = false,
}: {
  value: number
  name: string
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div class="rating rating-md">
      {/* Hidden reset radio */}
      <input
        type="radio"
        name={name}
        class="rating-hidden"
        checked={value === 0}
        onChange={() => onChange(0)}
        disabled={disabled}
        aria-label="Clear rating"
      />
      {[1, 2, 3, 4, 5].map((star) => (
        <input
          key={star}
          type="radio"
          name={name}
          class="mask mask-star-2 bg-warning"
          checked={value === star}
          onChange={() => onChange(star)}
          disabled={disabled}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        />
      ))}
    </div>
  )
}

function ReadOnlyStars({ rating }: { rating: number }) {
  return (
    <div class="rating rating-sm" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <input
          key={star}
          type="radio"
          class={`mask mask-star-2 ${star <= rating ? 'bg-warning' : 'bg-base-300'}`}
          checked={star === rating}
          disabled
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function OpinionCard({ opinion }: { opinion: ListingOpinion }) {
  return (
    <div class="flex flex-col gap-2 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div class="flex items-center justify-between gap-2">
        <ReadOnlyStars rating={opinion.rating} />
        <span class="text-xs text-base-content/50">{formatDate(opinion.createdAt)}</span>
      </div>
      {opinion.comment ? (
        <p class="text-sm leading-relaxed text-base-content/80">{opinion.comment}</p>
      ) : null}
    </div>
  )
}

function AddOpinionForm({
  listingId,
  onAdded,
}: {
  listingId: string
  onAdded: (opinion: ListingOpinion) => void
}) {
  const { showToast } = useErrorHandler()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)

  async function handleSubmit(event: JSX.TargetedSubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (rating < 1 || rating > 5) {
      setRatingError('Please select a rating between 1 and 5.')
      return
    }

    setRatingError(null)

    const session = readAuthSession()
    if (!session) {
      showToast('You must be logged in to submit an opinion.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await addListingOpinion(
        listingId,
        { listingId, rating, comment: comment.trim() },
        session.token,
        session.type,
      )
      setRating(0)
      setComment('')
      showToast('Your opinion has been submitted.', 'success')
      onAdded(created)
    } catch {
      showToast('Failed to submit opinion. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      id="add-opinion-form"
      class="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-base-300 bg-base-200/40 p-4"
      onSubmit={handleSubmit}
    >
      <h3 class="text-sm font-semibold text-base-content/70">Leave your opinion</h3>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-base-content/60" for="opinion-rating-label">
          Rating <span class="text-error">*</span>
        </label>
        <span id="opinion-rating-label" class="sr-only">
          Select rating
        </span>
        <StarRating
          value={rating}
          name={`opinion-rating-${listingId}`}
          onChange={(v) => {
            setRating(v)
            setRatingError(null)
          }}
          disabled={isSubmitting}
        />
        {ratingError ? <p class="text-xs text-error">{ratingError}</p> : null}
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-base-content/60" for="opinion-comment">
          Comment <span class="text-base-content/40">(optional)</span>
        </label>
        <textarea
          id="opinion-comment"
          name="comment"
          class="textarea textarea-bordered textarea-sm w-full resize-none"
          rows={3}
          placeholder="Share your thoughts about this listing…"
          value={comment}
          disabled={isSubmitting}
          onInput={(e) => setComment((e.currentTarget as HTMLTextAreaElement).value)}
          maxLength={2000}
        />
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          class="btn btn-primary btn-sm"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <span class="loading loading-spinner loading-xs" aria-hidden="true" />
          ) : null}
          <span>Submit opinion</span>
        </button>
      </div>
    </form>
  )
}

export function ListingOpinionsSection({ listingId }: Props) {
  const { isTenant, session } = useAuth()
  const [opinions, setOpinions] = useState<ListingOpinion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      setIsLoading(false)
      return
    }

    let mounted = true
    setIsLoading(true)
    getListingOpinions(listingId, session.token, session.type)
      .then((data) => {
        if (mounted) setOpinions(data)
      })
      .catch(() => {
        if (mounted) setOpinions([])
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [listingId, session])

  function handleOpinionAdded(opinion: ListingOpinion) {
    setOpinions((prev) => [opinion, ...prev])
  }

  return (
    <ListingSection title="Opinions">
      {/* Scrollable list */}
      <div
        class="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1"
        role="list"
        aria-label="Listing opinions"
      >
        {isLoading ? (
          <>
            <div class="skeleton h-20 w-full rounded-xl" />
            <div class="skeleton h-20 w-full rounded-xl" />
          </>
        ) : opinions.length === 0 ? (
          <p class="text-sm text-base-content/50">
            No opinions yet. Be the first to share your thoughts!
          </p>
        ) : (
          opinions.map((opinion) => (
            <div key={opinion.id} role="listitem">
              <OpinionCard opinion={opinion} />
            </div>
          ))
        )}
      </div>

      {/* Write form — only for tenants */}
      {isTenant ? (
        <AddOpinionForm listingId={listingId} onAdded={handleOpinionAdded} />
      ) : null}
    </ListingSection>
  )
}
