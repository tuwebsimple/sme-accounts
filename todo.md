# Dashboard de Analytics - TODO

## Procesamiento de Datos
- [x] Script Python para procesar datasets de TikTok e Instagram
- [x] Extracción de artistas desde descripciones con algoritmo de similitud
- [x] Cálculo de métricas mensuales (mediana, promedio, totales)
- [x] Generación de archivos JSON (data_tiktok.json, data_instagram.json)

## Estructura del Dashboard
- [x] Configuración de dependencias (Recharts, lucide-react)
- [x] Header con título dinámico y botones de plataforma
- [x] Botón de descarga CSV
- [x] 7 tarjetas de métricas con colores distintivos
- [x] Sistema de tabs (Evolución Mensual / Performance por Artista)

## Tab: Evolución Mensual
- [x] Gráfica combinada (barras + línea) de evolución mensual
- [x] Dropdown selector de métrica
- [x] Violin plot / distribución de videos
- [x] Tabla de videos del mes con ordenamiento
- [x] Interacción: click en barra filtra tabla

## Tab: Performance por Artista
- [x] Filtros: año, métrica, mínimo de videos, palabra a excluir
- [x] Gráfica horizontal de top 30 artistas
- [x] Tabla de videos del artista seleccionado
- [x] Interacción: click en barra muestra videos del artista

## Estilos y Diseño
- [x] Paleta de colores según especificaciones
- [x] Tipografía y layout responsivo
- [x] Formato de números (K/M)
- [x] Iconos de lucide-react

## Funcionalidades
- [x] Cambio entre plataformas TikTok/Instagram
- [x] Ordenamiento de tablas por columnas
- [x] Tooltips personalizados en gráficas
- [x] Exportación a CSV por plataforma
- [x] Links externos con target="_blank"

## Mejoras Solicitadas
- [x] Violin plot con puntos individuales y forma de violin
- [x] Tooltip del violin plot mostrando solo la mediana
- [x] Métrica inicial en evolución mensual: Interaction Rate Promedio
- [x] Optimizar algoritmo de extracción de artistas en descripciones

## Filtrado Dinámico por Mes
- [x] Filtrar tarjetas de métricas al seleccionar un mes
- [x] Filtrar violin plot al seleccionar un mes
- [x] Botón para limpiar filtro y volver a vista general
- [x] Cambiar color de barra seleccionada en gráfica de evolución mensual

## Mejoras de Visualización
- [x] Verificar y ajustar escala del gráfico para Promedio de Views y Promedio de Likes
- [x] Mostrar línea de promedio en el violin plot del mes seleccionado

## Actualización de Datos y Clasificación
- [x] Analizar nuevo dataset SMETikTokAccount(1).xlsx
- [x] Implementar clasificación por username @ más similar al artista
- [x] Procesar TikTok con nueva clasificación (65.2% clasificados, 287 artistas)
- [x] Procesar Instagram con nueva clasificación (80.7% clasificados, 292 artistas)
- [x] Generar archivos JSON actualizados (445 artistas totales)

## Tab Performance por Artista
- [x] Implementar interfaz del tab con filtros
- [x] Gráfica horizontal de top 30 artistas por métrica seleccionada
- [x] Filtro por año
- [x] Filtro por métrica (IR, Views, Likes)
- [x] Filtro por mínimo de videos
- [x] Filtro por palabra a excluir
- [x] Tabla de videos del artista seleccionado
- [x] Interacción: click en barra muestra videos del artista

## Violin Plot Dinámico
- [x] Actualizar violin plot para mostrar distribución de la métrica seleccionada (Views/Likes/IR)
- [x] Ajustar escala del eje Y según la métrica
- [x] Actualizar etiquetas y tooltip con la métrica correcta

## Tooltip Individual en Violin Plot
- [x] Implementar tooltip que muestre descripción del video al hacer hover en cada punto
- [x] Mostrar artista, métrica y descripción en el tooltip
- [x] Verificar que el filtrado por mes funcione correctamente en el violin plot

