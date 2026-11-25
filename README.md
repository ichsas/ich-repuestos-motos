# ICH – Repuestos para motos

Sitio estático de catálogo y panel privado conectado a Supabase.

## Publicación gratuita con GitHub Pages

1. Crear un repositorio **público** en GitHub llamado `ich-repuestos-motos`.
2. Subir el contenido de esta carpeta a la raíz del repositorio (no subir la carpeta contenedora como una subcarpeta).
3. En el repositorio abrir **Settings → Pages**.
4. En **Build and deployment**, elegir **Deploy from a branch**.
5. Seleccionar la rama `main` y la carpeta `/(root)`, y guardar.
6. Esperar a que GitHub Pages muestre el enlace publicado.

GitHub Pages solo aloja estos archivos estáticos. La base de datos, autenticación y almacenamiento de imágenes siguen en Supabase.

## Configuración

`config.js` contiene únicamente el Project URL y la clave pública publishable de Supabase. Nunca poner aquí contraseñas, `service_role` ni claves secretas.

En Supabase, cuando se publique el sitio, agregar la URL de GitHub Pages en **Authentication → URL Configuration → Redirect URLs** si se usan enlaces de confirmación o recuperación. Mantener RLS activado y comprobar que solo el usuario administrador autenticado pueda modificar productos, marcas y motocicletas.

El panel se abre en `/admin.html`.
