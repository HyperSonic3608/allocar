import { NavLink, useNavigate } from 'react-router'
import { usePrototype } from '../../state/prototype-store.js'
import logoLight from '../../assets/brand/logo-light.svg'
import logoDark from '../../assets/brand/logo-dark.svg'
import Button from '../ui/Button.jsx'

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
  const { dispatch } = usePrototype()
  const navigate = useNavigate()
  const agent = kind === 'agent'
  const publicPage = kind === 'public'
  const links = agent
    ? [
        ['Central de pedidos', '/agente'],
        ['Histórico', '/agente/historico'],
        ['Contratos', '/contratos'],
        ['Créditos', '/agente/creditos'],
      ]
    : [
        ['Buscar veículos', '/veiculos'],
        ['Meus pedidos', '/pedidos'],
        ['Meus contratos', '/contratos'],
        ['Meu cadastro', '/meu-cadastro'],
      ]
  return (
    <header className={`site-header ${agent ? 'site-header--agent' : ''}`}>
      <div className="site-header__inner">
        <NavLink className="logo-link" to="/" aria-label="AlloCar · página inicial">
          <Logo />
        </NavLink>
        <nav className="site-nav" aria-label="Navegação principal">
          {links.map(([label, path]) => (
            <NavLink key={path} to={publicPage ? '/entrar' : path}>
              {label}
            </NavLink>
          ))}
        </nav>
        {publicPage ? (
          <Button to="/entrar" variant="secondary" className="header-account">
            Entrar na conta
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="header-account"
            onClick={() => {
              dispatch({ type: 'LOGOUT' })
              navigate('/entrar')
            }}
          >
            Sair · {agent ? 'Hyper' : 'Ana'}
          </Button>
        )}
      </div>
    </header>
  )
}

export function LandingHeader() {
  return (
    <header className="landing-header">
      <div className="landing-header__inner">
        <NavLink to="/" aria-label="AlloCar · início">
          <Logo width={132} />
        </NavLink>
        <nav aria-label="Navegação da página inicial">
          <a href="#como-funciona">Como funciona</a>
          <a href="#categorias">Categorias</a>
          <a href="#duvidas">Dúvidas</a>
          <Button variant="secondary" to="/entrar">
            Entrar
          </Button>
        </nav>
      </div>
    </header>
  )
}
