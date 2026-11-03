import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import PageLayout, {
  ActionRow,
  Columns,
  SidePanel,
  StepsList,
} from '../components/layout/PageLayout.jsx'
import Card, { PageHeading } from '../components/ui/Card.jsx'
import Button, { TextLink } from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import AddressFields from '../components/ui/AddressFields.jsx'
import { Badge, Note } from '../components/ui/Feedback.jsx'
import { ErrorMessage } from '../components/ui/ResourceState.jsx'
import Icon from '../components/ui/Icon.jsx'
import { useApp } from '../state/app-context.js'
import useMutation from '../state/useMutation.js'
import { api } from '../api/client.js'
import { emptyAddress } from '../data/rental.js'

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

export function LoginPage() {
  const { login } = useApp()
  const mutation = useMutation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  async function submit(event) {
    event.preventDefault()
    await mutation.run(async () => {
      const account = await login({ usuario, senha })
      const destination = params.get('destino')
      navigate(
        destination?.startsWith('/') &&
          !destination.startsWith('//') &&
          !destination.startsWith('/entrar')
          ? destination
          : account.tipo === 'CLIENTE'
            ? '/pedidos'
            : '/agente',
        { replace: true },
      )
    })
  }
  return (
    <PageLayout
      kind="public"
      className="access-page"
      figmaId={mutation.error ? '4:1595' : '4:1017'}
    >
      <div className="access-layout">
        <AccessIntro />
        <Card className="access-form" as="form" onSubmit={submit}>
          <PageHeading
            title={mutation.error ? 'Não foi possível entrar' : 'Acesse sua conta'}
            description="Entre com seu usuário e senha. As ações disponíveis dependem do perfil da sua conta."
          />
          <div className="stack stack--tight">
            <Field
              label="Usuário"
              name="usuario"
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              autoComplete="username"
              helper="Informe seu usuário de acesso."
              required
              maxLength={120}
            />
            <Field
              label="Senha"
              name="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete="current-password"
              helper="Digite sua senha de acesso."
              required
              maxLength={256}
            />
          </div>
          <ErrorMessage error={mutation.error} />
          <ActionRow className="access-actions">
            <Button type="submit" disabled={mutation.pending}>
              {mutation.pending ? 'Entrando…' : 'Entrar'}
            </Button>
            <Button to="/" variant="secondary">
              Voltar ao início
            </Button>
          </ActionRow>
          <TextLink className="text-link--accent" to="/cadastro" iconAfter="arrowUpRight">
            Criar conta
          </TextLink>
        </Card>
      </div>
    </PageLayout>
  )
}

