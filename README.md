## Despliegue en Netlify (una proforma = un proyecto de Netlify)

Cada proforma vive en su propia subcarpeta y se publica como un proyecto
independiente de Netlify apuntando a este mismo repo.

### Pasos para publicar una proforma nueva
1. En Netlify: **Add new project → Import from GitHub →** elegir este repo.
2. Configurar el **Base directory** con el nombre de la subcarpeta
   (ejemplo: `sys-proformas`, `proforma-generico`).
3. Verificar que dentro de esa subcarpeta exista un `netlify.toml`.
4. Cambiar el nombre del sitio, por ejemplo `proforma-cliente-x`.

### `netlify.toml` (va DENTRO de cada subcarpeta, no en la raíz)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Notas
- No poner `base` en el `netlify.toml`: se configura en Netlify por proyecto.
- Un `netlify.toml` en la raíz afectaría a todos los proyectos, por eso se evita.
- El bloque `[[redirects]]` evita el 404 al entrar directo a una ruta (SPA).
- Si el 404 vuelve a aparecer, revisar Base directory y Publish directory.
