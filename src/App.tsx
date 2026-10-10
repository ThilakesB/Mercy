import { createBrowserRouter, RouterProvider } from 'react-router'
import Layout from './Layout'
import { AppProvider } from './ui'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import EvidenceTrackerPage from './pages/EvidenceTracker'
import TimelinePage from './pages/TimelinePage'
import PolicePage from './pages/PolicePage'
import Summary from './pages/Summary'
import Alerts from './pages/Alerts'
import Research from './pages/Research'
import Public from './pages/Public'
import Admin from './pages/Admin'
import Settings from './pages/Settings'
import { Button, Card, EmptyState } from './ui'

const router = createBrowserRouter([
  { path: '/login', Component: Login },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'cases', Component: Cases },
      { path: 'cases/:id', Component: CaseDetail },
      { path: 'evidence', Component: EvidenceTrackerPage },
      { path: 'timeline', Component: TimelinePage },
      { path: 'police', Component: PolicePage },
      { path: 'summary', Component: Summary },
      { path: 'alerts', Component: Alerts },
      { path: 'research', Component: Research },
      { path: 'public', Component: Public },
      { path: 'admin', Component: Admin },
      { path: 'settings', Component: Settings },
      {
        path: '*',
        Component: () => (
          <Card className="m-6">
            <EmptyState
              title="Record not found"
              text="The requested judicial registry route does not exist."
              action={
                <a href="/">
                  <Button>Return to Bench Dashboard</Button>
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
