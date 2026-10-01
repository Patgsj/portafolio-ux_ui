# Portafolio UX/UI — Patricio Soto

Sitio personal publicado en [patgsj.cl](https://patgsj.cl): casos de estudio, design system y exploraciones de interfaz.

## Qué contiene

- **Ferretería CTM:** caso de estudio de un catálogo digital y tótem de autoservicio con cliente real, desde el problema hasta el prototipo funcional desplegado.
- **Design System Banca Digital:** fundamentos como tokens (color con contraste WCAG, tipografía, espaciado en múltiplos de 4, radios y elevación), componentes con variantes en una librería de Figma publicada, y changelog por versión. Cada pestaña muestra una imagen exportada desde Figma; el archivo interactivo se abre a pedido.
- **Diseño UI:** seis ejercicios de interfaz elegidos por su cercanía a producto.

## Stack

- React 18 + TypeScript, con Vite 6.
- Tailwind CSS v4 (configuración en CSS: `src/styles/theme.css` define los tokens de color).
- Motion para las animaciones, Embla para el carrusel del caso y Lucide para los iconos.

Todo el sitio vive en `src/app/App.tsx`, con una función por sección. Es una página única sin router.

## Decisiones

- **Una sola dependencia por necesidad.** El proyecto partió desde Figma Make con una librería completa de componentes; se dejó solo lo que la página usa.
- **Imágenes antes que embeds.** El embed de Figma tarda varios segundos en cargar, así que el design system se muestra con imágenes precargadas y el embed queda como opción.
- **Accesibilidad:** foco visible en todos los controles, textos alternativos y contraste revisado según WCAG 2.2.

## Desarrollo

```bash
npm install
npm run dev     # servidor local
npm run build   # build de producción en dist/
```

## Despliegue

Cada push a `main` ejecuta `.github/workflows/deploy.yml`: instala dependencias, compila y sube `dist/` por FTP al hosting de patgsj.cl.
