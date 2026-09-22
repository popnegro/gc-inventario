# Prompt 1: Layout Principal y Exploración de Inventario

## Objetivo
Generar la vista principal de la pantalla `/inventario` de Grupo Comunicarte combinando la estructura ergonómica de "Find Near Me – Store Locator" con el catálogo OOH/DOOH.

## Instrucciones para Stitch
Actúa como un diseñador de producto senior y genera una interfaz web en pantalla completa (desktop-first, con adaptación móvil limpia):

1. **Header Superior (Navbar)**:
   - Logo a la izquierda: "GRUPO COMUNICARTE" en tipografía bold con acento azul `#2563EB`.
   - Selector de Plaza al centro: Píldora toggle segmentada con las opciones `[ Mendoza (Activo) ]` y `[ Buenos Aires ]`.
   - Accesos a la derecha: Botón "Cómo funciona", botón "Mi Propuesta / Selección" con badge contador `[ 0 ]`, y botón de contacto comercial.

2. **Estructura Split-Screen (Dual Pane)**:
   - **Panel Lateral Izquierdo (420px de ancho fijo, scroll vertical independiente)**:
     - Barra de búsqueda prominente: Buscador con autocompletado de Google Places ("Buscar dirección o barrio de tu local comercial...").
     - Filtros de Chips rápidos:
       * Tipo: `[ Todos ]` `[ Pantallas LED ]` `[ Tradicionales ]` `[ LED Móvil ]`
       * Estado: `[ Todos ]` `[ Disponibles ]` `[ Próximamente ]`
     - Barra de control de vista: Contador de resultados ("14 soportes encontrados en Mendoza") y toggle de vista `[ Mapa ]` | `[ Cuadrícula ]`.
     - Listado de tarjetas de soportes (`SupportCard`): 4 tarjetas con fotos 16:9, badges de disponibilidad (verde para disponible, ámbar para reservado), nombre, dirección, medidas, impactos mensuales (+1.2 M) y botón "+ Agregar a selección".
   - **Canvas Derecho (Flex-1, Mapa Vectorial a Pantalla Completa)**:
     - Mapa interactivo de Google Maps con Cloud Styling moderno (calles limpias, puntos de interés tenues).
     - Marcadores vectoriales (Advanced Markers):
       * Pantallas LED: Pines negros oscuros con ribete cian/azul y logo digital.
       * Carteles tradicionales: Pines azules de gran formato.
       * Circuito de LED Móvil: Línea de trayectoria violeta trazada sobre las calles principales con paradas clave.
     - Controles de mapa flotantes: Zoom in/out, botón "Mi ubicación actual", y switch Satélite/Mapa en la esquina superior derecha.

3. **Tokens y Paleta**:
   - Fondo: Blanco y superficie `#F8FAFC`.
   - Bordes: Grises suaves `#E2E8F0` con radio `rounded-xl`.
   - Tipografía: `Plus Jakarta Sans`.
