import { useNavigate } from 'react-router'
import PageLayout, {
  ActionRow,
  Columns,
  SidePanel,
  Stack,
} from '../components/layout/PageLayout.jsx'
import Card, { Metadata, PageHeading } from '../components/ui/Card.jsx'
import Button, { TextLink } from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import { Badge, Note } from '../components/ui/Feedback.jsx'
import Icon from '../components/ui/Icon.jsx'
import useRental from '../state/useRental.js'

export function ApprovalPage() {
  const { state, vehicle, period, price, dispatch } = useRental()
  const navigate = useNavigate()
  return (
    <PageLayout kind="agent" figmaId="4:1508" progress={{ status: 'APROVADO' }}>
      <Stack className="stack--tight">
        <section className="breadcrumbs">
          <nav aria-label="Caminho">
            <TextLink to="/agente">Área do agente</TextLink>
            <Icon name="breadcrumb" size={14} />
            <TextLink to="/agente">Pedidos aprovados</TextLink>
            <Icon name="breadcrumb" size={14} />
            <strong>Pedido #AL-001</strong>
          </nav>
          <small>A execução exige aprovação positiva vigente para a versão atual do pedido.</small>
        </section>
        <Columns className="columns--tight">
          <Card>
            <div className="approval-heading">
              <div className="panel-heading">
                <h1>Revisão do contrato · #AL-001</h1>
                <p>
                  Ana Silva · Versão {state.version} aprovada pelo Hyper Banco. Confira os dados e
                  as condições antes de executar.
                </p>
              </div>
              <Badge tone="success">APROVADO · V{state.version}</Badge>
            </div>
            <div className="field-grid field-grid--tight">
              <Field label="Automóvel / período" value={`${vehicle.name} · ${period}`} readOnly />
              <Field label="Valor total proposto" value={price} readOnly />
              <Field
                label="Tipo / proprietário atual"
                value="Contrato padrão · Empresa Exemplo"
                readOnly
              />
              <Field
                label="Crédito opcional / banco concedente"
                value="CR-001 · Hyper Banco · proposto"
                readOnly
              />
            </div>
            <Note title="Crédito opcional proposto · CR-001">
              <p>
                Hyper Banco · {price} · taxa proposta de 1% ao mês. Somente o banco concedente pode
                registrar ou associar este crédito. Associação ainda pendente.
              </p>
              <small>
                O proprietário é definido pelo tipo de contrato. Alterar o pedido invalida a
                aprovação anterior e exige nova análise. Não execute com reprovação ou aprovação de
                outra versão.
              </small>
            </Note>
          </Card>
          <SidePanel title={null}>
            <Metadata
              title="Antes de executar"
              items={[
                ['Pedido', '#AL-001'],
                ['Agente', 'Hyper Banco'],
                ['Parecer', `Positivo · v${state.version}`],
                ['Crédito', 'Opcional'],
              ]}
            />
          </SidePanel>
        </Columns>
        <ActionRow>
          <Button
            onClick={() => {
              dispatch({ type: 'EXECUTE' })
              navigate('/contratos/CT-001/executado')
            }}
          >
            Executar contrato
          </Button>
          <Button to="/agente/creditos/associar" variant="secondary">
            Associar crédito (banco)
          </Button>
          <Button to="/agente" variant="secondary">
            Voltar à fila
          </Button>
        </ActionRow>
      </Stack>
    </PageLayout>
  )
}

export function ExecutedContractPage() {
  const { state, vehicle, period, price } = useRental()
  return (
    <PageLayout kind="agent" figmaId="4:1629" progress={{ status: 'EM_EXECUCAO' }}>
      <Columns>
        <Card>
          <PageHeading
            title="Contrato em execução"
            description="Contrato CT-001 registrado. Pedido #AL-001: EM EXECUÇÃO. Crédito opcional e proprietário são preservados conforme contrato."
          />
          <section className="execution-success">
            <span className="execution-success__icon">
              <Icon name="check" />
            </span>
            <h2>Contrato executado com sucesso</h2>
            <p>
              O contrato CT-001 foi registrado após aprovação positiva da versão atual do pedido
              #AL-001, que está EM EXECUÇÃO.
            </p>
          </section>
          <Note title="Detalhes do contrato">
            <div className="field-grid execution-fields">
              <Field label="Contrato" value="CT-001" icon={null} readOnly />
              <Field label="Pedido" value="#AL-001 · EM EXECUÇÃO" icon={null} readOnly />
              <Field
                label="Proprietário do contrato"
                value="Empresa Exemplo"
                icon={null}
                readOnly
              />
              <Field
                label="Veículo"
                value={`${vehicle.name} ${vehicle.year} · ${vehicle.plate}`}
                icon={null}
                readOnly
              />
              <Field label="Período" value={period.replace(' a ', '–')} icon={null} readOnly />
              <Field label="Valor proposto / contrato" value={price} icon={null} readOnly />
            </div>
          </Note>
          <ActionRow>
            <Button to="/contratos/CT-001">Visualizar contrato</Button>
            <Button to="/pedidos" variant="secondary">
              Voltar para pedidos
            </Button>
          </ActionRow>
        </Card>
        <SidePanel
          title="Próximo passo"
          description="Agora que o contrato foi executado, acompanhe a retirada do veículo e os próximos eventos do pedido."
          steps={[
            [
              'Contrato executado',
              'O contrato CT-001 foi gerado a partir da versão aprovada do pedido #AL-001.',
            ],
            [
              'Acompanhe a retirada',
              'Confira data, horário, agência e documentos necessários para a retirada do veículo.',
            ],
            [
              'Consulte o contrato',
              'Revise condições, valores e responsabilidades antes da retirada do veículo.',
            ],
          ]}
        />
      </Columns>
      <span className="sr-only">Versão {state.version}</span>
    </PageLayout>
  )
}

