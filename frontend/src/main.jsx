import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Users from '@pages/Users';
import AdminRequests from '@pages/AdminRequests';
import Register from '@pages/Register';
import Error404 from '@pages/Error404';
import Notificaciones from '@pages/Notificaciones';
import Construccion from '@pages/Construccion';
import Root from '@pages/Root';
import Index from '@pages/Index';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    errorElement: <Error404/>,
    children: [
      {
        index: true,
        element: <Index/>
      },
      {
        path: '/home',
        element: <Home/>
      },
      {
        path: '/users',
        element: (
        <ProtectedRoute allowedRoles={['administrador']}>
          <Users />
        </ProtectedRoute>
        ),
      },
      {
        path: '/admin/requests',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <AdminRequests />
          </ProtectedRoute>
        ),
      },
      {
        path: '/notificaciones',
        element: (
          <ProtectedRoute allowedRoles={['encargado_inventario']}>
            <Notificaciones />
          </ProtectedRoute>
        ),
      },
      {
        path: '/construccion',
        element: (
          <ProtectedRoute allowedRoles={['administrador', 'jefe_cuadrilla', 'usuario']}>
            <Construccion />
          </ProtectedRoute>
        ),
      }
    ]
  },
  {
    path: '/auth',
    element: <Login/>
  },
  {
    path: '/register',
    element: <Register/>
  }
])

function AppWrapper() {
  return (
    <RouterProvider router={router}/>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppWrapper/>
)