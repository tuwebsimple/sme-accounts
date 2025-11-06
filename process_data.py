#!/usr/bin/env python3
"""
Script para procesar datasets de TikTok e Instagram y generar archivos JSON
para el dashboard de analytics de Sony Music México.
"""

import csv
import json
from datetime import datetime
from difflib import SequenceMatcher
from collections import defaultdict
import statistics

def load_artists(filepath):
    """Carga la lista de artistas desde el archivo de texto."""
    artists = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and line != '"main_artist"':
                # Remover comillas si existen
                artist = line.strip('"')
                if artist:
                    artists.append(artist)
    return artists

def normalize_text(text):
    """Normaliza texto removiendo espacios y caracteres especiales."""
    if not text:
        return ""
    return ''.join(c.lower() for c in text if c.isalnum())

def find_artist(description, artists, threshold=0.75):
    """
    Encuentra el artista en la descripción usando similitud de strings.
    Retorna el nombre del artista o "Sin artista" si no hay coincidencia.
    """
    if not description:
        return "Sin artista"
    
    description_lower = description.lower()
    description_normalized = normalize_text(description)
    
    # Buscar @mentions primero
    import re
    mentions = re.findall(r'@(\w+)', description)
    
    best_match = None
    best_score = 0
    
    for artist in artists:
        artist_lower = artist.lower()
        artist_normalized = normalize_text(artist)
        
        # Búsqueda exacta en @mentions (sin el @)
        for mention in mentions:
            mention_lower = mention.lower()
            # Comparación exacta
            if mention_lower == artist_lower:
                return artist
            # Comparación parcial (el mention contiene el artista o viceversa)
            if artist_normalized in normalize_text(mention) or normalize_text(mention) in artist_normalized:
                if len(artist_normalized) > 3:  # Evitar coincidencias muy cortas
                    return artist
        
        # Búsqueda exacta en descripción (nombre completo)
        if artist_lower in description_lower:
            # Verificar que sea una palabra completa, no parte de otra palabra
            pattern = r'\b' + re.escape(artist_lower) + r'\b'
            if re.search(pattern, description_lower):
                return artist
        
        # Búsqueda por palabras del nombre del artista
        artist_words = artist_lower.split()
        if len(artist_words) > 1:
            # Si el artista tiene múltiples palabras, buscar cada una
            words_found = sum(1 for word in artist_words if len(word) > 2 and word in description_lower)
            if words_found >= len(artist_words) * 0.7:  # 70% de las palabras encontradas
                return artist
        
        # Similitud de strings con SequenceMatcher para cada @mention
        for mention in mentions:
            similarity = SequenceMatcher(None, artist_normalized, normalize_text(mention)).ratio()
            if similarity > best_score:
                best_score = similarity
                best_match = artist
        
        # También buscar el artista como substring normalizado
        if len(artist_normalized) > 4 and artist_normalized in description_normalized:
            similarity = 0.85
            if similarity > best_score:
                best_score = similarity
                best_match = artist
    
    if best_score >= threshold:
        return best_match
    
    return "Sin artista"

def calculate_ir(views, likes, shares, comments, collects):
    """Calcula el Interaction Rate."""
    if views == 0:
        return 0.0
    return ((likes + shares + comments + collects) / views) * 100

def process_tiktok(csv_path, artists):
    """Procesa el dataset de TikTok y retorna datos agrupados por mes."""
    monthly_data = defaultdict(lambda: {
        'videos': [],
        'year_month': ''
    })
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Parsear fecha
            publish_date = datetime.strptime(row['publish_date'], '%Y-%m-%d %H:%M:%S')
            year_month = publish_date.strftime('%Y-%m')
            
            # Extraer métricas
            views = int(row['views'])
            likes = int(row['likes'])
            comments = int(row['comments'])
            shares = int(row['shares'])
            collects = 0  # TikTok no tiene collects en el dataset
            
            ir = calculate_ir(views, likes, shares, comments, collects)
            
            video = {
                'date': publish_date.strftime('%Y-%m-%d'),
                'description': '',  # TikTok no tiene descripción en el dataset
                'artist': 'Sin artista',  # Sin descripción, no se puede extraer artista
                'url': row['video_url'],
                'views': views,
                'likes': likes,
                'shares': shares,
                'comments': comments,
                'collects': collects,
                'ir': round(ir, 2)
            }
            
            monthly_data[year_month]['videos'].append(video)
            monthly_data[year_month]['year_month'] = year_month
    
    # Calcular métricas por mes
    result = {}
    for year_month, data in monthly_data.items():
        videos = data['videos']
        
        views_list = [v['views'] for v in videos]
        likes_list = [v['likes'] for v in videos]
        ir_list = [v['ir'] for v in videos]
        
        result[year_month] = {
            'year_month': year_month,
            'median_views': round(statistics.median(views_list), 2) if views_list else 0,
            'avg_views': round(statistics.mean(views_list), 2) if views_list else 0,
            'avg_likes': round(statistics.mean(likes_list), 2) if likes_list else 0,
            'total_shares': sum(v['shares'] for v in videos),
            'total_comments': sum(v['comments'] for v in videos),
            'total_collects': sum(v['collects'] for v in videos),
            'avg_ir': round(statistics.mean(ir_list), 2) if ir_list else 0,
            'total_posts': len(videos),
            'all_videos': videos
        }
    
    return result

