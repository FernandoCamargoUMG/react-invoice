# 🏗️ Arquitectura del Sistema de Facturación

## 📂 Estructura de Archivos

### **páginas (`src/pages/`)**
Componentes principales de navegación y gestión de datos:

#### **`Invoices.jsx`**
- 🎯 **Responsabilidad:** Página principal de gestión de facturas
- 📊 **Funciones:** Listado, filtros, navegación, API calls
- 🔄 **Estados que maneja:**
  - `invoices[]` - Lista de facturas
  - `customers[]`, `products[]` - Datos para selects
  - `loading`, `error`, `successMsg` - Estados UI
  - `invoiceHeader`, `invoiceItems` - Datos del formulario

#### **`Products.jsx`** 
- 🎯 **Responsabilidad:** Gestión de productos
- 📦 **Funciones:** CRUD de productos, validaciones

#### **`Customers.jsx`**
- 🎯 **Responsabilidad:** Gestión de clientes  
- 👥 **Funciones:** CRUD de clientes, validaciones

### **Modales (`src/components/modals/`)**
Componentes de interfaz reutilizables:

#### **`InvoiceModal.jsx`**
- 🎯 **Responsabilidad:** Formulario de creación/edición de facturas
- ⚙️ **Funciones internas:**
  - `handleAddItem()` - Agregar item a factura
  - `handleRemoveItem()` - Eliminar item 
  - `handleItemChange()` - Modificar item
- 📥 **Props que recibe:**
  - Estados desde `Invoices.jsx`
  - Callbacks para guardar datos

## 🔄 Flujo de Datos

```
Invoices.jsx (Parent) 
    ↓ (props)
InvoiceModal.jsx (Child)
    ↑ (callbacks)  
Invoices.jsx (API calls)
```

## 🎨 Principios de Diseño

1. **Separación de responsabilidades**
   - Páginas = Lógica de negocio + API
   - Modales = UI + Interacciones

2. **Comunicación unidireccional**
   - Props hacia abajo
   - Callbacks hacia arriba

3. **Estados centralizados**
   - Datos importantes en el componente padre
   - UI local en componentes hijos

## 🆕 **Actualización: Products Refactorizado**

### **`ProductModal.jsx`** (NUEVO)
- 🎯 **Responsabilidad:** Modal de creación/edición de productos
- 🎨 **UI Premium:** Diseño glassmorphism con efectos hover
- ⚙️ **Props:** Recibe datos y callbacks del componente padre
- 📝 **Campos:** Formulario vertical con validación visual

### **`Products.jsx` (REFACTORIZADO)**
- 📊 **Líneas:** Reducidas de 1020 → ~400 líneas (60% menos código)
- 🎯 **Focus:** Solo lógica de negocio y gestión de estados
- 🔄 **API:** Manejo centralizado de llamadas CRUD
- 📈 **Stats:** Dashboard con métricas del inventario

## ✅ Estado Actual: SÚPER LIMPIO

- ❌ **Duplicación eliminada**
- ✅ **Responsabilidades claras**  
- ✅ **Arquitectura consistente**
- 🆕 **Products refactorizado** - Modal separado
- 📏 **Código 60% más limpio**
- 🎨 **UI Premium consistente**