import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import AdminRequests from '@pages/AdminRequests';
import Register from '@pages/Register';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import Users from '@pages/Users';
import Regions from '@pages/Regions';
import DashboardJornada from '@pages/DashboardJornada';
import Asistencias from '@pages/Asistencias';
import Herramientas from '@pages/Herramientas';
import Bitacora from '@pages/Bitacora';
import Kits from '@pages/Kits';
import Transporte from '@pages/Transporte';
import Inventario from '@pages/Inventario';
import Incidencias from '@pages/Incidencias';
import Notificaciones from '@components/Notificaciones';
import GestionOperativa from '@pages/GestionOperativa';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/',
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      { path: '/home', element: <Home /> },
      {
        path: '/gestion-jornada',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'administrador']}>
            <DashboardJornada />
          </ProtectedRoute>
        ),
      },
      {
        path: '/asistencias',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'administrador']}>
            <Asistencias />
          </ProtectedRoute>
        ),
      },
      {
        path: '/inventario',
        element: (
          <ProtectedRoute allowedRoles={['administrador', 'encargado_inventario', 'jefe_cuadrilla']}>
            <Inventario />
          </ProtectedRoute>
        ),
      },
      {
        path: '/herramientas',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'administrador']}>
            <Herramientas />
          </ProtectedRoute>
        ),
      },
      {
        path: '/incidencias',
        element: (
          <ProtectedRoute allowedRoles={['administrador', 'encargado_inventario', 'jefe_cuadrilla']}>
            <Incidencias />
          </ProtectedRoute>
        ),
      },
      {
        path: '/gestion-operativa',
        element: (
          <ProtectedRoute allowedRoles={['administrador', 'encargado_inventario', 'jefe_cuadrilla']}>
            <GestionOperativa />
          </ProtectedRoute>
        ),
      },
      {
        path: '/notificaciones',
        element: (
          <ProtectedRoute allowedRoles={['administrador', 'encargado_inventario']}>
            <Notificaciones />
          </ProtectedRoute>
        ),
      },
      {
        path: '/bitacora',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'administrador']}>
            <Bitacora />
          </ProtectedRoute>
        ),
      },
      {
        path: '/kits',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'administrador']}>
            <Kits />
          </ProtectedRoute>
        ),
      },
      {
        path: '/transporte',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'administrador']}>
            <Transporte />
          </ProtectedRoute>
        ),
      },
      {
        path: '/regions',
        element: (
          <ProtectedRoute allowedRoles={['administrador', 'coordinador']}>
            <Regions />
          </ProtectedRoute>
        ),
      },
      {
        path: '/users',
        element: (
          <ProtectedRoute allowedRoles={['administrador', 'coordinador']}>
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
    ]
  },
  {
    path: '/auth',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
