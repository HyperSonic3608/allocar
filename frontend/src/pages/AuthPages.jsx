import { useState } from 'react'
import { useNavigate } from 'react-router'
import PageLayout, {
  ActionRow,
  Columns,
  SidePanel,
  StepsList,
} from '../components/layout/PageLayout.jsx'
import Card, { PageHeading } from '../components/ui/Card.jsx'
import Button, { TextLink } from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import { Alert, Badge, Note } from '../components/ui/Feedback.jsx'
import Icon from '../components/ui/Icon.jsx'
import { usePrototype } from '../state/prototype-store.js'

function AccessIntro() {
  return (
    <aside className="access-intro">
      <div className="landing-step__icon">
        <Icon name="pin" />
      </div>
      <h2>Seu próximo caminho começa aqui.</h2>
      <p>
        Solicite seu carro, acompanhe cada etapa da análise e encontre seus contratos em um só
        lugar.
      </p>
      <Badge tone="success">Tudo em um só lugar</Badge>
      <Button to="/" variant="secondary" icon="navigation">
        Conhecer a AlloCar
      </Button>
    </aside>
  )
}

export function LoginPage({ error = false }) {
  const { dispatch } = usePrototype()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('ana.silva')
  const [senha, setSenha] = useState('allocar2026')
  function enter(profile) {
    if (!usuario.trim() || !senha.trim()) {
      navigate('/entrar/erro')
      return
    }
    dispatch({ type: 'LOGIN', profile })
    navigate(profile === 'CLIENTE' ? '/pedidos' : '/agente')
  }
  return (
    <PageLayout
      kind="public"
      className={`access-page ${error ? 'access-page--error' : ''}`}
      figmaId={error ? '4:1595' : '4:1017'}
    >
      <div className="access-layout">
        <AccessIntro />
        <Card
          className="access-form"
          as="form"
          onSubmit={(event) => {
            event.preventDefault()
            enter('CLIENTE')
          }}
        >
          <PageHeading
            title={error ? 'Não foi possível entrar' : 'Acesse sua conta'}
            description={
              error
                ? 'Confira o usuário e a senha e tente novamente.'
                : 'Use seu usuário e senha para acompanhar pedidos, contratos e documentos da sua reserva.'
            }
          />
          <div className="stack stack--tight">
            <Field
              label="Usuário"
              helper="Informe seu usuário de acesso."
              name="usuario"
              autoComplete="username"
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              required
            />
            <Field
              label="Senha"
              helper={error ? 'Informe sua senha de acesso.' : 'Digite sua senha de acesso.'}
              name="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
          </div>
          {error && (
            <Alert tone="error" icon="loginError" title="Usuário ou senha inválidos.">
              Verifique se o usuário e a senha estão corretos e tente novamente.
            </Alert>
          )}
          <ActionRow className="access-actions">
            <Button type="submit">{error ? 'Tentar novamente' : 'Entrar como cliente'}</Button>
            <Button variant="secondary" icon="userButton" onClick={() => enter('BANCO')}>
              Entrar como agente
            </Button>
            {!error && (
              <Button variant="secondary" to="/entrar/erro">
                Simular credenciais inválidas
              </Button>
            )}
          </ActionRow>
          <Note title="Acesso protegido">
            Cliente, empresa e banco acessam com usuário e senha. Seu perfil determina as ações
            disponíveis na conta.
          </Note>
          {error ? (
            <Card className="create-account-card">
              <TextLink className="text-link--accent" to="/cadastro" iconAfter="arrowUpRight">
                Criar conta
              </TextLink>
              <small>Ainda não tem conta? Cadastre-se como cliente.</small>
            </Card>
          ) : (
            <TextLink className="text-link--accent" to="/cadastro" iconAfter="arrowUpRight">
              Criar conta
            </TextLink>
          )}
        </Card>
      </div>
    </PageLayout>
  )
}

