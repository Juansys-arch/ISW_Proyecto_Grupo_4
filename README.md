# ISW-Proyecto-2026
El proyecto de Ingeniería de Software (ISW) desarrollado este año 2026. 
# Plataforma de Gestión Operativa y Logística (ISW) - Grupo 4

Bienvenido al repositorio oficial del **Proyecto de Ingeniería de Software (ISW) 2026** desarrollado por el **Grupo 4**. 

Esta aplicación web fue diseñada como una solución integral para organizaciones orientadas a la construcción comunitaria y voluntariado (como TECHO), centralizando el control de obras, la logística de voluntarios y el inventario de materiales en una única plataforma colaborativa.

---

##  Características Principales

El sistema está dividido en módulos interconectados, diseñados para abarcar todos los frentes del trabajo en terreno:

*   ** Gestión de Usuarios y Roles:** Diferentes niveles de acceso incluyendo Administrador, Jefe de Cuadrilla, Encargado de Inventario y Voluntarios.
*   ** Gestión de Construcciones:** Registro de proyectos de vivienda, beneficiarios, asignación de hitos de obra y seguimiento del progreso en tiempo real hasta la firma de garantía.
*   ** Inventario y Herramientas:** Control exhaustivo de stock de materiales, creación de kits de herramientas, y actas digitales de entrega/devolución para cada cuadrilla.
*   ** Logística y Transporte:** Planificación de vehículos, validación de asistencia en el abordaje y envío automático de correos electrónicos con comprobantes de transporte al punto de encuentro.
*   ** Reporte de Incidencias:** Canal de comunicación de urgencia desde el terreno. Permite reportar desde falta de materiales hasta emergencias médicas (alertas críticas con registro de pacientes).
*   ** Evaluación de Voluntarios:** Módulo para que el Jefe de Cuadrilla evalúe el desempeño técnico y actitudinal de su equipo al finalizar la jornada.

---

##  Arquitectura y Tecnologías

El proyecto sigue una arquitectura Cliente-Servidor moderna, garantizando escalabilidad y un rendimiento óptimo.

### Backend (API REST)
*   **Entorno:** Node.js + Express
*   **Base de Datos:** PostgreSQL relacional
*   **ORM:** TypeORM para modelado y consultas eficientes
*   **Seguridad:** Autenticación mediante JSON Web Tokens (JWT) guardados en cookies seguras.

### Frontend (SPA)
*   **Framework:** React (usando Vite para builds ultrarrápidos)
*   **Estilos:** CSS Modules / Vanilla CSS con diseño moderno, Glassmorphism y diseño responsivo.
*   **Gestión de Estado:** React Hooks y Context API.
*   **Tablas:** Tabulator para un renderizado dinámico y eficiente de grandes volúmenes de datos.

---

##  Instalación y Uso Local

Para levantar este proyecto en tu entorno de desarrollo, sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Juansys-arch/ISW_Proyecto_Grupo_4.git
cd ISW_Proyecto_Grupo_4
```

### 2. Configurar el Backend
1. Navega a la carpeta del backend: `cd backend`
2. Instala las dependencias: `npm install`
3. Crea un archivo `.env` tomando como referencia el `.env.example`.
4. Asegúrate de tener **PostgreSQL** corriendo localmente y ajusta las credenciales en el archivo `.env` (Puerto por defecto 5432 o 5433).
5. Inicia el servidor de desarrollo:
```bash
npm run dev
```

### 3. Configurar el Frontend
1. Abre una nueva terminal y navega a la carpeta del frontend: `cd frontend`
2. Instala las dependencias: `npm install`
3. Inicia el entorno de desarrollo con Vite:
```bash
npm run dev
```

### 4. Acceso Inicial
Una vez que ambos servidores estén corriendo, ingresa a `http://localhost:5173`.
*El sistema generará usuarios base automáticamente la primera vez que inicies el backend (Ej: `administrador2024@gmail.cl`). Puedes revisar el archivo `initialSetup.js` para ver todas las credenciales por defecto.*

---

## Miembros del Equipo
* Proyecto de la asignatura de **Ingeniería de Software (ISW)** - Año 2026.
* Desarrollado y diseñado por el **Grupo 4**.

