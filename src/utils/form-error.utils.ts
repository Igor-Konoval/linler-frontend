import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

import {
  getReadableErrorMessage,
  isRequestFailure,
} from './request-failure.utils';

export function applyRequestFailureToForm<TFormValues extends FieldValues>(
  form: UseFormReturn<TFormValues>,
  error: unknown,
  fallbackMessage = 'Something went wrong',
): void {
  if (!isRequestFailure(error)) {
    form.setError('root', {
      type: 'server',
      message: fallbackMessage,
    });

    return;
  }

  if (error.fieldErrors) {
    Object.entries(error.fieldErrors).forEach(([fieldName, fieldMessage]) => {
      form.setError(fieldName as FieldPath<TFormValues>, {
        type: 'server',
        message: getReadableErrorMessage(fieldMessage),
      });
    });

    return;
  }

  form.setError('root', {
    type: 'server',
    message: getReadableErrorMessage(error.errorMessage),
  });
}
