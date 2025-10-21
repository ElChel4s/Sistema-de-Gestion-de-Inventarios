# 📦 Sistema de Gestión de Inventarios

## 🚀 Visión del Proyecto

Este proyecto busca desarrollar un **Sistema Integral de Gestión de Inventarios** que permita a las empresas controlar de manera eficiente sus productos, almacenes, movimientos de stock y usuarios del sistema. Nuestro objetivo es crear una solución moderna, escalable y fácil de usar.

## 🎯 Funcionalidades Planeadas

### ✅ **Módulos Activos** (En desarrollo)
- **👥 Gestión de Usuarios**: Control de acceso, roles y permisos
- **📦 Gestión de Productos**: CRUD completo de productos con categorización
- **🏷️ Gestión de Categorías**: Organización y clasificación de productos

### 🚧 **Módulos En Desarrollo**
- **📊 Dashboard Principal**: Panel con métricas y resúmenes del inventario
- **🏪 Gestión de Almacenes**: Control de múltiples ubicaciones de almacenamiento
- **📋 Movimientos de Inventario**: Entrada, salida y transferencias entre almacenes
- **⚙️ Configuración del Sistema**: Personalización y ajustes generales

## 🏗️ Arquitectura del Sistema

### **Backend** (Spring Boot + Java)
```
backend/
├── src/main/java/com/universidad/proyventasqr/
│   ├── controller/     # Controladores REST API
│   ├── service/        # Lógica de negocio
│   ├── repository/     # Acceso a datos (JPA)
│   ├── model/          # Entidades del dominio
│   ├── dto/            # Objetos de transferencia de datos
│   ├── config/         # Configuración (Security, Swagger, etc.)
│   └── security/       # Autenticación JWT y seguridad
└── resources/
    ├── application.properties
    └── ventasqr.sql    # Script de base de datos
```

**Tecnologías Backend:**
- ☕ Java 21
- 🍃 Spring Boot 3.x
- 🔐 Spring Security + JWT
- 📊 JPA/Hibernate
- 🗄️ MySQL/MariaDB
- 📚 Swagger/OpenAPI 3
- � ZXing (Generación de códigos QR/Barras)
- �🐳 Docker Support

### **Frontend** (React + TypeScript)
```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   │   ├── layout/     # Layout principal, sidebar, header
│   │   └── ui/         # Componentes UI base
│   ├── pages/          # Páginas de la aplicación
│   ├── store/          # Estado global (Jotai)
│   ├── lib/            # Utilidades y helpers
│   └── types/          # Definiciones de TypeScript
├── public/
└── package.json
```

**Tecnologías Frontend:**
- ⚛️ React 18
- 📘 TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS
- 🔄 Jotai (Estado global)
- 🛣️ React Router
- 🔍 Lucide Icons

## 🚀 Cómo Ejecutar el Sistema

### **Prerrequisitos**
- Java 21+
- Node.js 18+
- MySQL/MariaDB
- Git

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/ElChel4s/Sistema-de-Gestion-de-Inventarios.git
cd Sistema-de-Gestion-de-Inventarios
```

### **2. Configurar Base de Datos**
```sql
-- Crear base de datos
CREATE DATABASE ventasqr;
-- Ejecutar script: backend/ventasqr.sql
```

### **3. Ejecutar Backend**
```bash
cd backend
# Configurar application.properties con tu BD
./mvnw clean install    # Instalar dependencias (incluye ZXing)
./mvnw spring-boot:run  # Ejecutar aplicación
# El backend estará en http://localhost:8080
```

### **4. Ejecutar Frontend**
```bash
cd frontend
npm install
npm run dev
# El frontend estará en http://localhost:5173
```

## 🎨 Interfaz de Usuario

El sistema cuenta con:
- **🎨 Diseño Moderno**: Interfaz limpia y profesional con Tailwind CSS
- **📱 Responsive**: Adaptable a dispositivos móviles y desktop
- **🌙 Sidebar Dinámico**: Navegación intuitiva entre módulos
- **🔐 Autenticación JWT**: Login seguro con tokens
- **📋 Formularios Inteligentes**: Validaciones en tiempo real
- **📊 Tablas Interactivas**: Búsqueda, filtrado y paginación

## 🔧 Estado Actual del Desarrollo

### **Completado:**
- ✅ Estructura base del proyecto
- ✅ Configuración de Spring Security + JWT
- ✅ API REST para usuarios, productos y categorías
- ✅ Frontend con React y TypeScript
- ✅ Sistema de autenticación
- ✅ Layout principal y navegación
- ✅ CRUD básico de entidades principales

### **En Progreso:**
- 🚧 Dashboard con métricas del inventario
- 🚧 Sistema de almacenes múltiples
- 🚧 Módulo de movimientos de stock
- 🚧 Reportes y análisis
- 🚧 Configuración avanzada del sistema

### **Próximas Funcionalidades:**
- 📋 Sistema de códigos de barras/QR (ZXing implementado)
- 📊 Reportes avanzados y gráficos
- 📧 Notificaciones y alertas
- 📱 API para aplicación móvil
- 🔄 Sincronización en tiempo real
- 📁 Exportación de datos (PDF, Excel)

### **🔧 Instalación de Dependencias**
```bash
# Backend (Maven + ZXing)
cd backend
./mvnw clean install

# Frontend (npm)
cd frontend  
npm install
```

## 🤝 Contribuir al Proyecto

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork del repositorio
2. Crear una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## 📞 Contacto y Soporte

- 📧 **Email**: [tu-email@ejemplo.com]
- 🐛 **Issues**: [GitHub Issues](https://github.com/ElChel4s/Sistema-de-Gestion-de-Inventarios/issues)
- 📖 **Documentación**: En desarrollo...

## 📝 Notas de Desarrollo

- El sistema utiliza JWT para autenticación
- Las rutas están protegidas por roles de usuario
- Se implementa paginación en las consultas grandes
- El código sigue estándares de Clean Code
- Se busca mantener alta cobertura de tests

---

**⚠️ Nota**: Este sistema está en desarrollo activo. Algunas funcionalidades pueden no estar completamente implementadas o pueden cambiar en futuras versiones.

**🎯 Objetivo**: Crear un sistema robusto, escalable y fácil de mantener para la gestión integral de inventarios empresariales.