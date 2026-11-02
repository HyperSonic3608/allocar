import { useNavigate } from 'react-router'
import PageLayout, {
  ActionRow,
  Columns,
  SidePanel,
  Stack,
  StepsList,
} from '../components/layout/PageLayout.jsx'
import Card, { Metadata, PageHeading } from '../components/ui/Card.jsx'
import Button, { TextLink } from '../components/ui/Button.jsx'
import Field, { SelectField } from '../components/ui/Field.jsx'
import { Alert, Badge, Note } from '../components/ui/Feedback.jsx'
import RentalSummary, { ProgressSteps } from '../components/rental/RentalSummary.jsx'
import { VehicleImage } from '../components/rental/VehicleCard.jsx'
import useRental from '../state/useRental.js'
import { vehicles, formatMoney, parseMoney } from '../data/demo.js'

const statusLabels = {
  EM_ANALISE: 'Em análise',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
  CANCELADO: 'Cancelado',
  EM_EXECUCAO: 'Em execução',
}

export function MyOrdersPage() {
  const { state, vehicle, period, dispatch } = useRental()
  const terminal = ['CANCELADO', 'EM_EXECUCAO'].includes(state.status)
  return (
    <PageLayout figmaId="4:1196">
      <Stack className="stack--tight">
        <PageHeading
          title="Meus pedidos"
          description="Acompanhe seus pedidos e o andamento da análise financeira."
        />
        <div className="metrics">
          <div>
            <strong>{state.status === 'EM_ANALISE' ? 1 : 0} pendente</strong>
            <p>Solicitações aguardando análise financeira.</p>
          </div>
          <div className="metric--success">
            <strong>
              {state.status === 'APROVADO' ? 2 : 1} aprovado{state.status === 'APROVADO' ? 's' : ''}
            </strong>
            <p>Pedidos com aprovação financeira concluída.</p>
          </div>
          <div>
            <strong>{state.executed ? 1 : 0} em execução</strong>
            <p>
              {state.executed
                ? 'Contrato em vigência neste momento.'
                : 'Nenhum contrato em vigência neste momento.'}
            </p>
          </div>
        </div>
        <ActionRow>
          <Button to="/veiculos">Novo pedido</Button>
          <Button to="/pedidos/AL-001" variant="secondary">
            Ver #AL-001
          </Button>
          <Button to="/meu-cadastro" variant="secondary">
            Meu perfil
          </Button>
        </ActionRow>
        <div className="orders-grid">
          <Card className="order-card">
            <div className="order-card__header">
              <div>
                <h2>#AL-001</h2>
                <p className="muted">
                  {state.status === 'EM_ANALISE'
                    ? 'Pedido aguardando análise financeira'
                    : `Pedido ${statusLabels[state.status].toLowerCase()}`}
                </p>
              </div>
              <Badge
                outlined
                tone={
                  state.status === 'APROVADO' || state.executed
                    ? 'success'
                    : state.status === 'CANCELADO' || state.status === 'REPROVADO'
                      ? 'error'
                      : 'warning'
                }
              >
                {statusLabels[state.status]}
              </Badge>
            </div>
            <div className="order-card__details">
              <Note>
                <p className="fact-label">Veículo</p>
                <strong>
                  {vehicle.name} {vehicle.year}
                </strong>
                <p>Automóvel do pedido #AL-001</p>
              </Note>
              <Note>
                <p className="fact-label">Período</p>
                <strong>{period}</strong>
                <p>Período solicitado · sujeito à análise</p>
              </Note>
            </div>
            <ActionRow>
              <Button
                to={state.status === 'CANCELADO' ? '/pedidos/AL-001/cancelado' : '/pedidos/AL-001'}
                variant="secondary"
              >
                Ver pedido
              </Button>
              <Button
                to={terminal ? '/contratos/CT-001' : '/pedidos/AL-001/alterar'}
                variant="secondary"
              >
                {terminal ? 'Consultar registro' : 'Editar pedido'}
              </Button>
            </ActionRow>
          </Card>
          <Card className="order-card">
            <div className="order-card__header">
              <div>
                <h2>#AL-002</h2>
                <p className="muted">Aprovação financeira da versão atual</p>
              </div>
              <Badge outlined tone="success">
                Aprovado
              </Badge>
            </div>
            <div className="order-card__details">
              <Note>
                <p className="fact-label">Veículo</p>
                <strong>Volkswagen Polo 2025</strong>
                <p>Automóvel do pedido #AL-002</p>
              </Note>
              <Note>
                <p className="fact-label">Período</p>
                <strong>18/12/2026 a 20/12/2026</strong>
                <p>Aprovado não significa em execução.</p>
              </Note>
            </div>
            <ActionRow>
              <Button
                variant="secondary"
                onClick={() => dispatch({ type: 'MODAL', name: 'pedido-aprovado' })}
              >
                Ver pedido
              </Button>
              <Button
                variant="secondary"
                onClick={() => dispatch({ type: 'MODAL', name: 'pedido-aprovado' })}
              >
                Ver aprovação
              </Button>
            </ActionRow>
          </Card>
        </div>
      </Stack>
    </PageLayout>
  )
}

