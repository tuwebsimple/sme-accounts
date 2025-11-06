#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para procesar datasets de TikTok e Instagram
Clasifica videos por artista usando username @ más similar
"""

import pandas as pd
import json
import re
import math
from datetime import datetime
from difflib import SequenceMatcher

def safe_float(value, default=0.0):
    """Convierte a float y reemplaza NaN/inf con valor por defecto"""
    try:
        result = float(value)
        if math.isnan(result) or math.isinf(result):
            return default
        return result
    except (ValueError, TypeError):
        return default

def safe_int(value, default=0):
    """Convierte a int y maneja valores inválidos"""
    try:
        result = float(value)
        if math.isnan(result) or math.isinf(result):
            return default
        return int(result)
    except (ValueError, TypeError):
        return default

def similarity(a, b):
    """Calcula similitud entre dos strings (0-1)"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def load_artists():
    """Carga lista de artistas desde archivo"""
    try:
        with open('/home/ubuntu/upload/ArtistasSME.xlsx', 'r', encoding='utf-8') as f:
            artists = [line.strip() for line in f if line.strip()]
        print(f"Cargados {len(artists)} artistas")
        return artists
    except:
        # Si falla, intentar leer como texto plano
        with open('/home/ubuntu/upload/ArtistasSME.xlsx', 'rb') as f:
            content = f.read().decode('utf-8', errors='ignore')
            artists = [line.strip() for line in content.split('\n') if line.strip()]
        print(f"Cargados {len(artists)} artistas")
        return artists

def extract_usernames(text):
    """Extrae todos los usernames @ de un texto"""
    if pd.isna(text):
        return []
    matches = re.findall(r'@([a-zA-Z0-9_.]+)', str(text))
    return matches

def find_best_artist_match(usernames, artists, threshold=0.6):
    """
    Encuentra el artista más similar a los usernames encontrados
    Retorna (artista, similitud) o (None, 0) si no hay match
    """
    # Mapeo manual de correcciones (clave: subcadena a buscar, valor: artista correcto)
    manual_mapping = {
        'dope': 'Dove Cameron',
        'nath': 'Nathy Peluso',
        'calo': 'Carlos Rivera',
        'belo': 'BEÉLE',
        'beelo': 'BEÉLE',
        'pereza': 'Fuerza Regida',
        'miguel': 'Miguel Bueno',
        'mdo': 'Mon Laferte',
        'haim': 'Ha*Ash',
        'jain': 'Juan Luis',
        'neton': 'Neto Bernal'
    }
    
    if not usernames:
        return None, 0
    
    # Primero verificar mapeo manual (búsqueda exacta y por subcadena)
    for username in usernames:
        username_lower = username.lower()
        # Búsqueda exacta
        if username_lower in manual_mapping:
            return manual_mapping[username_lower], 1.0
        # Búsqueda por subcadena (si el username contiene la clave)
        for key, artist in manual_mapping.items():
            if key in username_lower:
                return artist, 1.0
    
    best_artist = None
    best_similarity = 0
    
    for username in usernames:
        for artist in artists:
            sim = similarity(username, artist)
            if sim > best_similarity and sim >= threshold:
                best_similarity = sim
                best_artist = artist
    
    return best_artist, best_similarity

