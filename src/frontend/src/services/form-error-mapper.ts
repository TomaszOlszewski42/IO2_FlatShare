export type FormFieldErrors = Record<string, string[]>;

export type FormErrorsResult = {
  summary: string | null;
  fieldErrors: FormFieldErrors;
};

type ApiErrorLike = {
  message?: string;
  errors?: Record<string, string[] | string>;
  fieldErrors?: Record<string, string[] | string>;
};

function normalizeFieldErrors(
  value: Record<string, string[] | string> | undefined,
): FormFieldErrors {
  if (!value) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([fieldName, fieldErrors]) => [
      fieldName,
      Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors],
    ]),
  );
}

export function mapFormErrors(error: unknown): FormErrorsResult {
  if (!error || typeof error !== 'object') {
    return {
      summary: 'Something went wrong. Please try again.',
      fieldErrors: {},
    };
  }

  const apiError = error as ApiErrorLike;

  const fieldErrors = normalizeFieldErrors(
    apiError.fieldErrors ?? apiError.errors,
  );

  return {
    summary: apiError.message ?? 'Something went wrong. Please try again.',
    fieldErrors,
  };
}