export function OrderFormPage({ editing = false }) {
  const { state, vehicle, dispatch, price } = useRental()
  const navigate = useNavigate()
  function submit(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    if (data.end <= data.start) {
      event.currentTarget
        .querySelector('[name=end]')
        .setCustomValidity('O término deve ser posterior ao início.')
      event.currentTarget.reportValidity()
      return
    }
    dispatch({
      type: editing ? 'EDIT' : 'DRAFT',
      values: {
        start: data.start,
        end: data.end,
        contractType: data.contractType,
        vehicleId: data.vehicleId || state.vehicleId,
      },
    })
    navigate(editing ? '/pedidos/AL-001' : '/pedidos/revisao')
  }
  const steps = [
    ['Revisar pedido', 'Confira o veículo, o tipo de locação e as datas.'],
    ['Salvar e reenviar', 'O envio invalida qualquer aprovação anterior.'],
    ['Nova versão', 'Os dados alterados seguem para uma nova análise financeira.'],
    ['Análise financeira', 'Aguarde o parecer sobre a versão reenviada.'],
    ['Contrato', 'Disponível apenas após parecer financeiro positivo da versão atual.'],
  ]
  return (
    <PageLayout
      figmaId={editing ? '4:1326' : '4:1234'}
      footer={editing ? 'AlloCar · Área do cliente' : undefined}
    >
      {!editing && (
        <PageHeading
          title="Novo pedido de aluguel"
          description="Escolha o automóvel e o período desejado. Os dados cadastrais e a renda serão considerados na análise financeira."
        />
      )}
      <form onSubmit={submit} className="stack">
        <Columns className={editing ? '' : 'columns--tight'}>
          <Card>
            <div className="panel-heading panel-heading--large">
              <h1>{editing ? 'Alterar pedido #AL-001' : 'Resumo do pedido #AL-001'}</h1>
              <p>
                {editing
                  ? 'Ana Silva · Revise o pedido antes de enviar uma nova versão para análise financeira.'
                  : 'Pedido referência #AL-001 · vinculado ao fluxo de análise financeira.'}
              </p>
            </div>
            {editing ? (
              <div className="field-grid">
                <SelectField label="Automóvel" name="vehicleId" defaultValue={vehicle.id}>
                  {vehicles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {item.year} · {item.plate}
                    </option>
                  ))}
                </SelectField>
                <Field label="Matrícula" value={vehicle.registration} readOnly />
                <SelectField
                  label="Tipo de contrato"
                  name="contractType"
                  defaultValue={state.contractType}
                >
                  <option value="PADRAO">Locação padrão</option>
                  <option value="COM_CREDITO">Locação com crédito</option>
                </SelectField>
                <Field
                  label="Início"
                  name="start"
                  type="date"
                  defaultValue={state.start}
                  required
                />
                <Field
                  className="field-grid__full"
                  label="Término"
                  name="end"
                  type="date"
                  defaultValue={state.end}
                  onChange={(event) => event.target.setCustomValidity('')}
                  required
                />
              </div>
            ) : (
              <div className="field-grid field-grid--tight">
                <SelectField
                  label="Automóvel"
                  name="vehicleId"
                  defaultValue={vehicle.id}
                  helper="Veículo selecionado para o pedido #AL-001"
                >
                  {vehicles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {item.year} · {item.plate}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Tipo de contrato"
                  name="contractType"
                  defaultValue={state.contractType}
                  helper="Contrato padrão para análise financeira"
                >
                  <option value="PADRAO">Aluguel padrão</option>
                  <option value="COM_CREDITO">Aluguel com crédito</option>
                </SelectField>
                <Field
                  label="Início"
                  name="start"
                  type="date"
                  defaultValue={state.start}
                  required
                />
                <Field
                  label="Término"
                  name="end"
                  type="date"
                  defaultValue={state.end}
                  onChange={(event) => event.target.setCustomValidity('')}
                  required
                />
              </div>
            )}
            {editing ? (
              <>
                <Note title="Crédito opcional">
                  O banco concedente poderá associar crédito a esta locação. A associação é
                  opcional.
                </Note>
                <Note title="Salvar invalida a aprovação anterior">
                  Ao salvar, qualquer aprovação anterior perde a validade e a nova versão passa por
                  NOVA análise financeira. O término deve ser posterior ao início.
                </Note>
                <Note title="Resumo do pedido">Total proposto: {price}</Note>
              </>
            ) : (
              <div className="proposed-total">
                <strong>Total proposto do contrato</strong>
                <b>{price.replace(',00', '')}</b>
              </div>
            )}
          </Card>
          {editing ? (
            <SidePanel
              description="Ao reenviar, a nova versão fica em análise. O contrato depende de parecer positivo vigente para essa versão."
              steps={steps}
            />
          ) : (
            <Stack>
              <Note title="Crédito opcional">
                O crédito é opcional. Somente o banco concedente pode associar o crédito concedido a
                este aluguel.
              </Note>
              <Note className="note--white" title="Revise antes de enviar">
                Confira veículo e período: a data final deve ser posterior à inicial. Ao enviar, o
                pedido segue para análise financeira, sem confirmar o contrato. Alterações invalidam
                a aprovação anterior e exigem nova análise.
              </Note>
            </Stack>
          )}
        </Columns>
        <ActionRow className={editing ? 'action-row--bar' : ''}>
          <Button type="submit">{editing ? 'Salvar e reenviar' : 'Revisar pedido'}</Button>
          <Button variant="secondary" to={editing ? '/pedidos/AL-001' : `/veiculos/${vehicle.id}`}>
            {editing ? 'Descartar' : 'Voltar'}
          </Button>
        </ActionRow>
      </form>
    </PageLayout>
  )
}

