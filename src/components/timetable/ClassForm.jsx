import { useState } from 'react';
import { DAYS, cn, todayName } from '../../lib/utils';
import { Field, FormActions, FormError } from '../ui/Field';

export default function ClassForm({ initial, onSubmit, onCancel, submitLabel = 'Save class' }) {
  const [values, setValues] = useState(() => ({
    subject: initial?.subject ?? '',
    lecturer: initial?.lecturer ?? '',
    location: initial?.location ?? '',
    day: initial?.day ?? todayName(),
    startTime: initial?.startTime ?? '09:00',
    endTime: initial?.endTime ?? '10:30',
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
    if (!values.subject.trim()) nextErrors.subject = 'Add the subject name.';
    if (!values.startTime) nextErrors.startTime = 'Pick a start time.';
    if (!values.endTime) nextErrors.endTime = 'Pick an end time.';
    if (values.startTime && values.endTime && values.startTime >= values.endTime) {
      nextErrors.endTime = 'The class must end after it starts.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please fix the highlighted fields before saving.');
      return;
    }

    onSubmit({
      subject: values.subject.trim(),
      lecturer: values.lecturer.trim(),
      location: values.location.trim(),
      day: values.day,
      startTime: values.startTime,
      endTime: values.endTime,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <FormError>{formError}</FormError>

      <Field label="Subject" htmlFor="class-subject" error={errors.subject}>
        <input
          id="class-subject"
          className="input"
          placeholder="e.g. Operating Systems"
          value={values.subject}
          onChange={update('subject')}
          aria-invalid={Boolean(errors.subject)}
          autoFocus
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Lecturer" htmlFor="class-lecturer" hint="Optional">
          <input
            id="class-lecturer"
            className="input"
            placeholder="e.g. Dr. Kenji Tanaka"
            value={values.lecturer}
            onChange={update('lecturer')}
          />
        </Field>

        <Field label="Room / location" htmlFor="class-location" hint="Optional">
          <input
            id="class-location"
            className="input"
            placeholder="e.g. Lecture Theatre 1"
            value={values.location}
            onChange={update('location')}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Day" htmlFor="class-day">
          <select id="class-day" className="input select" value={values.day} onChange={update('day')}>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Starts" htmlFor="class-start" error={errors.startTime}>
          <input
            id="class-start"
            type="time"
            className="input"
            value={values.startTime}
            onChange={update('startTime')}
            aria-invalid={Boolean(errors.startTime)}
          />
        </Field>

        <Field label="Ends" htmlFor="class-end" error={errors.endTime}>
          <input
            id="class-end"
            type="time"
            className="input"
            value={values.endTime}
            onChange={update('endTime')}
            aria-invalid={Boolean(errors.endTime)}
          />
        </Field>
      </div>

      <p
        className={cn(
          'rounded-xl border border-line bg-soft px-3 py-2 text-xs text-muted',
          !values.subject.trim() && 'hidden',
        )}
      >
        <span className="font-semibold text-ink">{values.subject.trim() || 'Class'}</span> · {values.day} ·{' '}
        {values.startTime || '—'}–{values.endTime || '—'}
      </p>

      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}
