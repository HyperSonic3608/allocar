import { useApp } from '../../state/app-context.js'
import { TextLink } from '../ui/Button.jsx'
import { Logo } from './Header.jsx'

export default function Footer({ publicPage = false, landing = false }) {
  const { setModal } = useApp()
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Logo width={112} />
        <p>AlloCar · Aluguel com clareza em cada etapa</p>
        <nav aria-label="Ajuda e documentos">
          <TextLink onClick={() => setModal({ name: 'ajuda' })}>Ajuda</TextLink>
          {!publicPage && (
            <TextLink onClick={() => setModal({ name: 'documentos' })}>Documentos</TextLink>
          )}
          {landing && <TextLink to="/#inicio">Voltar ao início</TextLink>}
        </nav>
      </div>
    </footer>
  )
}
