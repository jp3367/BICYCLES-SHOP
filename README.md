# 🚲 Bicycle Shop

API REST para la gestión de una tienda de bicicletas, desarrollada en **Node.js + TypeScript** con **Express 5** y **Sequelize** sobre **MySQL**.

Proyecto de la asignatura **Desarrollo Web en Entorno Servidor (DSW)** — 2º DAW.

---

## 📋 Índice

- [Tecnologías](#-tecnologías)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Modelos de datos](#-modelos-de-datos)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Pruebas con Postman](#-pruebas-con-postman)

---

## 🛠 Tecnologías

| Tecnología  | Uso                                   |
|-------------|---------------------------------------|
| Node.js     | Entorno de ejecución                  |
| TypeScript  | Tipado estático                       |
| Express 5   | Servidor HTTP y enrutado              |
| Sequelize 6 | ORM para acceso a base de datos       |
| MySQL       | Base de datos relacional (`mysql2`)   |
| dotenv      | Carga de variables de entorno         |
| tsx         | Ejecución en desarrollo con recarga   |
| Postman     | Pruebas de los endpoints              |

---

## 📁 Estructura del proyecto

```
bicycle-shop/
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Configuración de Express y rutas base
│   │   ├── server.ts               # Arranque: conexión a BD, sync y listen
│   │   ├── config/
│   │   │   ├── database.ts         # Instancia de Sequelize
│   │   │   └── env.ts              # Lectura de variables de entorno
│   │   ├── routes/
│   │   │   └── index.ts            # Router principal (/api)
│   │   └── modules/
│   │       ├── bicycles/           # Módulo de bicicletas
│   │       │   ├── bicycle.model.ts
│   │       │   ├── bicycle.service.ts
│   │       │   ├── bicycle.controller.ts
│   │       │   └── bicycle.routes.ts
│   │       └── brands/             # Módulo de marcas
│   │           ├── brand.model.ts
│   │           ├── brand.service.ts
│   │           ├── brand.controller.ts
│   │           ├── brand.routes.ts
│   │           └── associations.ts # Relaciones entre modelos
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/                       # (pendiente de desarrollo)
└── postman/                        # Colección de peticiones de Postman
```

Cada módulo sigue una arquitectura por capas:

- **Model** → definición de la tabla con Sequelize.
- **Service** → lógica de acceso a datos.
- **Controller** → gestión de la petición/respuesta HTTP y validaciones.
- **Routes** → asociación de rutas con los métodos del controlador.

---

## ✅ Requisitos previos

- [Node.js](https://nodejs.org/) 20 o superior
- npm
- Servidor **MySQL** en ejecución (XAMPP, MAMP, Docker, etc.)

---

## 📦 Instalación

```bash
git clone https://github.com/jp3367/BICYCLES-SHOP.git
cd BICYCLES-SHOP/backend
npm install
```

---

## ⚙️ Configuración

1. Crea la base de datos en MySQL:

   ```sql
   CREATE DATABASE dsw_products;
   ```

2. Copia el fichero de ejemplo de variables de entorno y ajústalo:

   ```bash
   cp .env.example .env
   ```

   | Variable      | Descripción                 | Valor por defecto |
   |---------------|-----------------------------|-------------------|
   | `PORT`        | Puerto del servidor         | `3000`            |
   | `DB_HOST`     | Host de MySQL               | `localhost`       |
   | `DB_PORT`     | Puerto de MySQL             | `3306`            |
   | `DB_NAME`     | Nombre de la base de datos  | `dsw_products`    |
   | `DB_USER`     | Usuario de MySQL            | `root`            |
   | `DB_PASSWORD` | Contraseña de MySQL         | *(vacía)*         |

---

## ▶️ Ejecución

Desde la carpeta `backend/`:

| Comando         | Descripción                                        |
|-----------------|----------------------------------------------------|
| `npm run dev`   | Arranca en modo desarrollo con recarga automática  |
| `npm run build` | Compila TypeScript                                 |
| `npm start`     | Ejecuta la versión compilada (`dist/server.js`)    |

Al arrancar, el servidor:

1. Comprueba la conexión con MySQL.
2. Sincroniza los modelos con la base de datos.
3. Escucha en `http://localhost:3000`.

> ⚠️ En desarrollo se usa `sequelize.sync({ force: true })`, que **borra y recrea las tablas** en cada arranque. En producción debe usarse `sequelize.sync()` o migraciones.

---

## 🗃 Modelos de datos

### Bicycle (`bicycles`)

| Campo         | Tipo                 | Obligatorio | Notas                 |
|---------------|----------------------|-------------|-----------------------|
| `id`          | INTEGER UNSIGNED     | —           | PK, autoincremental   |
| `brand`       | STRING(150)          | ✅          |                       |
| `model`       | STRING(150)          | ❌          |                       |
| `description` | TEXT                 | ❌          |                       |
| `price`       | DECIMAL(10,2)        | ✅          |                       |
| `stock`       | INTEGER UNSIGNED     | ❌          | Por defecto `0`       |
| `createdAt`   | DATE                 | —           | Automático            |
| `updatedAt`   | DATE                 | —           | Automático            |

### Brand (`brands`)

| Campo       | Tipo             | Obligatorio | Notas               |
|-------------|------------------|-------------|---------------------|
| `id`        | INTEGER UNSIGNED | —           | PK, autoincremental |
| `name`      | STRING(150)      | ✅          |                     |
| `createdAt` | DATE             | —           | Automático          |
| `updatedAt` | DATE             | —           | Automático          |

**Relación:** una marca (`Brand`) tiene muchas bicicletas (`Bicycle`) — definida en `associations.ts`.

---

## 🌐 Endpoints de la API

URL base: `http://localhost:3000`

### General

| Método | Ruta           | Descripción                   |
|--------|----------------|-------------------------------|
| GET    | `/`            | Comprueba que la API funciona |
| GET    | `/holaholita`  | Ruta de prueba                |

### Bicicletas — `/api/bicycles`

| Método | Ruta                 | Descripción                  | Respuesta OK   |
|--------|----------------------|------------------------------|----------------|
| GET    | `/api/bicycles`      | Lista todas las bicicletas   | `200`          |
| GET    | `/api/bicycles/:id`  | Obtiene una bicicleta por id | `200` / `404`  |
| POST   | `/api/bicycles`      | Crea una bicicleta           | `201` / `400`  |
| PUT    | `/api/bicycles/:id`  | Actualiza una bicicleta      | `200` / `404`  |
| DELETE | `/api/bicycles/:id`  | Elimina una bicicleta        | `204` / `404`  |

Ejemplo de cuerpo (POST / PUT):

```json
{
  "brand": "Orbea",
  "model": "Sky",
  "description": "Great for any occasion",
  "price": 189.99,
  "stock": 5
}
```

> `brand` y `price` son obligatorios al crear.

### Marcas — `/api/brands`

| Método | Ruta               | Descripción              | Respuesta OK   |
|--------|--------------------|--------------------------|----------------|
| GET    | `/api/brands`      | Lista todas las marcas   | `200`          |
| GET    | `/api/brands/:id`  | Obtiene una marca por id | `200` / `404`  |
| POST   | `/api/brands`      | Crea una marca           | `201` / `400`  |
| PUT    | `/api/brands/:id`  | Actualiza una marca      | `200` / `404`  |
| DELETE | `/api/brands/:id`  | Elimina una marca        | `204` / `404`  |

Ejemplo de cuerpo (POST / PUT):

```json
{
  "name": "BH"
}
```

> `name` es obligatorio al crear.

### Ejemplo con `curl`

```bash
curl -X POST http://localhost:3000/api/bicycles \
  -H "Content-Type: application/json" \
  -d '{"brand":"Orbea","model":"Sky","price":189.99,"stock":5}'
```

---

## 🧪 Pruebas con Postman

En la carpeta [`postman/`](postman/) se incluye la colección **bicycle-shop** con peticiones para todos los endpoints (Bicycles y Brands). Puedes abrirla desde Postman con la vista local del workspace.

---

## 🚧 Próximos pasos

- [ ] Desarrollo del frontend
- [ ] Relacionar `Bicycle` con `Brand` mediante `brandId`
- [ ] Validación de datos más completa
- [ ] Middleware de gestión de errores

---

## 👤 Autor

**Juan Pablo Miguel Velásquez** — 2º DAW, IES El Rincón
