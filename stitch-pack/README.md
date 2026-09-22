# Paquete de Recursos para Google Stitch: Rediseño de /inventario (Grupo Comunicarte)

Este paquete contiene todos los recursos, datos reales, directrices de marca y prompts secuenciados para generar en **Google Stitch** la nueva versión de `/inventario`, integrando el diseño del **Store Locator ("Find Near Me")** con el flujo comercial y de **Media Kit** de Grupo Comunicarte.

---

## 📁 Contenido del Paquete

```
stitch-pack/
├── README.md                                  <- Esta guía paso a paso
├── brand/
│   ├── tokens.json                           <- Tokens de color, tipografía, bordes y sombras
│   └── brand-guidelines.md                   <- Reglas de diseño y jerarquía visual B2B
├── data/
│   └── inventory-sample.json                 <- 4 soportes reales (LED, Tradicional, Móvil)
├── prompts/
│   ├── 01-layout-principal-exploracion.md    <- Prompt 1: Layout general y mapa base
│   ├── 02-busqueda-proximidad-seleccion.md   <- Prompt 2: Búsqueda geográfica y selección activa
│   ├── 03-panel-mediakit-exportacion.md      <- Prompt 3: Drawer de propuesta y exportación
│   └── 04-soporte-card-especificacion.md     <- Prompt 4: Ficha de componentes SupportCard
├── assets/
│   ├── captura-find-near-me.jpg              <- Captura visual del Store Locator (Split-Screen & Google Maps)
│   ├── captura-inventario-actual.jpg         <- Captura visual del /inventario actual de Grupo Comunicarte
│   ├── esquema-web-b2c.png                   <- Esquema arquitectónico original del proyecto
│   ├── soporte-led-mza-01.jpg                <- Foto real de soporte LED Peatonal Sarmiento
│   └── soporte-led-mza-08.png                <- Foto real de soporte LED Monumental Acceso Este
```

---

## 🚀 Pasos para usar en Google Stitch

### Paso 1: Configurar el Contexto de Marca
1. Abre tu proyecto en **Google Stitch**.
2. En la sección de configuración o adjuntos del proyecto, carga el archivo `brand/tokens.json` y el esquema `assets/esquema-web-b2c.png`.
3. Pega el contenido de `brand/brand-guidelines.md` como directrices generales de diseño para que el motor entienda que se trata de publicidad exterior (OOH/DOOH) de alta gama.

### Paso 2: Generar la Pantalla Base
1. Abre el archivo `prompts/01-layout-principal-exploracion.md`.
2. Copia y pega el texto en Stitch.
3. Stitch generará el layout dividido (Split Screen) con el panel lateral de 420px, la barra de búsqueda superior y el mapa vectorial con los pines personalizados.

### Paso 3: Generar el Estado Interactivo de Selección
1. En un nuevo lienzo o variante dentro de Stitch, ejecuta el `prompts/02-busqueda-proximidad-seleccion.md`.
2. Esto ilustrará la búsqueda por proximidad (ej. "Av. San Martín"), la etiqueta "📍 A 180 m" en las tarjetas y la **Sticky Bottom Bar** con el total de impactos acumulados.

### Paso 4: Generar el Panel de Media Kit
1. Ejecuta el `prompts/03-panel-mediakit-exportacion.md`.
2. Se generará el drawer lateral derecho (`MediakitPanel`) que resume la propuesta para agencias, la previsualización del PDF/PPT y el formulario de contacto.

### Paso 5: Generar el Catálogo de Componentes
1. Ejecuta el `prompts/04-soporte-card-especificacion.md` para tener la especificación técnica de las 4 variantes de `SupportCard`.
