# Gestor de Proformas
## By Hugo Jovel Web

Sistema de gestión de tareas y **proformas de exportación** con exportación a **PDF** en el formato del anexo de la tarea.
Construido con **React + TypeScript + Vite + Tailwind CSS**; los datos se guardan en `localStorage` (sin servidor).

## Características implementadas

| Requerimiento | Estado |
|---|---|
| Crear tarea/proforma con nombre, descripción, prioridad, fecha límite y datos de exportación | Implementado |
| Editar | Implementado |
| Eliminar con confirmación previa | Implementado |
| Marcar como completada / pendiente | Implementado |
| Lista de todas las tareas | Implementado |
| Filtros: estado (todas, completadas, pendientes) y prioridad | Implementado |
| Filtro por fecha límite: hoy, esta semana (lun–dom), este mes (actividades diarias, semanales y mensuales) | Implementado |
| Búsqueda por título | Implementado |
| Persistencia en `localStorage`, carga automática al iniciar | Implementado |
| PDF con logo, encabezado del exportador, N° control, moneda, datos de exportación, exportador/importador, detalle, total en letras, condición de pago | Implementado |
| Diseño responsive (móvil, tablet, escritorio), feedback visual, animaciones sutiles (respetan `prefers-reduced-motion`) | Implementado |

El **total en letras** se calcula con una función propia (`src/lib/numeroALetras.ts`): `15000` → `QUINCE MIL CON 00/100 DÓLARES`.
Soporta hasta 999 999 999.99; fuera de ese rango muestra `NÚMERO FUERA DE RANGO`.
(El PDF de ejemplo del anexo mostraba "NÚMERO FUERA DE RANGO CON 0/100" para $15000.00; aquí está corregido y probado.)

## Requisitos

- **Node.js 20 o superior** (incluye npm) y **Git**.
- Un navegador moderno (Firefox, Chromium, Chrome, Edge).

## Instalación y ejecución en Debian 13 (XFCE)

> Todos los comandos se ejecutan en el emulador de terminal de XFCE (*Xfce Terminal*).

1. Actualiza el sistema e instala Git y curl:

   ```bash
   sudo apt update
   sudo apt install -y git curl ca-certificates
   ```

2. Instala Node.js 20+ (elige **una** opción):

   - **Opción A — repositorios de Debian** (la más simple):
     ```bash
     sudo apt install -y nodejs npm
     node -v      # debe mostrar v20 o superior
     ```
     Si `node -v` muestra una versión menor a 20, usa la opción B.
   - **Opción B — nvm** (sin `sudo`, permite cambiar de versión). Instálalo con el comando oficial de <https://github.com/nvm-sh/nvm>, abre una terminal nueva y ejecuta:
     ```bash
     nvm install --lts
     node -v
     ```

3. Verifica el entorno (no instala nada):

   ```bash
   bash scripts/verificar-entorno.sh
   ```

4. Descomprime el proyecto, instala dependencias y arranca:

   ```bash
   unzip gestor-proformas.zip
   cd gestor-proformas
   npm install
   npm run dev
   ```

5. Abre <http://localhost:5173> en Firefox.

Otros comandos: `npm test` (pruebas), `npm run typecheck`, `npm run build` (genera `dist/`), `npm run preview`.

Para abrirlo desde otro equipo de la red local: `npm run dev -- --host` y entra con `http://IP-DE-DEBIAN:5173`
(permite el puerto 5173 si usas firewall; la app funciona por http gracias al respaldo de `nuevoId()`).

### Control de versiones (Git)

```bash
git init
git add .
git commit -m "feat: proyecto inicial gestor de proformas"
```

## Instalación y ejecución en Windows 10/11

1. Abre **PowerShell** e instala Git y Node.js LTS con winget (o descárgalos de sus sitios oficiales):

   ```powershell
   winget install --id Git.Git -e
   winget install --id OpenJS.NodeJS.LTS -e
   ```

   Cierra y abre PowerShell para que se actualice el `PATH`.

2. Verifica el entorno:

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\verificar-entorno.ps1
   ```

3. Descomprime el ZIP, entra a la carpeta y ejecuta:

   ```powershell
   cd gestor-proformas
   npm install
   npm run dev
   ```

4. Abre <http://localhost:5173>.

Si PowerShell bloquea `npm` ("la ejecución de scripts está deshabilitada"), ejecuta una vez:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, o usa `npm.cmd` / **cmd.exe**.

### Windows con Debian (WSL 2) — mismo entorno que Debian

Para trabajar en Debian desde Windows: en PowerShell de administrador `wsl --install -d Debian`, reinicia, abre "Debian" y sigue los pasos de la sección Debian.
Mantén el proyecto dentro del sistema de archivos de Linux (`~/gestor-proformas`), no en `/mnt/c`, para mejor rendimiento. El servidor de desarrollo es accesible desde el navegador de Windows en `http://localhost:5173`.

## Uso rápido

1. **Cargar ejemplo** (pantalla vacía) crea la proforma del anexo; **+ Nueva proforma** abre el formulario.
2. **Descargar PDF** en cualquier tarjeta genera `Proforma-<N° control>.pdf`.
3. Para cambiar el **logo**, reemplaza `public/logo.png` (PNG o JPG con extensión `.png`; fondo claro recomendado).
4. Los datos del exportador por defecto están en `src/lib/defaults.ts` (`exportadorPorDefecto`) y se pueden editar en cada proforma.

## Estructura

```
src/
  components/   ConfirmDialog, Filters, ProformaCard, ProformaForm
  hooks/        useProformas (estado + persistencia)
  lib/          pdf, numeroALetras, calculos, fechas, storage, defaults, id (+ *.test.ts)
  App.tsx, main.tsx, types.ts, index.css
public/logo.png
scripts/        verificar-entorno.sh / .ps1
```

## Datos y privacidad

Todo se guarda **solo en tu navegador** (`localStorage`, clave `gestor-proformas:v1`). Borrar los datos del sitio los elimina.
No hay servidor, cuentas ni credenciales. El `localStorage` no está cifrado: no registres información que no deba quedar en ese equipo.

## Estado de verificación (sin ocultar nada)

- **Ejecutado y aprobado:** compilación estricta de TypeScript de los módulos sin dependencias externas (`types`, `numeroALetras`, `calculos`, `fechas`, `storage`, `defaults`, `id`) y las aserciones equivalentes a las pruebas unitarias de `numeroALetras`, `fechas` y `calculos`.
- **No ejecutado** (el entorno donde se generó no tenía acceso a internet): `npm install`, `npm run build`, `npm test` con Vitest, la interfaz en un navegador y el renderizado real del PDF. Ejecuta `npm install && npm run typecheck && npm test && npm run build` en tu equipo y revisa un PDF generado contra el anexo.
- **Limitaciones conocidas:** sin ESLint/Prettier configurados; sin pruebas de interfaz ni accesibilidad automatizadas; el PDF usa Helvetica estándar (caracteres fuera de Latin-1, como chino, no se mostrarán bien); dos pestañas abiertas sobrescriben los datos de la otra (última escritura gana); el PDF es una proforma, no un DTE firmado ni transmitido.
