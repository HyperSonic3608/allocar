import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { api, all } from '../api/client.js'
import { useApp, emptyDraft } from '../state/app-context.js'
import useResource from '../state/useResource.js'
import useMutation from '../state/useMutation.js'
import useOrder from '../state/useOrder.js'
import PageLayout, {
  ActionRow,
  Columns,
  SidePanel,
  Stack,
} from '../components/layout/PageLayout.jsx'
import Card, { Metadata, PageHeading } from '../components/ui/Card.jsx'
import Button, { TextLink } from '../components/ui/Button.jsx'
import Field, { SelectField } from '../components/ui/Field.jsx'
import { Alert, Note } from '../components/ui/Feedback.jsx'
import ResourceState, { ErrorMessage, Pagination } from '../components/ui/ResourceState.jsx'
import RentalSummary from '../components/rental/RentalSummary.jsx'
import { VehicleImage } from '../components/rental/VehicleCard.jsx'
import { OrderActions, OrderFacts, OrderStatus } from '../components/rental/OrderFacts.jsx'
import DecisionFacts from '../components/rental/DecisionFacts.jsx'
import {
  contractType,
  formatDate,
  formatMoney,
  formatTime,
  ownerName,
  period,
  permissions,
  rentalDays,
  statusLabels,
  vehicleName,
} from '../data/rental.js'