export function OrderReviewPage() {
  const { state, vehicle, period, days } = useRental()
  const income = state.customer.incomes.reduce((sum, value) => sum + parseMoney(value), 0)
  return (
    <PageLayout figmaId="92:2699" footer={null}>
      <PageHeading
        eyebrow="REVISE SEU PEDIDO · 3 DE 4"
        title="Tudo certo com o seu pedido?"
        description="Confira os dados antes de enviar para a avaliação financeira."
      />
      <Columns>
        <Stack>
          <Card className="review-vehicle">
            <div className="stack">
              <h2>Automóvel</h2>
              <h3 className="large-title">{vehicle.name}</h3>
              <p className="muted">
                {vehicle.year} · {vehicle.plate} · {vehicle.registration}
              </p>
              <TextLink to="/veiculos">Alterar automóvel</TextLink>
            </div>
            <VehicleImage vehicle={vehicle} />
          </Card>
          <Card>
            <Metadata
              title="Período do aluguel"
              items={[
                ['Início', period.split(' a ')[0]],
                ['Término', period.split(' a ')[1]],
                ['Duração', `${days} dias`],
                [
                  'Contrato',
                  state.contractType === 'PADRAO' ? 'Aluguel sem crédito' : 'Aluguel com crédito',
                ],
              ]}
            />
            <TextLink to="/pedidos/novo">Editar período e contrato</TextLink>
          </Card>
          <Card>
            <h2>{state.customer.name}</h2>
            <p>
              CPF e RG cadastrados · {state.customer.occupation}
              <br />
              Renda informada: {formatMoney(income)} ·{' '}
              {state.customer.employers.filter(Boolean).length} entidade empregadora
            </p>
            <TextLink to="/meu-cadastro">Conferir meu cadastro</TextLink>
          </Card>
        </Stack>
        <RentalSummary />
      </Columns>
    </PageLayout>
  )
}

