import Segmented from './Segmented';

export default function FilterChips({ options, value, onChange, label, className }) {
  return (
    <Segmented
      options={options}
      value={value}
      onChange={onChange}
      ariaLabel={label}
      className={className}
    />
  );
}
