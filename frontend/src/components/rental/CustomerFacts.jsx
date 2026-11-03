import { Metadata } from '../ui/Card.jsx'
import { formatMoney } from '../../data/rental.js'

export default function CustomerFacts({ customer }) {
  const address = customer.endereco
  return (
    <>
      <Metadata
        title="Identificação e endereço"
        items={[
          ['Nome', customer.nome],
          ['RG / CPF', `${customer.rg} · ${customer.cpf}`],
          ['Profissão', customer.profissao],
          [
            'Endereço',
            address
              ? `${address.logradouro}, ${address.numero}${address.complemento ? ` · ${address.complemento}` : ''} · ${address.bairro} · ${address.cidade}/${address.uf} · ${address.cep}`
              : 'Não informado',
          ],
        ]}
      />
      <Metadata
        title="Vínculos e rendimentos analisados"
        items={
          customer.vinculos?.length
            ? customer.vinculos.map((item, index) => [
                `Vínculo ${index + 1} · ${item.empregador}`,
                formatMoney(item.rendimento),
              ])
            : [['Vínculos', 'Nenhum vínculo informado']]
        }
      />
    </>
  )
}
