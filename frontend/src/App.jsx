import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import AppProvider from './state/AppProvider.jsx'
import AppOverlays from './components/AppOverlays.jsx'
import RequireSession from './components/RequireSession.jsx'
import LandingPage from './pages/LandingPage.jsx'
import { InstitutionalRegisterPage, LoginPage, RegisterPage } from './pages/AuthPages.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import { VehicleDetailPage, VehicleSearchPage } from './pages/VehiclePages.jsx'
import {
  CancelledOrderPage,
  CancelOrderPage,
  MyOrdersPage,
  OrderDetailPage,
  OrderFormPage,
  OrderReviewPage,
  OrderSentPage,
} from './pages/OrderPages.jsx'
import {
  AgentDashboardPage,
  AnalysisPage,
  DecisionHistoryPage,
  RejectedOrderPage,
} from './pages/AgentPages.jsx'
import {
  ApprovalPage,
  ContractDetailPage,
  CreditAssociationPage,
  CreditRegistrationPage,
  CreditReceiptPage,
  CreditsPage,
  ExecutedContractPage,
  MyContractsPage,
} from './pages/ContractPages.jsx'

function RouteEffects() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = `AlloCar · ${pathname === '/' ? 'Seu próximo caminho começa aqui' : 'Aluguel de carros'}`
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo
        </a>
        <RouteEffects />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/entrar/erro" element={<Navigate to="/entrar" replace />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/cadastro/instituicao" element={<InstitutionalRegisterPage />} />
          <Route element={<RequireSession />}>
            <Route path="/veiculos" element={<VehicleSearchPage />} />
            <Route path="/veiculos/:id" element={<VehicleDetailPage />} />
            <Route path="/pedidos" element={<MyOrdersPage />} />
            <Route path="/pedidos/:id" element={<OrderDetailPage />} />
            <Route path="/pedidos/:id/alterar" element={<OrderFormPage editing />} />
            <Route path="/pedidos/:id/cancelado" element={<CancelledOrderPage />} />
            <Route path="/pedidos/:id/enviado" element={<OrderSentPage />} />
            <Route path="/pedidos/:id/reprovado" element={<RejectedOrderPage />} />
            <Route path="/contratos" element={<MyContractsPage />} />
            <Route path="/contratos/:id" element={<ContractDetailPage />} />
            <Route path="/contratos/:id/executado" element={<ExecutedContractPage />} />
            <Route path="/creditos/:id" element={<CreditReceiptPage />} />
          </Route>
          <Route element={<RequireSession roles={['CLIENTE']} />}>
            <Route path="/meu-cadastro" element={<ProfilePage />} />
            <Route path="/pedidos/novo" element={<OrderFormPage />} />
            <Route path="/pedidos/revisao" element={<OrderReviewPage />} />
            <Route path="/pedidos/:id/cancelar" element={<CancelOrderPage />} />
          </Route>
          <Route element={<RequireSession roles={['EMPRESA', 'BANCO']} />}>
            <Route path="/agente" element={<AgentDashboardPage />} />
            <Route path="/agente/pedidos/:id/analise" element={<AnalysisPage />} />
            <Route path="/agente/pedidos/:id/aprovado" element={<ApprovalPage />} />
            <Route path="/agente/historico" element={<DecisionHistoryPage />} />
          </Route>
          <Route element={<RequireSession roles={['BANCO']} />}>
            <Route path="/agente/creditos" element={<CreditsPage />} />
            <Route path="/agente/creditos/novo" element={<CreditRegistrationPage />} />
            <Route path="/agente/creditos/associar" element={<CreditAssociationPage />} />
            <Route path="/agente/creditos/:id" element={<CreditReceiptPage />} />
            <Route path="/agente/creditos/:id/associado" element={<CreditReceiptPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AppOverlays />
      </AppProvider>
    </BrowserRouter>
  )
}
