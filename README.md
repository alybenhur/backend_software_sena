# Software Management API

API REST desarrollada con NestJS para la gestión de software, reseñas, noticias y categorías.

## 🚀 Características

- ✅ Autenticación JWT con refresh tokens
- ✅ Base de datos MySQL con TypeORM
- ✅ Sistema de roles (Usuario, Usuario con permisos de noticias, Admin)
- ✅ Gestión de software con múltiples imágenes (Cloudinary)
- ✅ Sistema de reseñas anónimas con control anti-spam
- ✅ Gestión de noticias con categorías y expiración
- ✅ Rate limiting y seguridad con Helmet
- ✅ Validación automática de DTOs
- ✅ Documentación automática con Swagger
- ✅ Manejo centralizado de errores

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- MySQL (v8 o superior)
- Cuenta de Cloudinary

## 🔧 Instalación

1. Clonar el repositorio

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar el archivo `.env` con tus credenciales:
   - Configuración de MySQL
   - Secretos JWT
   - Credenciales de Cloudinary

5. Crear la base de datos MySQL:
```sql
CREATE DATABASE software_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🏃 Ejecución

### Modo desarrollo
```bash
npm run start:dev
```

### Modo producción
```bash
npm run build
npm run start:prod
```

## 📚 Documentación API

Una vez iniciada la aplicación, acceder a:
- **Swagger UI**: http://localhost:3000/api/docs

## 🏗️ Estructura del Proyecto

```
src/
├── config/                 # Archivos de configuración
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── cloudinary.config.ts
│   └── app.config.ts
├── common/                 # Utilidades compartidas
│   ├── decorators/
│   ├── dto/
│   ├── filters/
│   ├── guards/
│   └── interceptors/
├── modules/                # Módulos de la aplicación (se crearán)
│   ├── auth/
│   ├── users/
│   ├── software/
│   ├── reviews/
│   ├── news/
│   ├── categories/
│   └── upload/
├── app.module.ts
└── main.ts
```

## 🔐 Seguridad

- Autenticación basada en JWT
- Hash de contraseñas con bcrypt
- Rate limiting para prevenir abuso
- Helmet para headers de seguridad HTTP
- Validación de entrada con class-validator
- CORS configurado

## 📦 Tecnologías Utilizadas

- **NestJS** - Framework de Node.js
- **TypeORM** - ORM para TypeScript
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **Cloudinary** - Almacenamiento de imágenes
- **Swagger** - Documentación API
- **Class Validator** - Validación de DTOs

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📝 Variables de Entorno

Ver archivo `.env.example` para todas las variables disponibles.

### Variables Principales:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET`, `JWT_EXPIRATION`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `PORT`, `NODE_ENV`, `CORS_ORIGIN`

## 🚧 Estado del Proyecto

✅ Parte 1: Configuración inicial y estructura base (COMPLETADA)
⏳ Parte 2: Módulo de autenticación y usuarios (PENDIENTE)
⏳ Parte 3: Módulo de software (PENDIENTE)
⏳ Parte 4: Módulo de reseñas y valoraciones (PENDIENTE)
⏳ Parte 5: Módulo de noticias y categorías (PENDIENTE)
⏳ Parte 6: Módulo de upload (Cloudinary) (PENDIENTE)

## 📄 Licencia

MIT

## 👥 Autor

Tu Nombre