export function MyContractsPage() {
  const { state, vehicle, price } = useRental()
  return (
    <PageLayout figmaId="92:2701">
      <PageHeading
        className="page-heading--spaced"
        title="Seus contratos, em um só lugar."
        description="Consulte o contrato e sua relação com o pedido e o crédito, quando houver."
      />
      {state.executed ? (
        <Card>
          <div className="queue-heading">
            <h2>Contrato CT-001</h2>
            <Badge tone="success">Em execução</Badge>
          </div>
          <p>
            {state.customer.name} · {vehicle.name} · {price}
          </p>
          <p className="muted">
            Pedido #AL-001 · Contrato executado após parecer financeiro positivo.
          </p>
          <Button to="/contratos/CT-001" className="empty-action">
            Consultar contrato
          </Button>
        </Card>
      ) : (
        <Card>
          <h2>Você ainda não possui contratos em execução.</h2>
          <p>
            Acompanhe seu pedido. Após parecer positivo, o agente pode executar o contrato de
            aluguel.
          </p>
          <p className="muted">
            Quando o contrato for executado nesta demonstração, ele aparecerá aqui.
          </p>
          <Button to="/pedidos" className="empty-action">
            Acompanhar pedidos
          </Button>
        </Card>
      )}
      <TextLink to="/pedidos">Voltar aos pedidos</TextLink>
    </PageLayout>
  )
}

