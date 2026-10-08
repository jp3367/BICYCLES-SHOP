# 🔗 Guía de relaciones en Sequelize (para el examen)

Esta guía explica cómo pasar de un **dibujo ERD** a **código Sequelize**, qué te pueden pedir en el examen y trae ejercicios para practicar con soluciones.

---

## 1. Leer las "patas de gallo" del ERD

Cada extremo de la línea tiene **dos símbolos**. El de **fuera** (pegado a la caja) es el **máximo** y el de **dentro** es el **mínimo**.

| Símbolo | Mínimo | Máximo | Se lee |
|---------|--------|--------|--------|
| `\|\|`  | 1 | 1 | "exactamente uno" (obligatorio) |
| `o\|`   | 0 | 1 | "cero o uno" (opcional) |
| `\|{`   | 1 | N | "uno o muchos" |
| `o{`    | 0 | N | "cero o muchos" |

**Truco:** para saber cuántos B tiene un A, mira el símbolo **pegado a B**.

```
Brand ||──o{ Bicycle
```

- Pegado a Bicycle hay `o{` → una marca tiene **0..N** bicis.
- Pegado a Brand hay `||` → una bici tiene **exactamente 1** marca.
- ⇒ **1:N**.

---

## 2. Los tres tipos de relación

### 🟢 1:1 (uno a uno): `Bicycle ||──o| BicycleDetail`

Una bici tiene como mucho un detalle, y un detalle es de una sola bici.

- **FK:** en la tabla "dependiente" (la que no tiene sentido sola) → `bicycleId` en `bicycle-details`, con **`unique: true`**. Sin `unique` sería una 1:N.
- **Código:**

```ts
Bicycle.hasOne(BicycleDetail, { foreignKey: "bicycleId", as: "detail", onDelete: "CASCADE" });
BicycleDetail.belongsTo(Bicycle, { foreignKey: "bicycleId", as: "bicycle" });
```

- El alias va en **singular** (`detail`), porque devuelve **un objeto**.

### 🔵 1:N (uno a muchos): `Brand ||──o{ Bicycle`, `Customer ||──o{ Order`, `Model ||──o{ Bicycle`

- **FK:** **siempre en el lado N** → `brandId` en `bicycles`.
- **Código:**

```ts
Brand.hasMany(Bicycle, { foreignKey: "brandId", as: "bicycles" });  // lado 1
Bicycle.belongsTo(Brand, { foreignKey: "brandId", as: "brand" });   // lado N (tiene la FK)
```

- El alias del `hasMany` va en **plural** (devuelve un **array**). El del `belongsTo` va en **singular** (devuelve un **objeto**).

### 🟣 N:M (muchos a muchos): `Order >──< Bicycle` a través de `OrderItem`

Un pedido tiene muchas bicis y una bici está en muchos pedidos. En el ERD aparece **descompuesta** en dos 1:N hacia una tabla intermedia:

```
Order ||──o{ OrderItem }o──|| Bicycle
```

- **FK:** **las dos** en la tabla intermedia → `orderId` y `bicycleId` en `order_items` (más datos propios: `quantity`, `unitPrice`).
- **Código:**

```ts
// N:M "directa" (para Order.findAll({ include: "bicycles" }))
Order.belongsToMany(Bicycle, { through: OrderItem, foreignKey: "orderId", otherKey: "bicycleId", as: "bicycles" });
Bicycle.belongsToMany(Order, { through: OrderItem, foreignKey: "bicycleId", otherKey: "orderId", as: "orders" });

// Las dos 1:N hacia la tabla intermedia (para trabajar con las líneas)
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Bicycle.hasMany(OrderItem, { foreignKey: "bicycleId", as: "orderItems" });
OrderItem.belongsTo(Bicycle, { foreignKey: "bicycleId", as: "bicycle" });
```

- `foreignKey` = la FK que apunta **al modelo desde el que llamas**. `otherKey` = la FK que apunta **al otro**.

### Tabla resumen (para memorizar)