## Visualización de Categorías de Impacto
- [x] Reemplazar violin plot por gráfica de categorías de impacto
- [x] Definir rangos de impacto (Bajo, Medio, Alto, Muy Alto) según métrica
- [x] Mostrar cantidad y porcentaje de videos en cada categoría
- [x] Usar colores distintivos para cada categoría
- [x] Incluir gráfica de barras horizontal clara con resumen

## Corrección de Categorías de Impacto
- [x] Corregir cálculo de percentiles para usar solo videos filtrados (no todos)
- [x] Agregar columna "Categoría" en tabla de videos del mes
- [x] Mostrar badge visual con color según categoría de impacto
- [x] Sincronizar categorías entre gráfica y tabla

## Ajuste de Percentiles de Impacto
- [x] Cambiar percentiles de 20-40-60-80 a 10-30-60-85 para clasificación más restrictiva
- [x] Solo el 15% superior será clasificado como Alto o Muy Alto impacto

## Gráfica Stacked de Impacto por Mes
- [x] Agregar botón de toggle para cambiar entre vista de evolución y vista de impacto
- [x] Implementar gráfica stacked (apilada) mostrando categorías de impacto por mes
- [x] Calcular distribución de categorías para cada mes
- [x] Usar colores consistentes con las categorías existentes

## Reordenamiento de Categorías
- [x] Reordenar gráfica de barras horizontal de Muy Alto → Muy Bajo
- [x] Invertir orden actual (Muy Bajo → Muy Alto)

## Corrección de Colores en Gráfica Horizontal
- [x] Invertir colores en la gráfica de barras horizontal: Muy Alto debe ser verde, Muy Bajo debe ser rojo
- [x] Asegurar consistencia de colores en todas las visualizaciones

## Modificaciones Finales
- [x] Modificar card "Alto Impacto" para contar solo videos de categoría "Muy Alto"
- [x] Agregar filtro de años en Evolución Mensual
- [x] Agregar filtro de impacto en tabla "Videos del Mes"
- [x] Permitir filtrado combinado de año + impacto

## Reorganización de UI
- [x] Mover tarjetas de métricas dentro de la pestaña "Evolución Mensual"
- [x] Agregar opción para mostrar todos los videos (sin filtro de mes)
- [x] Crear tabla de "Todos los Videos" con filtros de año e impacto

## Simplificación del Dashboard
- [x] Eliminar tabla "Videos del Mes" (que aparece al seleccionar un mes)
- [x] Hacer que la tabla "Todos los Videos" sea la única tabla
- [x] Los filtros de la gráfica (año, mes seleccionado, impacto) deben afectar directamente a "Todos los Videos"
- [x] Eliminar botón "Ver Todos los Videos" (tabla siempre visible)

## Mejoras Finales de Tabla
- [x] Agregar botón "Limpiar filtro de mes" en la sección de la tabla
- [x] Establecer ordenamiento por defecto: videos más recientes primero (fecha descendente)

## Umbrales Fijos de Clasificación
- [x] Analizar distribución de Likes, Views e IR en los datos
- [x] Establecer umbral de 50K likes para "Muy Alto" (2.35% de videos)
- [x] Calcular umbrales equivalentes para Views (1.6M) e IR (23.22%)
- [x] Implementar rangos fijos en lugar de percentiles
- [x] Definir 5 categorías con umbrales claros para cada métrica

## Actualización de Gráficos con Umbrales Fijos
- [x] Actualizar cálculo de "Categorías de Impacto" para usar umbrales fijos
- [x] Actualizar gráfica stacked mensual para usar umbrales fijos
- [x] Mejorar visibilidad del botón "Vista Impacto"
- [x] Mejorar wording del botón (ej: "Ver Distribución de Impacto")

## Agregar Métrica Mediana de Views
- [x] Calcular umbral de impacto para Mediana de Views (mismo que Views: 1.6M)
- [x] Agregar "Mediana de Views" al dropdown de métricas
- [x] Actualizar función getImpactCategory para soportar median_views
- [x] Verificar que funcione en todos los visuales (gráficas, tabla, categorías)

