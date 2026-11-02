import Icon from './Icon.jsx'

export function Badge({ children, tone = 'neutral', outlined = false }) {
  const dot = tone === 'success' ? 'dotSuccess' : tone === 'warning' ? 'dotWarning' : 'dot'
  return (
    <span className={`badge badge--${tone} ${outlined ? 'badge--outlined' : ''}`}>
      <Icon name={dot} size={outlined ? 8 : 6} />
      {children}
    </span>
  )
}

export function Alert({ children, title, tone = 'info', icon, className = '' }) {
  return (
    <div className={`alert alert--${tone} ${className}`} role={tone === 'error' ? 'alert' : 'note'}>
      <div className="alert__title">
        <Icon
          name={icon || (tone === 'error' ? 'error' : tone === 'warning' ? 'warning' : 'info')}
        />
        {title}
      </div>
      {children && <div className="alert__body">{children}</div>}
    </div>
  )
}

export function Note({ title, children, className = '' }) {
  return (
    <section className={`note ${className}`}>
      {title && <h3>{title}</h3>}
      {children && <div className="note__body">{children}</div>}
    </section>
  )
}
