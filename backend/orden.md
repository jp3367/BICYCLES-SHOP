en database.ts tenemos la conexión a MYSQL.

env.ts lee la configuración de la base de datos del .env.

en associations.ts tenemos todas las relaciones de las tablas.

el orden que se debe seguirn en modules es el siguiente:

1. .model.ts
2. .service.ts
3. .controller.ts
4. routes.ts

Tener esto en cuenta para cualquier tipo de moodules que tenga que hacer para no cometer fallos y ponerse nervioso con tonterías.

en index.ts tenemos las rutas de los endpoints.

app.ts configura el servidor web y recibe las peticiones de bruno (una especie de conector entre bruno y el código).

server.ts inicia el servidor.

BICYCLE-MODELS

Es lo que entro en el pre examen
un modelo tiene muchas bicicletas, la realción es igual que brand (1:N)

bicycle-model.model.ts contiene la tabla
.services.ts las consultas (CRUD, findAll, findByPk)
.controller.ts recibe la petición, valida y responde
.routes.ts las rutas de los endpoints  GET /, GET /:id, POST /, PUT /:id, DELETE /:id