## Mejoras del Botón de Distribución
- [x] Invertir colores: azul por defecto, blanco cuando activo
- [x] Quitar emoji del texto del botón

## Agregar Métrica Mediana de Interaction Rate
- [x] Calcular umbral de impacto para Mediana de IR (mismo que IR: 23.22%)
- [x] Agregar "Mediana de Interaction Rate" al dropdown de métricas
- [x] Actualizar función getImpactCategory para soportar median_ir
- [x] Verificar que funcione en todos los visuales (gráficas, tabla, categorías)

## Correcciones Finales de Mediana de IR
- [x] Verificar que gráfico de Categorías de Impacto use median_ir correctamente
- [x] Cambiar nombre de "Mediana de Interaction Rate" a "Interaction Rate Mediana"
- [x] Agregar iconos al dropdown (📊 medianas, 📈 promedios)

## Ajustes de Diseño UI
- [x] Mover botón "Ver Distribución de Impacto" dentro de la card "Evolución Mensual" y hacerlo más pequeño
- [x] Mover botones de plataforma (TikTok/Instagram) a la esquina superior derecha, más discretos
- [x] Mostrar mes y año en palabras en el título "Todos los Videos" (ej: "Octubre 2025" en lugar de "2025-10")
- [x] Hacer botón del mismo tamaño que los botones de la izquierda (TikTok/Instagram)

## Reorganización de Botones en Header
- [x] Mover botón "Descargar CSV" al header junto a los botones de TikTok/Instagram

## Mejora de Iconos en Dropdown de Métricas
- [x] Reemplazar emojis con iconos de lucide-react
- [x] Usar un icono diferente para cada métrica

## Correcciones en Performance por Artista
- [x] Establecer filtros iniciales: año 2025 y mínimo 3 videos
- [x] Extender altura del gráfico para mostrar todos los nombres de artistas (600→900px)
- [x] Corregir clasificaciones: Dope→Dove Cameron, Nath→Nathy Peluso, Calo→Carlos Rivera, Belo→BEÉLE, Pereza→Fuerza Regida, Miguel→Miguel Bueno
- [x] Arreglar ranking para que cambie dinámicamente según la métrica seleccionada (incluye median_views y median_ir)

## Bug: Valores NaN en JSON
- [x] Corregir script de procesamiento para reemplazar NaN con 0 (funciones safe_float y safe_int)
- [x] Regenerar archivos JSON sin valores NaN

## Correcciones Adicionales de Clasificación de Artistas
- [x] Agregar al mapeo manual: MDO→Mon Laferte, HAIM→Ha*Ash, Jain→Juan Luis
- [x] Regenerar datos con clasificaciones corregidas

## Bug: Mapeo Manual No Funciona Correctamente
- [x] Mejorar lógica de mapeo para capturar variaciones de usernames (mayúsculas, subcadenas)
- [x] Agregar casos faltantes: Neton→Neto Bernal, Beelo→BEÉLE
- [x] Regenerar datos con mapeo corregido (422 artistas, reducción de duplicados)

## Investigación: Artistas Incorrectos Aún Aparecen
- [x] Verificar datos en artist_stats.json
- [x] Confirmar que mapeo se aplicó correctamente
- [x] Solucionar problema: agregar normalize_artist_name() en generate_artist_stats()
- [x] Datos regenerados: 415 artistas (reducción de 7 duplicados consolidados)

## Funcionalidad: Cambio Dinámico de Métrica en Performance por Artista
- [x] Implementar selector de métrica (avg_views, median_views, avg_ir, median_ir, avg_likes)
- [x] Actualizar valores del gráfico según métrica seleccionada (ya implementado en artistData)
- [x] Reordenar ranking de artistas según métrica seleccionada (ya implementado en artistData)
- [x] Corregir selector para usar artistMetric en lugar de evolutionMetric

## Normalización de Nombres en Datos Mensuales
- [x] Aplicar normalize_artist_name() en process_tiktok() antes de guardar
- [x] Aplicar normalize_artist_name() en process_instagram() antes de guardar
- [x] Regenerar datos para corregir nombres en tabla de videos