| Relación | ¿Dónde va la FK? | Lado "1" / dueño | Lado con la FK |
|----------|------------------|------------------|----------------|
| 1:1 | Tabla dependiente (+ `unique`) | `hasOne` | `belongsTo` |
| 1:N | Lado N | `hasMany` | `belongsTo` |
| N:M | Tabla intermedia (2 FKs) | `belongsToMany` ×2 (`through`) | |

> 🧠 **Regla mnemotécnica:** **`belongsTo` siempre va en el modelo que TIENE la columna FK.**

---

## 3. Qué ficheros tocar cuando aparece una relación nueva

Como hemos hecho con **Model** en el pre-examen:

| # | Fichero | Qué haces |
|---|---------|-----------|
| 1 | `modules/<nueva>/<nueva>.model.ts` | La clase + `init()` |
| 2 | `.service.ts`, `.controller.ts`, `.routes.ts` | CRUD (copia de Brand) |
| 3 | `routes/index.ts` | `router.use("/nueva", ...)` |
| 4 | `server.ts` | `import "./modules/<nueva>/<nueva>.model.js"` |
| 5 | **Modelo que recibe la FK** | `declare xxxId` + columna con `references` |
| 6 | `models/associations.ts` | Las **dos** direcciones |
| 7 | Service/controller del modelo con la FK | `xxxExists()`, validar en `create`/`update`, añadir a los tipos |

---

## 4. Consultar relaciones: `include`

```ts
Bicycle.findAll({
    include: [{
        model: Brand,            // la clase
        as: "brand",             // ⚠️ el MISMO alias que en associations.ts
        attributes: ["id", "name"],
        where: { name: "Trek" }, // filtra la tabla incluida
        required: true,          // INNER JOIN (por defecto es LEFT JOIN)
    }],
});
```

| Opción | Efecto |
|--------|--------|
| `attributes: [...]` | Qué columnas devolver |
| `attributes: { exclude: [...] }` | Todas menos esas |
| `where` | Filtra la tabla incluida (y activa `required: true` solo) |
| `required: true` | Solo filas principales que **tienen** relacionado (INNER JOIN) |
| `required: false` | Todas las filas principales; las que no tienen relacionado salen con `null` / `[]` |
| `include: [...]` | Anidar otro nivel (Order → Bicycle → Detail) |
| `through: { attributes: [] }` | Solo en N:M: columnas de la tabla intermedia (`[]` = ocultarla) |

### Operadores (`import { Op } from "sequelize"`)

| Op | SQL | Ejemplo |
|----|-----|---------|
| `[Op.eq]` | `=` | `{ status: { [Op.eq]: "paid" } }` (o simplemente `{ status: "paid" }`) |
| `[Op.ne]` | `!=` | `{ suspension: { [Op.ne]: null } }` |
| `[Op.gt]` / `[Op.gte]` | `>` / `>=` | `{ price: { [Op.gt]: 100 } }` |
| `[Op.lt]` / `[Op.lte]` | `<` / `<=` | `{ stock: { [Op.lte]: 5 } }` |
| `[Op.between]` | `BETWEEN` | `{ price: { [Op.between]: [100, 500] } }` |
| `[Op.in]` | `IN` | `{ status: { [Op.in]: ["paid", "shipped"] } }` |
| `[Op.like]` | `LIKE` | `{ name: { [Op.like]: "%Trek%" } }` |
| `[Op.or]` | `OR` | `{ [Op.or]: [{ stock: 0 }, { price: { [Op.gt]: 1000 } }] }` |
| `[Op.and]` | `AND` | Implícito si pones varias claves en el mismo `where` |

### Filtrar la tabla principal por un campo de la incluida

Si quieres el filtro **en el `where` principal**, se usa la sintaxis `$alias.campo$`:

```ts
Bicycle.findAll({
    where: { "$brand.name$": "Trek" },
    include: [{ model: Brand, as: "brand" }],
});
```

---

## 5. Ejemplos que pueden caer en el examen (con solución)

Todos usan las relaciones que ya existen en el proyecto.

### 5.1 1:N hacia abajo: una marca con todas sus bicis

```ts
Brand.findByPk(id, { include: [{ model: Bicycle, as: "bicycles" }] });
```

*(Ya está hecho: `BrandService.findWithBicycles`.)*

### 5.2 1:N hacia arriba: bicis de una marca por nombre

