import { useCallback, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { api, all, ApiError } from '../api/client.js'
import { useApp } from '../state/app-context.js'
import useResource from '../state/useResource.js'
import useMutation from '../state/useMutation.js'
import useOrder from '../state/useOrder.js'
import PageLayout, {
  ActionRow,
  Columns,
  SidePanel,
  Stack,
  StepsList,
} from '../components/layout/PageLayout.jsx'
import Card, { Metadata, PageHeading } from '../components/ui/Card.jsx'
import Button, { TextLink } from '../components/ui/Button.jsx'
import { Note, Alert } from '../components/ui/Feedback.jsx'
import { SelectField, TextAreaField } from '../components/ui/Field.jsx'
import ResourceState, { ErrorMessage, Pagination } from '../components/ui/ResourceState.jsx'
import { OrderActions, OrderStatus } from '../components/rental/OrderFacts.jsx'
import CustomerFacts from '../components/rental/CustomerFacts.jsx'
import DecisionFacts from '../components/rental/DecisionFacts.jsx'
import Icon from '../components/ui/Icon.jsx'
import {
  formatMoney,
  formatTime,
  ownerName,
  period,
  permissions,
  statusLabels,
  vehicleName,
} from '../data/rental.js'

export function AgentDashboardPage() {
  const { account } = useApp()
  const [status, setStatus] = useState('EM_ANALISE')
  const [page, setPage] = useState(0)
  const resource = useResource(
    useCallback(
      async (signal) => {
        const [list, pending, approved] = await Promise.all([
          api.orders({ status, pagina: page, tamanho: 10 }, signal),
          api.orders({ status: 'EM_ANALISE', tamanho: 1 }, signal),
          api.orders({ status: 'APROVADO', tamanho: 1 }, signal),
        ])
        const details = await Promise.all(list.itens.map((order) => api.order(order.id, signal)))
        return { ...list, details, pending: pending.total, approved: approved.total }
      },
      [page, status],
    ),
  )
  return (
    <PageLayout kind="agent" figmaId="4:1428" className="agent-dashboard">
      <div className="agent-workspace">
        <Card className="agent-sidebar">
          <Note className="agent-identity">
            <h3>{account.nome}</h3>
            <p>
              {account.tipo === 'BANCO' ? 'Banco agente' : 'Empresa agente'} · análise financeira e
              gestão de pedidos autorizados.
            </p>
          </Note>
          <section className="agent-side-nav">
            <h2>Área do agente</h2>
            <nav aria-label="Filas do agente">
              {[
                ['EM_ANALISE', 'Fila de análise', 'ticketActive'],
                ['APROVADO', 'Pedidos aprovados', 'user'],
                ['REPROVADO', 'Pedidos reprovados', 'heartNav'],
                ['EM_EXECUCAO', 'Em execução', 'briefcase'],
              ].map(([value, label, icon]) => (
                <button
                  key={value}
                  type="button"
                  className={status === value ? 'is-selected' : ''}
                  onClick={() => {
                    setStatus(value)
                    setPage(0)
                  }}
                >
                  <Icon name={icon} size={18} />
                  {label}
                </button>
              ))}
            </nav>
          </section>
          <Button variant="secondary" to="/agente/historico">
            Histórico de pareceres
          </Button>
          {account.tipo === 'BANCO' && (
            <Button variant="secondary" to="/agente/creditos">
              Créditos
            </Button>
          )}
        </Card>
        <Stack>
          <Card className="agent-title">
            <PageHeading
              title="Central do agente"
              description="Consulte e analise os pedidos do seu escopo institucional."
            />
          </Card>
          <ResourceState resource={resource}>
            {(data) => (
              <>
                <div className="agent-indicators">
                  {[
                    ['Pedidos em análise', data.pending, 'Aguardando avaliação financeira.'],
                    ['Pedidos aprovados', data.approved, 'Com parecer positivo vigente.'],
                  ].map(([label, total, caption]) => (
                    <section className="agent-indicator" key={label}>
                      <div>
                        <Icon name="ticket" size={18} />
                        <strong>{label}</strong>
                        <span className="step-number step-number--active">{total}</span>
                      </div>
                      <p>{caption}</p>
                    </section>
                  ))}
                </div>
                <Card>
                  <div className="queue-heading">
                    <div>
                      <h2>Fila de pedidos</h2>
                      <p className="muted">{data.total} pedidos neste filtro.</p>
                    </div>
                    <div
                      className="queue-filters"
                      role="group"
                      aria-label="Filtrar fila por status"
                    >
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
                  </div>
                  {data.details.length ? (
                    <div className="agent-table-wrap">
                      <table className="agent-table">
                        <thead>
                          <tr>
                            {[
                              'Pedido',
                              'Cliente',
                              'Veículo',
                              'Renda/mês',
                              'Status',
                              'Versão',
                              'Ação',
                            ].map((label) => (
                              <th key={label} scope="col">
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.details.map((detail) => (
                            <tr key={detail.pedido.id}>
                              <td>{detail.pedido.numero}</td>
                              <td>{detail.cliente.nome}</td>
                              <td>{vehicleName(detail.automovel)}</td>
                              <td>{formatMoney(detail.cliente.rendaTotal)}</td>
                              <td>
                                <OrderStatus status={detail.pedido.status} />
                              </td>
                              <td>{detail.pedido.versao}</td>
                              <td>
                                <Button
                                  variant="secondary"
                                  className="button--compact"
                                  to={
                                    permissions(account, detail).analyze
                                      ? `/agente/pedidos/${detail.pedido.id}/analise`
                                      : `/pedidos/${detail.pedido.id}`
                                  }
                                  aria-label={`${permissions(account, detail).analyze ? 'Analisar' : 'Consultar'} pedido ${detail.pedido.numero}`}
                                >
                                  <Icon name="chevronRight" size={18} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Note title="Nenhum pedido neste filtro">
                      Selecione outro estado para consultar os pedidos autorizados.
                    </Note>
                  )}
                  <Pagination
                    page={data.pagina}
                    size={data.tamanho}
                    total={data.total}
                    onChange={setPage}
                  />
                </Card>
                {data.details[0] && (
                  <Card>
                    <div className="queue-heading">
                      <h2>Detalhes do pedido {data.details[0].pedido.numero}</h2>
                      <OrderStatus status={data.details[0].pedido.status} />
                    </div>
                    <Metadata
                      title="Dados da proposta"
                      items={[
                        ['Cliente', data.details[0].cliente.nome],
                        ['Veículo', vehicleName(data.details[0].automovel)],
                        ['Período', period(data.details[0].pedido)],
                        ['Valor', formatMoney(data.details[0].pedido.valorTotal)],
                        ['Renda declarada', formatMoney(data.details[0].cliente.rendaTotal)],
                      ]}
                    />
                    <Button to={`/pedidos/${data.details[0].pedido.id}`} variant="secondary">
                      Consultar pedido completo
                    </Button>
                  </Card>
                )}
              </>
            )}
          </ResourceState>
        </Stack>
      </div>
    </PageLayout>
  )
}

function AnalysisForm({ detail, onReload }) {
  const { account, setModal, notify } = useApp()
  const [decision, setDecision] = useState('')
  const [reason, setReason] = useState('')
  const mutation = useMutation()
  const navigate = useNavigate()
  const allowed = permissions(account, detail)
  async function save(event) {
    event.preventDefault()
    await mutation.run(async () => {
      if (!decision || !reason.trim())
        throw new ApiError(
          400,
          'PARECER_INCOMPLETO',
          'Escolha uma decisão e informe a justificativa antes de salvar.',
        )
      await api.evaluate(detail.pedido.id, {
        versaoPedido: detail.pedido.versao,
        versaoCadastro: detail.cliente.versaoCadastro,
        decisao: decision,
        justificativa: reason.trim(),
      })
      notify('Parecer financeiro registrado.')
      navigate(
        decision === 'APROVADO'
          ? `/agente/pedidos/${detail.pedido.id}/aprovado`
          : `/pedidos/${detail.pedido.id}/reprovado`,
      )
    })
  }
  return (
    <form onSubmit={save} className="stack">
      <Columns className="columns--reverse">
        <SidePanel className="analysis-summary" title={null}>
          <section>
            <h2>Cliente</h2>
            <p>
              {detail.cliente.nome} · {detail.cliente.profissao}
            </p>
            <small>
              {detail.cliente.vinculos.length} vínculos · Renda de{' '}
              {formatMoney(detail.cliente.rendaTotal)}
            </small>
          </section>
          <section>
            <h2>Veículo</h2>
            <p>{vehicleName(detail.automovel)}</p>
            <small>{period(detail.pedido)}</small>
          </section>
          <section>
            <h2>Proposta</h2>
            <p>{formatMoney(detail.pedido.valorTotal)}</p>
            <small>{ownerName(detail.pedido.agenteResponsavelId, detail.agents)}</small>
          </section>
          <OrderStatus status={detail.pedido.status} />
        </SidePanel>
        <Card>
          <CustomerFacts customer={detail.cliente} />
          <div className="panel-heading">
            <h2>Decisão da análise</h2>
            <p>
              Pedido versão {detail.pedido.versao} · cadastro versão {detail.cliente.versaoCadastro}
              . A decisão só é registrada ao salvar.
            </p>
          </div>
          {allowed.analyze ? (
            <>
              <div className="field-grid field-grid--tight">
                <div className="field">
                  <span className="field__label" id="decisao-label">
                    Decisão
                  </span>
                  <button
                    type="button"
                    className="decision-select"
                    aria-labelledby="decisao-label decisao-texto"
                    aria-haspopup="dialog"
                    disabled={mutation.pending}
                    onClick={() =>
                      setModal({ name: 'decisao', order: detail.pedido, onSelect: setDecision })
                    }
                  >
                    <span id="decisao-texto">
                      {decision === 'APROVADO'
                        ? 'Aprovar'
                        : decision === 'REPROVADO'
                          ? 'Reprovar'
                          : 'Selecione aprovar ou reprovar'}
                    </span>
                    <Icon name="decision" />
                  </button>
                  <small className="field__helper">Escolha uma opção para esta versão.</small>
                </div>
                <TextAreaField
                  label="Justificativa obrigatória"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  maxLength={2000}
                  disabled={mutation.pending}
                  helper="Descreva os motivos da decisão. Não existe aprovação automática por renda."
                />
              </div>
              <Alert title="Regras de análise">
                Mudanças na proposta ou no cadastro exigem nova análise e invalidam pareceres
                anteriores.
              </Alert>
              <ErrorMessage
                error={mutation.error}
                onReload={mutation.error?.status === 409 ? onReload : undefined}
              />
              <Button type="submit" disabled={mutation.pending}>
                {mutation.pending ? 'Registrando…' : 'Salvar decisão'}
              </Button>
            </>
          ) : (
            <Note title="Análise indisponível">
              Somente o agente responsável pode avaliar um pedido em análise. Consulte o estado
              atual e as ações disponíveis.
              <OrderActions detail={detail} />
            </Note>
          )}
          <TextLink to={`/agente/historico?pedido=${detail.pedido.id}`}>
            Consultar histórico de pareceres
          </TextLink>
        </Card>
      </Columns>
      {allowed.edit && (
        <ActionRow>
          <Button variant="secondary" to={`/pedidos/${detail.pedido.id}/alterar`}>
            Alterar pedido
          </Button>
        </ActionRow>
      )}
    </form>
  )
}

export function AnalysisPage() {
  const { id } = useParams()
  const resource = useOrder(id)
  return (
    <PageLayout
      kind="agent"
      figmaId="4:1460"
      progress={resource.data && { status: resource.data.pedido.status }}
    >
      <ResourceState resource={resource}>
        {(detail) => (
          <>
            <PageHeading
              title={`Análise do pedido ${detail.pedido.numero}`}
              description={`Confira os dados de ${detail.cliente.nome} e registre uma decisão justificada.`}
            />
            <AnalysisForm
              key={`${id}-${detail.pedido.versao}-${detail.cliente.versaoCadastro}`}
              detail={detail}
              onReload={resource.reload}
            />
          </>
        )}
      </ResourceState>
    </PageLayout>
  )
}

export function RejectedOrderPage() {
  const { id } = useParams()
  const { account } = useApp()
  const resource = useOrder(id)
  return (
    <PageLayout
      figmaId="4:1567"
      progress={resource.data && { status: resource.data.pedido.status }}
    >
      <ResourceState resource={resource}>
        {(detail) => {
          const decision = detail.pareceres
            .filter(
              (item) =>
                item.versaoPedido === detail.pedido.versao &&
                item.versaoCadastro === detail.cliente.versaoCadastro &&
                item.decisao === 'REPROVADO',
            )
            .sort((a, b) => Date.parse(b.emitidoEm) - Date.parse(a.emitidoEm))[0]
          return (
            <>
              <Columns>
                <Stack>
                  <Card>
                    <PageHeading
                      title={
                        detail.pedido.status === 'REPROVADO'
                          ? 'Pedido não aprovado'
                          : `Pedido ${detail.pedido.numero}`
                      }
                      description={`${detail.cliente.nome} · ${statusLabels[detail.pedido.status]}`}
                    />
                    <Note title={detail.pedido.numero}>
                      {vehicleName(detail.automovel)} · {period(detail.pedido)}
                    </Note>
                  </Card>
                  <Card>
                    <h2>Status do pedido</h2>
                    <OrderStatus status={detail.pedido.status} />
                    {decision ? (
                      <Alert tone="error" title="Justificativa do parecer">
                        {decision.justificativa}
                      </Alert>
                    ) : (
                      <Note title="Consulte a avaliação atual">
                        O estado e a versão do pedido podem ter mudado desde a emissão de pareceres
                        anteriores.
                      </Note>
                    )}
                  </Card>
                </Stack>
                <SidePanel title="Próximos passos">
                  <StepsList
                    items={[
                      [
                        'Revise o cadastro',
                        'O cliente pode conferir documentos, endereço e rendimentos.',
                      ],
                      [
                        'Revise a proposta',
                        'O titular ou o agente responsável pode alterar um pedido aberto.',
                      ],
                      [
                        'Solicite nova análise',
                        'Uma nova versão não garante aprovação financeira.',
                      ],
                    ]}
                  />
                </SidePanel>
              </Columns>
              <ActionRow>
                {permissions(account, detail).edit && (
                  <Button to={`/pedidos/${id}/alterar`}>Revisar pedido</Button>
                )}
                <Button variant="secondary" to={`/pedidos/${id}`}>
                  Consultar pedido
                </Button>
              </ActionRow>
            </>
          )
        }}
      </ResourceState>
    </PageLayout>
  )
}

export function DecisionHistoryPage() {
  const [params, setParams] = useSearchParams()
  const id = params.get('pedido') || ''
  const orders = useResource(useCallback((signal) => all('/pedidos', { signal }), []))
  const detail = useOrder(id)
  return (
    <PageLayout kind="agent" figmaId="92:2704">
      <PageHeading
        title="Histórico da avaliação financeira."
        description="Consulte decisões, justificativas e versões consideradas em cada avaliação."
      />
      <ResourceState resource={orders}>
        {(items) => (
          <Card>
            <SelectField
              label="Pedido"
              value={id}
              onChange={(event) =>
                setParams(event.target.value ? { pedido: event.target.value } : {})
              }
            >
              <option value="">Selecione um pedido</option>
              {items.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.numero} · {statusLabels[order.status]}
                </option>
              ))}
            </SelectField>
            {!items.length && <p>Nenhum pedido disponível para consulta.</p>}
          </Card>
        )}
      </ResourceState>
      {id && (
        <ResourceState resource={detail}>
          {(data) => (
            <Stack>
              {data.pareceres.length ? (
                data.pareceres.map((decision) => (
                  <Card key={decision.id}>
                    <div className="queue-heading">
                      <h2>
                        {data.pedido.numero} · versão {decision.versaoPedido}
                      </h2>
                      <OrderStatus status={decision.decisao} />
                    </div>
                    <h3>{ownerName(decision.agenteId, data.agents)}</h3>
                    <p>{decision.justificativa}</p>
                    <DecisionFacts decision={decision} vehicle={data.automovel} />
                    <p className="muted">
                      Emitido em {formatTime(decision.emitidoEm)} · Cadastro versão{' '}
                      {decision.versaoCadastro}
                      <br />
                      {data.contrato?.parecerAprovadorId === decision.id
                        ? 'Parecer utilizado na execução do contrato.'
                        : decision.versaoPedido === data.pedido.versao &&
                            decision.versaoCadastro === data.cliente.versaoCadastro
                          ? 'Parecer vinculado às versões atuais.'
                          : 'Parecer histórico; as versões dos dados foram alteradas.'}
                    </p>
                    <Button variant="secondary" to={`/pedidos/${id}`} className="history-action">
                      Consultar pedido
                    </Button>
                  </Card>
                ))
              ) : (
                <Note title="Sem pareceres registrados">
                  Este pedido ainda não possui histórico financeiro.
                </Note>
              )}
            </Stack>
          )}
        </ResourceState>
      )}
      <TextLink to="/agente">Voltar à central</TextLink>
    </PageLayout>
  )
}
