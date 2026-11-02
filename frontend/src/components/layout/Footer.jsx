import { usePrototype } from '../../state/prototype-store.js'
import { TextLink } from '../ui/Button.jsx'
import { Logo } from './Header.jsx'

export default function Footer({ publicPage = false, landing = false }) {
  const { dispatch } = usePrototype()
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Logo width={112} />
        <p>AlloCar · Aluguel com clareza em cada etapa</p>
        <nav aria-label="Ajuda e documentos">
          <TextLink onClick={() => dispatch({ type: 'MODAL', name: 'ajuda' })}>Ajuda</TextLink>
          {!publicPage && (
            <TextLink onClick={() => dispatch({ type: 'MODAL', name: 'documentos' })}>
              Documentos
            </TextLink>
          )}
          {landing && <TextLink to="/#inicio">Voltar ao início</TextLink>}
        </nav>
      </div>
    </footer>
  )
}