```ts
Bicycle.findAll({ include: [{ model: Brand, as: "brand", where: { name }, required: true }] });
```

*(Ya está hecho: `BicycleService.findByBrandName`.)*

### 5.3 1:1: bicis de carbono con su detalle

```ts
Bicycle.findAll({ include: [{ model: BicycleDetail, as: "detail", where: { frameMaterial: "Carbon" } }] });
```

### 5.4 1:N + filtro: pedidos pagados de un cliente

```ts
Order.findAll({ where: { customerId, status: "paid" }, include: [includeCustomer] });
```

### 5.5 N:M: un pedido con sus bicicletas y la cantidad de cada una

```ts
Order.findByPk(id, {
    include: [{ model: Bicycle, as: "bicycles", attributes: ["id", "model", "price"],
                through: { attributes: ["quantity", "unitPrice"] } }],
});
```

### 5.6 N:M al revés: en qué pedidos aparece una bicicleta

```ts
Bicycle.findByPk(id, { include: [{ model: Order, as: "orders", through: { attributes: [] } }] });
```

### 5.7 Tres saltos: clientes que han comprado alguna bici de la marca X

```ts
Customer.findAll({
    include: [{
        model: Order, as: "orders", required: true, attributes: ["id"],
        include: [{
            model: Bicycle, as: "bicycles", required: true, attributes: ["id", "model"],
            through: { attributes: [] },
            include: [{ model: Brand, as: "brand", where: { name: brandName }, attributes: [] }],
        }],
    }],
});
```

### 5.8 Contar relacionados: número de bicis por marca

```ts
import { fn, col } from "sequelize";
Brand.findAll({
    attributes: ["id", "name", [fn("COUNT", col("bicycles.id")), "totalBicycles"]],
    include: [{ model: Bicycle, as: "bicycles", attributes: [] }],
    group: ["Brand.id"],
});
```

### 5.9 Con la nueva entidad Model: un modelo con sus bicis y la marca de cada una

```ts
BicycleModel.findByPk(id, {
    include: [{ model: Bicycle, as: "bicycles", include: [{ model: Brand, as: "brand", attributes: ["name"] }] }],
});
```

---

## 6. Errores típicos (y qué significan)

| Error | Causa | Solución |
|-------|-------|----------|
| `SequelizeEagerLoadingError: X is associated to Y using an alias. You've included an alias (foo), but it does not match...` | El `as` del include no coincide con `associations.ts` | Copia el alias exacto |
| `X is not associated to Y!` | Falta la asociación, o `defineAssociations()` no se ejecuta | Revisa `associations.ts` y que esté en `server.ts` |
| `Naming collision between attribute 'x' and association 'x'` | El alias se llama igual que una columna | Cambia el alias (p. ej. `bicycleModel`) |
| `Table 'xxx' doesn't exist` | No has importado el modelo en `server.ts` | Añade el `import` |
| `ForeignKeyConstraintError` | Borrar un padre con hijos (RESTRICT), o crear un hijo con FK inexistente | Captúralo → `409`, o valida con `xxxExists()` → `400` |
| La ruta devuelve 404 o "not found" en vez de tu consulta | `/:id` está antes de la ruta fija | Pon las rutas fijas **arriba** |
| `Cannot find module '.../x.model'` | Import sin `.js` | En ESM: `from "./x.model.js"` |

---

## 7. 🏋️ Relaciones para practicar

Intenta hacerlas siguiendo el orden de la sección 3 **sin mirar la solución**. Cada una tiene una "consulta de examen".

### Práctica A (1:N, fácil): `Category ||──o{ Bicycle`

Cada bici pertenece a una categoría (Montaña, Carretera, Urbana…).

1. CRUD de Category (`name`).
2. Todas las bicicletas con su categoría y su marca.
3. Las categorías con sus bicis de stock > 0.

<details><summary>Solución (claves)</summary>

```ts
// associations.ts
Category.hasMany(Bicycle, { foreignKey: "categoryId", as: "bicycles" });
Bicycle.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// 2
Bicycle.findAll({ include: [includeBrand, { model: Category, as: "category", attributes: ["id", "name"] }] });

// 3
Category.findAll({ include: [{ model: Bicycle, as: "bicycles", where: { stock: { [Op.gt]: 0 } } }] });
```

