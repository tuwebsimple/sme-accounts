import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Eye,
  Heart,
  TrendingUp,
  Share2,
  MessageCircle,
  Bookmark,
  Download,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Activity,
  Zap,
  Target,
  TrendingDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine
} from 'recharts';

// Tipos
interface Video {
  date: string;
  description: string;
  artist: string;
  url: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  collects: number;
  ir: number;
}

interface MonthData {
  year_month: string;
  median_views: number;
  avg_views: number;
  avg_likes: number;
  total_shares: number;
  total_comments: number;
  total_collects: number;
  avg_ir: number;
  total_posts: number;
  all_videos: Video[];
}

interface DataSet {
  [key: string]: MonthData;
}

interface ArtistPlatformStats {
  total_videos: number;
  avg_views: number;
  avg_likes: number;
  avg_ir: number;
  total_views: number;
  total_likes: number;
}

interface ArtistStats {
  tiktok?: ArtistPlatformStats;
  instagram?: ArtistPlatformStats;
}

interface ArtistStatsData {
  [artistName: string]: ArtistStats;
}

type Platform = 'tiktok' | 'instagram';
type Tab = 'evolution' | 'artist';
type SortColumn = 'date' | 'views' | 'likes' | 'shares' | 'comments' | 'collects' | 'ir';
type SortDirection = 'asc' | 'desc';
type ArtistMetric = 'median_views' | 'avg_views' | 'avg_likes' | 'median_ir' | 'avg_ir';

// Función para formatear números
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Componente de tarjeta de métrica
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  borderColor: string;
}

