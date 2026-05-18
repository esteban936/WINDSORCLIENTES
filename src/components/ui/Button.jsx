export function Button({ variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-ink text-white hover:bg-charcoal',
    secondary: 'border border-neutral-300 bg-white text-ink hover:border-champagne',
    ghost: 'text-ink hover:bg-neutral-100',
    gold: 'bg-champagne text-ink hover:bg-[#d2b987]',
    danger: 'bg-red-700 text-white hover:bg-red-800',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

