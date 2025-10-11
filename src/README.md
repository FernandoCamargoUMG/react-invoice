# 🏗️ React Invoice - Estructura del Proyecto

## 📁 Organización de Archivos

```
src/
├── 📄 App.jsx              # Componente principal y routing
├── 📄 App.css              # Estilos globales de la aplicación
├── 📄 main.jsx             # Punto de entrada de React
├── 📄 index.css            # Estilos base
├── 
├── 📂 pages/               # Páginas principales de la aplicación
│   ├── 🏠 Dashboard.jsx    # Panel principal con métricas
│   ├── 🔐 Login.jsx        # Página de autenticación
│   ├── 👥 Customers.jsx    # Gestión de clientes
│   ├── 📦 Products.jsx     # Gestión de productos
│   ├── 📄 Invoices.jsx     # Gestión de facturas
│   └── 👤 Users.jsx        # Gestión de usuarios
│
├── 📂 components/          # Componentes reutilizables
│   ├── 📂 modals/          # Modales de la aplicación
│   │   └── 📄 InvoiceModal.jsx  # Modal para crear/editar facturas
│   ├── 🌍 GlobalSettings.jsx    # Configuraciones globales
│   └── 💱 CurrencySelector.jsx  # Selector de moneda
│
├── 📂 styles/              # Archivos de estilos
│   └── 📄 Dashboard.css    # Estilos específicos del dashboard
│
├── 📂 config/              # Configuraciones
│   └── ⚙️ api.js           # Configuración de la API
│
├── 📂 utils/               # Utilidades y helpers
│   └── 💰 currency.js      # Utilidades de moneda
│
└── 📂 assets/              # Recursos estáticos
    └── 🖼️ react.svg        # Iconos y imágenes
```

## 🎨 Características del Diseño

### ✨ Sistema de Diseño Premium
- **Glassmorphism Effects**: Efectos de cristal y transparencia
- **Gradient Cards**: Tarjetas con gradientes temáticos
- **Hover Animations**: Animaciones suaves en hover
- **Iconos Personalizados**: Emojis con gradientes circulares

### 🎯 Paleta de Colores por Módulo
- **Dashboard**: 🔵 Azul (#667eea) - Profesional y confiable
- **Customers**: 👤 Multi-color (Azul, Amarillo, Verde, Naranja)
- **Products**: 📦 Verde (#22c55e) - Crecimiento y prosperidad
- **Invoices**: 💰 Dorado (#eab308) - Valor y premium

### 📱 Responsive Design
- **Mobile First**: Diseño optimizado para móviles
- **Grid Layouts**: Sistema de grillas responsive
- **Breakpoints**: xs=12 (móvil), md=6/8/4 (desktop)

## 🚀 Tecnologías Utilizadas

- **React 18**: Framework principal
- **Material-UI**: Sistema de componentes
- **React Router**: Navegación entre páginas
- **Vite**: Herramienta de desarrollo
- **CSS Modules**: Estilos modulares

## 🔄 Flujo de la Aplicación

1. **Login** → Autenticación de usuario
2. **Dashboard** → Vista general de métricas
3. **Gestión de Datos**:
   - Customers → Crear/editar clientes
   - Products → Administrar inventario
   - Invoices → Generar facturas
   - Users → Gestionar usuarios del sistema

## 📋 Convenciones de Código

- **Naming**: PascalCase para componentes, camelCase para variables
- **Estructura**: Cada página es autocontenida con sus modales
- **Estilos**: Sistema de design tokens consistent
- **Responsivo**: Mobile-first approach con breakpoints definidos