export function RegisterPage() {
  const { login, notify } = useApp()
  const navigate = useNavigate()
  const mutation = useMutation()
  const [address, setAddress] = useState(emptyAddress)
  const [confirmationError, setConfirmationError] = useState('')
  async function submit(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    if (values.senha !== values.confirmarSenha) {
      setConfirmationError('As senhas precisam ser iguais.')
      return
    }
    setConfirmationError('')
    await mutation.run(async () => {
      await api.registerClient({
        usuario: values.usuario,
        senha: values.senha,
        nome: values.nome,
        rg: values.rg,
        cpf: values.cpf,
        profissao: values.profissao,
        endereco: address,
        vinculos: [],
      })
      notify('Conta criada. Informe seus vínculos e rendimentos no cadastro.')
      try {
        await login({ usuario: values.usuario, senha: values.senha })
      } catch {
        navigate('/entrar', { replace: true })
        notify('Conta criada. Entre com suas credenciais para continuar.')
        return
      }
      navigate('/meu-cadastro', { replace: true })
    })
  }
  return (
    <PageLayout kind="public" figmaId="4:1071">
      <Columns>
        <Card as="form" className="card--form" onSubmit={submit}>
          <PageHeading
            title="Crie sua conta"
            description="Preencha sua identificação e endereço para solicitar e acompanhar aluguéis."
          />
          <div className="field-grid">
            <Field
              label="Nome completo"
              name="nome"
              autoComplete="name"
              required
              maxLength={160}
              error={mutation.error?.campos.nome}
            />
            <Field
              label="CPF"
              name="cpf"
              required
              maxLength={30}
              error={mutation.error?.campos.cpf}
            />
            <Field label="RG" name="rg" required maxLength={30} error={mutation.error?.campos.rg} />
            <Field label="Profissão" name="profissao" required maxLength={120} />
            <Field
              label="Usuário"
              name="usuario"
              autoComplete="username"
              minLength={3}
              maxLength={120}
              pattern="[a-zA-Z0-9._-]+"
              required
              helper="Letras, números, ponto, sublinhado ou hífen."
              error={mutation.error?.campos.usuario}
            />
            <Field
              label="Senha"
              name="senha"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={256}
              required
              helper="Use pelo menos 12 caracteres."
            />
            <Field
              label="Confirmar senha"
              name="confirmarSenha"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={256}
              required
              error={confirmationError}
            />
          </div>
          <Note title="Endereço">
            <AddressFields value={address} onChange={setAddress} errors={mutation.error?.campos} />
          </Note>
          <ErrorMessage error={mutation.error} />
          <ActionRow>
            <Button type="submit" disabled={mutation.pending}>
              {mutation.pending ? 'Criando conta…' : 'Criar conta'}
            </Button>
            <Button variant="secondary" to="/entrar">
              Voltar
            </Button>
          </ActionRow>
          <Note title="Emprego e renda">
            Após entrar, você pode registrar até três vínculos empregatícios e seus rendimentos.
          </Note>
          <TextLink to="/cadastro/instituicao">Cadastrar empresa ou banco</TextLink>
        </Card>
        <SidePanel description="Mantenha seus dados atualizados e acompanhe o pedido até a contratação.">
          <StepsList />
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}

export function InstitutionalRegisterPage() {
  const [type, setType] = useState('EMPRESA')
  const [address, setAddress] = useState(emptyAddress)
  const [created, setCreated] = useState(null)
  const mutation = useMutation()
  async function submit(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    await mutation.run(async () =>
      setCreated(
        await api.registerAgent({
          nome: values.nome,
          cnpj: values.cnpj,
          usuario: values.usuario,
          senha: values.senha,
          tipo: type,
          endereco: address,
        }),
      ),
    )
  }
  return (
    <PageLayout kind="public" figmaId="92:2707">
      <PageHeading
        title="Sua instituição na AlloCar."
        description="Cadastre a empresa ou o banco para atuar na análise e gestão dos aluguéis."
      />
      {created ? (
        <Card>
          <PageHeading
            title="Cadastro institucional recebido"
            description={`${created.usuario} · ${created.tipo === 'BANCO' ? 'Banco' : 'Empresa'}`}
          />
          <Note title="Validação necessária">
            Sua instituição foi cadastrada e aguarda validação administrativa. O acesso será
            liberado após essa validação.
          </Note>
          <Button to="/entrar" className="institution-submit">
            Ir para o acesso
          </Button>
        </Card>
      ) : (
        <Columns>
          <Card as="form" onSubmit={submit}>
            <div className="field-grid">
              <Field label="Nome / razão social" name="nome" required maxLength={160} />
              <Field label="CNPJ" name="cnpj" required maxLength={30} />
            </div>
            <AddressFields value={address} onChange={setAddress} errors={mutation.error?.campos} />
            <div className="type-selector" role="group" aria-label="Selecionar tipo de agente">
              {[
                ['EMPRESA', 'Empresa'],
                ['BANCO', 'Banco'],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  variant="secondary"
                  aria-pressed={type === value}
                  onClick={() => setType(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="field-grid">
              <Field
                label="Usuário"
                name="usuario"
                autoComplete="username"
                required
                minLength={3}
                maxLength={120}
                pattern="[a-zA-Z0-9._-]+"
              />
              <Field
                label="Senha"
                type="password"
                name="senha"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={256}
                helper="Use pelo menos 12 caracteres."
              />
            </div>
            <ErrorMessage error={mutation.error} />
            <Button className="institution-submit" type="submit" disabled={mutation.pending}>
              {mutation.pending ? 'Enviando cadastro…' : 'Concluir cadastro'}
            </Button>
          </Card>
          <SidePanel title="Empresa ou banco">
            <p>
              Agentes analisam e modificam pedidos de seu escopo. Somente bancos concedem e associam
              crédito.
            </p>
            <Note title="Ativação institucional">
              O cadastro não permite ativar a própria conta. Aguarde a validação administrativa.
            </Note>
            <Button variant="secondary" to="/entrar">
              Já tenho cadastro
            </Button>
          </SidePanel>
        </Columns>
      )}
    </PageLayout>
  )
}
