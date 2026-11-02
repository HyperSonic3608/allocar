import PageLayout, {
  ActionRow,
  Columns,
  SidePanel,
  StepsList,
} from '../components/layout/PageLayout.jsx'
import Card, { PageHeading } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import { Note } from '../components/ui/Feedback.jsx'
import { formatMoney, parseMoney } from '../data/demo.js'
import { usePrototype } from '../state/prototype-store.js'

export default function ProfilePage() {
  const { state, dispatch } = usePrototype()
  const customer = state.customer
  function save(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    dispatch({
      type: 'CUSTOMER',
      values: {
        name: values.nome,
        occupation: values.profissao,
        address: values.endereco,
        employers: [values.empregador0, values.empregador1, values.empregador2],
        incomes: [values.renda0, values.renda1, values.renda2],
      },
    })
  }
  return (
    <PageLayout figmaId="4:1134">
      <Columns>
        <Card as="form" className="card--form" onSubmit={save}>
          <PageHeading
            title="Seu cadastro"
            description="Mantenha identificação, endereço e renda atualizados para manter a análise financeira consistente."
          />
          <Note title="Identificação">
            <div className="field-grid field-grid--tight">
              <Field
                label="Nome completo"
                name="nome"
                defaultValue={customer.name}
                helper="Nome como aparece na CNH e documentos."
                required
              />
              <Field
                label="Profissão"
                name="profissao"
                defaultValue={customer.occupation}
                helper="Cargo principal utilizado na análise financeira."
                required
              />
            </div>
          </Note>
          <Note title="Endereço">
            <Field
              label="Endereço"
              name="endereco"
              defaultValue={customer.address}
              helper="Endereço residencial utilizado para validação e contato."
              required
            />
          </Note>
          <Note title="Emprego e renda">
            <div className="field-grid field-grid--tight">
              {[0, 1, 2].map((index) => (
                <div className="field-grid-row" key={index}>
                  <Field
                    label={`Empregador ${index + 1}`}
                    name={`empregador${index}`}
                    defaultValue={customer.employers[index]}
                    placeholder="Não informado"
                    helper={
                      index === 0
                        ? 'Nome da empresa principal.'
                        : `${index === 1 ? 'Segundo' : 'Terceiro'} vínculo empregatício (opcional).`
                    }
                  />
                  <Field
                    label={`Renda mensal ${index + 1}`}
                    name={`renda${index}`}
                    defaultValue={customer.incomes[index]}
                    placeholder="Não informado"
                    helper={
                      index === 0
                        ? 'Renda bruta declarada para análise financeira.'
                        : `Deixe em branco se não houver ${index === 1 ? 'segundo' : 'terceiro'} vínculo.`
                    }
                  />
                </div>
              ))}
            </div>
            <p>
              Máximo de 3 vínculos empregatícios. Renda total informada:{' '}
              {formatMoney(customer.incomes.reduce((sum, value) => sum + parseMoney(value), 0))}.
            </p>
          </Note>
          <ActionRow>
            <Button type="submit">Salvar cadastro</Button>
            <Button to="/pedidos" variant="secondary">
              Voltar
            </Button>
          </ActionRow>
        </Card>
        <SidePanel description="Alterações nos dados utilizados na análise invalidam a aprovação financeira anterior e exigem nova análise.">
          <StepsList />
        </SidePanel>
      </Columns>
    </PageLayout>
  )
}