export function OrderSentPage() {
  const { vehicle, price, period } = useRental()
  return (
    <PageLayout figmaId="92:2700" className="expanded-page" footer={null}>
      <PageHeading
        eyebrow="PEDIDO · 4 DE 4"
        title="Pedido enviado. Próximo passo: análise."
        description="Sua solicitação #AL-001 foi registrada para avaliação pelo agente."
      />
      <Columns>
        <Card>
          <h2 className="large-title">Em análise financeira</h2>
          <h3>
            {vehicle.name} · {period}
            <br />
            Proposta de {price}
          </h3>
          <p>
            Você pode consultar, alterar ou cancelar o pedido. Um contrato só pode ser executado
            após parecer positivo.
          </p>
          <ActionRow className="action-row--left">
            <Button to="/pedidos/AL-001">Acompanhar pedido</Button>
            <Button to="/pedidos" variant="secondary">
              Meus pedidos
            </Button>
          </ActionRow>
        </Card>
        <SidePanel title="O que acontece agora?" className="side-panel--spaced">
          <p>1. O agente avalia os dados e a renda.</p>
          <p>2. O parecer fica disponível no pedido.</p>
          <p>3. Com aprovação, o contrato pode ser executado.</p>
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}

export function OrderDetailPage() {
  const { state, vehicle, vehicleLabel, period, price } = useRental()
  const terminal = ['CANCELADO', 'EM_EXECUCAO'].includes(state.status)
  const title = statusLabels[state.status]
  return (
    <PageLayout figmaId="4:1288" footer="AlloCar · Área do cliente">
      <ProgressSteps />
      <Columns>
        <Card>
          <PageHeading
            title="Pedido #AL-001"
            description={
              state.status === 'EM_ANALISE'
                ? 'Recebemos seu pedido. A análise financeira está em andamento.'
                : `Acompanhe a situação atual do seu pedido: ${title.toLowerCase()}.`
            }
          />
          <div className="field-grid">
            <Field label="Cliente" value={state.customer.name} readOnly />
            <Field label="Pedido" value="#AL-001" readOnly />
            <Field label="Veículo" value={vehicleLabel} readOnly />
            <Field label="Matrícula" value={vehicle.registration} readOnly />
            <Field label="Período" value={period} readOnly />
            <Field
              label="Tipo de locação"
              value={state.contractType === 'PADRAO' ? 'Locação padrão' : 'Locação com crédito'}
              readOnly
            />
            <Field className="field-grid__full" label="Total proposto" value={price} readOnly />
          </div>
          <Note className="note--ink" title={title}>
            {state.status === 'EM_ANALISE'
              ? `Versão ${state.version} recebida. A análise financeira está em andamento e o contrato só será liberado após parecer positivo vigente.`
              : `Versão ${state.version} · ${title}. Consulte o histórico e as condições vinculadas a este pedido.`}
          </Note>
          <ActionRow>
            {terminal ? (
              <Button to={state.executed ? '/contratos/CT-001' : '/pedidos/AL-001/cancelado'}>
                Consultar registro
              </Button>
            ) : (
              <>
                <Button variant="secondary" to="/pedidos/AL-001/alterar">
                  Alterar pedido
                </Button>
                <Button variant="danger" to="/pedidos/AL-001/cancelar">
                  Cancelar pedido
                </Button>
              </>
            )}
            <Button variant="secondary" to="/pedidos">
              Voltar
            </Button>
          </ActionRow>
        </Card>
        <SidePanel title="Histórico do pedido" className="history-side">
          <p>Acompanhe o fluxo atual do seu pedido.</p>
          <h2>Próximos passos</h2>
          <StepsList
            active={0}
            items={[
              [
                'Revisão financeira',
                'Nossa equipe analisa a solicitação e valida as condições do pedido.',
              ],
              ['Aprovação', 'O contrato depende de parecer financeiro positivo da versão atual.'],
              ['Contrato', 'Contrato disponível somente após aprovação da versão atual do pedido.'],
            ]}
          />
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}

export function CancelOrderPage() {
  const { state, vehicle, period, days, price, dispatch } = useRental()
  const navigate = useNavigate()
  return (
    <PageLayout figmaId="4:1380" footer="AlloCar · Área do cliente">
      <Columns>
        <Card>
          <PageHeading
            title="Cancelar pedido?"
            description="Revise os dados do pedido antes de confirmar o cancelamento. Esta ação encerra o pedido atual e não pode ser desfeita."
          />
          <Alert className="cancel-warning" tone="warning" title="Esta ação encerra o pedido">
            Após confirmar, o pedido #AL-001 será cancelado e não poderá ser reativado.
          </Alert>
          <Note>
            <div className="request-strip">
              <p>Pedido #AL-001</p>
              <p>{state.customer.name}</p>
              <p>
                {vehicle.name} {vehicle.year} · {vehicle.plate} · {vehicle.registration}
              </p>
              <p>{period}</p>
              <Badge>Pendente</Badge>
              <p>{price}</p>
            </div>
            <dl className="inline-facts">
              <div>
                <dt>Veículo</dt>
                <dd>
                  {vehicle.name} {vehicle.year} · {vehicle.plate} · {vehicle.registration}
                </dd>
              </div>
              <div>
                <dt>Período</dt>
                <dd>
                  {period} · {days} dias
                </dd>
              </div>
              <div>
                <dt>Tipo de locação</dt>
                <dd>Locação padrão</dd>
              </div>
            </dl>
          </Note>
          <Note title="O que acontece após confirmar">
            <StepsList
              className="steps-list--white"
              items={[
                [
                  'Pedido encerrado',
                  'O pedido #AL-001 será marcado como cancelado e não poderá ser reativado.',
                ],
                [
                  'Novo pedido necessário',
                  'Para solicitar outro aluguel após o cancelamento, será necessário criar um novo pedido.',
                ],
              ]}
            />
          </Note>
          <ActionRow>
            <Button to="/pedidos/AL-001" variant="secondary">
              Manter pedido
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                dispatch({ type: 'CANCEL' })
                navigate('/pedidos/AL-001/cancelado')
              }}
            >
              Confirmar cancelamento
            </Button>
          </ActionRow>
        </Card>
        <SidePanel title={null}>
          <div className="reservation-count">
            <h3>
              Minhas reservas <span className="step-number step-number--active">1</span>
            </h3>
            <p>Você tem 1 pedido em análise.</p>
          </div>
          <Metadata
            title="Pedido em análise"
            items={[
              ['Pedido', '#AL-001'],
              ['Cliente', state.customer.name],
              ['Veículo', vehicle.name],
              ['Período', '10 a 15 dez 2026'],
            ]}
          />
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}

export function CancelledOrderPage() {
  const { state, vehicle, period, price } = useRental()
  return (
    <PageLayout figmaId="4:1409" footer="AlloCar · Área do cliente">
      <Columns>
        <Card>
          <PageHeading
            title="Pedido cancelado"
            description="O pedido #AL-001 foi cancelado e não pode ser contratado. O histórico permanece disponível para acompanhamento."
          />
          <Alert tone="error" title="CANCELADO · Confirmação registrada">
            O pedido permanece no seu histórico. Nenhum contrato será executado a partir dele.
          </Alert>
          <div className="field-grid">
            <Field label="Pedido" value="#AL-001" readOnly />
            <Field label="Cliente" value={state.customer.name} readOnly />
            <Field
              label="Veículo"
              value={`${vehicle.name} ${vehicle.year} ${vehicle.plate}`}
              readOnly
            />
            <Field label="Matrícula" value={vehicle.registration} readOnly />
            <Field label="Período" value={period.replace(' a ', '–')} icon="calendar" readOnly />
            <Field label="Locação" value="Locação padrão" readOnly />
          </div>
          <Note title="Resumo financeiro">
            <p>Total proposto: {price}</p>
            <p>
              Este pedido permanece apenas como registro histórico e não permite execução de
              contrato.
            </p>
          </Note>
          <ActionRow>
            <Button to="/pedidos">Meus pedidos</Button>
            <Button variant="secondary" to="/veiculos" iconAfter="arrowUpRight">
              Solicitar novo pedido
            </Button>
          </ActionRow>
        </Card>
        <SidePanel
          description="Após o cancelamento, você pode acompanhar o histórico do pedido e solicitar uma nova locação."
          steps={[
            ['Conta / Perfil', 'Consulte os dados de Ana Silva.'],
            ['Meus pedidos', 'Consulte o registro histórico do pedido cancelado.'],
            ['Novo pedido', 'Inicie outra solicitação escolhendo veículo e período.'],
            ['Acompanhamento', 'Consulte o histórico do pedido e acompanhe novas solicitações.'],
          ]}
        />
      </Columns>
    </PageLayout>
  )
}
