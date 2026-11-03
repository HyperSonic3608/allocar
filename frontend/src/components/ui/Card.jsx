export default function Card({ children, className = '', as: Component = 'section', ...props }) {
  return (
    <Component className={`card ${className}`} {...props}>
      {children}
    </Component>
  )
}

export function Metadata({ title, items, className = '' }) {
  return (
    <section className={`metadata ${className}`}>
      {title && <h3>{title}</h3>}
      <dl>
        {items.map(([label, value]) => (
          <div className="metadata__row" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function PageHeading({ title, eyebrow, className = '', as: Heading = 'h1' }) {
  return (
    <div className={`page-heading ${eyebrow ? 'page-heading--journey' : ''} ${className}`}>
      <Heading>{title}</Heading>
    </div>
  )
}
