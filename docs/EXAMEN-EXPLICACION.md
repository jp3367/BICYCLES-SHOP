# 🚲 Prueba de Examen UT1 (8/10/2026): explicación de TODOS los ejercicios

> **Enunciado resumido**
> Partimos del ERD de clase y se añade una entidad nueva, **Model**, relacionada con **Bicycle**.
>
> 1. CRUD básico de Model que funcione desde Bruno.
> 2. Consulta: todas las bicicletas con su **marca** (Brand) y su **modelo** (Model).
> 3. Consulta: bicicletas con **precio > 100** → `[Op.gt]`.
> 4. Consulta: **pedidos** que incluyan bicicletas con **precio < 100** y **peso > 20** → `[Op.lt]` y `[Op.gt]`.
>
> Cada apartado vale un 25 %. Hay que subirlo a una rama nueva llamada `pre-examen`.

---

## 0. Leer el ERD antes de tocar código

```
Model ||──o{ Bicycle
```

| Lado | Símbolo | Significa |
|------|---------|-----------|
| Model | `\|\|` | Cada bicicleta tiene **exactamente un** modelo (obligatorio) |
| Bicycle | `o{` | Un modelo tiene **cero o muchas** bicicletas |

👉 Es una relación **1:N**, idéntica a `Brand ||──o{ Bicycle`. **La regla de oro:** en una 1:N la clave foránea va en el lado "muchos". Por eso la FK `modelId` va en la tabla `bicycles`, igual que `brandId`.

Así que todo el ejercicio 1 consiste en **copiar lo que ya está hecho con Brand** y cambiar nombres.

---

## ⚠️ Dos trampas de nombres (importantes)

### Trampa 1: la clase no puede llamarse `Model`

En cada `*.model.ts` hacemos:

```ts
import { Model, DataTypes, ... } from "sequelize";
export class Brand extends Model<...> { }
```

Si la clase se llamara `Model`, quedaría `class Model extends Model`, y eso choca con el `Model` de Sequelize. Por eso la clase se llama **`BicycleModel`** y la tabla sigue siendo **`models`**. La carpeta es `bicycle-models`, porque `models/` ya existe (es donde está `associations.ts`), y la ruta es `/api/models`.

### Trampa 2: el alias no puede ser `"model"`

`Bicycle` **ya tiene un atributo** llamado `model` (un string con el nombre comercial). Si en la asociación pones `as: "model"`, Sequelize lanza este error:

```
Naming collision between attribute 'model' and association 'model' on model Bicycle
```

Por eso el alias es **`as: "bicycleModel"`**.

---

## Orden de trabajo (el mismo que sigue el proyecto)

Para cada entidad nueva el proyecto sigue siempre este orden:

```
1. modules/<entidad>/<entidad>.model.ts       ← la tabla
2. modules/<entidad>/<entidad>.service.ts     ← las consultas a BD
3. modules/<entidad>/<entidad>.controller.ts  ← req/res, validaciones, códigos HTTP
4. modules/<entidad>/<entidad>.routes.ts      ← URL → método del controller
5. routes/index.ts                            ← montar el router (/api/xxx)
6. models/associations.ts                     ← hasMany / belongsTo
7. server.ts                                  ← import del modelo para que sync() lo cree
8. Si la entidad tiene FK en otra tabla → tocar ese modelo, su service y su controller
```

---

## EJERCICIO 1: CRUD de Model (25 %)

### 1.1 `backend/src/modules/bicycle-models/bicycle-model.model.ts`

Es una copia de `brand.model.ts` con un campo extra opcional, `year`:

```ts
export class BicycleModel extends Model<
    InferAttributes<BicycleModel>,
    InferCreationAttributes<BicycleModel>
> {
    declare id: CreationOptional<number>;      // autoincrement → opcional al crear
    declare name: string;                      // obligatorio
    declare year: number | null;               // opcional
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

BicycleModel.init(
    {
        id:   { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(150), allowNull: false },
        year: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    { sequelize, tableName: "models", modelName: "BicycleModel", timestamps: true }
);
```

- `declare` le dice a TypeScript qué campos tiene el objeto. `init()` le dice a Sequelize cómo es la tabla.
- `CreationOptional` = "no hace falta mandarlo en el `create()`" (lo pone la BD).

### 1.2 `bicycle-model.service.ts`

Solo habla con la base de datos, igual que `BrandService`:

| Método | Sequelize |
|--------|-----------|
| `findAll()` | `BicycleModel.findAll({ order: [["id","ASC"]] })` |
| `findById(id)` | `BicycleModel.findByPk(id)` |
| `create(data)` | `BicycleModel.create(data)` |
| `update(m, data)` | `m.update(data)` |
| `delete(m)` | `m.destroy()` |

### 1.3 `bicycle-model.controller.ts`

Lee `req.params` / `req.body`, valida y responde. Los códigos HTTP son los mismos que en el resto del proyecto:

| Caso | Código |
|------|--------|
| Listar / obtener / actualizar OK | `200` (`res.json`) |
| Crear OK | `201` |
| Borrar OK | `204` (`res.status(204).send()`) |
| Falta `name` | `400` |
| No existe el id | `404` |
| Borrar un modelo que tiene bicicletas | `409` (se captura `ForeignKeyConstraintError`, igual que en Brand) |

En `update` se usa el patrón de spread condicional del proyecto:

```ts
await BicycleModelService.update(bicycleModel, {
    ...(name !== undefined && { name }),
    ...(year !== undefined && { year }),
});
```

Si `name` no viene en el body, no se toca.

### 1.4 `bicycle-model.routes.ts`

```ts
router.get("/", BicycleModelController.getAll);
router.get("/:id", BicycleModelController.getById);
router.post("/", BicycleModelController.create);
router.put("/:id", BicycleModelController.update);
router.delete("/:id", BicycleModelController.delete);
```

### 1.5 `routes/index.ts`: montar el router

```ts
import bicycleModelRoutes from "../modules/bicycle-models/bicycle-model.routes.js";
router.use("/models", bicycleModelRoutes);   // → /api/models
```

### 1.6 `models/associations.ts`: la relación

Va justo debajo de la de Brand, porque es el mismo tipo de relación:

```ts
BicycleModel.hasMany(Bicycle, { foreignKey: "modelId", as: "bicycles" });
Bicycle.belongsTo(BicycleModel, { foreignKey: "modelId", as: "bicycleModel" });
```

- **`hasMany`** se pone en el lado "1" (Model tiene muchas bicis).
- **`belongsTo`** se pone en el lado que **tiene la FK** (Bicycle tiene `modelId`).
- Se definen **las dos** para poder hacer `include` en ambas direcciones.

### 1.7 `server.ts`: importar el modelo

```ts
import "./modules/bicycle-models/bicycle-model.model.js";
```

Si no se importa, `sequelize.sync()` no sabe que existe y **no crea la tabla**.

### 1.8 Añadir la FK `modelId` a Bicycle

Como la FK vive en `bicycles`, hay que tocar tres ficheros del módulo bicycles.

**`bicycle.model.ts`**: igual que `brandId`:

```ts
declare modelId: number;
// ...
modelId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,                         // || en el ERD = obligatorio
    references: { model: "models", key: "id" },
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",                     // no se puede borrar un Model con bicis
},
```

**`bicycle.service.ts`**: añadir `modelId` a los tipos de `create`/`update` y un método para comprobar que existe (copia de `brandExists`):

```ts
static async modelExists(modelId: number) {
    const bicycleModel = await BicycleModel.findByPk(modelId);
    return bicycleModel !== null;
}
```

**`bicycle.controller.ts`**: en `create`, `modelId` pasa a ser obligatorio y se valida que existe. En `update` se valida solo si viene en el body. Es exactamente lo mismo que ya se hacía con `brandId`.

> 💡 A partir de ahora, para crear una bicicleta hay que mandar `brandId`, `modelId` y `price`. Primero hay que crear el Model; si no, devuelve `400 "Model not found"`.

### Probar en Bruno

Carpeta `bruno/bicycle-shop/1 - Models CRUD`:

| Petición | Método + URL | Body |
|---|---|---|
| Crear | `POST /api/models` | `{ "name": "Marlin 5", "year": 2024 }` |
| Listar | `GET /api/models` | |
| Uno | `GET /api/models/1` | |
| Editar | `PUT /api/models/1` | `{ "year": 2025 }` |
| Borrar | `DELETE /api/models/1` | |

---

## EJERCICIO 2: bicicletas con su marca y su modelo (25 %)

**Idea:** son dos `include` en la misma consulta, uno por cada relación `belongsTo` de Bicycle.

En `bicycle.service.ts` ya existía el objeto `includeBrand`. Creamos otro igual para el modelo:

```ts
const includeModel = {
    model: BicycleModel,          // ← la CLASE de Sequelize
    as: "bicycleModel",           // ← el MISMO alias que en associations.ts
    attributes: ["id", "name", "year"],
};

// EXAM 2
static async findAllWithBrandAndModel() {
    return Bicycle.findAll({
        include: [includeBrand, includeModel],
        order: [["id", "ASC"]],
    });
}
```