export function ContractDetailPage() {
  const { state, vehicle, period, price } = useRental()
  return (
    <PageLayout figmaId="92:2702" progress={{ status: 'EM_EXECUCAO' }}>
      <PageHeading
        className="page-heading--spaced"
        title="Detalhes do contrato."
        description="Condições vinculadas ao pedido #AL-001 e ao parecer financeiro registrado."
      />
      <Columns>
        <Card>
          <Metadata
            title="Dados do aluguel"
            items={[
              ['Automóvel', `${vehicle.name} · ${vehicle.registration}`],
              ['Cliente', state.customer.name],
              ['Período', period],
              ['Valor proposto', price],
            ]}
          />
          <Metadata
            title="Responsáveis e condições"
            items={[
              ['Proprietário', 'Hyper Locadora · empresa'],
              ['Parecer', 'Positivo'],
              ['Crédito', state.associated ? 'CR-001 · associado' : 'Opcional · consulte o pedido'],
              ['Execução', 'Consulte a situação atual no pedido'],
            ]}
          />
        </Card>
        <SidePanel title="Contrato ligado ao pedido" className="side-panel--spaced">
          <p>
            A consulta é de leitura. O agente executa o contrato após aprovação; o banco pode
            associar crédito.
          </p>
          <Button to="/pedidos/AL-001">Consultar pedido</Button>
          <Button to="/contratos" variant="secondary">
            Meus contratos
          </Button>
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}

export function CreditAssociationPage() {
  const { state, dispatch } = useRental()
  const navigate = useNavigate()
  function submit(event) {
    event.preventDefault()
    dispatch({ type: 'ASSOCIATE', values: Object.fromEntries(new FormData(event.currentTarget)) })
    navigate('/agente/creditos/CR-001/associado')
  }
  return (
    <PageLayout kind="agent" figmaId="92:2703" progress={{ status: 'EM_EXECUCAO' }}>
      <PageHeading
        className="page-heading--spaced"
        title="Associe o crédito ao aluguel."
        description="Registro demonstrativo pelo Hyper Banco, agente concedente do crédito."
      />
      <Columns>
        <Card as="form" onSubmit={submit}>
          <div className="field-grid">
            <Field
              label="Número do contrato de crédito"
              name="number"
              defaultValue={state.credit.number}
              icon={null}
              required
            />
            <Field label="Banco concedente" name="bank" value="Hyper Banco" icon={null} readOnly />
          </div>
          <div className="field-grid">
            <Field
              label="Valor concedido"
              name="value"
              defaultValue={state.credit.value}
              icon={null}
              required
            />
            <Field
              label="Taxa proposta"
              name="rate"
              defaultValue={state.credit.rate}
              icon={null}
              required
            />
          </div>
          <Field
            label="Pedido associado"
            value="#AL-001 · Ana Silva"
            icon={null}
            readOnly
            helper="Contrato de aluguel CT-001 · parecer positivo"
          />
          <p className="muted">
            A associação do crédito mantém a execução do contrato como uma ação separada.
          </p>
          <Button type="submit" className="credit-action">
            Confirmar associação
          </Button>
          <Button
            variant="secondary"
            to="/agente/pedidos/AL-001/aprovado"
            className="credit-action"
          >
            Voltar ao contrato
          </Button>
        </Card>
        <SidePanel title="Crédito opcional" className="side-panel--spaced">
          <p>
            O crédito é concedido pelo banco agente. A empresa e o cliente podem consultar a
            informação no pedido.
          </p>
          <Metadata
            title="Vínculo"
            items={[
              ['Crédito', 'CR-001'],
              ['Aluguel', 'CT-001'],
              ['Pedido', '#AL-001'],
              ['Cliente', 'Ana Silva'],
            ]}
          />
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}

export function CreditReceiptPage() {
  const { state } = useRental()
  return (
    <PageLayout kind="agent" figmaId="4:1639" progress={{ status: 'EM_EXECUCAO' }}>
      <Columns>
        <Card>
          <PageHeading
            title="Recibo de associação de crédito"
            description="Este recibo confirma a vinculação do crédito ao pedido de aluguel. Apenas o banco concedente registra e associa este crédito."
          />
          <Note>
            <div className="queue-heading">
              <h2>Crédito associado</h2>
              <Badge tone="success">Associado</Badge>
            </div>
            <div className="credit-facts">
              <div>
                <h3>Crédito</h3>
                <strong>{state.credit.number}</strong>
              </div>
              <div>
                <h3>Banco concedente</h3>
                <strong>Hyper Banco</strong>
              </div>
              <div>
                <h3>Valor associado</h3>
                <strong>{state.credit.value}</strong>
              </div>
              <div>
                <h3>Taxa proposta</h3>
                <strong>{state.credit.rate.replace('ao mês', 'a.m.')}</strong>
              </div>
            </div>
          </Note>
          <Note title="Pedido vinculado">
            <p>Este crédito foi associado ao pedido de aluguel abaixo.</p>
            <div className="credit-facts credit-facts--single">
              <div>
                <h3>Pedido</h3>
                <strong>#AL-001</strong>
              </div>
              <div>
                <h3>Proprietário do contrato</h3>
                <strong>Empresa Exemplo</strong>
              </div>
            </div>
          </Note>
          <ActionRow>
            <Button to="/pedidos/AL-001">Consultar pedido vinculado</Button>
            <Button variant="secondary" to="/agente/creditos">
              Voltar aos créditos
            </Button>
          </ActionRow>
        </Card>
        <SidePanel
          title="Banco concedente"
          description="Hyper Banco é o único responsável por registrar e associar este crédito ao pedido."
        >
          <div className="credit-facts credit-facts--single">
            <div>
              <h3>Banco</h3>
              <strong>Hyper Banco</strong>
            </div>
            <div>
              <h3>Responsabilidade</h3>
              <strong>Registro e associação</strong>
            </div>
            <div>
              <h3>Status</h3>
              <strong>Associado</strong>
            </div>
            <div>
              <h3>Próximo passo</h3>
              <strong>Consultar o pedido #AL-001</strong>
            </div>
          </div>
          <Note title="Contexto bancário">
            A associação não é uma nova aprovação. Somente o banco concedente registra e associa o
            crédito; o cliente não o edita.
          </Note>
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}

export function CreditsPage() {
  const { state } = useRental()
  return (
    <PageLayout kind="agent" figmaId="92:2706">
      <PageHeading
        className="page-heading--spaced"
        title="Créditos vinculados a aluguéis."
        description="Consulte a concessão e a associação ao pedido de aluguel."
      />
      <Card>
        <h2>CR-001 · Hyper Banco</h2>
        <p>
          Ana Silva · Pedido #AL-001
          <br />
          {state.credit.value} · taxa proposta de {state.credit.rate}
        </p>
        <Button to="/agente/creditos/CR-001/associado" className="credit-list-action">
          Consultar associação
        </Button>
        <Button to="/agente/creditos/associar" variant="secondary" className="credit-list-action">
          Registrar associação
        </Button>
      </Card>
      <TextLink to="/agente">Voltar à central</TextLink>
    </PageLayout>
  )
}
