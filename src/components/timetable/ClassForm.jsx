import { useState } from 'react';
import { DAYS, cn, todayName } from '../../lib/utils';
import { Field, FormActions, FormError } from '../ui/Field';
import { Input, Select } from '../ui/Input';

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
    if (!values.subject.trim()) nextErrors.subject = 'Subject name is required.';
    if (!values.startTime) nextErrors.startTime = 'Start time is required.';
    if (!values.endTime) nextErrors.endTime = 'End time is required.';
    if (values.startTime && values.endTime && values.startTime >= values.endTime) {
      nextErrors.endTime = 'End time must be after start time.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please check the required fields.');
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
        <Input
          id="class-subject"
          placeholder="e.g. Operating Systems"
          value={values.subject}
          onChange={update('subject')}
          error={Boolean(errors.subject)}
          autoFocus
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Lecturer" htmlFor="class-lecturer" hint="Optional">
          <Input
            id="class-lecturer"
            placeholder="e.g. Dr. Kenji Tanaka"
            value={values.lecturer}
            onChange={update('lecturer')}
          />
        </Field>

        <Field label="Room / location" htmlFor="class-location" hint="Optional">
          <Input
            id="class-location"
            placeholder="e.g. Lecture Hall B"
            value={values.location}
            onChange={update('location')}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Day" htmlFor="class-day">
          <Select id="class-day" value={values.day} onChange={update('day')}>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Starts" htmlFor="class-start" error={errors.startTime}>
          <Input
            id="class-start"
            type="time"
            value={values.startTime}
            onChange={update('startTime')}
            error={Boolean(errors.startTime)}
          />
        </Field>

        <Field label="Ends" htmlFor="class-end" error={errors.endTime}>
          <Input
            id="class-end"
            type="time"
            value={values.endTime}
            onChange={update('endTime')}
            error={Boolean(errors.endTime)}
          />
        </Field>
      </div>

      {values.subject.trim() && (
        <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 px-3.5 py-2.5 text-xs text-text-2">
          <span className="font-semibold text-text">{values.subject.trim()}</span> · {values.day} ·{' '}
          <span className="tabular-nums">{values.startTime || '—'} – {values.endTime || '—'}</span>
        </div>
      )}

      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}
