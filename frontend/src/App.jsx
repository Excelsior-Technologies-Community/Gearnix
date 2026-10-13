import AppRoutes from './routes/AppRoutes'

/**
 * Root app component. Routing lives in AppRoutes; each layout controls its own
 * theming. Global providers (Auth, Cart, Wishlist) wrap this in later steps.
 */
export default function App() {
  return <AppRoutes />
}
