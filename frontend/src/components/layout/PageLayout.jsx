import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ProgressSteps from '../rental/ProgressSteps.jsx'
import { journey } from '../../data/rental.js'

export default function PageLayout({
  children,
  kind = 'client',
  progress,
  className = '',
  figmaId,
}) {
  return (
    <div className={`app-page ${className}`} data-figma-id={figmaId}>
      <Header kind={kind} />
      <main id="conteudo" className="page-content">
        {progress && <ProgressSteps {...progress} />}
        {children}
      </main>
      <Footer publicPage={kind === 'public'} />
    </div>
  )
}

export function Columns({ children, className = '' }) {
  return <div className={`columns ${className}`}>{children}</div>
}
export function Stack({ children, className = '' }) {
  return <div className={`stack ${className}`}>{children}</div>
}
export function ActionRow({ children, className = '' }) {
  return <div className={`action-row ${className}`}>{children}</div>
}

export function StepsList({ items = journey, active = -1, className = '' }) {
  return (
    <ol className={`steps-list ${className}`}>
      {items.map(([title, description], index) => (
        <li key={title}>
          <span
            className={`step-number ${active < 0 || active === index ? 'step-number--active' : ''}`}
          >
            {index + 1}
          </span>
          <div>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function SidePanel({
  title = 'Próximos passos',
  description,
  children,
  steps,
  className = '',
}) {
  return (
    <aside className={`side-panel ${className}`}>
      {title && <h2>{title}</h2>}
      {description && <p className="muted">{description}</p>}
      {steps && <StepsList items={steps} />}
      {children}
    </aside>
  )
}
