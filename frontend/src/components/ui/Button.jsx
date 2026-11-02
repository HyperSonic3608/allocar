import { Link } from 'react-router'
import Icon from './Icon.jsx'

export default function Button({
  children,
  to,
  href,
  variant = 'primary',
  icon,
  iconAfter,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = `button button--${variant} ${className}`
  const content = (
    <>
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
      {iconAfter && <Icon name={iconAfter} size={18} />}
    </>
  )
  if (to)
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  if (href)
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    )
  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  )
}

export function TextLink({ children, to, onClick, className = '', iconAfter }) {
  const content = (
    <>
      {children}
      {iconAfter && <Icon name={iconAfter} size={18} />}
    </>
  )
  return to ? (
    <Link className={`text-link ${className}`} to={to}>
      {content}
    </Link>
  ) : (
    <button className={`text-link ${className}`} type="button" onClick={onClick}>
      {content}
    </button>
  )
}
