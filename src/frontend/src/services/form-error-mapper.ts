export type FormFieldErrors = Record<string, string[]>;

export type FormErrorsResult = {
  summary: string | null;
  fieldErrors: FormFieldErrors;
};

type ApiFieldErrorItem = {
  field?: string;
  message?: string;
};

type ApiFieldErrorsValue =
  | Record<string, string[] | string>
  | ApiFieldErrorItem[];

type ApiErrorLike = {
  message?: string;
  errors?: ApiFieldErrorsValue;
  fieldErrors?: ApiFieldErrorsValue;
};

function appendFieldError(
  result: FormFieldErrors,
  fieldName: string,
  message: string,
): void {
  if (!result[fieldName]) {
    result[fieldName] = [];
  }

  result[fieldName].push(message);
}

function normalizeFieldErrors(value: ApiFieldErrorsValue | undefined): FormFieldErrors {
  if (!value) {
    return {};
  }

  if (Array.isArray(value)) {
    const result: FormFieldErrors = {};

    for (const item of value) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const fieldName =
        typeof item.field === 'string' && item.field.trim().length > 0
          ? item.field
          : 'general';

      const message =
        typeof item.message === 'string' && item.message.trim().length > 0
          ? item.message
          : 'Invalid value.';

      appendFieldError(result, fieldName, message);
    }

    return result;
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