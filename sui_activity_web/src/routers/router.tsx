import {
  createHashRouter,
} from 'react-router-dom'
import HomePage from '../pages/HomePage'

const routes = [
  {
    path: '/',
    element: <HomePage />,
  }
]

const router = createHashRouter(routes, {
  future: {
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_relativeSplatPath: true,
    v7_skipActionErrorRevalidation: true,
  }
})

export default router
