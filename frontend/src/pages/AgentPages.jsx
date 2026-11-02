import { useState } from 'react'
import { useNavigate } from 'react-router'
import PageLayout, {
  ActionRow,
  Columns,
  SidePanel,
  Stack,
  StepsList,
} from '../components/layout/PageLayout.jsx'
import Card, { PageHeading } from '../components/ui/Card.jsx'
import Button, { TextLink } from '../components/ui/Button.jsx'
import { Alert, Badge, Note } from '../components/ui/Feedback.jsx'
import { TextAreaField } from '../components/ui/Field.jsx'
import Icon from '../components/ui/Icon.jsx'
import useRental from '../state/useRental.js'

function MiniFact({ label, value, icon = 'userSmall', className = '' }) {
  return (
    <div className={`mini-fact ${className}`}>
      <strong>{label}</strong>
      <div>
        <Icon name={icon} size={16} />
        <span>{value}</span>
      </div>
    </div>
  )
}

export function AgentDashboardPage() {
  const { state, vehicle, dispatch } = useRental()
  const [filter, setFilter] = useState('Pendentes')
  const showMain =
    filter === 'Pendentes'
      ? state.status === 'EM_ANALISE'
      : filter === 'Aprovados'
        ? state.status === 'APROVADO'
        : state.status === 'REPROVADO'
  return (
    <PageLayout kind="agent" figmaId="4:1428" className="agent-dashboard">
      <div className="agent-workspace">
        <Card className="agent-sidebar">
          <Note className="agent-identity">
            <h3>Hyper Banco</h3>
            <p>Agente bancário responsável por análise financeira de pedidos.</p>
          </Note>
          <section className="agent-side-nav">
            <h2>Área do agente</h2>
            <nav aria-label="Filas do agente">
              {[
                ['Fila de análise', 'ticketActive', 'Pendentes'],
                ['Pedidos aprovados', 'user', 'Aprovados'],
                ['Pedidos reprovados', 'heartNav', 'Reprovados'],
                ['Pedidos pendentes', 'bell', 'Pendentes'],
              ].map(([label, icon, name], index) => (
                <button
                  key={label}
                  type="button"
                  className={
                    filter === name && (index === 0 || name !== 'Pendentes') ? 'is-selected' : ''
                  }
                  onClick={() => setFilter(name)}
                >
                  <Icon name={icon} size={18} />
                  {label}
                </button>
              ))}
            </nav>
          </section>
          <Note className="agent-queue-note">
            <strong>Resumo da fila</strong>
            <p>
              {state.status === 'EM_ANALISE' ? '02' : '01'} pedidos pendentes de análise financeira.
            </p>
          </Note>
        </Card>
        <Stack>
          <Card className="agent-title">
            <PageHeading
              title="Central do agente"
              description="Pedidos que precisam da sua análise financeira."
            />
          </Card>
          <div className="agent-indicators">
            {[
              [
                'Pedidos pendentes',
                state.status === 'EM_ANALISE' ? '2' : '1',
                'Aguardando análise financeira do agente.',
              ],
              [
                'Versão dos pedidos',
                state.version,
                `Ambos aguardam uma decisão para a versão ${state.version}.`,
              ],
            ].map(([title, value, caption]) => (
              <section key={title} className="agent-indicator">
                <div>
                  <Icon name="ticket" size={18} />
                  <strong>{title}</strong>
                  <span className="step-number step-number--active">{value}</span>
                </div>
                <p>{caption}</p>
              </section>
            ))}
          </div>
          <Card>
            <div className="queue-heading">
              <div>
                <h2>Fila de análise</h2>
                <p className="muted">Selecione o status dos pedidos para consultar a fila.</p>
              </div>
              <div className="queue-filters">
                {['Pendentes', 'Aprovados', 'Reprovados'].map((name) => (
                  <button
                    type="button"
                    key={name}
                    onClick={() => setFilter(name)}
                    aria-pressed={name === filter}
                  >
                    <Badge>{name}</Badge>
                  </button>
                ))}
              </div>
            </div>
            <div className="agent-table-wrap">
              <table className="agent-table">
                <colgroup>
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '12%' }} />
                </colgroup>
                <thead>
                  <tr>
                    {['Pedido', 'Cliente', 'Veículo', 'Renda/mês', 'Status', 'Versão', 'Ação'].map(
                      (label) => (
                        <th key={label} scope="col">
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {showMain && (
                    <tr>
                      <td>#AL-001</td>
                      <td>{state.customer.name}</td>
                      <td>{vehicle.name}</td>
                      <td>R$ 6.000,00/mês</td>
                      <td>
                        <Badge>
                          {state.status === 'APROVADO'
                            ? 'Aprovado'
                            : state.status === 'REPROVADO'
                              ? 'Reprovado'
                              : 'Pendente'}
                        </Badge>
                      </td>
                      <td>Versão {state.version}</td>
                      <td>
                        <Button
                          className="button--compact"
                          variant="secondary"
                          to="/agente/pedidos/AL-001/analise"
                          aria-label="Analisar pedido AL-001"
                        >
                          <Icon name="chevronLeft" size={18} />
                        </Button>
                      </td>
                    </tr>
                  )}
                  {filter === 'Pendentes' && (
                    <tr>
                      <td>#AL-003</td>
                      <td>Carlos Lima</td>
                      <td>VW Polo</td>
                      <td>R$ 4.500,00/mês</td>
                      <td>
                        <Badge>Pendente</Badge>
                      </td>
                      <td>Versão 1</td>
                      <td>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label="Ver pedido AL-003"
                          onClick={() => dispatch({ type: 'MODAL', name: 'pedido-carlos' })}
                        >
                          <Icon name="chevronLeft" size={18} />
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {!showMain && filter !== 'Pendentes' && (
                <p className="table-empty">Nenhum pedido neste status.</p>
              )}
            </div>
          </Card>
          <Card>
            <div className="queue-heading">
              <div>
                <h2>Detalhes do pedido #AL-001</h2>
                <p className="muted">
                  {state.customer.name} · Pedido pendente de análise financeira.
                </p>
              </div>
              <Badge>Pendente</Badge>
            </div>
            <div className="agent-facts">
              <MiniFact
                label="Cliente"
                value={`${state.customer.name} · ${state.customer.occupation}`}
              />
              <MiniFact label="Veículo" value={vehicle.name} icon="car" />
              <MiniFact label="Renda declarada" value="R$ 6.000,00/mês" icon="wallet" />
              <MiniFact label="Fonte de renda" value="1 empregador" icon="business" />
              <MiniFact
                className="mini-fact--wide"
                label="Identificação / endereço"
                value="Identificação e endereço cadastrados"
                icon="location"
              />
            </div>
            <Button
              to="/agente/pedidos/AL-001/analise"
              variant="secondary"
              className="agent-analyze-button"
            >
              Analisar #AL-001
            </Button>
          </Card>
        </Stack>
      </div>
    </PageLayout>
  )
}

export function AnalysisPage() {
  const { state, vehicle, period, dispatch } = useRental()
  const navigate = useNavigate()
  function save() {
    if (!state.decision || !state.justification.trim()) {
      dispatch({ type: 'MODAL', name: 'decisao-obrigatoria' })
      return
    }
    dispatch({ type: 'SAVE_DECISION' })
    navigate(
      state.decision === 'APROVADO'
        ? '/agente/pedidos/AL-001/aprovado'
        : '/pedidos/AL-001/reprovado',
    )
  }
  return (
    <PageLayout kind="agent" figmaId="4:1460" progress={{ status: state.status }}>
      <Stack>
        <PageHeading
          title="Análise do pedido #AL-001"
          description={`Confira os dados de ${state.customer.name} e registre uma decisão justificada para a versão ${state.version}.`}
        />
        <Columns className="columns--reverse">
          <SidePanel className="analysis-summary" title={null}>
            <section>
              <h2>Cliente</h2>
              <p>
                {state.customer.name} · {state.customer.occupation}
              </p>
              <small>
                Identificação e endereço cadastrados · 1 vínculo empregatício · Renda R$
                6.000,00/mês
              </small>
            </section>
            <section>
              <h2>Veículo</h2>
              <p>{vehicle.name}</p>
              <small>{period.replace(' a ', '–')}</small>
            </section>
            <section>
              <h2>Análise</h2>
              <p>Sem parecer vigente</p>
              <small>A decisão escolhida será vinculada à versão atual do pedido.</small>
            </section>
            <div className="analysis-pending">
              <Badge tone="warning">Pendente</Badge>
              <small>A decisão ainda não foi registrada para esta versão do pedido.</small>
            </div>
          </SidePanel>
          <Card>
            <div className="panel-heading">
              <h2>Decisão da análise</h2>
              <p>Selecione uma opção e informe o motivo. A decisão só será registrada ao salvar.</p>
            </div>
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
                  onClick={() => dispatch({ type: 'MODAL', name: 'decisao' })}
                >
                  <span id="decisao-texto">
                    {state.decision === 'APROVADO'
                      ? 'Aprovar'
                      : state.decision === 'REPROVADO'
                        ? 'Reprovar'
                        : 'Selecione aprovar ou reprovar'}
                  </span>
                  <Icon name="decision" />
                </button>
                <small className="field__helper">
                  Escolha apenas uma opção: aprovar ou reprovar.
                </small>
              </div>
              <TextAreaField
                label="Justificativa obrigatória"
                placeholder="Descreva o motivo da decisão escolhida."
                helper="A justificativa é obrigatória para salvar a decisão."
                value={state.justification}
                onChange={(event) => dispatch({ type: 'JUSTIFICATION', value: event.target.value })}
              />
            </div>
            <Alert title="Regras de análise">
              Alterações no pedido exigem nova análise e invalidam aprovação positiva anterior.
            </Alert>
            <TextLink to="/agente/historico">Consultar histórico de pareceres</TextLink>
          </Card>
        </Columns>
        <div className="analysis-actions">
          <div>
            <Button variant="secondary" to="/pedidos/AL-001/alterar">
              Alterar pedido
            </Button>
            <small>Alterações exigem nova análise.</small>
          </div>
          <Button onClick={save}>Salvar decisão</Button>
          <small>Escolha e justificativa obrigatórias.</small>
        </div>
      </Stack>
    </PageLayout>
  )
}

export function RejectedOrderPage() {
  return (
    <PageLayout kind="agent" figmaId="4:1567" progress={{ status: 'REPROVADO' }}>
      <Columns>
        <Stack>
          <Card>
            <PageHeading
              title="Pedido não aprovado"
              description="Consulte a justificativa e revise as informações do pedido."
            />
            <div className="rejected-request">
              <span>AL</span>
              <div>
                <strong>Pedido #AL-001</strong>
                <p>Cliente Ana Silva · revisão necessária para nova análise</p>
              </div>
            </div>
          </Card>
          <Card>
            <PageHeading
              as="h2"
              title="Status do pedido"
              description="O parecer atual impede a execução contratual. Revise os dados e altere o pedido para solicitar nova análise."
            />
            <Alert tone="error" title="Pedido #AL-001 · REPROVADO">
              Motivo: informações de renda insuficientes para a proposta.
            </Alert>
          </Card>
        </Stack>
        <SidePanel title={null}>
          <Card className="rejected-next">
            <PageHeading
              as="h2"
              title="Próximos passos"
              description="Atualize os dados e altere o pedido para solicitar nova análise. Nenhum contrato pode ser executado com parecer negativo."
            />
            <StepsList
              items={[
                ['Atualize os dados', 'Confira e atualize as informações de renda cadastradas.'],
                [
                  'Altere o pedido',
                  'Revise o pedido com os dados atualizados para solicitar uma nova análise.',
                ],
                [
                  'Solicite nova análise',
                  'A nova análise considera a versão revisada do pedido, sem garantia de aprovação.',
                ],
              ]}
            />
          </Card>
        </SidePanel>
      </Columns>
      <ActionRow className="action-row--bar">
        <Button to="/pedidos/AL-001/alterar">Revisar pedido</Button>
        <Button variant="secondary" to="/pedidos">
          Meus pedidos
        </Button>
      </ActionRow>
    </PageLayout>
  )
}

export function DecisionHistoryPage() {
  const { state, vehicle } = useRental()
  const justification =
    state.justification ||
    'Renda informada compatível com a proposta de R$ 1.250,00. Cadastro e vínculos de renda conferidos para esta avaliação demonstrativa.'
  return (
    <PageLayout kind="agent" figmaId="92:2704">
      <PageHeading
        className="page-heading--spaced"
        title="Histórico da avaliação financeira."
        description="Consulte a justificativa e a versão do pedido que fundamentou cada decisão."
      />
      <Card>
        <h2>Pedido #AL-001 · Versão {state.version}</h2>
        <h3 className="large-title">
          Parecer {state.decision === 'REPROVADO' ? 'negativo' : 'positivo'} · Hyper Locadora
        </h3>
        <p>{justification}</p>
        <p className="muted">
          Dados avaliados: {state.customer.name} · renda de R$ 6.000,00 · {vehicle.name}
          <br />
          Uma alteração na proposta exige nova análise financeira.
        </p>
        <Button className="history-action" to="/agente/pedidos/AL-001/analise">
          Abrir análise atual
        </Button>
        <Button className="history-action" to="/agente" variant="secondary">
          Voltar à central
        </Button>
      </Card>
    </PageLayout>
  )
}
