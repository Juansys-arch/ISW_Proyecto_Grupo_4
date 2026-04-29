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
import Register from '@pages/Register';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login/>,
  },
  {
    path: '/',
    element: <Root/>,
    errorElement: <Error404/>,
    children: [
      {
        path: '/home',
        element: <Home/>
      },
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
        path: '/herramientas',
        element: (
          <ProtectedRoute allowedRoles={['jefe_cuadrilla', 'administrador']}>
            <Herramientas />
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
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>
);