const MetricCard = ({ label, value, icon, borderColor }: MetricCardProps) => (
  <div
    style={{
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: `3px solid ${borderColor}`,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <div style={{ color: borderColor }}>{icon}</div>
      <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>{label}</div>
    </div>
    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111' }}>{value}</div>
  </div>
);

export default function Home() {
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [data, setData] = useState<DataSet>({});
  const [artistStatsData, setArtistStatsData] = useState<ArtistStatsData>({});
  const [activeTab, setActiveTab] = useState<Tab>('evolution');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc'); // Más reciente primero
  const [artistSortColumn, setArtistSortColumn] = useState<SortColumn>('views');
  const [artistSortDirection, setArtistSortDirection] = useState<SortDirection>('desc');
  const [artistYear, setArtistYear] = useState<string>('2025');
  const [artistMetric, setArtistMetric] = useState<ArtistMetric>('avg_ir');
  const [minVideos, setMinVideos] = useState<number>(3);
  const [filterWord, setFilterWord] = useState<string>('');
  const [evolutionMetric, setEvolutionMetric] = useState<'median_views' | 'avg_views' | 'avg_likes' | 'median_ir' | 'avg_ir'>('avg_ir');
  const [showImpactView, setShowImpactView] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedImpactFilter, setSelectedImpactFilter] = useState<string>('all');

  // Cargar artist stats una vez al inicio
  useEffect(() => {
    const loadArtistStats = async () => {
      try {
        const response = await fetch('/artist_stats.json');
        const jsonData = await response.json();
        setArtistStatsData(jsonData);
      } catch (error) {
        console.error('Error loading artist stats:', error);
      }
    };
    loadArtistStats();
  }, []);

  // Cargar datos al cambiar plataforma
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/data_${platform}.json`);
        const jsonData = await response.json();
        setData(jsonData);
        setSelectedMonth(null);
        setSelectedArtist(null);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [platform]);

  // Calcular métricas totales o del mes seleccionado
  const totalMetrics = useMemo(() => {
    let allVideos: Video[] = [];
    
    if (selectedMonth && data[selectedMonth]) {
      // Si hay un mes seleccionado, usar solo esos videos
      allVideos = data[selectedMonth].all_videos;
    } else {
      // Si no, usar todos los videos
      Object.values(data).forEach((month) => {
        allVideos.push(...month.all_videos);
      });
    }

    if (allVideos.length === 0) {
      return {
        total_posts: 0,
        avg_views: 0,
        avg_likes: 0,
        avg_ir: 0,
        total_shares: 0,
        total_comments: 0,
        total_collects: 0,
      };
    }

    const views = allVideos.map((v) => v.views);
    const likes = allVideos.map((v) => v.likes);
    const ir = allVideos.map((v) => v.ir);

    return {
      total_posts: allVideos.length,
      avg_views: views.reduce((a, b) => a + b, 0) / views.length,
      avg_likes: likes.reduce((a, b) => a + b, 0) / likes.length,
      avg_ir: ir.reduce((a, b) => a + b, 0) / ir.length,
      total_shares: allVideos.reduce((sum, v) => sum + v.shares, 0),
      total_comments: allVideos.reduce((sum, v) => sum + v.comments, 0),
      total_collects: allVideos.reduce((sum, v) => sum + v.collects, 0),
    };
  }, [data, selectedMonth]);

  // Preparar datos para gráfica de evolución
  const chartData = useMemo(() => {
    return Object.entries(data)
      .filter(([monthKey]) => selectedYear === 'all' || monthKey.startsWith(selectedYear))
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([monthKey, monthData]) => {
        let metricValue: number;
        if (evolutionMetric === 'median_ir') {
          // Calcular mediana de IR para este mes
          const irValues = monthData.all_videos.map(v => v.ir).sort((a, b) => a - b);
          metricValue = irValues.length > 0 ? irValues[Math.floor(irValues.length / 2)] : 0;
        } else {
          metricValue = monthData[evolutionMetric];
        }
        return {
          month: monthKey,
          posts: monthData.total_posts,
          metric: metricValue,
        };
      });
  }, [data, evolutionMetric, selectedYear]);

  // Datos para gráfica stacked de impacto por mes
  const impactStackedData = useMemo(() => {
    return Object.entries(data)
      .filter(([monthKey]) => selectedYear === 'all' || monthKey.startsWith(selectedYear))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, monthData]) => {
        const videos = monthData.all_videos;
        
        // Definir categorías según la métrica
        let categories: { name: string; min: number; max: number; color: string; count: number }[];
        
        // Usar umbrales fijos basados en análisis de datos
        if (evolutionMetric === 'avg_ir' || evolutionMetric === 'median_ir') {
          categories = [
            { name: 'Muy Bajo', min: 0, max: 3.16, color: '#ef4444', count: 0 },
            { name: 'Bajo', min: 3.16, max: 5.36, color: '#f97316', count: 0 },
            { name: 'Medio', min: 5.36, max: 11.09, color: '#eab308', count: 0 },
            { name: 'Alto', min: 11.09, max: 23.22, color: '#84cc16', count: 0 },
            { name: 'Muy Alto', min: 23.22, max: Infinity, color: '#22c55e', count: 0 },
          ];
          
          videos.forEach(v => {
            const cat = categories.find(c => v.ir >= c.min && v.ir < c.max);
            if (cat) cat.count++;
          });
        } else if (evolutionMetric === 'avg_views' || evolutionMetric === 'median_views') {
          // Views
          categories = [
            { name: 'Muy Bajo', min: 0, max: 1746, color: '#ef4444', count: 0 },
            { name: 'Bajo', min: 1746, max: 5197, color: '#f97316', count: 0 },
            { name: 'Medio', min: 5197, max: 26760, color: '#eab308', count: 0 },
            { name: 'Alto', min: 26760, max: 1600000, color: '#84cc16', count: 0 },
            { name: 'Muy Alto', min: 1600000, max: Infinity, color: '#22c55e', count: 0 },
          ];
          
          videos.forEach(v => {
            const cat = categories.find(c => v.views >= c.min && v.views < c.max);
            if (cat) cat.count++;
          });
        } else {
          // Likes
          categories = [
            { name: 'Muy Bajo', min: 0, max: 58, color: '#ef4444', count: 0 },
            { name: 'Bajo', min: 58, max: 228, color: '#f97316', count: 0 },
            { name: 'Medio', min: 228, max: 2788, color: '#eab308', count: 0 },
            { name: 'Alto', min: 2788, max: 50000, color: '#84cc16', count: 0 },
            { name: 'Muy Alto', min: 50000, max: Infinity, color: '#22c55e', count: 0 },
          ];
          
          videos.forEach(v => {
            const cat = categories.find(c => v.likes >= c.min && v.likes < c.max);
            if (cat) cat.count++;
          });
        }
        
        return {
          month,
          'Muy Alto': categories[4].count,
          'Alto': categories[3].count,
          'Medio': categories[2].count,
          'Bajo': categories[1].count,
          'Muy Bajo': categories[0].count,
        };
      });
  }, [data, evolutionMetric, selectedYear]);

  // Datos para violin plot (distribución)
  // Función para calcular la categoría de impacto de un video
  const getImpactCategory = useCallback((video: Video, metric: typeof evolutionMetric, allVideosForCalculation: Video[]) => {
    let value: number;
    if (metric === 'avg_ir' || metric === 'median_ir') {
      value = video.ir;
    } else if (metric === 'avg_views' || metric === 'median_views') {
      value = video.views;
    } else {
      value = video.likes;
    }
    
    // Umbrales fijos basados en análisis de datos
    // 50K likes = 2.35% de videos = percentil 97.65
    if (metric === 'avg_ir' || metric === 'median_ir') {
      // Interaction Rate
      if (value < 3.16) return { name: 'Muy Bajo', color: '#ef4444' };
      if (value < 5.36) return { name: 'Bajo', color: '#f97316' };
      if (value < 11.09) return { name: 'Medio', color: '#eab308' };
      if (value < 23.22) return { name: 'Alto', color: '#84cc16' };
      return { name: 'Muy Alto', color: '#22c55e' };
    } else if (metric === 'avg_views' || metric === 'median_views') {
      // Views
      if (value < 1746) return { name: 'Muy Bajo', color: '#ef4444' };
      if (value < 5197) return { name: 'Bajo', color: '#f97316' };
      if (value < 26760) return { name: 'Medio', color: '#eab308' };
      if (value < 1600000) return { name: 'Alto', color: '#84cc16' };
      return { name: 'Muy Alto', color: '#22c55e' };
    } else {
      // Likes
      if (value < 58) return { name: 'Muy Bajo', color: '#ef4444' };
      if (value < 228) return { name: 'Bajo', color: '#f97316' };
      if (value < 2788) return { name: 'Medio', color: '#eab308' };
      if (value < 50000) return { name: 'Alto', color: '#84cc16' };
      return { name: 'Muy Alto', color: '#22c55e' };
    }
  }, []);

  const violinValues = useMemo(() => {
    let allVideos: Video[] = [];
    
    if (selectedMonth && data[selectedMonth]) {
      // Si hay un mes seleccionado, usar solo esos videos
      allVideos = data[selectedMonth].all_videos;
    } else {
      // Si no, usar todos los videos
      Object.values(data).forEach((month) => {
        allVideos.push(...month.all_videos);
      });
    }
    
    // Extraer valores según la métrica seleccionada
    let metricValues: number[];
    let maxValue: number;
    let metricName: string;
    let metricUnit: string;
    
    if (evolutionMetric === 'avg_ir' || evolutionMetric === 'median_ir') {
      metricValues = allVideos.map((v) => Math.min(v.ir, 25));
      maxValue = 25;
      metricName = 'IR';
      metricUnit = '%';
    } else if (evolutionMetric === 'avg_views' || evolutionMetric === 'median_views') {
      metricValues = allVideos.map((v) => v.views);
      maxValue = Math.max(...metricValues, 1);
      metricName = 'Views';
      metricUnit = '';
    } else { // avg_likes
      metricValues = allVideos.map((v) => v.likes);
      maxValue = Math.max(...metricValues, 1);
      metricName = 'Likes';
      metricUnit = '';
    }
    
    // Calcular mediana y promedio
    const sortedValues = [...metricValues].sort((a, b) => a - b);
    const median = sortedValues.length > 0 ? sortedValues[Math.floor(sortedValues.length / 2)] : 0;
    const average = metricValues.length > 0 ? metricValues.reduce((a, b) => a + b, 0) / metricValues.length : 0;
    
    // Crear bins para el histograma (forma de violin)
    const numBins = evolutionMetric === 'avg_ir' ? 26 : 50;
    const bins = new Array(numBins).fill(0);
    
    metricValues.forEach(value => {
      const binIndex = Math.min(Math.floor((value / maxValue) * (numBins - 1)), numBins - 1);
      bins[binIndex]++;
    });
    
    // Normalizar bins para el ancho del violin
    const maxBin = Math.max(...bins);
    const normalizedBins = bins.map(count => (count / maxBin) * 100);
    
    // Crear datos para scatter plot (puntos individuales)
    const scatterData = allVideos.map((v, idx) => {
      const value = metricValues[idx];
      const normalizedValue = (value / maxValue) * (numBins - 1);
      const binIndex = Math.min(Math.floor(normalizedValue), numBins - 1);
      const binWidth = normalizedBins[binIndex];
      // Distribuir puntos horizontalmente dentro del bin
      const jitter = (Math.random() - 0.5) * binWidth * 0.8;
      
      return {
        x: jitter,
        y: value,
        value: value,
        description: v.description,
        artist: v.artist,
      };
    });
    
    // Crear datos para la forma del violin (contorno)
    const violinShape = normalizedBins.flatMap((width, idx) => {
      const yValue = (idx / (numBins - 1)) * maxValue;
      return [
        { x: -width / 2, y: yValue },
        { x: width / 2, y: yValue }
      ];
    });
    
    return {
      scatterData,
      violinShape,
      median,
      average,
      maxValue,
      metricName,
      metricUnit
    };
  }, [data, selectedMonth, evolutionMetric]);

  // Todos los videos (filtrados por año y mes)
  const allVideos = useMemo(() => {
    const videos: Video[] = [];
    Object.entries(data)
      .filter(([monthKey]) => {
        // Filtrar por año
        if (selectedYear !== 'all' && !monthKey.startsWith(selectedYear)) return false;
        // Filtrar por mes si hay uno seleccionado
        if (selectedMonth && selectedMonth !== 'all' && monthKey !== selectedMonth) return false;
        return true;
      })
      .forEach(([_, monthData]) => {
        videos.push(...monthData.all_videos);
      });
    
    // Aplicar filtro de impacto
    let filteredVideos = videos;
    if (selectedImpactFilter !== 'all') {
      filteredVideos = videos.filter(video => {
        const category = getImpactCategory(video, evolutionMetric, videos);
        return category.name === selectedImpactFilter;
      });
    }
    
    // Ordenar
    filteredVideos.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    return filteredVideos;
  }, [data, selectedYear, selectedMonth, selectedImpactFilter, sortColumn, sortDirection, evolutionMetric, getImpactCategory]);

  // Videos del mes seleccionado
  const monthVideos = useMemo(() => {
    if (!selectedMonth || !data[selectedMonth]) return [];

    let videos = [...data[selectedMonth].all_videos];
    
    // Aplicar filtro de impacto
    if (selectedImpactFilter !== 'all') {
      videos = videos.filter(video => {
        const category = getImpactCategory(video, evolutionMetric, data[selectedMonth].all_videos);
        return category.name === selectedImpactFilter;
      });
    }
    
    videos.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    return videos;
  }, [data, selectedMonth, sortColumn, sortDirection, selectedImpactFilter, evolutionMetric, getImpactCategory]);

  // Análisis por artista
  const artistData = useMemo(() => {
    const result: Array<{
      artist: string;
      videos: number;
      avg_views: number;
      avg_likes: number;
      avg_ir: number;
      metric: number;
    }> = [];

    Object.entries(artistStatsData).forEach(([artistName, stats]) => {
      const platformStats = platform === 'tiktok' ? stats.tiktok : stats.instagram;
      if (!platformStats) return;

      // Filtrar por palabra en nombre de artista
      if (filterWord && artistName.toLowerCase().includes(filterWord.toLowerCase())) return;

      // Filtrar por mínimo de videos
      if (platformStats.total_videos < minVideos) return;

      // Si se seleccionó un año específico, filtrar videos por año
      if (artistYear !== 'all') {
        let videosInYear = 0;
        Object.values(data).forEach((month) => {
          month.all_videos.forEach((video) => {
            if (video.artist === artistName && video.date.startsWith(artistYear)) {
              videosInYear++;
            }
          });
        });
        if (videosInYear < minVideos) return;
      }

      let metric = platformStats.avg_views;
      if (artistMetric === 'median_views') {
        // Calcular mediana de views para este artista
        const artistVideos: number[] = [];
        Object.values(data).forEach((month) => {
          month.all_videos.forEach((video) => {
            if (video.artist === artistName) {
              if (artistYear === 'all' || video.date.startsWith(artistYear)) {
                artistVideos.push(video.views);
              }
            }
          });
        });
        if (artistVideos.length > 0) {
          artistVideos.sort((a, b) => a - b);
          const mid = Math.floor(artistVideos.length / 2);
          metric = artistVideos.length % 2 === 0 ? (artistVideos[mid - 1] + artistVideos[mid]) / 2 : artistVideos[mid];
        }
      } else if (artistMetric === 'avg_views') {
        metric = platformStats.avg_views;
      } else if (artistMetric === 'avg_likes') {
        metric = platformStats.avg_likes;
      } else if (artistMetric === 'median_ir') {
        // Calcular mediana de IR para este artista
        const artistIRs: number[] = [];
        Object.values(data).forEach((month) => {
          month.all_videos.forEach((video) => {
            if (video.artist === artistName) {
              if (artistYear === 'all' || video.date.startsWith(artistYear)) {
                artistIRs.push(video.ir);
              }
            }
          });
        });
        if (artistIRs.length > 0) {
          artistIRs.sort((a, b) => a - b);
          const mid = Math.floor(artistIRs.length / 2);
          metric = artistIRs.length % 2 === 0 ? (artistIRs[mid - 1] + artistIRs[mid]) / 2 : artistIRs[mid];
        }
      } else if (artistMetric === 'avg_ir') {
        metric = platformStats.avg_ir;
      }

      result.push({
        artist: artistName,
        videos: platformStats.total_videos,
        avg_views: platformStats.avg_views,
        avg_likes: platformStats.avg_likes,
        avg_ir: platformStats.avg_ir,
        metric,
      });
    });

    result.sort((a, b) => b.metric - a.metric);
    return result.slice(0, 30);
  }, [artistStatsData, platform, artistYear, artistMetric, minVideos, filterWord, data]);

  // Videos del artista seleccionado
  const artistVideos = useMemo(() => {
    if (!selectedArtist) return [];

    const videos: Video[] = [];
    Object.values(data).forEach((month) => {
      month.all_videos.forEach((video) => {
        if (video.artist === selectedArtist) {
          videos.push(video);
        }
      });
    });

    videos.sort((a, b) => {
      const aVal = a[artistSortColumn];
      const bVal = b[artistSortColumn];
      if (artistSortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return videos;
  }, [data, selectedArtist, artistSortColumn, artistSortDirection]);

  // Años disponibles
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    Object.keys(data).forEach((monthKey) => {
      const year = monthKey.split('-')[0];
      years.add(year);
    });
    return Array.from(years).sort();
  }, [data]);

  // Función para descargar CSV
  const downloadCSV = () => {
    const rows = [
      ['Mes', 'Total Posts', 'Mediana Views', 'Promedio Views', 'Promedio Likes', 'Total Shares', 'Total Comments', 'Total Collects', 'IR Promedio'],
    ];

    Object.entries(data)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([monthKey, month]) => {
        rows.push([
          monthKey,
          month.total_posts.toString(),
          month.median_views.toString(),
          month.avg_views.toString(),
          month.avg_likes.toString(),
          month.total_shares.toString(),
          month.total_comments.toString(),
          month.total_collects.toString(),
          month.avg_ir.toString(),
        ]);
      });

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolucion_mensual_${platform === 'tiktok' ? 'TikTok' : 'Instagram'}.csv`;
    a.click();
  };

  // Función para ordenar tabla
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleArtistSort = (column: SortColumn) => {
    if (artistSortColumn === column) {
      setArtistSortDirection(artistSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setArtistSortColumn(column);
      setArtistSortDirection('desc');
    }
  };

  const metricLabels = {
    median_views: 'Mediana de Views',
    avg_views: 'Promedio de Views',
    avg_likes: 'Promedio de Likes',
    median_ir: 'Interaction Rate Mediana',
    avg_ir: 'Interaction Rate Promedio',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f9fafb, #e5e7eb)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>
              Performance de cuenta oficial de Sony Music México en {platform === 'tiktok' ? 'TikTok' : 'Instagram'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPlatform('tiktok')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: platform === 'tiktok' ? '#3b82f6' : '#f3f4f6',
                color: platform === 'tiktok' ? 'white' : '#666',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              TikTok
            </button>
            <button
              onClick={() => setPlatform('instagram')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: platform === 'instagram' ? '#3b82f6' : '#f3f4f6',
                color: platform === 'instagram' ? 'white' : '#666',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              Instagram
            </button>
            <button
              onClick={downloadCSV}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'white',
                color: '#111',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Download size={16} />
              Descargar CSV
            </button>
          </div>
        </div>

        {/* Controles principales */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          {selectedMonth && (
            <button
              onClick={() => setSelectedMonth(null)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '2px solid #3b82f6',
                backgroundColor: 'white',
                color: '#3b82f6',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              ✕ Limpiar filtro ({selectedMonth})
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => setActiveTab('evolution')}
              style={{
                padding: '12px 0',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'evolution' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'evolution' ? '#3b82f6' : '#666',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Evolución Mensual
            </button>
            <button
              onClick={() => setActiveTab('artist')}
              style={{
                padding: '12px 0',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'artist' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'artist' ? '#3b82f6' : '#666',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Performance por Artista
            </button>
          </div>
        </div>

        {/* Contenido de tabs */}
        {activeTab === 'evolution' && (
          <>
            {/* Tarjetas de métricas */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <MetricCard label="Total Posts" value={totalMetrics.total_posts} icon={<Calendar size={16} />} borderColor="#3b82f6" />
              <MetricCard label="Views Prom." value={formatNumber(totalMetrics.avg_views)} icon={<Eye size={16} />} borderColor="#8b5cf6" />
              <MetricCard label="Likes Prom." value={formatNumber(totalMetrics.avg_likes)} icon={<Heart size={16} />} borderColor="#ec4899" />
              <MetricCard label="Int. Rate" value={`${totalMetrics.avg_ir.toFixed(2)}%`} icon={<TrendingUp size={16} />} borderColor="#10b981" />
              <MetricCard label="Shares" value={formatNumber(totalMetrics.total_shares)} icon={<Share2 size={16} />} borderColor="#f97316" />
              <MetricCard label="Comments" value={formatNumber(totalMetrics.total_comments)} icon={<MessageCircle size={16} />} borderColor="#06b6d4" />
              <MetricCard label="Collects" value={formatNumber(totalMetrics.total_collects)} icon={<Bookmark size={16} />} borderColor="#fbbf24" />
            </div>

          <div>
            {/* Gráficas */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Evolución mensual */}
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '4px' }}>Evolución Mensual</h3>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {selectedMonth ? `Mes seleccionado: ${selectedMonth} - Click en otra barra para cambiar o en "Limpiar filtro"` : 'Haz click en una barra para filtrar la tabla de videos'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowImpactView(!showImpactView)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: showImpactView ? '1px solid #e5e7eb' : '1px solid #3b82f6',
                        fontSize: '11px',
                        backgroundColor: showImpactView ? 'white' : '#3b82f6',
                        color: showImpactView ? '#666' : 'white',
                        cursor: 'pointer',
                        fontWeight: '600',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {showImpactView ? '← Ver Evolución' : 'Ver Distribución'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        fontSize: '12px',
                      }}
                    >
                      <option value="all">Todos los años</option>
                      {Object.keys(data).map(month => month.split('-')[0]).filter((v, i, a) => a.indexOf(v) === i).sort().reverse().map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select
                        value={evolutionMetric}
                        onChange={(e) => setEvolutionMetric(e.target.value as any)}
                        style={{
                          padding: '6px 32px 6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          fontSize: '12px',
                          appearance: 'none',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          paddingRight: '32px',
                        }}
                      >
                        <option value="median_views">Mediana de Views</option>
                        <option value="avg_views">Promedio de Views</option>
                        <option value="avg_likes">Promedio de Likes</option>
                        <option value="median_ir">Interaction Rate Mediana</option>
                        <option value="avg_ir">Interaction Rate Promedio</option>
                      </select>
                      <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        {evolutionMetric === 'median_views' && <BarChart3 size={14} color="#666" />}
                        {evolutionMetric === 'avg_views' && <Eye size={14} color="#666" />}
                        {evolutionMetric === 'avg_likes' && <Heart size={14} color="#666" />}
                        {evolutionMetric === 'median_ir' && <Target size={14} color="#666" />}
                        {evolutionMetric === 'avg_ir' && <Zap size={14} color="#666" />}
                      </div>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  {!showImpactView ? (
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" style={{ fontSize: '11px' }} />
                    <YAxis yAxisId="left" style={{ fontSize: '11px' }} />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      style={{ fontSize: '11px' }}
                      tickFormatter={(value) => {
                        if (evolutionMetric === 'avg_views' || evolutionMetric === 'avg_likes') {
                          return formatNumber(value);
                        }
                        return value.toFixed(1);
                      }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (typeof value === 'number') {
                          if (name === metricLabels[evolutionMetric]) {
                            if (evolutionMetric === 'avg_ir' || evolutionMetric === 'median_ir') {
                              return [`${value.toFixed(2)}%`, name];
                            }
                            return [formatNumber(value), name];
                          }
                          return [value, name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="posts" name="# Posts" onClick={(data) => setSelectedMonth(data.month)} style={{ cursor: 'pointer' }}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.month === selectedMonth ? '#10b981' : '#3b82f6'} />
                      ))}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="metric" stroke="#8b5cf6" name={metricLabels[evolutionMetric]} />
                  </ComposedChart>
                  ) : (
                  <BarChart data={impactStackedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" style={{ fontSize: '11px' }} />
                    <YAxis style={{ fontSize: '11px' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Muy Alto" stackId="a" fill="#22c55e" />
                    <Bar dataKey="Alto" stackId="a" fill="#84cc16" />
                    <Bar dataKey="Medio" stackId="a" fill="#eab308" />
                    <Bar dataKey="Bajo" stackId="a" fill="#f97316" />
                    <Bar dataKey="Muy Bajo" stackId="a" fill="#ef4444" />
                  </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Categorías de Impacto */}
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '4px' }}>Categorías de Impacto</h3>
                  <p style={{ fontSize: '12px', color: '#666' }}>{violinValues.scatterData.length} videos analizados</p>
                </div>
                {(() => {
                  // Definir rangos de impacto según la métrica
                  let categories: { name: string; min: number; max: number; color: string; count: number; percentage: number }[] = [];
                  
                  // Usar umbrales fijos basados en análisis de datos
                  if (evolutionMetric === 'avg_ir' || evolutionMetric === 'median_ir') {
                    categories = [
                      { name: 'Muy Bajo (<3.16%)', min: 0, max: 3.16, color: '#ef4444', count: 0, percentage: 0 },
                      { name: 'Bajo (3.16-5.36%)', min: 3.16, max: 5.36, color: '#f97316', count: 0, percentage: 0 },
                      { name: 'Medio (5.36-11.09%)', min: 5.36, max: 11.09, color: '#eab308', count: 0, percentage: 0 },
                      { name: 'Alto (11.09-23.22%)', min: 11.09, max: 23.22, color: '#84cc16', count: 0, percentage: 0 },
                      { name: 'Muy Alto (>23.22%)', min: 23.22, max: Infinity, color: '#22c55e', count: 0, percentage: 0 },
                    ];
                  } else if (evolutionMetric === 'avg_views' || evolutionMetric === 'median_views') {
                    // Views
                    categories = [
                      { name: 'Muy Bajo (<1.7K)', min: 0, max: 1746, color: '#ef4444', count: 0, percentage: 0 },
                      { name: 'Bajo (1.7K-5.2K)', min: 1746, max: 5197, color: '#f97316', count: 0, percentage: 0 },
                      { name: 'Medio (5.2K-26.8K)', min: 5197, max: 26760, color: '#eab308', count: 0, percentage: 0 },
                      { name: 'Alto (26.8K-1.6M)', min: 26760, max: 1600000, color: '#84cc16', count: 0, percentage: 0 },
                      { name: 'Muy Alto (>1.6M)', min: 1600000, max: Infinity, color: '#22c55e', count: 0, percentage: 0 },
                    ];
                  } else {
                    // Likes
                    categories = [
                      { name: 'Muy Bajo (<58)', min: 0, max: 58, color: '#ef4444', count: 0, percentage: 0 },
                      { name: 'Bajo (58-228)', min: 58, max: 228, color: '#f97316', count: 0, percentage: 0 },
                      { name: 'Medio (228-2.8K)', min: 228, max: 2788, color: '#eab308', count: 0, percentage: 0 },
                      { name: 'Alto (2.8K-50K)', min: 2788, max: 50000, color: '#84cc16', count: 0, percentage: 0 },
                      { name: 'Muy Alto (>50K)', min: 50000, max: Infinity, color: '#22c55e', count: 0, percentage: 0 },
                    ];
                  }
                  
                  // Contar videos en cada categoría
                  violinValues.scatterData.forEach(video => {
                    const cat = categories.find(c => video.value >= c.min && video.value < c.max);
                    if (cat) cat.count++;
                  });
                  
                  // Calcular porcentajes
                  const total = violinValues.scatterData.length;
                  categories.forEach(cat => {
                    cat.percentage = total > 0 ? (cat.count / total) * 100 : 0;
                  });
                  
                  // Invertir el orden para mostrar de Muy Alto a Muy Bajo
                  const categoriesReversed = [...categories].reverse();
                  
                  return (
                    <div>
                      {/* Gráfica de barras */}
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={categoriesReversed} layout="vertical" margin={{ left: 80, right: 20, top: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" style={{ fontSize: '11px' }} />
                          <YAxis type="category" dataKey="name" style={{ fontSize: '11px' }} width={70} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: '12px' }}>
                                    <p><strong>{data.name}</strong></p>
                                    <p>Videos: {data.count}</p>
                                    <p>Porcentaje: {data.percentage.toFixed(1)}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {categoriesReversed.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      
                      {/* Resumen de impacto */}
                      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                          <p style={{ fontSize: '11px', color: '#991b1b', fontWeight: 'bold', marginBottom: '4px' }}>Bajo Impacto</p>
                          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                            {categories.slice(0, 2).reduce((sum, cat) => sum + cat.count, 0)}
                          </p>
                          <p style={{ fontSize: '11px', color: '#991b1b' }}>
                            {categories.slice(0, 2).reduce((sum, cat) => sum + cat.percentage, 0).toFixed(1)}% del total
                          </p>
                        </div>
                        <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                          <p style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', marginBottom: '4px' }}>Alto Impacto (Muy Alto)</p>
                          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                            {categories[4].count}
                          </p>
                          <p style={{ fontSize: '11px', color: '#166534' }}>
                            {categories[4].percentage.toFixed(1)}% del total
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Tabla de todos los videos */}
            {(
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111' }}>
                      {selectedMonth && selectedMonth !== 'all' 
                        ? `Videos de ${(() => {
                          const [year, month] = selectedMonth.split('-');
                          const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                          return `${monthNames[parseInt(month) - 1]} ${year}`;
                        })()}` 
                        : 'Todos los Videos'
                      }
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        value={selectedImpactFilter}
                        onChange={(e) => setSelectedImpactFilter(e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          fontSize: '12px',
                        }}
                      >
                        <option value="all">Todos los impactos</option>
                        <option value="Muy Alto">Muy Alto</option>
                        <option value="Alto">Alto</option>
                        <option value="Medio">Medio</option>
                        <option value="Bajo">Bajo</option>
                        <option value="Muy Bajo">Muy Bajo</option>
                      </select>
                      {selectedMonth && selectedMonth !== 'all' && (
                        <button
                          onClick={() => setSelectedMonth(null)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            fontSize: '12px',
                            backgroundColor: 'white',
                            color: '#666',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Limpiar filtro de mes
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Mostrando {allVideos.length} videos
                    {selectedMonth && selectedMonth !== 'all' ? ` del mes ${selectedMonth}` : ''}
                    {selectedYear !== 'all' ? ` del año ${selectedYear}` : ''}
                    {selectedImpactFilter !== 'all' ? ` (filtrados por ${selectedImpactFilter})` : ''}
                  </p>
                </div>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', borderBottom: '2px solid #e5e7eb' }}>
                      <tr>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>#</th>
                        <th
                          style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleSort('date')}
                        >
                          Fecha {sortColumn === 'date' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Descripción</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Artista</th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleSort('views')}
                        >
                          Views {sortColumn === 'views' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleSort('likes')}
                        >
                          Likes {sortColumn === 'likes' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleSort('shares')}
                        >
                          Shares {sortColumn === 'shares' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleSort('comments')}
                        >
                          Comments {sortColumn === 'comments' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleSort('collects')}
                        >
                          Collects {sortColumn === 'collects' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleSort('ir')}
                        >
                          IR {sortColumn === 'ir' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Impacto</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allVideos.map((video, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '8px' }}>{idx + 1}</td>
                          <td style={{ padding: '8px' }}>{video.date}</td>
                          <td style={{ padding: '8px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {video.description || 'Sin descripción'}
                          </td>
                          <td style={{ padding: '8px' }}>{video.artist || 'Sin artista'}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(video.views)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(video.likes)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(video.shares)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(video.comments)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(video.collects)}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: video.ir > 10 ? '#10b981' : '#666', fontWeight: video.ir > 10 ? 'bold' : 'normal' }}>
                            {video.ir.toFixed(2)}%
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            {(() => {
                              const category = getImpactCategory(video, evolutionMetric, allVideos);
                              return (
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  backgroundColor: `${category.color}20`,
                                  color: category.color,
                                  border: `1px solid ${category.color}`
                                }}>
                                  {category.name}
                                </span>
                              );
                            })()}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                              Ver
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          </>
        )}

        {activeTab === 'artist' && (
          <div>
            {/* Filtros */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Año</label>
                  <select
                    value={artistYear}
                    onChange={(e) => setArtistYear(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  >
                    <option value="all">Todos los años</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Métrica</label>
                  <select
                    value={artistMetric}
                    onChange={(e) => setArtistMetric(e.target.value as ArtistMetric)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  >
                    <option value="median_views">Mediana de Views</option>
                    <option value="avg_views">Promedio de Views</option>
                    <option value="avg_likes">Promedio de Likes</option>
                    <option value="median_ir">Interaction Rate Mediana</option>
                    <option value="avg_ir">Interaction Rate Promedio</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Mínimo de videos: {minVideos}</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={minVideos}
                    onChange={(e) => setMinVideos(parseInt(e.target.value))}
                    style={{ width: '150px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Filtrar palabra</label>
                  <input
                    type="text"
                    placeholder="Agregar palabra a filtrar..."
                    value={filterWord}
                    onChange={(e) => setFilterWord(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px', width: '200px' }}
                  />
                </div>
              </div>
            </div>

            {/* Gráfica de performance por artista */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '4px' }}>Performance por Artista</h3>
                <p style={{ fontSize: '12px', color: '#666' }}>Top 30 artistas</p>
              </div>
              <ResponsiveContainer width="100%" height={900}>
                <BarChart data={artistData} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" style={{ fontSize: '11px' }} />
                  <YAxis type="category" dataKey="artist" style={{ fontSize: '11px' }} width={90} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: '12px' }}>
                            <p><strong>{data.artist}</strong></p>
                            <p>Videos: {data.videos}</p>
                            <p>Promedio Views: {formatNumber(data.avg_views)}</p>
                            <p>Promedio Likes: {formatNumber(data.avg_likes)}</p>
                            <p>IR Promedio: {data.avg_ir.toFixed(2)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="metric" onClick={(data) => setSelectedArtist(data.artist)} style={{ cursor: 'pointer' }}>
                    {artistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.artist === selectedArtist ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla de videos del artista */}
            {selectedArtist && (
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '4px' }}>Videos de {selectedArtist}</h3>
                  <p style={{ fontSize: '12px', color: '#666' }}>{artistVideos.length} videos</p>
                </div>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', borderBottom: '2px solid #e5e7eb' }}>
                      <tr>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>#</th>
                        <th
                          style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleArtistSort('date')}
                        >
                          Fecha {artistSortColumn === 'date' && (artistSortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', maxWidth: '300px' }}>Descripción</th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleArtistSort('views')}
                        >
                          <Eye size={12} style={{ display: 'inline', color: '#8b5cf6', marginRight: '4px' }} />
                          Views {artistSortColumn === 'views' && (artistSortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleArtistSort('likes')}
                        >
                          <Heart size={12} style={{ display: 'inline', color: '#ec4899', marginRight: '4px' }} />
                          Likes {artistSortColumn === 'likes' && (artistSortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleArtistSort('shares')}
                        >
                          <Share2 size={12} style={{ display: 'inline', color: '#f97316', marginRight: '4px' }} />
                          Shares {artistSortColumn === 'shares' && (artistSortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleArtistSort('comments')}
                        >
                          <MessageCircle size={12} style={{ display: 'inline', color: '#06b6d4', marginRight: '4px' }} />
                          Comments {artistSortColumn === 'comments' && (artistSortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleArtistSort('collects')}
                        >
                          <Bookmark size={12} style={{ display: 'inline', color: '#fbbf24', marginRight: '4px' }} />
                          Collects {artistSortColumn === 'collects' && (artistSortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th
                          style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleArtistSort('ir')}
                        >
                          IR {artistSortColumn === 'ir' && (artistSortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                        </th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artistVideos.map((video, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '8px' }}>{idx + 1}</td>
                          <td style={{ padding: '8px' }}>{video.date}</td>
                          <td style={{ padding: '8px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {video.description || 'Sin descripción'}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(video.views)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(video.likes)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(video.shares)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(video.comments)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber(video.collects)}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: video.ir > 10 ? '#10b981' : '#666', fontWeight: video.ir > 10 ? 'bold' : 'normal' }}>
                            {video.ir.toFixed(2)}%
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            {(() => {
                              const category = getImpactCategory(video, evolutionMetric, monthVideos);
                              return (
                                <span style={{ 
                                  backgroundColor: category.color + '20', 
                                  color: category.color, 
                                  padding: '4px 8px', 
                                  borderRadius: '4px', 
                                  fontSize: '11px', 
                                  fontWeight: 'bold',
                                  border: `1px solid ${category.color}`
                                }}>
                                  {category.name}
                                </span>
                              );
                            })()}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                              Ver
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