> ⚠️ Ojo con la palabra `model` aquí: en el `include`, `model:` es la clave de Sequelize que significa "qué tabla incluyo". No tiene nada que ver con nuestra entidad.

**Controller:** `getAllWithBrandAndModel` llama al service y hace `res.json(bicycles)`.

**Ruta:**

```ts
router.get("/with-brand-model", BicycleController.getAllWithBrandAndModel);
```

> ⚠️ **Muy importante:** esta ruta va **ANTES** de `router.get("/:id", ...)`. Express prueba las rutas de arriba abajo. Si `/:id` estuviera antes, `/with-brand-model` encajaría como `id = "with-brand-model"` y devolvería 404.

**Bruno:** `GET http://localhost:3000/api/bicycles/with-brand-model`

**Resultado:**

```json
[
  {
    "id": 1, "brandId": 1, "modelId": 1, "model": "City 80", "price": "80.00",
    "brand":        { "id": 1, "name": "Trek" },
    "bicycleModel": { "id": 1, "name": "Marlin 5", "year": 2024 }
  }
]
```

---

## EJERCICIO 3: bicicletas con precio > 100 (25 %)

**Idea:** un `where` con el operador `[Op.gt]` (*greater than*).

```ts
// EXAM 3
static async findByPriceGreaterThan(minPrice: number) {
    return Bicycle.findAll({
        where: { price: { [Op.gt]: minPrice } },   // WHERE price > minPrice
        include: [includeBrand],
        order: [["price", "ASC"]],
    });
}
```

- `Op` ya estaba importado en `bicycle.service.ts` (`import { Op } from "sequelize"`).
- Los corchetes en `[Op.gt]` son obligatorios porque `Op.gt` es un *Symbol* y se usa como clave calculada.

**Controller:** el 100 llega por la URL. Se convierte con `Number()` y se comprueba que es un número:

```ts
const price = Number(req.params.price);
if (Number.isNaN(price)) { res.status(400).json({ message: "price must be a number" }); return; }
```

**Ruta** (también por encima de `/:id`):

```ts
router.get("/price/greater-than/:price", BicycleController.getByPriceGreaterThan);
```

**Bruno:** `GET http://localhost:3000/api/bicycles/price/greater-than/100`

> Se ha hecho con parámetro para que valga para cualquier precio. Si el profe lo quiere fijo en 100, basta con `where: { price: { [Op.gt]: 100 } }` y una ruta sin `:price`.

---

## EJERCICIO 4: pedidos con bicicletas de precio < 100 y peso > 20 (25 %)

Este es el difícil, por dos motivos:

1. Se piden **pedidos** (Order), pero el filtro está en **bicicletas**. Order y Bicycle son **N:M** a través de `OrderItem`.
2. **El peso NO está en Bicycle.** Está en **BicycleDetail** (relación 1:1). Hay que bajar un nivel más.

### El camino por el ERD

```
Order ──(N:M vía OrderItem, as "bicycles")──▶ Bicycle ──(1:1, as "detail")──▶ BicycleDetail
                                              price < 100                      weight > 20
```

Esas asociaciones ya existían en `associations.ts`:

```ts
Order.belongsToMany(Bicycle, { through: OrderItem, foreignKey: "orderId", otherKey: "bicycleId", as: "bicycles" });
Bicycle.hasOne(BicycleDetail, { foreignKey: "bicycleId", as: "detail" });
```

### El código, en `order.service.ts`

```ts
// EXAM 4
static async findByBicyclePriceAndWeight(maxPrice: number, minWeight: number) {
    return Order.findAll({
        include: [
            includeCustomer,
            {
                model: Bicycle,
                as: "bicycles",
                required: true,                                   // INNER JOIN
                where: { price: { [Op.lt]: maxPrice } },          // price < 100
                attributes: ["id", "model", "price"],
                through: { attributes: ["quantity", "unitPrice"] }, // columnas de OrderItem
                include: [
                    {
                        model: BicycleDetail,
                        as: "detail",
                        required: true,                           // INNER JOIN
                        where: { weight: { [Op.gt]: minWeight } }, // weight > 20
                        attributes: ["weight"],
                    },
                ],
            },
        ],
        order: [["id", "ASC"]],
    });
}
```

### Qué hace cada pieza