export function RegisterPage() {
  const { dispatch } = usePrototype()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    if (values.senha !== values.confirmarSenha) {
      setError('As senhas precisam ser iguais.')
      return
    }
    dispatch({ type: 'LOGIN', profile: 'CLIENTE' })
    navigate('/meu-cadastro')
  }
  return (
    <PageLayout kind="public" figmaId="4:1071">
      <Columns>
        <Card className="card--form" as="form" onSubmit={submit}>
          <PageHeading
            title="Crie sua conta"
            description="Preencha seus dados para acessar pedidos, contratos e documentos da sua reserva."
          />
          <div className="field-grid">
            <Field
              label="Nome completo"
              name="nome"
              defaultValue="Ana Silva"
              helper="Informe seu nome completo."
              autoComplete="name"
              required
            />
            <Field
              label="CPF"
              name="cpf"
              defaultValue="000.000.000-00"
              helper="Informe seu CPF."
              required
            />
            <Field
              label="RG"
              name="rg"
              defaultValue="00.000.000-0"
              helper="Informe seu RG."
              required
            />
            <Field
              label="Usuário"
              name="usuario"
              defaultValue="ana.silva"
              helper="Nome de usuário para acessar sua conta."
              autoComplete="username"
              required
            />
            <Field
              label="Senha"
              name="senha"
              type="password"
              defaultValue="allocar2026"
              helper="Defina sua senha de acesso."
              autoComplete="new-password"
              required
            />
            <Field
              label="Confirmar senha"
              name="confirmarSenha"
              type="password"
              defaultValue="allocar2026"
              helper="Repita a senha informada acima."
              autoComplete="new-password"
              required
              error={error}
            />
          </div>
          <ActionRow>
            <Button type="submit">Criar conta</Button>
            <Button variant="secondary" to="/entrar">
              Voltar
            </Button>
          </ActionRow>
          <Note title="Regra institucional">
            Empresa ou banco exige nome, CNPJ, endereço e credenciais. Perfil institucional sujeito
            à validação.
          </Note>
          <TextLink to="/cadastro/instituicao">Cadastrar empresa ou banco</TextLink>
        </Card>
        <SidePanel description="Após o cadastro, você acessa seu perfil, acompanha pedidos e segue o fluxo até a contratação.">
          <StepsList />
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}

export function InstitutionalRegisterPage() {
  const [type, setType] = useState('Empresa')
  const { dispatch } = usePrototype()
  const navigate = useNavigate()
  return (
    <PageLayout kind="public" figmaId="92:2707" className="expanded-page" footer={null}>
      <PageHeading
        className="page-heading--spaced"
        title="Sua instituição na AlloCar."
        description="Cadastre a empresa ou o banco para atuar na análise e gestão dos aluguéis."
      />
      <Columns>
        <Card
          as="form"
          onSubmit={(event) => {
            event.preventDefault()
            dispatch({ type: 'TOAST', message: 'Cadastro institucional recebido para validação.' })
            navigate('/entrar')
          }}
        >
          <div className="field-grid">
            <Field
              label="Nome / razão social"
              name="nome"
              defaultValue="Hyper Locadora"
              icon={null}
              required
            />
            <Field
              label="CNPJ"
              name="cnpj"
              defaultValue="12.345.678/0001-90"
              icon={null}
              required
            />
          </div>
          <Field
            label="Endereço"
            name="endereco"
            defaultValue="Rua das Flores, 120 · São Paulo / SP"
            icon={null}
            required
          />
          <div className="type-selector" role="group" aria-label="Selecionar tipo de agente">
            <Button
              variant="secondary"
              aria-pressed={type === 'Empresa'}
              onClick={() => setType('Empresa')}
            >
              Empresa
            </Button>
            <Button
              variant="secondary"
              aria-pressed={type === 'Banco'}
              onClick={() => setType('Banco')}
            >
              Banco
            </Button>
          </div>
          <Field
            label="Tipo de agente"
            value={type}
            readOnly
            icon={null}
            helper="Empresas e bancos realizam análise; somente o banco concede crédito."
          />
          <div className="field-grid">
            <Field
              label="Usuário"
              name="usuario"
              defaultValue="hyper.agente"
              icon={null}
              autoComplete="username"
              required
            />
            <Field
              label="Senha"
              name="senha"
              type="password"
              defaultValue="allocar2026"
              autoComplete="new-password"
              required
            />
          </div>
          <Button type="submit" className="institution-submit">
            Concluir cadastro
          </Button>
        </Card>
        <SidePanel title="Empresa ou banco" className="side-panel--spaced">
          <p>
            Os agentes podem modificar pedidos e emitir parecer financeiro. Bancos também concedem
            crédito opcional vinculado ao aluguel.
          </p>
          <Button variant="secondary" to="/entrar">
            Já tenho cadastro
          </Button>
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}
