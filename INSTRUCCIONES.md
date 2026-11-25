# ICH – Repuestos para motos (versión adaptada a tu Supabase)

Esta versión está adaptada a las tablas que ya existen en tu proyecto Supabase. **No crea tablas nuevas y no debes ejecutar el antiguo `supabase-schema.sql`.**

## Tablas que utiliza
- `categorias`: `id`, `nombre` (y otros campos que ya tengas).
- `marcas`: `id`, `nombre`, `created_at`.
- `motocicletas`: `id`, `marca`, `modelo`, `anio_desde`, `anio_hasta`, `created_at`.
- `productos`: `id`, `referencia`, `nombre`, `descripcion`, `categoria_id`, `marca_id`, `precio`, `imagenes` (arreglo de texto), `activo`, `created_at`, `updated_at`.

Las relaciones `productos.categoria_id` y `productos.marca_id` deben estar relacionadas mediante claves foráneas con `categorias.id` y `marcas.id` para que se muestren los nombres en la tienda.

## Panel de administración
Abre `admin.html` después de publicar:
- **Productos:** crear, editar, publicar/ocultar y borrar productos.
- **Marcas:** agregar, editar y borrar marcas. El panel impide borrar una marca si algún producto la está utilizando.
- **Motocicletas:** agregar manualmente cualquier marca, modelo y rango de años; también permite editar y borrar.

## Conexión de Supabase
En `config.js`, reemplaza los dos valores de ejemplo por:
- `supabaseUrl`: Project URL de Supabase.
- `supabaseAnonKey`: clave pública anon/publishable.

No coloques `service_role`, contraseñas ni claves secretas en los archivos del sitio.

## Almacenamiento de fotografías
El panel espera un bucket público de Supabase Storage llamado `product-images`, con permiso de lectura pública y permisos de carga para usuarios autenticados. Si el bucket o las políticas no existen, hay que configurarlos desde Storage/RLS antes de probar la carga de imágenes.

## Acceso privado
El panel utiliza Supabase Authentication. Debe existir un usuario administrador creado manualmente y el registro público debe permanecer desactivado. Las políticas RLS deben permitir a `authenticated` gestionar las tablas `productos`, `marcas` y `motocicletas`; la tienda pública solo necesita leer categorías y productos activos, además de sus marcas.

## Publicar gratis con GitHub Pages (alternativa a Netlify)
1. Crea un repositorio **público** en GitHub llamado `ich-repuestos-motos`.
2. Sube el contenido de esta carpeta directamente a la raíz del repositorio (no la carpeta contenedora).
3. En GitHub abre Settings → Pages.
4. En Build and deployment selecciona Deploy from a branch, rama `main`, carpeta `/(root)` y pulsa Save.
5. Espera a que GitHub Pages publique la página.
6. Abre el enlace publicado y agrega `/admin.html` para entrar al panel.

GitHub Pages aloja los archivos estáticos sin créditos de IA. Supabase continúa gestionando base de datos, autenticación e imágenes. Para enlaces de autenticación, agrega el dominio publicado en Supabase → Authentication → URL Configuration → Redirect URLs. Mantén RLS activado.

## Importante
Esta versión no modifica la estructura de Supabase. La administración de compatibilidad de productos con motocicletas queda pendiente de revisar la estructura de la tabla `compatibilidad`; no se asume ningún nombre de columna que todavía no hayamos confirmado.


## Actualización correctiva (25/11/2026)
Esta carpeta incluye los archivos con identificadores de versión para evitar que el navegador reutilice scripts antiguos. Para actualizar Netlify, publica nuevamente TODO el contenido de esta carpeta (incluida la carpeta `assets`) y no solo `admin.js`. Después abre `/admin.html` y recarga con Ctrl+F5.
