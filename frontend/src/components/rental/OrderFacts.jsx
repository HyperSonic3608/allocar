import Field from '../ui/Field.jsx'
import { Badge } from '../ui/Feedback.jsx'
import Button from '../ui/Button.jsx'
import { ActionRow } from '../layout/PageLayout.jsx'
import { useApp } from '../../state/app-context.js'
import {
  contractType,
  formatMoney,
  period,
  statusLabels,
  statusTones,
  permissions,
  vehicleName,
} from '../../data/rental.js'

export function OrderStatus({ status, outlined = false }) {
  return (
    <Badge tone={statusTones[status] || 'neutral'} outlined={outlined}>
      {statusLabels[status] || status}
    </Badge>
  )
}

export function OrderFacts({ detail }) {
  const { pedido, cliente, automovel } = detail
  return (
    <div className="field-grid">
      <Field label="Cliente" value={cliente.nome} readOnly />
      <Field label="Pedido" value={pedido.numero} readOnly />
      <Field
        label="Veículo"
        value={`${vehicleName(automovel)} · ${automovel.ano} · ${automovel.placa}`}
        readOnly
      />
      <Field label="Matrícula" value={automovel.matricula} readOnly />
      <Field label="Período" value={period(pedido)} readOnly />
      <Field label="Tipo de contrato" value={contractType(pedido.tipo)} readOnly />
      <Field
        className="field-grid__full"
        label="Valor total proposto"
        value={formatMoney(pedido.valorTotal)}
        readOnly
      />
    </div>
  )
}

export function OrderActions({ detail }) {
  const { account } = useApp()
  const allowed = permissions(account, detail)
  const id = detail.pedido.id
  return (
    <ActionRow>
      {allowed.analyze && <Button to={`/agente/pedidos/${id}/analise`}>Analisar pedido</Button>}
      {allowed.execute && <Button to={`/agente/pedidos/${id}/aprovado`}>Revisar contrato</Button>}
      {detail.contrato && (
        <Button to={`/contratos/${detail.contrato.id}`}>Consultar contrato</Button>
      )}
      {allowed.edit && (
        <Button to={`/pedidos/${id}/alterar`} variant="secondary">
          Alterar pedido
        </Button>
      )}
      {allowed.cancel && (
        <Button to={`/pedidos/${id}/cancelar`} variant="danger">
          Cancelar pedido
        </Button>
      )}
      <Button to={account.tipo === 'CLIENTE' ? '/pedidos' : '/agente'} variant="secondary">
        Voltar
      </Button>
    </ActionRow>
  )
}