def process_instagram(csv_path, artists):
    """Procesa el dataset de Instagram y retorna datos agrupados por mes."""
    monthly_data = defaultdict(lambda: {
        'videos': [],
        'year_month': ''
    })
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Parsear fecha
            date_str = row['date']
            if not date_str:
                continue
            
            publish_date = datetime.strptime(date_str, '%Y-%m-%d')
            year_month = publish_date.strftime('%Y-%m')
            
            # Extraer descripción
            description = row.get('Descripción', '') or row.get('Description', '')
            
            # Encontrar artista
            artist = find_artist(description, artists)
            
            # Extraer métricas
            try:
                views = int(float(row.get('Visualizaciones', 0) or 0))
            except:
                views = int(float(row.get('Alcance', 0) or 0))
            
            likes = int(float(row.get('Me gusta', 0) or 0))
            comments = int(float(row.get('Comentarios', 0) or 0))
            shares = int(float(row.get('Veces que se compartió', 0) or 0))
            collects = int(float(row.get('Veces que se guardó', 0) or 0))
            
            ir = calculate_ir(views, likes, shares, comments, collects)
            
            video = {
                'date': publish_date.strftime('%Y-%m-%d'),
                'description': description[:100] if description else '',
                'artist': artist,
                'url': row.get('Enlace permanente', ''),
                'views': views,
                'likes': likes,
                'shares': shares,
                'comments': comments,
                'collects': collects,
                'ir': round(ir, 2)
            }
            
            monthly_data[year_month]['videos'].append(video)
            monthly_data[year_month]['year_month'] = year_month
    
    # Calcular métricas por mes
    result = {}
    for year_month, data in monthly_data.items():
        videos = data['videos']
        
        views_list = [v['views'] for v in videos]
        likes_list = [v['likes'] for v in videos]
        ir_list = [v['ir'] for v in videos]
        
        result[year_month] = {
            'year_month': year_month,
            'median_views': round(statistics.median(views_list), 2) if views_list else 0,
            'avg_views': round(statistics.mean(views_list), 2) if views_list else 0,
            'avg_likes': round(statistics.mean(likes_list), 2) if likes_list else 0,
            'total_shares': sum(v['shares'] for v in videos),
            'total_comments': sum(v['comments'] for v in videos),
            'total_collects': sum(v['collects'] for v in videos),
            'avg_ir': round(statistics.mean(ir_list), 2) if ir_list else 0,
            'total_posts': len(videos),
            'all_videos': videos
        }
    
    return result

def main():
    """Función principal."""
    print("Cargando lista de artistas...")
    artists = load_artists('/home/ubuntu/upload/ArtistasSME.xlsx')
    print(f"Cargados {len(artists)} artistas")
    
    print("\nProcesando dataset de TikTok...")
    tiktok_data = process_tiktok('/home/ubuntu/upload/tiktok_full_dataset.csv', artists)
    print(f"Procesados {sum(d['total_posts'] for d in tiktok_data.values())} videos de TikTok")
    
    print("\nProcesando dataset de Instagram...")
    instagram_data = process_instagram('/home/ubuntu/upload/instagram_posts_by_accounts.csv', artists)
    print(f"Procesados {sum(d['total_posts'] for d in instagram_data.values())} posts de Instagram")
    
    # Guardar archivos JSON
    print("\nGuardando archivos JSON...")
    with open('/home/ubuntu/tiktok-dashboard/client/public/data_tiktok.json', 'w', encoding='utf-8') as f:
        json.dump(tiktok_data, f, ensure_ascii=False, indent=2)
    
    with open('/home/ubuntu/tiktok-dashboard/client/public/data_instagram.json', 'w', encoding='utf-8') as f:
        json.dump(instagram_data, f, ensure_ascii=False, indent=2)
    
    print("\n✓ Archivos generados exitosamente:")
    print("  - client/public/data_tiktok.json")
    print("  - client/public/data_instagram.json")
    
    # Mostrar estadísticas
    print("\n=== Estadísticas ===")
    print(f"TikTok: {len(tiktok_data)} meses, {sum(d['total_posts'] for d in tiktok_data.values())} videos")
    print(f"Instagram: {len(instagram_data)} meses, {sum(d['total_posts'] for d in instagram_data.values())} posts")

if __name__ == '__main__':
    main()
