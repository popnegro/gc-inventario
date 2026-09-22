# Prompt 2: Búsqueda por Proximidad y Selección de Soportes

## Objetivo
Mostrar el estado interactivo donde el anunciante ha realizado una búsqueda geográfica para encontrar soportes OOH cercanos a su punto de venta y ha comenzado a armar su selección.

## Instrucciones para Stitch
Modifica la vista de `/inventario` para representar el **Estado Activo de Búsqueda y Selección**:

1. **Estado de la Barra de Búsqueda**:
   - El input tiene un valor ingresado: `"Av. San Martín y Garibaldi, Ciudad de Mendoza"`.
   - Botón `[ X ]` para limpiar búsqueda y badge informativo: *"Mostrando soportes ordenados por cercanía"*.

2. **Mapa (Canvas Derecho)**:
   - Aparece un **marcador de radar rojo pulsante** en el centro de la intersección buscada con la etiqueta: *"Tu punto comercial buscado"*.
   - El mapa se encuadra automáticamente mostrando los 3 carteles más cercanos dentro de un radio de 2 km.
   - El cartel más próximo (`GC-MZA-LED-01`) tiene su **InfoWindow / Tarjeta flotante abierta sobre el mapa**:
     * Muestra foto miniatura, nombre *"Peatonal Sarmiento & Av. San Martín"*.
     * Medidas: *"10 x 4 m"* | Impactos: *"+1.250.000 / mes"*.
     * Distancia: *"A solo 180 metros caminando"*.
     * Botón con estado seleccionado: `[ ✓ En tu propuesta ]` en fondo azul eléctrico.

3. **Panel Lateral Izquierdo**:
   - Las tarjetas se reordenan automáticamente:
     * **Tarjeta 1**: Muestra un badge destacado en la esquina: `[ 📍 A 180 m ]`. Su botón de acción dice `[ ✓ En tu propuesta ]` (estado seleccionado activo con borde azul).
     * **Tarjeta 2**: Muestra el badge `[ 📍 A 650 m ]`. Su botón dice `[ ✓ En tu propuesta ]` (también seleccionado).
     * **Tarjeta 3**: Muestra el badge `[ 📍 A 1.4 km ]`. Su botón dice `[ + Agregar a selección ]` (aún disponible para añadir).

4. **Sticky Bottom Bar (Barra Flotante Inferior de Selección)**:
   - En la parte inferior de la pantalla se despliega una barra flotante oscura (`bg-slate-900 text-white`, `rounded-2xl`, con sombra pronunciada `shadow-2xl`):
     * **Sector Izquierdo**:
       - Contador: `2 soportes seleccionados (Mendoza)`.
       - Métrica acumulada destacada: `~3.650.000 impactos estimados / mes`.
     * **Sector Derecho**:
       - Botón secundario: `[ Ver detalle rápido ]`.
       - Botón principal de acción (CTA): `[ Armar Media Kit & Cotización → ]` (botón azul brillante con icono de flecha).
