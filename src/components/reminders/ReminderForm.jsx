import { useState } from 'react';
import { BellRing } from 'lucide-react';
import { defaultReminderDate, parseDateTime, toDateTimeInput } from '../../lib/utils';
import { Field, FormActions, FormError } from '../ui/Field';
import { Input, Textarea } from '../ui/Input';

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
    if (!values.title.trim()) nextErrors.title = 'Title is required.';
    if (!values.datetime) nextErrors.datetime = 'Choose when to be reminded.';
    else if (!parseDateTime(values.datetime)) nextErrors.datetime = 'Invalid date format.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please check the required fields.');
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

      <Field label="Reminder title" htmlFor="reminder-title" error={errors.title}>
        <Input
          id="reminder-title"
          placeholder="e.g. Bring lab notebook"
          value={values.title}
          onChange={update('title')}
          error={Boolean(errors.title)}
          autoFocus
        />
      </Field>

      <Field label="Date & time" htmlFor="reminder-datetime" error={errors.datetime}>
        <Input
          id="reminder-datetime"
          type="datetime-local"
          value={values.datetime}
          onChange={update('datetime')}
          error={Boolean(errors.datetime)}
        />
      </Field>

      <Field label="Notes" htmlFor="reminder-description" hint="Optional details for the class.">
        <Textarea
          id="reminder-description"
          rows={3}
          placeholder="Specific details or materials needed…"
          value={values.description}
          onChange={update('description')}
        />
      </Field>

      <div className="flex items-start gap-2.5 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-3 text-xs leading-relaxed text-text-3">
        <BellRing className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent stroke-[1.5]" aria-hidden="true" />
        <span>Browser notifications appear while UniHub is open in a tab.</span>
      </div>

      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}
