import { useState } from 'react';
import {
  ANNOUNCEMENT_CATEGORIES,
  cn,
  parseDateTime,
  toDateTimeInput,
} from '../../lib/utils';
import { Field, FormActions, FormError } from '../ui/Field';

export default function AnnouncementForm({ initial, onSubmit, onCancel, submitLabel = 'Save announcement' }) {
  const [values, setValues] = useState(() => ({
    title: initial?.title ?? '',
    content: initial?.content ?? '',
    category: initial?.category ?? 'General',
    isPublished: initial?.isPublished ?? false,
    publishedAt: initial?.publishedAt
      ? toDateTimeInput(initial.publishedAt)
      : toDateTimeInput(new Date()),
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
    if (!values.title.trim()) nextErrors.title = 'Add a headline for the announcement.';
    if (!values.content.trim()) nextErrors.content = 'Write the announcement content.';
    if (values.isPublished && !values.publishedAt) nextErrors.publishedAt = 'Choose when this should go live.';
    else if (values.isPublished && !parseDateTime(values.publishedAt)) {
      nextErrors.publishedAt = 'That publish date does not look valid.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please fix the highlighted fields before saving.');
      return;
    }

    onSubmit({
      title: values.title.trim(),
      content: values.content.trim(),
      category: values.category,
      isPublished: values.isPublished,
      publishedAt: values.isPublished ? parseDateTime(values.publishedAt)?.toISOString() : null,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <FormError>{formError}</FormError>

      <Field label="Headline" htmlFor="announcement-title" error={errors.title}>
        <input
          id="announcement-title"
          className="input"
          placeholder="e.g. Mid-semester exam timetable released"
          value={values.title}
          onChange={update('title')}
          aria-invalid={Boolean(errors.title)}
          autoFocus
        />
      </Field>

      <Field label="Category" htmlFor="announcement-category">
        <select
          id="announcement-category"
          className="input select"
          value={values.category}
          onChange={update('category')}
        >
          {ANNOUNCEMENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Content" htmlFor="announcement-content" error={errors.content}>
        <textarea
          id="announcement-content"
          className="input min-h-[120px] resize-y"
          rows={5}
          placeholder="Share the details with your class…"
          value={values.content}
          onChange={update('content')}
          aria-invalid={Boolean(errors.content)}
        />
      </Field>

      <div className="space-y-3 rounded-xl border border-line bg-soft p-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={values.isPublished}
            onChange={(event) =>
              setValues((current) => ({ ...current, isPublished: event.target.checked }))
            }
            className="mt-0.5 h-4 w-4 rounded border-line accent-[var(--brand)]"
          />
          <span>
            <span className="block text-sm font-medium">Publish this announcement</span>
            <span className="block text-xs text-muted">
              Leave unchecked to save a draft that students cannot see.
            </span>
          </span>
        </label>

        <Field
          label="Publish at"
          htmlFor="announcement-published-at"
          error={errors.publishedAt}
          hint="A future time schedules the notice; students see it from that moment."
          className={cn(!values.isPublished && 'opacity-60')}
        >
          <input
            id="announcement-published-at"
            type="datetime-local"
            className="input"
            value={values.publishedAt}
            onChange={update('publishedAt')}
            disabled={!values.isPublished}
            aria-invalid={Boolean(errors.publishedAt)}
          />
        </Field>
      </div>

      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}
