import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import PrototypeProvider from './state/PrototypeProvider.jsx'
import PrototypeOverlays from './components/PrototypeOverlays.jsx'
import LandingPage from './pages/LandingPage.jsx'
import { InstitutionalRegisterPage, LoginPage, RegisterPage } from './pages/AuthPages.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import { EmptySearchPage, VehicleDetailPage, VehicleSearchPage } from './pages/VehiclePages.jsx'
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
      <PrototypeProvider>
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo
        </a>
        <RouteEffects />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/entrar/erro" element={<LoginPage error />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/cadastro/instituicao" element={<InstitutionalRegisterPage />} />
          <Route path="/meu-cadastro" element={<ProfilePage />} />
          <Route path="/veiculos" element={<VehicleSearchPage />} />
          <Route path="/veiculos/sem-resultados" element={<EmptySearchPage />} />
          <Route path="/veiculos/:id" element={<VehicleDetailPage />} />
          <Route path="/pedidos" element={<MyOrdersPage />} />
          <Route path="/pedidos/novo" element={<OrderFormPage />} />
          <Route path="/pedidos/revisao" element={<OrderReviewPage />} />
          <Route path="/pedidos/AL-001" element={<OrderDetailPage />} />
          <Route path="/pedidos/AL-001/alterar" element={<OrderFormPage editing />} />
          <Route path="/pedidos/AL-001/cancelar" element={<CancelOrderPage />} />
          <Route path="/pedidos/AL-001/cancelado" element={<CancelledOrderPage />} />
          <Route path="/pedidos/AL-001/enviado" element={<OrderSentPage />} />
          <Route path="/pedidos/AL-001/reprovado" element={<RejectedOrderPage />} />
          <Route path="/agente" element={<AgentDashboardPage />} />
          <Route path="/agente/pedidos/AL-001/analise" element={<AnalysisPage />} />
          <Route path="/agente/pedidos/AL-001/aprovado" element={<ApprovalPage />} />
          <Route path="/agente/historico" element={<DecisionHistoryPage />} />
          <Route path="/agente/creditos" element={<CreditsPage />} />
          <Route path="/agente/creditos/associar" element={<CreditAssociationPage />} />
          <Route path="/agente/creditos/CR-001/associado" element={<CreditReceiptPage />} />
          <Route path="/contratos" element={<MyContractsPage />} />
          <Route path="/contratos/CT-001" element={<ContractDetailPage />} />
          <Route path="/contratos/CT-001/executado" element={<ExecutedContractPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <PrototypeOverlays />
      </PrototypeProvider>
    </BrowserRouter>
  )
}
