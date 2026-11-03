import { Metadata } from '../ui/Card.jsx'
import CustomerFacts from './CustomerFacts.jsx'
import { contractType, formatMoney, period, vehicleName } from '../../data/rental.js'

export default function DecisionFacts({ decision, vehicle }) {
  const proposal = decision.propostaAnalisada
  return (
    <details className="decision-snapshot">
      <summary>Dados considerados neste parecer</summary>
      {decision.dadosCliente && <CustomerFacts customer={decision.dadosCliente} />}
      {proposal && (
        <Metadata
          title="Proposta analisada"
          items={[
            [
              'Automóvel',
              proposal.automovelId === vehicle?.id ? vehicleName(vehicle) : proposal.automovelId,
            ],
            ['Período', period(proposal)],
            ['Tipo', contractType(proposal.tipo)],
            ['Valor proposto', formatMoney(proposal.valorTotal)],
          ]}
        />
      )}
    </details>
  )
}
