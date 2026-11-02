import { useId, useRef, useState } from 'react'
import Icon from './Icon.jsx'

export default function Field({
  label,
  helper,
  error,
  icon = 'user',
  type = 'text',
  className = '',
  name,
  ...props
}) {
  const id = useId()
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const password = type === 'password'
  const inputType = password && visible ? 'text' : type
  const fieldIcon = password ? 'eye' : icon === null ? null : type === 'date' ? 'calendar' : icon
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className="field__control">
        {fieldIcon &&
          (password ? (
            <button
              className="field__icon-button"
              type="button"
              aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setVisible(!visible)}
            >
              <Icon name="eye" />
            </button>
          ) : (
            <Icon name={fieldIcon} />
          ))}
        <input
          ref={ref}
          id={id}
          name={name}
          type={inputType}
          aria-describedby={helper || error ? `${id}-help` : undefined}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </div>
      {(helper || error) && (
        <small id={`${id}-help`} className="field__helper">
          {error || helper}
        </small>
      )}
    </div>
  )
}

export function SelectField({ label, helper, name, children, ...props }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="field__control">
        <Icon name="user" />
        <select id={id} name={name} {...props}>
          {children}
        </select>
        <Icon name="decision" />
      </div>
      {helper && <small className="field__helper">{helper}</small>}
    </div>
  )
}

export function TextAreaField({ label, helper, ...props }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} aria-describedby={helper ? `${id}-help` : undefined} {...props} />
      {helper && (
        <small id={`${id}-help`} className="field__helper">
          {helper}
        </small>
      )}
    </div>
  )
}