def process_tiktok(artists):
    """Procesa dataset de TikTok"""
    print("\nProcesando dataset de TikTok...")
    
    # Leer datos
    df = pd.read_excel('/home/ubuntu/upload/SMETikTokAccount(1).xlsx')
    df['date'] = pd.to_datetime(df['date'])
    
    # Clasificar por artista
    classified_count = 0
    for idx, row in df.iterrows():
        usernames = extract_usernames(row['description'])
        artist, sim = find_best_artist_match(usernames, artists)
        
        if artist:
            df.at[idx, 'artist'] = artist
            df.at[idx, 'artist_similarity'] = sim
            classified_count += 1
        else:
            df.at[idx, 'artist'] = 'Sin artista'
            df.at[idx, 'artist_similarity'] = 0
    
    print(f"Videos clasificados: {classified_count}/{len(df)} ({classified_count/len(df)*100:.1f}%)")
    
    # Calcular IR
    df['ir'] = ((df['likes'] + df['comments']) / df['plays'] * 100).fillna(0)
    
    # Normalizar nombres de artistas antes de guardar
    df['artist'] = df['artist'].apply(normalize_artist_name)
    
    # Agrupar por mes
    df['month'] = df['date'].dt.to_period('M').astype(str)
    
    monthly_data = {}
    for month, group in df.groupby('month'):
        videos = []
        for _, row in group.iterrows():
            videos.append({
                'date': row['date'].strftime('%Y-%m-%d'),
                'description': str(row['description'])[:200],
                'artist': row['artist'],
                'views': safe_int(row['plays']),
                'likes': safe_int(row['likes']),
                'comments': safe_int(row['comments']),
                'shares': safe_int(row['shares']),
                'collects': safe_int(row['collects']),
                'ir': safe_float(row['ir']),
                'url': str(row['video_id'])
            })
        
        # Métricas del mes
        views = group['plays'].tolist()
        likes = group['likes'].tolist()
        ir_values = group['ir'].tolist()
        
        monthly_data[month] = {
            'total_posts': len(group),
            'median_views': safe_float(sorted(views)[len(views)//2]) if views else 0,
            'avg_views': safe_float(group['plays'].mean()),
            'avg_likes': safe_float(group['likes'].mean()),
            'avg_ir': safe_float(group['ir'].mean()),
            'total_shares': safe_int(group['shares'].sum()),
            'total_comments': safe_int(group['comments'].sum()),
            'total_collects': safe_int(group['collects'].sum()),
            'all_videos': videos
        }
    
    # Guardar
    with open('client/public/data_tiktok.json', 'w', encoding='utf-8') as f:
        json.dump(monthly_data, f, ensure_ascii=False, indent=2)
    
    print(f"Procesados {len(df)} videos de TikTok en {len(monthly_data)} meses")
    return df

def process_instagram(artists):
    """Procesa dataset de Instagram"""
    print("\nProcesando dataset de Instagram...")
    
    # Leer datos
    df = pd.read_csv('/home/ubuntu/upload/instagram_posts_by_accounts.csv')
    df['date'] = pd.to_datetime(df['date'])
    
    # Clasificar por artista
    classified_count = 0
    for idx, row in df.iterrows():
        usernames = extract_usernames(row['Descripción'])
        artist, sim = find_best_artist_match(usernames, artists)
        
        if artist:
            df.at[idx, 'artist'] = artist
            df.at[idx, 'artist_similarity'] = sim
            classified_count += 1
        else:
            df.at[idx, 'artist'] = 'Sin artista'
            df.at[idx, 'artist_similarity'] = 0
    
    print(f"Posts clasificados: {classified_count}/{len(df)} ({classified_count/len(df)*100:.1f}%)")
    
    # Calcular IR
    df['ir'] = ((df['Me gusta'] + df['Comentarios']) / df['Visualizaciones'] * 100).fillna(0)
    
    # Normalizar nombres de artistas antes de guardar
    df['artist'] = df['artist'].apply(normalize_artist_name)
    
    # Agrupar por mes
    df['month'] = df['date'].dt.to_period('M').astype(str)
    
    monthly_data = {}
    for month, group in df.groupby('month'):
        videos = []
        for _, row in group.iterrows():
            videos.append({
                'date': row['date'].strftime('%Y-%m-%d'),
                'description': str(row['Descripción'])[:200],
                'artist': row['artist'],
                'views': safe_int(row['Visualizaciones']),
                'likes': safe_int(row['Me gusta']),
                'comments': safe_int(row['Comentarios']),
                'shares': safe_int(row['Veces que se compartió']),
                'collects': safe_int(row['Veces que se guardó']),
                'ir': safe_float(row['ir']),
                'url': str(row['Enlace permanente'])
            })
        
        # Métricas del mes
        views = group['Visualizaciones'].tolist()
        likes = group['Me gusta'].tolist()
        
        monthly_data[month] = {
            'total_posts': len(group),
            'median_views': safe_float(sorted(views)[len(views)//2]) if views else 0,
            'avg_views': safe_float(group['Visualizaciones'].mean()),
            'avg_likes': safe_float(group['Me gusta'].mean()),
            'avg_ir': safe_float(group['ir'].mean()),
            'total_shares': safe_int(group['Veces que se compartió'].sum()) if 'Veces que se compartió' in group.columns else 0,
            'total_comments': safe_int(group['Comentarios'].sum()),
            'total_collects': safe_int(group['Veces que se guardó'].sum()) if 'Veces que se guardó' in group.columns else 0,
            'all_videos': videos
        }
    
    # Guardar
    with open('client/public/data_instagram.json', 'w', encoding='utf-8') as f:
        json.dump(monthly_data, f, ensure_ascii=False, indent=2)
    
    print(f"Procesados {len(df)} posts de Instagram en {len(monthly_data)} meses")
    return df

def normalize_artist_name(artist_name):
    """Normaliza nombres de artistas usando el mapeo manual"""
    # Mismo mapeo que en find_best_artist_match
    manual_mapping = {
        'dope': 'Dove Cameron',
        'nath': 'Nathy Peluso',
        'calo': 'Carlos Rivera',
        'belo': 'BEÉLE',
        'beelo': 'BEÉLE',
        'pereza': 'Fuerza Regida',
        'miguel': 'Miguel Bueno',
        'mdo': 'Mon Laferte',
        'haim': 'Ha*Ash',
        'jain': 'Juan Luis',
        'neton': 'Neto Bernal'
    }
    
    artist_lower = artist_name.lower()
    
    # Búsqueda exacta
    if artist_lower in manual_mapping:
        return manual_mapping[artist_lower]
    
    # Búsqueda por subcadena
    for key, correct_name in manual_mapping.items():
        if key in artist_lower:
            return correct_name
    
    return artist_name

def generate_artist_stats(df_tiktok, df_instagram):
    """Genera estadísticas por artista para ambas plataformas"""
    print("\nGenerando estadísticas por artista...")
    
    # Normalizar nombres de artistas en los DataFrames
    df_tiktok['artist'] = df_tiktok['artist'].apply(normalize_artist_name)
    df_instagram['artist'] = df_instagram['artist'].apply(normalize_artist_name)
    
    stats = {}
    
    # Procesar TikTok
    for artist in df_tiktok['artist'].unique():
        if artist == 'Sin artista':
            continue
        
        artist_data = df_tiktok[df_tiktok['artist'] == artist]
        stats[artist] = {
            'tiktok': {
                'total_videos': len(artist_data),
                'avg_views': safe_float(artist_data['plays'].mean()),
                'avg_likes': safe_float(artist_data['likes'].mean()),
                'avg_ir': safe_float(artist_data['ir'].mean()),
                'total_views': safe_int(artist_data['plays'].sum()),
                'total_likes': safe_int(artist_data['likes'].sum()),
            }
        }
    
    # Procesar Instagram
    for artist in df_instagram['artist'].unique():
        if artist == 'Sin artista':
            continue
        
        artist_data = df_instagram[df_instagram['artist'] == artist]
        if artist not in stats:
            stats[artist] = {}
        
        stats[artist]['instagram'] = {
            'total_videos': len(artist_data),
            'avg_views': safe_float(artist_data['Visualizaciones'].mean()),
            'avg_likes': safe_float(artist_data['Me gusta'].mean()),
            'avg_ir': safe_float(artist_data['ir'].mean()),
            'total_views': safe_int(artist_data['Visualizaciones'].sum()),
            'total_likes': safe_int(artist_data['Me gusta'].sum()),
        }
    
    # Guardar
    with open('client/public/artist_stats.json', 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    print(f"Estadísticas generadas para {len(stats)} artistas")

if __name__ == '__main__':
    print("=== Procesamiento de datos con clasificación por username ===\n")
    
    # Cargar artistas
    artists = load_artists()
    
    # Procesar datasets
    df_tiktok = process_tiktok(artists)
    df_instagram = process_instagram(artists)
    
    # Generar estadísticas por artista
    generate_artist_stats(df_tiktok, df_instagram)
    
    print("\n✓ Archivos generados exitosamente:")
    print("  - client/public/data_tiktok.json")
    print("  - client/public/data_instagram.json")
    print("  - client/public/artist_stats.json")
