import { createBrowserRouter, RouterProvider } from 'react-router'
import Layout from './Layout'
import { AppProvider } from './ui'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import CasesNew from './pages/CasesNew'
import CaseDetail from './pages/CaseDetail'
import Schedule from './pages/Schedule'
import Lawyers from './pages/Lawyers'
import Criminals from './pages/Criminals'
import CriminalDetail from './pages/CriminalDetail'
import Research from './pages/Research'
import LawReference from './pages/LawReference'
import Judgments from './pages/Judgments'
import Documents from './pages/Documents'
import Settings from './pages/Settings'
import PrintDecree from './pages/PrintDecree'
import EvidenceTrackerPage from './pages/EvidenceTracker'
import TimelinePage from './pages/TimelinePage'
import PolicePage from './pages/PolicePage'
import Summary from './pages/Summary'
import Alerts from './pages/Alerts'
import Public from './pages/Public'
import Admin from './pages/Admin'
import { Button, Card, EmptyState } from './ui'

const router = createBrowserRouter([
  { path: '/login', Component: Login },
  { path: '/print/:id', Component: PrintDecree },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'cases', Component: Cases },
      { path: 'cases/new', Component: CasesNew },
      { path: 'cases/:id', Component: CaseDetail },
      { path: 'schedule', Component: Schedule },
      { path: 'lawyers', Component: Lawyers },
      { path: 'criminals', Component: Criminals },
      { path: 'criminals/:id', Component: CriminalDetail },
      { path: 'research', Component: Research },
      { path: 'law-reference', Component: LawReference },
      { path: 'judgments', Component: Judgments },
      { path: 'documents', Component: Documents },
      { path: 'settings', Component: Settings },
      // Supplementary legacy endpoints
      { path: 'evidence', Component: EvidenceTrackerPage },
      { path: 'timeline', Component: TimelinePage },
      { path: 'police', Component: PolicePage },
      { path: 'summary', Component: Summary },
      { path: 'alerts', Component: Alerts },
      { path: 'public', Component: Public },
      { path: 'admin', Component: Admin },
      {
        path: '*',
        Component: () => (
          <Card className="m-6 p-8">
            <EmptyState
              title="Record not found"
              text="The requested judicial registry route does not exist."
              action={
                <a href="/">
                  <Button variant="hazard" size="sm">Return to Bench Dashboard</Button>
                </a>
              }
            />
          </Card>
        ),
      },
    ],
  },
])

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  )
}
