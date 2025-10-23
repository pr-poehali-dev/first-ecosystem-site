import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление звуками для WB PVZ (получение списка, увеличение счетчика скачиваний)
    Args: event с httpMethod, queryStringParameters
    Returns: HTTP response со списком звуков
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        return get_sounds(event)
    elif method == 'POST':
        return increment_download(event)
    else:
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

def get_sounds(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    category = params.get('category')
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    if category:
        cur.execute(
            "SELECT id, title, description, file_url, category, downloads_count FROM wb_sounds WHERE category = %s ORDER BY created_at DESC",
            (category,)
        )
    else:
        cur.execute(
            "SELECT id, title, description, file_url, category, downloads_count FROM wb_sounds ORDER BY created_at DESC"
        )
    
    sounds = []
    for row in cur.fetchall():
        sounds.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'file_url': row[3],
            'category': row[4],
            'downloads_count': row[5]
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'sounds': sounds})
    }

def increment_download(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    sound_id = body_data.get('sound_id')
    
    if not sound_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'sound_id required'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE wb_sounds SET downloads_count = downloads_count + 1 WHERE id = %s",
        (sound_id,)
    )
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True})
    }
