import { AppButton } from '../ui/app-button'

type CreateListingButtonProps = {
  text?: string
  onClick: () => void
  className?: string
}

type ClearFiltersButtonProps = {
  onClick: () => void
  className?: string
}

export function CreateListingButton({ text = 'Add listing', onClick, className = '' }: CreateListingButtonProps) {
  return (
    <AppButton className={className} onClick={onClick}>
      {text}
    </AppButton>
  )
}

export function ClearFiltersButton({ onClick, className = '' }: ClearFiltersButtonProps) {
  return (
    <AppButton variant="outline" className={className} onClick={onClick}>
      Clear filters
    </AppButton>
  )
}
