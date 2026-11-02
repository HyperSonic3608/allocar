import Icon from '../ui/Icon.jsx'

const requestSteps = ['Automóvel', 'Período e contrato', 'Revisão', 'Envio do pedido']
const rentalSteps = ['Recebido', 'Em análise', 'Aprovação', 'Contrato']

export default function ProgressSteps({ flow = 'rental', current = 1, status = 'EM_ANALISE' }) {
  const request = flow === 'request'
  const cancelled = !request && status === 'CANCELADO'
  const rejected = !request && status === 'REPROVADO'
  const index = request
    ? current
    : cancelled
      ? 1
      : ['APROVADO', 'REPROVADO'].includes(status)
        ? 2
        : status === 'EM_EXECUCAO'
          ? 3
          : 1
  const titles = [...(request ? requestSteps : rentalSteps)]
  if (cancelled) titles[1] = 'Pedido cancelado'
  if (rejected) titles[2] = 'Não aprovado'
  const description = request
    ? 'Escolha o automóvel, informe o período e revise os dados antes de enviar.'
    : cancelled
      ? 'Pedido encerrado. Para solicitar outro aluguel, crie um novo pedido.'
      : rejected
        ? 'Revise o pedido para solicitar nova análise. A execução do contrato está bloqueada.'
        : status === 'EM_EXECUCAO'
          ? 'Contrato registrado após aprovação financeira da proposta.'
          : 'A contratação depende de parecer financeiro positivo vigente.'
  return (
    <section
      className="progress-steps"
      aria-label={request ? 'Etapas da solicitação' : 'Etapas do pedido'}
      data-flow={flow}
      data-status={request ? undefined : status}
    >
      <ol>
        {titles.map((title, step) => {
          const state =
            step < index
              ? 'completed'
              : step === index
                ? cancelled || rejected
                  ? 'interrupted'
                  : 'current'
                : cancelled || rejected
                  ? 'blocked'
                  : 'upcoming'
          const caption =
            state === 'completed'
              ? 'Concluído'
              : state === 'blocked'
                ? 'Indisponível'
                : state === 'upcoming'
                  ? 'A seguir'
                  : cancelled
                    ? 'Encerrado'
                    : rejected
                      ? 'Revisão necessária'
                      : !request && status === 'APROVADO'
                        ? 'Parecer positivo'
                        : !request && status === 'EM_EXECUCAO'
                          ? 'Em execução'
                          : 'Etapa atual'
          return (
            <li key={step} data-state={state} aria-current={step === index ? 'step' : undefined}>
              <span className="progress-steps__number">
                {state === 'completed' ? <Icon name="stepCheck" /> : step + 1}
              </span>
              <div className="progress-steps__label">
                <strong>{title}</strong>
                <small>{caption}</small>
              </div>
              {step < titles.length - 1 && <Icon name="chevronRight" size={16} />}
            </li>
          )
        })}
      </ol>
      <p>{description}</p>
    </section>
  )
}
