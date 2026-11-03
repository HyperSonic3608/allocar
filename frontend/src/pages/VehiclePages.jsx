import { useCallback, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { api, all } from '../api/client.js'
import { useApp } from '../state/app-context.js'
import useResource from '../state/useResource.js'
import PageLayout, { Columns, SidePanel, Stack } from '../components/layout/PageLayout.jsx'
import Card, { Metadata, PageHeading } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import VehicleCard, { VehicleImage } from '../components/rental/VehicleCard.jsx'
import ResourceState, { Pagination } from '../components/ui/ResourceState.jsx'
import { ownerName, rentalDays, vehicleName } from '../data/rental.js'

export function VehicleSearchPage() {
  const { draft, setDraft } = useApp()
  const [params, setParams] = useSearchParams()
  const marca = params.get('marca') || ''
  const ano = params.get('ano') || ''
  const page = Number(params.get('pagina')) || 0
  const [start, setStart] = useState(draft.start)
  const [end, setEnd] = useState(draft.end)
  const resource = useResource(
    useCallback(
      async (signal) => {
        const [catalog, choices] = await Promise.all([
          api.vehicles({ marca, ano, pagina: page, tamanho: 6 }, signal),
          all('/automoveis', { signal }),
        ])
        return {
          catalog,
          brands: [...new Set(choices.map((vehicle) => vehicle.marca))].sort(),
          years: [...new Set(choices.map((vehicle) => vehicle.ano))].sort((a, b) => b - a),
        }
      },
      [marca, ano, page],
    ),
  )
  function filter(key, value) {
    const next = new URLSearchParams(params)
    next.delete('pagina')
    if (next.get(key) === String(value)) next.delete(key)
    else next.set(key, value)
    setParams(next)
  }
  function updatePeriod(event) {
    event.preventDefault()
    const input = event.currentTarget.querySelector('[name=fim]')
    if (end <= start) {
      input.setCustomValidity('O término deve ser posterior ao início.')
      input.reportValidity()
      return
    }
    setDraft((previous) => ({ ...previous, start, end }))
    resource.reload()
  }
  return (
    <PageLayout
      figmaId={resource.data?.catalog.total === 0 ? '92:2705' : '92:2697'}
      progress={{ flow: 'request', current: 0 }}
    >
      <PageHeading
        eyebrow="ALUGAR UM CARRO · 1 DE 4"
        title="Encontre o carro para o seu próximo caminho"
        description="Escolha um automóvel e confira os detalhes antes de solicitar o aluguel."
      />
      <Card as="form" className="search-period" onSubmit={updatePeriod}>
        <Field
          label="Início do aluguel"
          type="date"
          name="inicio"
          icon={null}
          value={start}
          onChange={(event) => {
            event.target.form?.querySelector('[name=fim]')?.setCustomValidity('')
            setStart(event.target.value)
          }}
          required
        />
        <Field
          label="Término do aluguel"
          type="date"
          name="fim"
          icon={null}
          value={end}
          onChange={(event) => {
            event.target.setCustomValidity('')
            setEnd(event.target.value)
          }}
          required
        />
        <p className="muted">
          {rentalDays(start, end) > 0
            ? `${rentalDays(start, end)} dias de aluguel`
            : 'Informe as datas'}
          <br />
          Período desejado
        </p>
        <Button type="submit">Atualizar busca</Button>
      </Card>
      <ResourceState resource={resource}>
        {({ catalog, brands, years }) => (
          <div className="search-layout">
            <Card className="search-filters">
              <h2>Refine sua busca</h2>
              <fieldset className="filter-group">
                <legend>Marca</legend>
                {brands.map((name) => (
                  <Button
                    key={name}
                    variant="secondary"
                    aria-pressed={marca === name}
                    onClick={() => filter('marca', name)}
                  >
                    {name}
                  </Button>
                ))}
              </fieldset>
              <fieldset className="filter-group">
                <legend>Ano do automóvel</legend>
                {[...new Set([...years, (years[0] || new Date().getFullYear()) + 1])].map(
                  (year) => (
                    <Button
                      key={year}
                      variant="secondary"
                      aria-pressed={ano === String(year)}
                      onClick={() => filter('ano', year)}
                    >
                      {year}
                    </Button>
                  ),
                )}
              </fieldset>
              <Button variant="secondary" onClick={() => setParams({})}>
                Limpar filtros
              </Button>
            </Card>
            <Stack>
              <div className="search-results-heading">
                <h2>
                  {catalog.total} automóve{catalog.total === 1 ? 'l no catálogo' : 'is no catálogo'}
                </h2>
              </div>
              {catalog.total ? (
                <>
                  <div className="vehicle-grid">
                    {catalog.itens.map((vehicle) => (
                      <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                  </div>
                  <Pagination
                    page={catalog.pagina}
                    size={catalog.tamanho}
                    total={catalog.total}
                    onChange={(pagina) => {
                      const next = new URLSearchParams(params)
                      next.set('pagina', pagina)
                      setParams(next)
                    }}
                  />
                </>
              ) : (
                <Card>
                  <h2 className="large-title">Nenhum automóvel para estes filtros.</h2>
                  <p>Tente outra marca ou outro ano para consultar o catálogo.</p>
                  <Button onClick={() => setParams({})}>Limpar filtros</Button>
                </Card>
              )}
            </Stack>
          </div>
        )}
      </ResourceState>
    </PageLayout>
  )
}

export function VehicleDetailPage() {
  const { id } = useParams()
  const { account, setDraft } = useApp()
  const navigate = useNavigate()
  const resource = useResource(
    useCallback(
      async (signal) => {
        const [vehicle, agents] = await Promise.all([api.vehicle(id, signal), api.agents(signal)])
        return { vehicle, agents }
      },
      [id],
    ),
  )
  return (
    <PageLayout figmaId="92:2698" progress={{ flow: 'request', current: 0 }}>
      <PageHeading
        eyebrow="AUTOMÓVEL · 1 DE 4"
        title="Conheça o automóvel escolhido"
        description="Consulte a identificação e siga para o período e o tipo de contrato."
      />
      <ResourceState resource={resource}>
        {({ vehicle, agents }) => (
          <Columns>
            <Card>
              <VehicleImage vehicle={vehicle} className="vehicle-detail-photo" />
              <h2 className="large-title">{vehicleName(vehicle)}</h2>
              <p className="muted">
                {vehicle.ano} · {vehicle.placa} · {vehicle.matricula}
              </p>
              <Metadata
                title="Identificação do automóvel"
                items={[
                  ['Marca', vehicle.marca],
                  ['Modelo', vehicle.modelo],
                  ['Ano', vehicle.ano],
                  ['Matrícula / placa', `${vehicle.matricula} · ${vehicle.placa}`],
                ]}
              />
            </Card>
            <SidePanel title="Seu próximo passo">
              <p>
                Informe o período e o valor da proposta. O envio inicia a análise financeira pelo
                agente escolhido.
              </p>
              <Metadata
                title="Propriedade atual"
                items={[
                  [
                    'Proprietário',
                    ownerName(vehicle.proprietarioId, agents, {
                      id: account.parteId,
                      nome: account.nome,
                    }),
                  ],
                  ['Matrícula', vehicle.matricula],
                ]}
              />
              {account.tipo === 'CLIENTE' && (
                <Button
                  onClick={() => {
                    setDraft((draft) => ({ ...draft, vehicleId: vehicle.id }))
                    navigate('/pedidos/novo')
                  }}
                >
                  Selecionar automóvel
                </Button>
              )}
              <Button variant="secondary" to="/veiculos">
                Voltar à busca
              </Button>
            </SidePanel>
          </Columns>
        )}
      </ResourceState>
    </PageLayout>
  )
}
