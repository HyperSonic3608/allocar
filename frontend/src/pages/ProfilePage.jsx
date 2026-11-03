import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../api/client.js'
import { useApp } from '../state/app-context.js'
import useResource from '../state/useResource.js'
import useMutation from '../state/useMutation.js'
import PageLayout, {
  ActionRow,
  Columns,
  SidePanel,
  StepsList,
} from '../components/layout/PageLayout.jsx'
import Card, { PageHeading } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import AddressFields from '../components/ui/AddressFields.jsx'
import { Note } from '../components/ui/Feedback.jsx'
import ResourceState, { ErrorMessage } from '../components/ui/ResourceState.jsx'
import { formatMoney } from '../data/rental.js'

function IdentityForm({ customer, onSaved, onReload }) {
  const [address, setAddress] = useState(customer.endereco)
  const mutation = useMutation()
  async function submit(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    await mutation.run(async () =>
      onSaved(
        await api.updateProfile({
          versaoCadastro: customer.versaoCadastro,
          nome: values.nome,
          rg: values.rg,
          cpf: values.cpf,
          profissao: values.profissao,
          endereco: address,
        }),
      ),
    )
  }
  return (
    <form className="stack" onSubmit={submit}>
      <Note title="Identificação">
        <div className="field-grid field-grid--tight">
          <Field
            label="Nome completo"
            name="nome"
            defaultValue={customer.nome}
            maxLength={160}
            autoComplete="name"
            required
          />
          <Field
            label="Profissão"
            name="profissao"
            defaultValue={customer.profissao}
            required
            maxLength={120}
          />
          <Field label="CPF" name="cpf" defaultValue={customer.cpf} required maxLength={30} />
          <Field label="RG" name="rg" defaultValue={customer.rg} required maxLength={30} />
        </div>
      </Note>
      <Note title="Endereço">
        <AddressFields value={address} onChange={setAddress} errors={mutation.error?.campos} />
      </Note>
      <ErrorMessage
        error={mutation.error}
        onReload={mutation.error?.status === 409 ? onReload : undefined}
      />
      <ActionRow>
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? 'Salvando…' : 'Salvar cadastro'}
        </Button>
        <Button variant="secondary" to="/pedidos">
          Voltar
        </Button>
      </ActionRow>
    </form>
  )
}

function EmploymentForm({ customer, employment, index, onSaved, onReload }) {
  const mutation = useMutation()
  async function submit(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const body = {
      versaoCadastro: customer.versaoCadastro,
      empregador: values.empregador,
      rendimento: Number(values.rendimento),
    }
    await mutation.run(async () =>
      onSaved(
        employment
          ? await api.updateEmployment(employment.id, body)
          : await api.addEmployment(body),
      ),
    )
  }
  return (
    <form className="employment-form stack stack--tight" onSubmit={submit}>
      <div className="field-grid field-grid--tight">
        <Field
          label={`Empregador ${index + 1}`}
          name="empregador"
          defaultValue={employment?.empregador || ''}
          maxLength={160}
          required
        />
        <Field
          label={`Renda mensal ${index + 1}`}
          name="rendimento"
          defaultValue={employment?.rendimento ?? ''}
          type="number"
          min="0"
          step="0.01"
          required
          helper="Rendimento bruto mensal em reais."
        />
      </div>
      <ErrorMessage
        error={mutation.error}
        onReload={mutation.error?.status === 409 ? onReload : undefined}
      />
      <ActionRow>
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? 'Salvando…' : employment ? 'Salvar vínculo' : 'Adicionar vínculo'}
        </Button>
        {employment && (
          <Button
            variant="secondary"
            disabled={mutation.pending}
            onClick={() =>
              mutation.run(async () =>
                onSaved(await api.deleteEmployment(employment.id, customer.versaoCadastro)),
              )
            }
          >
            Remover vínculo
          </Button>
        )}
      </ActionRow>
    </form>
  )
}

function DeactivateAccount({ customer }) {
  const { clearSession } = useApp()
  const [confirm, setConfirm] = useState(false)
  const mutation = useMutation()
  const navigate = useNavigate()
  return (
    <Note title="Desativação da conta">
      <p>Encerre o acesso à sua conta preservando o histórico de pedidos e contratos.</p>
      {confirm ? (
        <>
          <p>
            Confirma a desativação? Você será desconectado e não poderá entrar novamente com esta
            conta.
          </p>
          <ErrorMessage error={mutation.error} />
          <ActionRow>
            <Button
              variant="secondary"
              onClick={() => setConfirm(false)}
              disabled={mutation.pending}
            >
              Manter conta
            </Button>
            <Button
              variant="danger"
              disabled={mutation.pending}
              onClick={() =>
                mutation.run(async () => {
                  await api.deactivate(customer.versaoCadastro)
                  clearSession()
                  navigate('/entrar', { replace: true })
                })
              }
            >
              {mutation.pending ? 'Desativando…' : 'Confirmar desativação'}
            </Button>
          </ActionRow>
        </>
      ) : (
        <Button variant="secondary" onClick={() => setConfirm(true)}>
          Desativar minha conta
        </Button>
      )}
    </Note>
  )
}

export default function ProfilePage() {
  const resource = useResource(useCallback((signal) => api.profile(signal), []))
  const { notify, refreshSession } = useApp()
  function saved(customer) {
    resource.replace(customer)
    refreshSession()
    notify('Cadastro atualizado. Pedidos abertos podem exigir nova análise.')
  }
  return (
    <PageLayout figmaId="4:1134">
      <ResourceState resource={resource}>
        {(customer) => (
          <Columns>
            <Card className="card--form">
              <PageHeading
                title="Seu cadastro"
                description="Mantenha identificação, endereço e renda atualizados para a análise financeira."
              />
              <IdentityForm
                key={`identity-${customer.versaoCadastro}`}
                customer={customer}
                onSaved={saved}
                onReload={resource.reload}
              />
              <Note title="Emprego e renda">
                <p>
                  Até três vínculos empregatícios. Renda total: {formatMoney(customer.rendaTotal)}.
                </p>
                {customer.vinculos.map((employment, index) => (
                  <EmploymentForm
                    key={`${employment.id}-${customer.versaoCadastro}`}
                    customer={customer}
                    employment={employment}
                    index={index}
                    onSaved={saved}
                    onReload={resource.reload}
                  />
                ))}
                {customer.vinculos.length < 3 && (
                  <EmploymentForm
                    key={`new-${customer.versaoCadastro}`}
                    customer={customer}
                    index={customer.vinculos.length}
                    onSaved={saved}
                    onReload={resource.reload}
                  />
                )}
              </Note>
              <DeactivateAccount customer={customer} />
            </Card>
            <SidePanel description="Mudanças nos dados financeiros invalidam pareceres anteriores de pedidos ainda não executados.">
              <StepsList />
            </SidePanel>
          </Columns>
        )}
      </ResourceState>
    </PageLayout>
  )
}
