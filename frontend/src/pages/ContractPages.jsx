import { useCallback, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { api, all } from '../api/client.js'
import { useApp } from '../state/app-context.js'
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
import { Badge, Note } from '../components/ui/Feedback.jsx'
import ResourceState, { ErrorMessage, Pagination } from '../components/ui/ResourceState.jsx'
import { OrderFacts, OrderStatus } from '../components/rental/OrderFacts.jsx'
import Icon from '../components/ui/Icon.jsx'
import {
  contractType,
  formatMoney,
  formatTime,
  ownerName,
  period,
  permissions,
  vehicleName,
} from '../data/rental.js'

function useContract(id) {
  return useResource(
    useCallback(
      async (signal) => {
        const contract = await api.contract(id, signal)
        const [detail, agents, credit] = await Promise.all([
          api.order(contract.pedidoId, signal),
          api.agents(signal),
          contract.creditoId ? api.credit(contract.creditoId, signal) : Promise.resolve(null),
        ])
        return { contract, detail, agents, credit }
      },
      [id],
    ),
  )
}

export function ApprovalPage() {
  const { id } = useParams()
  const { account, notify } = useApp()
  const resource = useOrder(id)
  const mutation = useMutation()
  const navigate = useNavigate()
  return (
    <PageLayout
      kind="agent"
      figmaId="4:1508"
      progress={resource.data && { status: resource.data.pedido.status }}
    >
      <ResourceState resource={resource}>
        {(detail) => (
          <>
            <PageHeading
              title={`Revisão do contrato · ${detail.pedido.numero}`}
              description={`${detail.cliente.nome} · versão ${detail.pedido.versao}. Confira o parecer e a proposta antes da execução.`}
            />
            <Columns>
              <Card>
                <OrderStatus status={detail.pedido.status} />
                <OrderFacts detail={detail} />
                <Note title="Crédito opcional">
                  A concessão e a associação de crédito são operações do banco concedente. A
                  associação depende de contrato de aluguel executado e não substitui o parecer
                  financeiro.
                </Note>
                <ErrorMessage
                  error={mutation.error}
                  onReload={mutation.error?.status === 409 ? resource.reload : undefined}
                />
                {detail.contrato ? (
                  <Button to={`/contratos/${detail.contrato.id}`}>
                    Consultar contrato executado
                  </Button>
                ) : permissions(account, detail).execute ? (
                  <Button
                    disabled={mutation.pending}
                    onClick={() =>
                      mutation.run(async () => {
                        const contract = await api.execute(id, detail.pedido.versao)
                        notify('Contrato executado com sucesso.')
                        navigate(`/contratos/${contract.id}/executado`, { replace: true })
                      })
                    }
                  >
                    {mutation.pending ? 'Executando…' : 'Executar contrato'}
                  </Button>
                ) : (
                  <Note title="Execução indisponível">
                    A execução exige o agente responsável e um parecer positivo vigente para a
                    proposta e o cadastro atuais.
                  </Note>
                )}
              </Card>
              <SidePanel title="Antes de executar">
                <Metadata
                  title="Condições da avaliação"
                  items={[
                    ['Pedido', detail.pedido.numero],
                    [
                      'Agente responsável',
                      ownerName(detail.pedido.agenteResponsavelId, detail.agents),
                    ],
                    ['Versão do pedido', detail.pedido.versao],
                    ['Versão cadastral', detail.cliente.versaoCadastro],
                  ]}
                />
                {account.tipo === 'BANCO' && (
                  <Button variant="secondary" to="/agente/creditos">
                    Consultar créditos
                  </Button>
                )}
                <Button variant="secondary" to={`/agente/historico?pedido=${id}`}>
                  Consultar pareceres
                </Button>
              </SidePanel>
            </Columns>
            <ActionRow>
              <Button variant="secondary" to={`/pedidos/${id}`}>
                Consultar pedido
              </Button>
              <Button variant="secondary" to="/agente">
                Voltar à fila
              </Button>
            </ActionRow>
          </>
        )}
      </ResourceState>
    </PageLayout>
  )
}

export function MyContractsPage() {
  const [page, setPage] = useState(0)
  const resource = useResource(
    useCallback(
      async (signal) => {
        const list = await api.contracts({ pagina: page, tamanho: 6 }, signal)
        const details = await Promise.all(
          list.itens.map(async (contract) => ({
            contract,
            detail: await api.order(contract.pedidoId, signal),
          })),
        )
        return { ...list, details }
      },
      [page],
    ),
  )
  return (
    <PageLayout figmaId="92:2701">
      <PageHeading
        title="Seus contratos, em um só lugar."
        description="Consulte as condições executadas e a relação com o pedido e o crédito, quando houver."
      />
      <ResourceState resource={resource}>
        {(data) => (
          <Stack>
            {data.details.length ? (
              <div className="orders-grid">
                {data.details.map(({ contract, detail }) => (
                  <Card key={contract.id}>
                    <div className="queue-heading">
                      <h2>Contrato {contract.numero}</h2>
                      <Badge tone="success">Em execução</Badge>
                    </div>
                    <p>
                      {detail.cliente.nome} · {vehicleName(detail.automovel)}
                    </p>
                    <p className="muted">
                      {detail.pedido.numero} · {period(detail.pedido)}
                      <br />
                      {formatMoney(contract.valorTotal)} · {contractType(contract.tipo)}
                      <br />
                      Executado em {formatTime(contract.executadoEm)}
                    </p>
                    <Button to={`/contratos/${contract.id}`}>Consultar contrato</Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <h2>Você ainda não possui contratos em execução.</h2>
                <p>
                  Após parecer positivo, o agente responsável pode executar o contrato do aluguel.
                </p>
                <Button to="/pedidos" className="empty-action">
                  Acompanhar pedidos
                </Button>
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
      <TextLink to="/pedidos">Voltar aos pedidos</TextLink>
    </PageLayout>
  )
}

export function ContractDetailPage({ executed = false }) {
  const { id } = useParams()
  const { account } = useApp()
  const resource = useContract(id)
  return (
    <PageLayout
      figmaId={executed ? '4:1629' : '92:2702'}
      progress={resource.data && { status: resource.data.detail.pedido.status }}
    >
      <ResourceState resource={resource}>
        {({ contract, detail, agents, credit }) => (
          <>
            <PageHeading
              title={executed ? 'Contrato em execução' : `Detalhes do contrato ${contract.numero}`}
              description={`${detail.pedido.numero} · Condições registradas após aprovação financeira.`}
            />
            <Columns>
              <Card>
                {executed && (
                  <section className="execution-success">
                    <span className="execution-success__icon">
                      <Icon name="check" />
                    </span>
                    <h2>Contrato executado com sucesso</h2>
                    <p>
                      Contrato {contract.numero} · {formatTime(contract.executadoEm)}
                    </p>
                  </section>
                )}
                <Metadata
                  title="Dados do aluguel"
                  items={[
                    ['Contrato', contract.numero],
                    ['Identificador do contrato', contract.id],
                    ['Pedido', detail.pedido.numero],
                    ['Cliente', detail.cliente.nome],
                    [
                      'Automóvel',
                      `${vehicleName(detail.automovel)} · ${detail.automovel.matricula}`,
                    ],
                    ['Período', period(detail.pedido)],
                    ['Valor do contrato', formatMoney(contract.valorTotal)],
                  ]}
                />
                <Metadata
                  title="Responsáveis e condições"
                  items={[
                    ['Tipo', contractType(contract.tipo)],
                    [
                      'Proprietário registrado',
                      ownerName(contract.proprietarioRegistradoId, agents, detail.cliente),
                    ],
                    ['Execução', formatTime(contract.executadoEm)],
                    ['Crédito', credit?.numero || 'Sem crédito associado'],
                  ]}
                />
                {credit && (
                  <Note title="Crédito associado">
                    <p>
                      {credit.numero} · {formatMoney(credit.valor)}
                      <br />
                      Banco: {ownerName(credit.bancoConcedenteId, agents)}
                    </p>
                    <Button to={`/creditos/${credit.id}`} variant="secondary">
                      Consultar crédito
                    </Button>
                  </Note>
                )}
                <ActionRow>
                  {executed && <Button to={`/contratos/${id}`}>Visualizar contrato</Button>}
                  <Button variant="secondary" to="/contratos">
                    Meus contratos
                  </Button>
                </ActionRow>
              </Card>
              <SidePanel title="Contrato ligado ao pedido">
                <p>
                  Os valores e o proprietário registrado são preservados na execução. A associação
                  de crédito não altera a aprovação do pedido.
                </p>
                <Button to={`/pedidos/${detail.pedido.id}`}>Consultar pedido</Button>
                {account.tipo === 'BANCO' && !contract.creditoId && (
                  <Button
                    variant="secondary"
                    to={`/agente/creditos/associar?contrato=${contract.id}`}
                  >
                    Associar crédito
                  </Button>
                )}
                <Button to="/contratos" variant="secondary">
                  Todos os contratos
                </Button>
              </SidePanel>
            </Columns>
          </>
        )}
      </ResourceState>
    </PageLayout>
  )
}

export function ExecutedContractPage() {
  return <ContractDetailPage executed />
}

export function CreditRegistrationPage() {
  const { account, notify } = useApp()
  const mutation = useMutation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  async function submit(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    await mutation.run(async () => {
      const credit = await api.grantCredit({
        numero: values.numero,
        valor: Number(values.valor),
        taxa: Number(values.taxa),
      })
      notify('Concessão de crédito registrada.')
      navigate(
        `/agente/creditos/${credit.id}${params.get('contrato') ? `?contrato=${encodeURIComponent(params.get('contrato'))}` : ''}`,
        { replace: true },
      )
    })
  }
  return (
    <PageLayout kind="agent" figmaId="92:2703">
      <PageHeading
        title="Registre a concessão do crédito."
        description="O banco concedente registra o crédito e pode associá-lo depois a um contrato executado."
      />
      <Columns>
        <Card as="form" onSubmit={submit}>
          <div className="field-grid">
            <Field label="Número do contrato de crédito" name="numero" required maxLength={80} />
            <Field label="Banco concedente" value={account.nome} readOnly />
            <Field
              label="Valor concedido (R$)"
              name="valor"
              type="number"
              min="0.01"
              step="0.01"
              required
            />
            <Field
              label="Taxa contratual"
              name="taxa"
              type="number"
              min="0"
              step="0.000001"
              required
              helper="Informe a taxa acordada no contrato de crédito."
            />
          </div>
          <ErrorMessage error={mutation.error} />
          <Button type="submit" disabled={mutation.pending} className="credit-action">
            {mutation.pending ? 'Registrando…' : 'Registrar crédito'}
          </Button>
          <Button to="/agente/creditos" variant="secondary" className="credit-action">
            Voltar aos créditos
          </Button>
        </Card>
        <SidePanel title="Banco concedente">
          <p>
            {account.nome} será identificado como concedente. A concessão não aprova um pedido e não
            executa um contrato de aluguel.
          </p>
          <Note title="Associação separada">
            Após registrar, escolha um contrato executado e confirme a associação do crédito.
          </Note>
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}

function AssociationForm({ data }) {
  const [params] = useSearchParams()
  const { account, notify } = useApp()
  const [contractId, setContractId] = useState(params.get('contrato') || '')
  const [creditId, setCreditId] = useState(params.get('credito') || '')
  const mutation = useMutation()
  const navigate = useNavigate()
  const credits = data.credits.filter(
    (credit) => !credit.contratoId && credit.bancoConcedenteId === account.parteId,
  )
  const credit = credits.find((item) => item.id === creditId)
  async function submit(event) {
    event.preventDefault()
    await mutation.run(async () => {
      await api.associateCredit(contractId, creditId)
      notify('Crédito associado ao contrato de aluguel.')
      navigate(`/agente/creditos/${creditId}/associado`, { replace: true })
    })
  }
  return (
    <Columns>
      <Card as="form" onSubmit={submit}>
        <SelectField
          label="Crédito disponível"
          name="creditId"
          value={creditId}
          onChange={(event) => setCreditId(event.target.value)}
          required
        >
          <option value="">Selecione um crédito livre</option>
          {credits.map((item) => (
            <option key={item.id} value={item.id}>
              {item.numero} · {formatMoney(item.valor)}
            </option>
          ))}
        </SelectField>
        {credit && (
          <Metadata
            title="Crédito selecionado"
            items={[
              ['Número', credit.numero],
              ['Banco concedente', account.nome],
              ['Valor', formatMoney(credit.valor)],
              [
                'Taxa contratual',
                credit.taxa.toLocaleString('pt-BR', { maximumFractionDigits: 6 }),
              ],
            ]}
          />
        )}
        {data.contracts.length > 0 && (
          <SelectField
            label="Contratos disponíveis para consulta"
            value={data.contracts.some((item) => item.id === contractId) ? contractId : ''}
            onChange={(event) => setContractId(event.target.value)}
          >
            <option value="">Selecione ou informe o identificador abaixo</option>
            {data.contracts
              .filter((item) => !item.creditoId)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.numero} · {formatMoney(item.valorTotal)}
                </option>
              ))}
          </SelectField>
        )}
        <Field
          label="Identificador do contrato de aluguel"
          name="contractId"
          value={contractId}
          onChange={(event) => setContractId(event.target.value)}
          required
          pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
          helper="Copie o identificador exibido na consulta do contrato executado apresentado ao banco."
        />
        {!credits.length && (
          <Note title="Nenhum crédito livre">
            Registre uma concessão para associar crédito a um aluguel.
          </Note>
        )}
        <ErrorMessage error={mutation.error} />
        <Button type="submit" className="credit-action" disabled={mutation.pending || !credit}>
          {mutation.pending ? 'Associando…' : 'Confirmar associação'}
        </Button>
        <Button to="/agente/creditos/novo" variant="secondary" className="credit-action">
          Registrar novo crédito
        </Button>
        <Button to="/agente/creditos" variant="secondary" className="credit-action">
          Voltar aos créditos
        </Button>
      </Card>
      <SidePanel title="Crédito opcional">
        <p>
          Somente o banco concedente pode associar seu crédito livre. O contrato de aluguel precisa
          estar executado e sem outro crédito associado.
        </p>
        <Note title="Contrato apresentado ao banco">
          É possível informar o identificador de um contrato executado apresentado para
          financiamento. Após associar, o banco passa a consultá-lo.
        </Note>
      </SidePanel>
    </Columns>
  )
}

export function CreditAssociationPage() {
  const resource = useResource(
    useCallback(async (signal) => {
      const [credits, contracts] = await Promise.all([
        all('/creditos', { signal }),
        all('/contratos', { signal }),
      ])
      return { credits, contracts }
    }, []),
  )
  return (
    <PageLayout kind="agent" figmaId="92:2703">
      <PageHeading
        title="Associe o crédito ao aluguel."
        description="Escolha um crédito concedido pelo seu banco e um contrato de aluguel executado."
      />
      <ResourceState resource={resource}>{(data) => <AssociationForm data={data} />}</ResourceState>
    </PageLayout>
  )
}

export function CreditReceiptPage() {
  const { id } = useParams()
  const { account } = useApp()
  const [params] = useSearchParams()
  const resource = useResource(
    useCallback(
      async (signal) => {
        const credit = await api.credit(id, signal)
        const [agents, contract] = await Promise.all([
          api.agents(signal),
          credit.contratoId ? api.contract(credit.contratoId, signal) : Promise.resolve(null),
        ])
        const detail = contract ? await api.order(contract.pedidoId, signal) : null
        return { credit, agents, contract, detail }
      },
      [id],
    ),
  )
  return (
    <PageLayout figmaId="4:1639">
      <ResourceState resource={resource}>
        {({ credit, agents, contract, detail }) => (
          <>
            <PageHeading
              title={
                credit.contratoId
                  ? 'Recibo de associação de crédito'
                  : 'Detalhes do crédito concedido'
              }
              description="Consulte a concessão e sua associação ao contrato de aluguel, quando houver."
            />
            <Columns>
              <Card>
                <Note>
                  <div className="queue-heading">
                    <h2>Crédito {credit.numero}</h2>
                    <Badge tone={credit.contratoId ? 'success' : 'neutral'}>
                      {credit.contratoId ? 'Associado' : 'Livre'}
                    </Badge>
                  </div>
                  <Metadata
                    title="Condições do crédito"
                    items={[
                      ['Número', credit.numero],
                      ['Banco concedente', ownerName(credit.bancoConcedenteId, agents)],
                      ['Valor concedido', formatMoney(credit.valor)],
                      [
                        'Taxa contratual',
                        credit.taxa.toLocaleString('pt-BR', { maximumFractionDigits: 6 }),
                      ],
                      ['Concedido em', formatTime(credit.criadoEm)],
                    ]}
                  />
                </Note>
                {contract && (
                  <Note title="Aluguel vinculado">
                    <Metadata
                      title={contract.numero}
                      items={[
                        ['Pedido', detail.pedido.numero],
                        ['Cliente', detail.cliente.nome],
                        ['Veículo', vehicleName(detail.automovel)],
                        [
                          'Proprietário registrado',
                          ownerName(contract.proprietarioRegistradoId, agents, detail.cliente),
                        ],
                      ]}
                    />
                    <Button to={`/contratos/${contract.id}`}>Consultar contrato vinculado</Button>
                  </Note>
                )}
                {!contract &&
                  account.tipo === 'BANCO' &&
                  credit.bancoConcedenteId === account.parteId && (
                    <Button
                      to={`/agente/creditos/associar?credito=${id}${params.get('contrato') ? `&contrato=${encodeURIComponent(params.get('contrato'))}` : ''}`}
                    >
                      Associar a um contrato
                    </Button>
                  )}
                <Button
                  variant="secondary"
                  to={account.tipo === 'BANCO' ? '/agente/creditos' : '/contratos'}
                >
                  Voltar
                </Button>
              </Card>
              <SidePanel title="Banco concedente">
                <h3>{ownerName(credit.bancoConcedenteId, agents)}</h3>
                <p>O banco é responsável pela concessão e associação deste crédito.</p>
                <Note title="Operações distintas">
                  A associação de crédito não é uma nova aprovação nem executa o contrato de
                  aluguel.
                </Note>
              </SidePanel>
            </Columns>
          </>
        )}
      </ResourceState>
    </PageLayout>
  )
}

export function CreditsPage() {
  const { account } = useApp()
  const [page, setPage] = useState(0)
  const resource = useResource(
    useCallback(
      async (signal) => {
        const [credits, agents] = await Promise.all([
          api.credits({ pagina: page, tamanho: 6 }, signal),
          api.agents(signal),
        ])
        return { ...credits, agents }
      },
      [page],
    ),
  )
  return (
    <PageLayout kind="agent" figmaId="92:2706">
      <PageHeading
        title="Créditos vinculados a aluguéis."
        description="Consulte concessões livres e associações autorizadas para sua conta."
      />
      <ActionRow>
        <Button to="/agente/creditos/novo">Registrar crédito</Button>
        <Button variant="secondary" to="/agente/creditos/associar">
          Associar crédito
        </Button>
      </ActionRow>
      <ResourceState resource={resource}>
        {(data) => (
          <Stack>
            {data.itens.length ? (
              <div className="orders-grid">
                {data.itens.map((credit) => (
                  <Card key={credit.id}>
                    <div className="queue-heading">
                      <h2>{credit.numero}</h2>
                      <Badge tone={credit.contratoId ? 'success' : 'neutral'}>
                        {credit.contratoId ? 'Associado' : 'Livre'}
                      </Badge>
                    </div>
                    <p>
                      {ownerName(credit.bancoConcedenteId, data.agents)}
                      <br />
                      {formatMoney(credit.valor)} · taxa contratual{' '}
                      {credit.taxa.toLocaleString('pt-BR', { maximumFractionDigits: 6 })}
                    </p>
                    <Button to={`/agente/creditos/${credit.id}`}>Consultar crédito</Button>
                    {!credit.contratoId && credit.bancoConcedenteId === account.parteId && (
                      <Button
                        variant="secondary"
                        to={`/agente/creditos/associar?credito=${credit.id}`}
                      >
                        Registrar associação
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Note title="Nenhum crédito disponível">
                Registre uma concessão para iniciar o acompanhamento dos créditos do seu banco.
              </Note>
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
      <TextLink to="/agente">Voltar à central</TextLink>
    </PageLayout>
  )
}
