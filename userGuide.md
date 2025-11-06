# Guía de Usuario - Dashboard de Analytics

## Información General

**Propósito**: Analizar el rendimiento de las cuentas oficiales de Sony Music México en TikTok e Instagram con métricas detalladas, visualizaciones interactivas y análisis por artista.

**Acceso**: Público

## Powered by Manus

Este dashboard está construido con tecnología de vanguardia que garantiza rendimiento y escalabilidad excepcionales. El stack tecnológico incluye **React 19** con **TypeScript** para una interfaz de usuario robusta y tipada, **Vite** como herramienta de construcción ultrarrápida, **Recharts** para visualizaciones de datos interactivas y responsivas, y **Lucide React** para iconografía moderna. El frontend utiliza **Tailwind CSS 4** con componentes de **shadcn/ui** para un diseño consistente y profesional. El despliegue se realiza en una infraestructura de auto-escalado con CDN global que asegura tiempos de carga mínimos desde cualquier ubicación geográfica.

## Usando el Dashboard

El dashboard presenta dos plataformas de análisis que puedes alternar fácilmente. Al cargar la página, verás siete tarjetas de métricas en la parte superior que muestran el rendimiento general: total de posts, views promedio, likes promedio, interaction rate, shares, comments y collects. Cada tarjeta tiene un borde de color distintivo que corresponde a su métrica específica.

Para cambiar entre plataformas, haz clic en los botones "TikTok" o "Instagram" ubicados en la parte superior. El dashboard cargará automáticamente los datos correspondientes y actualizará todas las métricas y visualizaciones. Si deseas exportar los datos mensuales, haz clic en "Descargar CSV" para obtener un archivo con la evolución mensual de la plataforma seleccionada.

El dashboard ofrece dos pestañas principales de análisis. La pestaña "Evolución Mensual" muestra una gráfica combinada donde las barras azules representan el número de posts por mes y la línea morada muestra la métrica seleccionada (por defecto, mediana de views). Puedes cambiar la métrica usando el dropdown sobre la gráfica. Haz clic en cualquier barra para filtrar la tabla de videos del mes correspondiente. A la derecha verás un violin plot que muestra la distribución del interaction rate de todos los videos. Pasa el cursor sobre las barras para ver detalles de cada video.

La tabla de videos del mes aparece cuando seleccionas un mes en la gráfica. Puedes ordenar la tabla haciendo clic en cualquier encabezado de columna (Fecha, Views, Likes, Shares, Comments, Collects, IR). Las flechas indican el orden actual. Los valores de IR mayores a 10% se muestran en verde para destacar el contenido de alto rendimiento. Haz clic en "Ver" para abrir el video original en una nueva pestaña.

La pestaña "Performance por Artista" te permite analizar el rendimiento de artistas específicos. Usa los filtros en la parte superior para refinar el análisis: selecciona un año específico o "Todos los años", elige la métrica de comparación (Mediana de Views, Promedio de Likes, o Interaction Rate Promedio), ajusta el slider para establecer un mínimo de videos requeridos, o ingresa una palabra en el campo de texto para excluir videos que la contengan en su descripción.

La gráfica horizontal muestra los top 30 artistas ordenados por la métrica seleccionada. Haz clic en cualquier barra para ver todos los videos de ese artista. La barra seleccionada cambiará a color verde. Pasa el cursor sobre las barras para ver estadísticas detalladas del artista. La tabla de videos del artista seleccionado funciona igual que la tabla de videos del mes, con ordenamiento por columnas y enlaces directos a cada video.

## Gestión del Dashboard

Este es un dashboard de análisis estático que no requiere configuración adicional. Los datos se procesan desde archivos CSV y se presentan de forma interactiva. Para actualizar los datos, necesitarás ejecutar el script de procesamiento de Python con nuevos archivos CSV y regenerar los archivos JSON en la carpeta public.

Si necesitas personalizar el dashboard, puedes acceder al código fuente a través del panel de Code en la interfaz de gestión. El archivo principal del dashboard está en `client/src/pages/Home.tsx` y los datos procesados se encuentran en `client/public/data_tiktok.json` y `client/public/data_instagram.json`.

## Próximos Pasos

Habla con Manus AI en cualquier momento para solicitar cambios o agregar funcionalidades. Puedes pedir análisis adicionales, nuevas visualizaciones, filtros personalizados, o cualquier mejora que necesites para optimizar el análisis del rendimiento de tus cuentas de redes sociales. El dashboard está diseñado para ser extensible y puede adaptarse fácilmente a tus necesidades específicas de análisis y reporte.