| Pieza | Para qué |
|-------|----------|
| `include` anidado | Order → Bicycle → BicycleDetail. Cada nivel usa el **alias** de `associations.ts`. |
| `where` dentro del include | Filtra **esa tabla incluida**, no la principal. |
| `required: true` | Convierte el LEFT JOIN en **INNER JOIN**. Sin él saldrían **todos** los pedidos, algunos con `bicycles: []`. Con él solo salen los pedidos que tienen al menos una bici que cumple. |
| `through: { attributes: [...] }` | En una N:M, Sequelize mete los datos de la tabla intermedia (`OrderItem`) dentro de cada bici. Así eliges qué columnas mostrar (`[]` = ninguna). |
| `[Op.lt]` | *less than*, `<` |
| `[Op.gt]` | *greater than*, `>` |

> 💡 Con un `where` dentro de un include, Sequelize ya pone `required: true` automáticamente. Aun así, ponerlo explícito deja claro qué quieres y el profe lo valora.

**Controller** (`order.controller.ts`): lee `price` y `weight` de la URL, valida que son números y llama al service.

**Ruta** (`order.routes.ts`, antes de `/:id`):

```ts
router.get("/bicycles/price-less-than/:price/weight-greater-than/:weight", OrderController.getByBicyclePriceAndWeight);
```

**Bruno:** `GET http://localhost:3000/api/orders/bicycles/price-less-than/100/weight-greater-than/20`

### Ejemplo comprobado

Datos de prueba:
- Bici 1: 80 €, 22,5 kg ✅
- Bici 2: 90 €, 8 kg ❌ (pesa poco)
- Bici 3: 500 €, 25 kg ❌ (cara)
- Pedido 1 = bici 1 + bici 3
- Pedido 2 = bici 2

Resultado: **solo el pedido 1**, y dentro **solo la bici 1**:

```json
[{
  "id": 1, "customerId": 1, "status": "pending",
  "customer": { "id": 1, "name": "Ana", "email": "a@a.com" },
  "bicycles": [{
    "id": 1, "model": "cheap heavy", "price": 80,
    "detail": { "weight": 22.5 },
    "OrderItem": { "quantity": 1, "unitPrice": 80 }
  }]
}]
```

---

## Bruno: cómo probarlo todo

Abre en Bruno la carpeta `bruno/bicycle-shop` (**Open Collection**). La variable `baseUrl` ya vale `http://localhost:3000/api`.

1. `npm run dev` en `backend/`. Ojo: `sync({ force: true })` **borra la BD en cada arranque**.
2. Ejecuta en orden la carpeta **0 - Seed data** (marca → modelo → bicis → detalle → cliente → pedido → línea).
3. Prueba **1 - Models CRUD**.
4. Prueba **2-3-4 - Exam queries**.

---

## Subir a GitHub en la rama `pre-examen`

La rama `pre-examen` ya está creada en local, a partir de `Exam-Tests`. En el examen real, el primer paso sería `git checkout -b <nombre-rama>`. Después:

```bash
git add .
```

```bash
git commit -m "Pre-examen: Model entity CRUD + exam queries 2, 3 and 4"
```

```bash
git push -u origin pre-examen
```

---

## Checklist rápida para el examen real

- [ ] ¿Dónde va la FK? → en el lado **N** (o en la tabla intermedia si es N:M).
- [ ] Modelo nuevo: `model.ts` → `service.ts` → `controller.ts` → `routes.ts`.
- [ ] `routes/index.ts` → `router.use("/xxx", ...)`.
- [ ] `associations.ts` → **las dos direcciones** (`hasMany` + `belongsTo`, etc.).
- [ ] `server.ts` → `import "./modules/xxx/xxx.model.js"`.
- [ ] Si hay FK nueva en otra entidad → actualizar su model, su service (tipos + `xxxExists`) y su controller.
- [ ] El alias del `include` es **idéntico** al de `associations.ts`.
- [ ] Alias ≠ nombre de un atributo existente.
- [ ] Rutas fijas (`/with-brand-model`, `/price/...`) **antes** de `/:id`.
- [ ] Los operadores con corchetes: `{ price: { [Op.gt]: 100 } }`.
- [ ] Imports con extensión **`.js`** (el proyecto es ESM aunque escribas `.ts`).
- [ ] `npx tsc --noEmit` dentro de `backend/` para ver si compila.

> 🐛 **Aviso sobre código previo:** `BicycleService.findByPriceRange` usa `{ $between: [...] }`. Esa sintaxis es de Sequelize v4 y **no funciona en v6**. Debería ser `{ [Op.between]: [minPrice, maxPrice] }`. Ahora mismo no tiene ruta, así que no rompe nada, pero no lo copies en el examen.
