import { useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useApp } from '../../state/app-context.js'
import useMutation from '../../state/useMutation.js'
import { ErrorMessage } from '../ui/ResourceState.jsx'
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
  const { account, logout: endSession } = useApp()
  const exit = useMutation()
  const navigate = useNavigate()
  const { pathname, hash } = useLocation()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const menuButton = useRef(null)
  const area = accountArea(kind, account?.tipo)
  const publicPage = area === 'public' || area === 'landing'
  const links =
    area === 'landing'
      ? landingLinks
      : area === 'agent'
        ? agentLinks.filter(([, path]) => path !== '/agente/creditos' || account?.tipo === 'BANCO')
        : clientLinks
  const name = account?.nome?.split(' ')[0] || ''
  function closeMenu() {
    setOpen(false)
  }
  async function logout() {
    await exit.run(async () => {
      await endSession()
      closeMenu()
      navigate('/entrar', { replace: true })
    })
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
              to={path}
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
            to={account ? (account.tipo === 'CLIENTE' ? '/pedidos' : '/agente') : '/entrar'}
            variant="secondary"
            icon="userButton"
            className="header-account"
            onClick={closeMenu}
          >
            {account ? 'Minha conta' : 'Entrar na conta'}
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="header-account"
            disabled={exit.pending}
            onClick={logout}
          >
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
      {exit.error && (
        <div className="header-error">
          <ErrorMessage error={exit.error} />
        </div>
      )}
    </header>
  )
}

export function LandingHeader() {
  return <Header kind="landing" />
}