export function MyOrdersPage() {
  const { account } = useApp()
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('')
  const resource = useResource(
    useCallback(
      async (signal) => {
        const [list, pending, approved, executing] = await Promise.all([
          api.orders({ pagina: page, tamanho: 6, status }, signal),
          ...['EM_ANALISE', 'APROVADO', 'EM_EXECUCAO'].map((status) =>
            api.orders({ status, tamanho: 1 }, signal),
          ),
        ])
        const details = await Promise.all(list.itens.map((order) => api.order(order.id, signal)))
        return {
          ...list,
          details,
          pending: pending.total,
          approved: approved.total,
          executing: executing.total,
        }
      },
      [page, status],
    ),
  )
  return (
    <PageLayout figmaId="4:1196">
      <PageHeading
        title={account.tipo === 'CLIENTE' ? 'Meus pedidos' : 'Pedidos do meu escopo'}
        description="Acompanhe os pedidos e o andamento da avaliação financeira."
      />
      <ResourceState resource={resource}>
        {(data) => (
          <Stack>
            <div className="metrics">
              {[
                [`${data.pending} em análise`, 'Solicitações aguardando avaliação financeira.'],
                [`${data.approved} aprovados`, 'Pedidos com parecer positivo vigente.'],
                [`${data.executing} em execução`, 'Pedidos com contrato executado.'],
              ].map(([title, text], index) => (
                <div key={title} className={index === 1 ? 'metric--success' : ''}>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              ))}
            </div>
            <ActionRow>
              {account.tipo === 'CLIENTE' && <Button to="/veiculos">Novo pedido</Button>}
              {account.tipo === 'CLIENTE' ? (
                <Button variant="secondary" to="/meu-cadastro">
                  Meu cadastro
                </Button>
              ) : (
                <Button variant="secondary" to="/agente">
                  Central do agente
                </Button>
              )}
            </ActionRow>
            <div className="queue-filters" role="group" aria-label="Filtrar pedidos por status">
              {[['', 'Todos'], ...Object.entries(statusLabels)].map(([value, label]) => (
                <Button
                  key={value}
                  variant="secondary"
                  aria-pressed={status === value}
                  onClick={() => {
                    setStatus(value)
                    setPage(0)
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            {data.details.length ? (
              <div className="orders-grid">
                {data.details.map((detail) => (
                  <Card className="order-card" key={detail.pedido.id}>
                    <div className="order-card__header">
                      <div>
                        <h2>{detail.pedido.numero}</h2>
                        <p className="muted">
                          {detail.cliente.nome} · versão {detail.pedido.versao}
                        </p>
                      </div>
                      <OrderStatus outlined status={detail.pedido.status} />
                    </div>
                    <div className="order-card__details">
                      <Note title="Veículo">
                        <strong>
                          {vehicleName(detail.automovel)} · {detail.automovel.ano}
                        </strong>
                        <p>{detail.automovel.matricula}</p>
                      </Note>
                      <Note title="Período">
                        <strong>{period(detail.pedido)}</strong>
                        <p>{formatMoney(detail.pedido.valorTotal)}</p>
                      </Note>
                    </div>
                    <ActionRow>
                      <Button to={`/pedidos/${detail.pedido.id}`} variant="secondary">
                        Ver pedido
                      </Button>
                      {permissions(account, detail).edit && (
                        <Button to={`/pedidos/${detail.pedido.id}/alterar`} variant="secondary">
                          Editar pedido
                        </Button>
                      )}
                    </ActionRow>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <h2>Nenhum pedido neste filtro.</h2>
                <p className="muted">Suas solicitações aparecerão aqui após o envio.</p>
                {account.tipo === 'CLIENTE' && (
                  <Button to="/veiculos" className="empty-action">
                    Escolher um automóvel
                  </Button>
                )}
              </Card>
            )}
            <Pagination
              page={data.pagina}
              size={data.tamanho}
              total={data.total}
              onChange={setPage}
            />
          </Stack>
        )}
      </ResourceState>
    </PageLayout>
  )
}

function OrderEditor({ editing, data, onReload }) {
  const { draft, setDraft, account, notify } = useApp()
  const detail = data.detail
  const original = editing
    ? {
        vehicleId: detail.pedido.automovelId,
        start: detail.pedido.inicio,
        end: detail.pedido.fim,
        contractType: detail.pedido.tipo,
        total: detail.pedido.valorTotal,
        agentId: detail.pedido.agenteResponsavelId,
      }
    : draft
  const [values, setValues] = useState(original)
  const mutation = useMutation()
  const navigate = useNavigate()
  const vehicle = data.vehicles.find((item) => item.id === values.vehicleId)
  async function submit(event) {
    event.preventDefault()
    const end = event.currentTarget.querySelector('[name=end]')
    if (values.end <= values.start) {
      end.setCustomValidity('O término deve ser posterior ao início.')
      end.reportValidity()
      return
    }
    if (!editing) {
      setDraft(values)
      navigate('/pedidos/revisao')
      return
    }
    await mutation.run(async () => {
      const result = await api.updateOrder(detail.pedido.id, {
        versao: detail.pedido.versao,
        proposta: {
          automovelId: values.vehicleId,
          inicio: values.start,
          fim: values.end,
          tipo: values.contractType,
          valorTotal: Number(values.total),
        },
      })
      notify('Proposta atualizada e enviada para nova análise.')
      navigate(`/pedidos/${result.pedido.id}`)
    })
  }
  if (editing && !permissions(account, detail).edit)
    return (
      <Note title="Pedido sem permissão de alteração">
        <p>
          Somente o titular ou o agente responsável pode modificar um pedido antes da execução ou do
          cancelamento.
        </p>
        <Button to={`/pedidos/${detail.pedido.id}`} variant="secondary">
          Consultar pedido
        </Button>
      </Note>
    )
  const field = (name) => ({
    value: values[name],
    onChange: (event) => {
      event.target.setCustomValidity('')
      if (name === 'start') event.target.form?.querySelector('[name=end]')?.setCustomValidity('')
      setValues((current) => ({ ...current, [name]: event.target.value }))
    },
  })
  return (
    <form onSubmit={submit} className="stack">
      <Columns>
        <Card>
          <div className="panel-heading">
            <h2>{editing ? 'Revise a proposta' : 'Dados do aluguel'}</h2>
            <p>Informe o automóvel, o período e o valor total proposto para avaliação.</p>
          </div>
          <div className="field-grid">
            <SelectField label="Automóvel" name="vehicleId" {...field('vehicleId')} required>
              <option value="">Selecione o automóvel</option>
              {data.vehicles.map((item) => (
                <option key={item.id} value={item.id}>
                  {vehicleName(item)} · {item.ano} · {item.placa}
                </option>
              ))}
            </SelectField>
            <Field label="Matrícula" value={vehicle?.matricula || ''} readOnly />
            <SelectField
              label="Tipo de contrato"
              name="contractType"
              {...field('contractType')}
              required
            >
              <option value="PADRAO">Aluguel padrão</option>
              <option value="COM_CREDITO">Aluguel com crédito</option>
            </SelectField>
            <Field
              label="Valor total proposto (R$)"
              name="total"
              type="number"
              min="0.01"
              step="0.01"
              {...field('total')}
              required
              helper="Valor total da proposta, sujeito à análise do agente."
            />
            <Field label="Início" name="start" type="date" {...field('start')} required />
            <Field label="Término" name="end" type="date" {...field('end')} required />
            {editing ? (
              <Field
                className="field-grid__full"
                label="Agente responsável"
                value={ownerName(detail.pedido.agenteResponsavelId, data.agents)}
                readOnly
              />
            ) : (
              <div className="field-grid__full">
                <SelectField
                  label="Agente responsável"
                  name="agentId"
                  {...field('agentId')}
                  required
                >
                  <option value="">Selecione uma instituição</option>
                  {data.agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.nome} · {agent.tipo === 'BANCO' ? 'Banco' : 'Empresa'}
                    </option>
                  ))}
                </SelectField>
              </div>
            )}
          </div>
          <Note title={editing ? 'Alteração exige nova análise' : 'Revise antes de enviar'}>
            {editing
              ? 'Salvar incrementa a versão do pedido e invalida pareceres anteriores. O contrato depende de nova aprovação.'
              : 'O pedido será enviado ao agente escolhido. O envio não confirma um contrato nem realiza cobrança.'}
          </Note>
          <ErrorMessage
            error={mutation.error}
            onReload={mutation.error?.status === 409 ? onReload : undefined}
          />
        </Card>
        <SidePanel
          title="Próximos passos"
          description="O valor faz parte da proposta. O agente avalia as condições e os dados financeiros do cadastro."
          steps={[
            ['Informe a proposta', 'Escolha automóvel, período, tipo e valor total.'],
            ['Revise os dados', 'Confira o cadastro e a instituição responsável.'],
            ['Aguarde a análise', 'A contratação depende de parecer financeiro positivo.'],
          ]}
        />
      </Columns>
      <ActionRow>
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? 'Salvando…' : editing ? 'Salvar e reenviar' : 'Revisar pedido'}
        </Button>
        <Button variant="secondary" to={editing ? `/pedidos/${detail.pedido.id}` : '/veiculos'}>
          {editing ? 'Descartar' : 'Voltar'}
        </Button>
      </ActionRow>
    </form>
  )
}

export function OrderFormPage({ editing = false }) {
  const { id } = useParams()
  const resource = useResource(
    useCallback(
      async (signal) => {
        const [vehicles, agents, detail] = await Promise.all([
          all('/automoveis', { signal }),
          api.agents(signal),
          editing ? api.order(id, signal) : Promise.resolve(null),
        ])
        return { vehicles, agents, detail }
      },
      [editing, id],
    ),
  )
  return (
    <PageLayout figmaId={editing ? '4:1326' : '4:1234'} progress={{ flow: 'request', current: 1 }}>
      <PageHeading
        eyebrow="PERÍODO E CONTRATO · 2 DE 4"
        title={
          editing
            ? `Alterar pedido${resource.data ? ` ${resource.data.detail.pedido.numero}` : ''}`
            : 'Novo pedido de aluguel'
        }
        description="Os dados cadastrais e a renda serão considerados na avaliação financeira."
      />
      <ResourceState resource={resource}>
        {(data) => (
          <OrderEditor
            key={editing ? `${id}-${data.detail.pedido.versao}` : 'new'}
            editing={editing}
            data={data}
            onReload={resource.reload}
          />
        )}
      </ResourceState>
    </PageLayout>
  )
}

export function OrderReviewPage() {
  const { draft, setDraft, notify } = useApp()
  const navigate = useNavigate()
  const mutation = useMutation()
  const ready = Boolean(
    draft.vehicleId && draft.start && draft.end && Number(draft.total) > 0 && draft.agentId,
  )
  const resource = useResource(
    useCallback(
      async (signal) => {
        if (!ready) return null
        const [vehicle, customer, agents] = await Promise.all([
          api.vehicle(draft.vehicleId, signal),
          api.profile(signal),
          api.agents(signal),
        ])
        return { vehicle, customer, agent: agents.find((item) => item.id === draft.agentId) }
      },
      [ready, draft.vehicleId, draft.agentId],
    ),
  )
  async function send() {
    await mutation.run(async () => {
      const detail = await api.createOrder({
        agenteResponsavelId: draft.agentId,
        proposta: {
          automovelId: draft.vehicleId,
          inicio: draft.start,
          fim: draft.end,
          tipo: draft.contractType,
          valorTotal: Number(draft.total),
        },
      })
      setDraft(emptyDraft())
      notify('Pedido enviado para avaliação financeira.')
      navigate(`/pedidos/${detail.pedido.id}/enviado`, { replace: true })
    })
  }
  return (
    <PageLayout figmaId="92:2699" progress={{ flow: 'request', current: 2 }}>
      <PageHeading
        eyebrow="REVISE SEU PEDIDO · 3 DE 4"
        title="Tudo certo com o seu pedido?"
        description="Confira os dados antes de enviar para a avaliação financeira."
      />
      {!ready ? (
        <Card>
          <h2>Complete a proposta antes de revisar.</h2>
          <p>Escolha automóvel, agente, período e valor total para continuar.</p>
          <Button to="/pedidos/novo" className="empty-action">
            Preencher proposta
          </Button>
        </Card>
      ) : (
        <ResourceState resource={resource}>
          {({ vehicle, customer, agent }) => (
            <Columns>
              <Stack>
                <Card className="review-vehicle">
                  <Stack>
                    <h2>Automóvel</h2>
                    <h3 className="large-title">{vehicleName(vehicle)}</h3>
                    <p className="muted">
                      {vehicle.ano} · {vehicle.placa} · {vehicle.matricula}
                    </p>
                    <TextLink to="/veiculos">Alterar automóvel</TextLink>
                  </Stack>
                  <VehicleImage vehicle={vehicle} />
                </Card>
                <Card>
                  <Metadata
                    title="Período e contrato"
                    items={[
                      ['Início', formatDate(draft.start)],
                      ['Término', formatDate(draft.end)],
                      ['Duração', `${rentalDays(draft.start, draft.end)} dias`],
                      ['Contrato', contractType(draft.contractType)],
                      ['Agente', agent?.nome || draft.agentId],
                    ]}
                  />
                  <TextLink to="/pedidos/novo">Editar proposta</TextLink>
                </Card>
                <Card>
                  <h2>{customer.nome}</h2>
                  <p>
                    {customer.profissao}
                    <br />
                    Renda informada: {formatMoney(customer.rendaTotal)} · {customer.vinculos.length}{' '}
                    vínculos empregatícios
                  </p>
                  <TextLink to="/meu-cadastro">Conferir meu cadastro</TextLink>
                </Card>
                <ErrorMessage error={mutation.error} />
              </Stack>
              <RentalSummary
                vehicle={vehicle}
                total={Number(draft.total)}
                days={rentalDays(draft.start, draft.end)}
                onSubmit={send}
                pending={mutation.pending}
              />
            </Columns>
          )}
        </ResourceState>
      )}
    </PageLayout>
  )
}

export function OrderSentPage() {
  const { id } = useParams()
  const resource = useOrder(id)
  return (
    <PageLayout
      figmaId="92:2700"
      progress={resource.data && { status: resource.data.pedido.status }}
    >
      <ResourceState resource={resource}>
        {({ pedido, automovel }) => (
          <>
            <PageHeading
              eyebrow="PEDIDO REGISTRADO"
              title="Pedido enviado. Acompanhe os próximos passos."
              description={`Solicitação ${pedido.numero} · ${statusLabels[pedido.status]}`}
            />
            <Columns>
              <Card>
                <h2 className="large-title">{statusLabels[pedido.status]}</h2>
                <h3>
                  {vehicleName(automovel)} · {period(pedido)}
                  <br />
                  Proposta de {formatMoney(pedido.valorTotal)}
                </h3>
                <p>
                  Consulte o pedido para acompanhar as condições e o parecer financeiro. Alterações
                  e cancelamento dependem do estado atual.
                </p>
                <ActionRow className="action-row--left">
                  <Button to={`/pedidos/${pedido.id}`}>Acompanhar pedido</Button>
                  <Button variant="secondary" to="/pedidos">
                    Meus pedidos
                  </Button>
                </ActionRow>
              </Card>
              <SidePanel title="O que acontece agora?">
                <p>
                  O agente avalia a proposta e os rendimentos informados. Após parecer positivo, o
                  contrato pode ser executado.
                </p>
              </SidePanel>
            </Columns>
          </>
        )}
      </ResourceState>
    </PageLayout>
  )
}

export function OrderDetailPage({ cancelled = false }) {
  const { id } = useParams()
  const { account, notify } = useApp()
  const resource = useOrder(id)
  const mutation = useMutation()
  return (
    <PageLayout
      figmaId={cancelled ? '4:1409' : '4:1288'}
      progress={resource.data && { status: resource.data.pedido.status }}
    >
      <ResourceState resource={resource}>
        {(detail) => (
          <Columns>
            <Card>
              <PageHeading
                title={
                  detail.pedido.status === 'CANCELADO'
                    ? 'Pedido cancelado'
                    : `Pedido ${detail.pedido.numero}`
                }
                description={`${detail.cliente.nome} · ${ownerName(detail.pedido.agenteResponsavelId, detail.agents)} · versão ${detail.pedido.versao}`}
              />
              <OrderStatus status={detail.pedido.status} />
              <OrderFacts detail={detail} />
              <Note className="note--ink" title={statusLabels[detail.pedido.status]}>
                Versão {detail.pedido.versao}. A execução exige aprovação da proposta e do cadastro
                atuais. Contratos executados preservam suas condições.
              </Note>
              <ErrorMessage
                error={mutation.error}
                onReload={mutation.error?.status === 409 ? resource.reload : undefined}
              />
              <OrderActions detail={detail} />
              {permissions(account, detail).edit && detail.pedido.status !== 'EM_ANALISE' && (
                <Button
                  variant="secondary"
                  disabled={mutation.pending}
                  onClick={() =>
                    mutation.run(async () => {
                      const updated = await api.resend(id, detail.pedido.versao)
                      resource.replace({ ...updated, agents: detail.agents })
                      notify('Pedido reenviado para análise.')
                    })
                  }
                >
                  {mutation.pending ? 'Reenviando…' : 'Reenviar para análise'}
                </Button>
              )}
            </Card>
            <SidePanel title="Histórico do pedido">
              <p>
                {detail.pareceres.length
                  ? 'Pareceres registrados para este pedido.'
                  : 'Nenhum parecer financeiro registrado.'}
              </p>
              {detail.pareceres.map((decision) => (
                <Note
                  key={decision.id}
                  title={`${decision.decisao === 'APROVADO' ? 'Aprovado' : 'Reprovado'} · versão ${decision.versaoPedido}`}
                >
                  <p>{decision.justificativa}</p>
                  <DecisionFacts decision={decision} vehicle={detail.automovel} />
                  <small>
                    {formatTime(decision.emitidoEm)} · Cadastro {decision.versaoCadastro}
                  </small>
                </Note>
              ))}
              {detail.contrato && (
                <Button to={`/contratos/${detail.contrato.id}`} variant="secondary">
                  Consultar contrato
                </Button>
              )}
            </SidePanel>
          </Columns>
        )}
      </ResourceState>
    </PageLayout>
  )
}

export function CancelOrderPage() {
  const { id } = useParams()
  const { account, notify } = useApp()
  const resource = useOrder(id)
  const mutation = useMutation()
  const navigate = useNavigate()
  return (
    <PageLayout
      figmaId="4:1380"
      progress={resource.data && { status: resource.data.pedido.status }}
    >
      <ResourceState resource={resource}>
        {(detail) => (
          <Columns>
            <Card>
              <PageHeading
                title="Cancelar pedido?"
                description="Revise os dados antes de confirmar. O cancelamento encerra esta solicitação."
              />
              <Alert tone="warning" title="Esta ação encerra o pedido">
                O pedido {detail.pedido.numero} não poderá ser reativado após o cancelamento.
              </Alert>
              <OrderFacts detail={detail} />
              <ErrorMessage
                error={mutation.error}
                onReload={mutation.error?.status === 409 ? resource.reload : undefined}
              />
              {permissions(account, detail).cancel ? (
                <ActionRow>
                  <Button variant="secondary" to={`/pedidos/${id}`}>
                    Manter pedido
                  </Button>
                  <Button
                    variant="danger"
                    disabled={mutation.pending}
                    onClick={() =>
                      mutation.run(async () => {
                        await api.cancel(id, detail.pedido.versao)
                        notify('Cancelamento registrado.')
                        navigate(`/pedidos/${id}/cancelado`, { replace: true })
                      })
                    }
                  >
                    {mutation.pending ? 'Cancelando…' : 'Confirmar cancelamento'}
                  </Button>
                </ActionRow>
              ) : (
                <Note title="Cancelamento indisponível">
                  O cancelamento exige o cliente titular e um pedido que ainda não esteja encerrado.
                  <Button to={`/pedidos/${id}`} variant="secondary">
                    Consultar pedido
                  </Button>
                </Note>
              )}
            </Card>
            <SidePanel title="Pedido selecionado">
              <Metadata
                title={detail.pedido.numero}
                items={[
                  ['Cliente', detail.cliente.nome],
                  ['Veículo', vehicleName(detail.automovel)],
                  ['Estado', statusLabels[detail.pedido.status]],
                  ['Total proposto', formatMoney(detail.pedido.valorTotal)],
                ]}
              />
            </SidePanel>
          </Columns>
        )}
      </ResourceState>
    </PageLayout>
  )
}

export function CancelledOrderPage() {
  return <OrderDetailPage cancelled />
}