FK `categoryId` en `bicycles`. Import en `server.ts` y `router.use("/categories", ...)`.
</details>

### Práctica B (1:1, media): `Customer ||──o| Address`

Cada cliente tiene como mucho una dirección (`street`, `city`, `zip`).

1. CRUD de Address (validar que el cliente existe y que **no tiene ya** dirección → 409).
2. Clientes de una ciudad concreta con sus pedidos.

<details><summary>Solución (claves)</summary>

```ts
// address.model.ts → customerId: { type: INTEGER.UNSIGNED, allowNull: false, unique: true }
Customer.hasOne(Address, { foreignKey: "customerId", as: "address", onDelete: "CASCADE" });
Address.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

// 2
Customer.findAll({
    include: [
        { model: Address, as: "address", where: { city }, required: true },
        { model: Order, as: "orders" },
    ],
});
```

Es el mismo patrón que `BicycleDetail` (copia su controller, incluido `bicycleHasDetail` → `customerHasAddress`).
</details>

### Práctica C (N:M, difícil): `Bicycle >──< Accessory` a través de `BicycleAccessory`

Una bici puede llevar muchos accesorios (timbre, luces, candado…) y un accesorio vale para muchas bicis. La tabla intermedia guarda `installed: boolean`.

1. CRUD de Accessory (`name`, `price`).
2. Una bici con todos sus accesorios (mostrando `installed`).
3. Accesorios de precio < 20 que estén en bicis de la marca X.

<details><summary>Solución (claves)</summary>

```ts
Bicycle.belongsToMany(Accessory, { through: BicycleAccessory, foreignKey: "bicycleId", otherKey: "accessoryId", as: "accessories" });
Accessory.belongsToMany(Bicycle, { through: BicycleAccessory, foreignKey: "accessoryId", otherKey: "bicycleId", as: "bicycles" });

// 2
Bicycle.findByPk(id, { include: [{ model: Accessory, as: "accessories", through: { attributes: ["installed"] } }] });

// 3
Accessory.findAll({
    where: { price: { [Op.lt]: 20 } },
    include: [{
        model: Bicycle, as: "bicycles", required: true, through: { attributes: [] },
        include: [{ model: Brand, as: "brand", where: { name: brandName }, attributes: [] }],
    }],
});
```

`BicycleAccessory` tiene `bicycleId` y `accessoryId` (las dos FKs).
</details>

### Práctica D (encadenada, tipo ejercicio 4): `Supplier ||──o{ Brand`

Un proveedor suministra varias marcas.

1. CRUD de Supplier.
2. **Pedidos** que incluyan bicicletas de marcas de un proveedor concreto (`supplierId`).

<details><summary>Solución (claves)</summary>

```ts
Supplier.hasMany(Brand, { foreignKey: "supplierId", as: "brands" });
Brand.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });

Order.findAll({
    include: [{
        model: Bicycle, as: "bicycles", required: true, through: { attributes: [] },
        include: [{ model: Brand, as: "brand", required: true, where: { supplierId } }],
    }],
});
```

Camino: Order → Bicycle (N:M) → Brand (N:1) → filtro por FK `supplierId`.
</details>

### Práctica E (preguntas rápidas de teoría)

1. Si una relación es `A ||──o{ B`, ¿en qué tabla va la FK? → **B**.
2. ¿Qué diferencia una 1:1 de una 1:N en la definición de la columna FK? → **`unique: true`**.
3. ¿Qué método va en el modelo que tiene la FK? → **`belongsTo`**.
4. ¿Para qué sirve `required: true`? → Pasa de LEFT JOIN a **INNER JOIN**.
5. ¿Qué hace `through: { attributes: [] }`? → Oculta las columnas de la tabla intermedia en una N:M.
6. ¿Por qué `onDelete: "RESTRICT"` en `brandId`? → Para que no se pueda borrar una marca que tiene bicis (y el controller devuelve **409**).
7. ¿Por qué pongo `/with-brand-model` antes de `/:id`? → Express coge **la primera ruta que encaja**.
