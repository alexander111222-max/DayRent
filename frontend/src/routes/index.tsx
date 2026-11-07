import { createBrowserRouter } from 'react-router-dom'
import { Layout, ProtectedRoute } from '@/components/layout'
import {
  HomePage,
  SearchPage,
  ItemDetailPage,
  LoginPage,
  RegisterPage,
  VerifyEmailPage,
  ProfilePage,
  MyItemsPage,
  CreateItemPage,
  EditItemPage,
  ItemBookingsPage,
  BasketPage,
  BookingsPage,
  NotFoundPage,
} from '@/pages'
import { ROUTES } from '@/utils/constants'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.search, element: <SearchPage /> },
      { path: '/items/:id', element: <ItemDetailPage /> },
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
      { path: ROUTES.verifyEmail, element: <VerifyEmailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.profile, element: <ProfilePage /> },
          { path: ROUTES.myItems, element: <MyItemsPage /> },
          { path: ROUTES.itemCreate, element: <CreateItemPage /> },
          { path: '/items/:id/edit', element: <EditItemPage /> },
          { path: '/items/:id/bookings', element: <ItemBookingsPage /> },
          { path: ROUTES.basket, element: <BasketPage /> },
          { path: ROUTES.bookings, element: <BookingsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
