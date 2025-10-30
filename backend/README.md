# Sistema de Inventario con Control QR

## Descripción

El **Sistema de Inventario con Control QR** es una aplicación web completa desarrollada en **Spring Boot** que revoluciona la gestión de inventarios mediante la integración de códigos QR y automatización inteligente. El sistema permite el control integral de productos, almacenes y movimientos de inventario, generando automáticamente códigos QR únicos para cada producto que facilitan la identificación rápida y el escaneo en tiempo real. Incluye un sistema robusto de respaldos que genera tickets PDF tipo ticket (formato estándar de 80mm) para cada movimiento, proporcionando documentación física oficial y trazabilidad completa. El dashboard centralizado ofrece estadísticas en tiempo real, alertas automáticas de stock bajo, identificación de productos más vendidos y métricas de rendimiento por usuario y almacén. El sistema de auditoría (Kardex) mantiene un historial completo de todos los movimientos con filtros por fechas y cálculo automático de saldos. La autenticación JWT con roles diferenciados (ADMIN, GERENTE, PERSONAL) garantiza la seguridad y el control de acceso granular, mientras que la integración con PostgreSQL asegura la persistencia confiable de datos. Con su arquitectura monolítica optimizada, el sistema está diseñado para empresas que requieren un control preciso de inventario, automatización de procesos y documentación completa de todas las transacciones comerciales.

## Características Principales

- **Autenticación JWT** con roles (ADMIN, GERENTE, PERSONAL)
- **Gestión de Productos** con generación automática de códigos QR
- **Control de Almacenes** múltiples con gestión de capacidad
- **Sistema de Movimientos** (Entrada, Salida, Transferencia)
- **Respaldo Automático** en PDF tipo ticket (80mm)
- **Dashboard Completo** con estadísticas en tiempo real
- **Sistema de Auditoría** (Kardex) para trazabilidad


## 🛠️ Tecnologías

- **Backend:** Java 21, Spring Boot 3.5.0, PostgreSQL
- **Seguridad:** Spring Security, JWT
- **PDF:** iText 7.2.5 para tickets
- **QR:** ZXing 3.5.3 para códigos
- **Documentación:** Swagger/OpenAPI
- **Contenedores:** Docker & Docker Compose


