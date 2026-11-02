import { useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { usePrototype } from '../../state/prototype-store.js'
import logoLight from '../../assets/brand/logo-light.svg'
import logoDark from '../../assets/brand/logo-dark.svg'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import { accountArea, activeLink, agentLinks, clientLinks, landingLinks } from './navigation.js'

export function Logo({ dark = false, width = 118, className = '' }) {
  return (
    <img
      className={`logo ${className}`}
      src={dark ? logoDark : logoLight}
      width={width}
      height={(width * 250) / 572}
      alt="AlloCar"
    />
  )
}

export default function Header({ kind = 'client' }) {
  const { state, dispatch } = usePrototype()
  const navigate = useNavigate()
  const { pathname, hash } = useLocation()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const menuButton = useRef(null)
  const area = accountArea(kind, state.profile)
  const publicPage = area === 'public' || area === 'landing'
  const links = area === 'landing' ? landingLinks : area === 'agent' ? agentLinks : clientLinks
  const name = area === 'agent' ? 'Hyper' : state.customer.name.split(' ')[0]
  function closeMenu() {
    setOpen(false)
  }
  function logout() {
    closeMenu()
    dispatch({ type: 'LOGOUT' })
    navigate('/entrar')
  }
  return (
    <header
      className={`site-header ${open ? 'site-header--open' : ''}`}
      data-area={area}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          closeMenu()
          menuButton.current?.focus()
        }
      }}
    >
      <div className="site-header__inner">
        <Link
          className="logo-link"
          to="/"
          aria-label="AlloCar · página inicial"
          onClick={closeMenu}
        >
          <Logo />
        </Link>
        <nav id={menuId} className="site-nav" aria-label="Navegação principal">
          {links.map(([label, path]) => (
            <Link
              key={path}
              className="site-nav__link"
              to={area === 'public' ? '/entrar' : path}
              aria-current={
                area !== 'public' && activeLink(path, pathname, hash) ? 'page' : undefined
              }
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
        </nav>
        {publicPage ? (
          <Button
            to="/entrar"
            variant="secondary"
            icon="userButton"
            className="header-account"
            onClick={closeMenu}
          >
            Entrar na conta
          </Button>
        ) : (
          <Button variant="secondary" className="header-account" onClick={logout}>
            Sair · {name}
          </Button>
        )}
        <button
          ref={menuButton}
          type="button"
          className="icon-button header-menu"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen(!open)}
        >
          <Icon name="menu" />
        </button>
      </div>
    </header>
  )
}

export function LandingHeader() {
  return <Header kind="landing" />
}
