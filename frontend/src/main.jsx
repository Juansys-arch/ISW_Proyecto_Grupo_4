import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import DashboardJornada from '@pages/DashboardJornada';
import Asistencias from '@pages/Asistencias';
import Herramientas from '@pages/Herramientas';
import Bitacora from '@pages/Bitacora';
import Kits from '@pages/Kits';
import Transporte from '@pages/Transporte';
import Users from '@pages/Users';
import Register from '@pages/Register';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import Inventario from '@pages/Inventario';
import Incidencias from '@pages/Incidencias';
import Construccion from '@pages/Construccion';
import GestionOperativa from '@pages/GestionOperativa';
import Notificaciones from '@pages/Notificaciones';
import EvaluacionCuadrilla from '@pages/EvaluacionCuadrilla';
import Volunteer from '@pages/Volunteer';
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
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'super_admin', 'super_admin', 'admin_region']}>
            <DashboardJornada />
          </ProtectedRoute>
        ),
      },
      {
        path: '/asistencias',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'super_admin', 'super_admin', 'admin_region']}>
            <Asistencias />
          </ProtectedRoute>
        ),
      },
      {
        path: '/inventario',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'encargado_inventario', 'jefe_cuadrilla', 'super_admin', 'admin_region']}>
            <Inventario />
          </ProtectedRoute>
        ),
      },
      {
        path: '/herramientas',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'super_admin', 'super_admin', 'admin_region']}>
            <Herramientas />
          </ProtectedRoute>
        ),
      },
      {
        path: '/incidencias',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'jefe_cuadrilla']}>
            <Incidencias />
          </ProtectedRoute>
        ),
      },
      {
        path: '/gestion-operativa',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'encargado_inventario', 'jefe_cuadrilla', 'super_admin', 'admin_region']}>
            <GestionOperativa />
          </ProtectedRoute>
        ),
      },
      {
        path: '/construccion',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'jefe_cuadrilla', 'super_admin', 'admin_region']}>
            <Construccion />
          </ProtectedRoute>
        ),
      },
      {
        path: '/bitacora',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'super_admin', 'super_admin', 'admin_region']}>
            <Bitacora />
          </ProtectedRoute>
        ),
      },
      {
        path: '/kits',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'super_admin', 'super_admin', 'admin_region']}>
            <Kits />
          </ProtectedRoute>
        ),
      },
      {
        path: '/transporte',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'super_admin', 'super_admin', 'admin_region']}>
            <Transporte />
          </ProtectedRoute>
        ),
      },
      {
        path: '/evaluacion-cuadrilla',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'super_admin', 'super_admin', 'admin_region']}>
            <EvaluacionCuadrilla />
          </ProtectedRoute>
        ),
      },
      {
        path: '/users',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'coordinador']}>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: '/voluntarios',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'encargado_voluntarios']}>
            <Volunteer />
          </ProtectedRoute>
        ),
      },
      {
        path: '/regiones',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'admin_region', 'super_admin']}>
            <Volunteer />
          </ProtectedRoute>
        ),
      },
      {
        path: '/notificaciones',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'encargado_inventario', 'jefe_cuadrilla', 'super_admin', 'admin_region']}>
            <Notificaciones />
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