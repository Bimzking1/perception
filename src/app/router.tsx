import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { HomePage } from '../features/home/HomePage'
import { GamesPage } from '../features/games/GamesPage'
import { SessionPage } from '../features/session/SessionPage'
import { ResultsPage } from '../features/results/ResultsPage'
import { StatisticsPage } from '../features/statistics/StatisticsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'games', element: <GamesPage /> },
      { path: 'session', element: <SessionPage /> },
      { path: 'results/:sessionId', element: <ResultsPage /> },
      { path: 'stats', element: <StatisticsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
