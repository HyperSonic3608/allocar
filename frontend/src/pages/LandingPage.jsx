import { LandingHeader, Logo } from '../components/layout/Header.jsx'
import Button, { TextLink } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/Feedback.jsx'
import { Metadata } from '../components/ui/Card.jsx'
import Icon from '../components/ui/Icon.jsx'
import VehicleCard, { VehicleImage } from '../components/rental/VehicleCard.jsx'
import { vehicles } from '../data/demo.js'

const steps = [
  [
    '01 · Crie sua conta',
    'Cadastre seus dados e mantenha suas informações atualizadas para a análise do pedido.',
    'Seu acesso ao AlloCar',
    'Criar conta',
    '/cadastro',
  ],
  [
    '02 · Escolha seu carro',
    'Informe o veículo e o período desejados. Seu pedido segue para avaliação financeira.',
    'Solicitação pela internet',
    'Acessar pedidos',
    '/entrar',
  ],
  [
    '03 · Acompanhe o pedido',
    'Consulte o status, revise informações e acompanhe a formalização do contrato após aprovação.',
    'Clareza até o contrato',
    'Entrar na minha conta',
    '/entrar',
  ],
]
const questions = [
  [
    'Preciso criar uma conta para solicitar um carro?',
    'Sim. O AlloCar exige cadastro prévio e acesso com usuário e senha para criar e acompanhar pedidos.',
    'Seus pedidos ficam vinculados à sua conta.',
  ],
  [
    'Quando o meu contrato é liberado?',
    'Após o agente analisar financeiramente o pedido e emitir parecer positivo para a versão atual.',
    'Pedido aprovado e contrato em execução são etapas diferentes.',
  ],
  [
    'Posso alterar ou cancelar um pedido?',
    'Você pode revisar ou cancelar a solicitação antes da execução do contrato, conforme o estado do pedido.',
    'Alterar o pedido exige uma nova análise financeira.',
  ],
]

export default function LandingPage() {
  return (
    <div className="landing" id="inicio" data-figma-id="77:2376" data-figma-mobile-id="77:2377">
      <LandingHeader />
      <main id="conteudo">
        <section className="landing-intro">
          <div className="landing-hero">
            <div className="landing-hero__copy">
              <p className="landing-eyebrow landing-eyebrow--lime">
                ALUGUEL DE CARROS, COM CLAREZA
              </p>
              <h1>
                Seu próximo
                <br className="desktop-break" /> caminho
                <span className="mobile-break">
                  <br />
                </span>
                <span className="desktop-break"> </span>começa
                <br className="desktop-break" /> aqui.
              </h1>
              <p>
                Escolha seu carro, envie seu pedido e acompanhe cada etapa até o contrato. Tudo em
                um só lugar.
              </p>
              <div className="landing-hero__actions">
                <Button to="/entrar">Começar meu pedido</Button>
                <Button className="hero-create-account" variant="inverse" to="/cadastro">
                  Criar minha conta
                </Button>
              </div>
              <p className="small">
                Você acompanha o pedido. A contratação vem após a análise financeira.
              </p>
            </div>
            <div className="landing-hero__visual">
              <VehicleImage vehicle={vehicles[0]} className="landing-hero__image" />
              <div className="landing-hero__summary">
                <p>
                  Um caminho simples,
                  <br />
                  do pedido ao contrato.
                </p>
                <Metadata
                  title="Acompanhe cada etapa"
                  items={[
                    ['Pedido', 'Pela internet'],
                    ['Análise', 'Por um agente'],
                    ['Contrato', 'Após aprovação'],
                    ['Crédito', 'Opcional'],
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="landing-section landing-section--white" id="como-funciona">
          <div className="landing-section__inner">
            <p className="landing-eyebrow">SIMPLES EM CADA ETAPA</p>
            <h2>
              Seu aluguel,
              <br />
              com o próximo passo claro.
            </h2>
            <div className="landing-steps">
              {steps.map(([title, description, badge, action, to]) => (
                <article className="landing-step" key={title}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <Badge tone="success">{badge}</Badge>
                  <Button to={to} variant="secondary" icon="navigation">
                    {action}
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="landing-section" id="categorias">
          <div className="landing-section__inner">
            <p className="landing-eyebrow">UM CARRO PARA CADA PLANO</p>
            <h2>Qual é o seu próximo destino?</h2>
            <p className="landing-section__description">
              Conheça exemplos de categorias. Cadastre-se para iniciar seu pedido e consultar as
              condições do aluguel.
            </p>
            <div className="landing-vehicles">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} landing />
              ))}
            </div>
          </div>
        </section>
        <section className="landing-section landing-section--white" id="duvidas">
          <div className="landing-section__inner">
            <p className="landing-eyebrow">ANTES DE PEGAR A ESTRADA</p>
            <h2>Dúvidas? Vamos por partes.</h2>
            <div className="landing-faq">
              {questions.map(([question, answer, note]) => (
                <details key={question} open>
                  <summary>
                    {question}
                    <Icon name="chevronUp" size={18} />
                  </summary>
                  <p>{answer}</p>
                  <small>{note}</small>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="landing-section landing-invitation">
          <div className="landing-cta">
            <Logo dark width={144} />
            <h2>
              Seu próximo caminho
              <br />
              pode começar agora.
            </h2>
            <p>
              Crie sua conta e acompanhe seu aluguel com clareza, do primeiro pedido ao contrato.
            </p>
            <Button to="/cadastro">Quero criar minha conta</Button>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <div>
          <Logo width={112} />
          <p>AlloCar · Seu caminho, sem complicação.</p>
          <TextLink to="/#inicio">Voltar ao início</TextLink>
        </div>
      </footer>
    </div>
  )
}
