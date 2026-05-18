export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

