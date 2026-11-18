import { useState } from 'react';
import { BellRing } from 'lucide-react';
import { defaultReminderDate, parseDateTime, toDateTimeInput } from '../../lib/utils';
import { Field, FormActions, FormError } from '../ui/Field';

export default function ReminderForm({ initial, onSubmit, onCancel, submitLabel = 'Save reminder' }) {
  const [values, setValues] = useState(() => ({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    datetime: initial?.datetime ? toDateTimeInput(initial.datetime) : defaultReminderDate(),
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const update = (key) => (event) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Give this reminder a title.';
    if (!values.datetime) nextErrors.datetime = 'Choose when to be reminded.';
    else if (!parseDateTime(values.datetime)) nextErrors.datetime = 'That date does not look valid.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please fix the highlighted fields before saving.');
      return;
    }

    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      datetime: toDateTimeInput(parseDateTime(values.datetime)),
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <FormError>{formError}</FormError>

      <Field label="Reminder" htmlFor="reminder-title" error={errors.title}>
        <input
          id="reminder-title"
          className="input"
          placeholder="e.g. Finish the OS lab report"
          value={values.title}
          onChange={update('title')}
          aria-invalid={Boolean(errors.title)}
          autoFocus
        />
      </Field>

      <Field label="Date & time" htmlFor="reminder-datetime" error={errors.datetime}>
        <input
          id="reminder-datetime"
          type="datetime-local"
          className="input"
          value={values.datetime}
          onChange={update('datetime')}
          aria-invalid={Boolean(errors.datetime)}
        />
      </Field>

      <Field label="Notes" htmlFor="reminder-description" hint="Optional details to help future you.">
        <textarea
          id="reminder-description"
          className="input min-h-[76px] resize-y"
          rows={3}
          placeholder="What exactly needs doing?"
          value={values.description}
          onChange={update('description')}
        />
      </Field>

      <p className="flex items-start gap-2 rounded-xl border border-line bg-soft px-3 py-2 text-xs leading-relaxed text-muted">
        <BellRing className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
        Browser notifications only appear while UniHub is open in a tab — they cannot run in the background.
      </p>

      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}
