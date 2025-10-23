import json
import os
from typing import Dict, Any
import psycopg2

ADMIN_PASSWORD = "2501"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Админ-панель для управления звуками WB PVZ
    Args: event с httpMethod, body, headers
    Returns: HTTP response с данными звуков или результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    admin_password = headers.get('X-Admin-Password') or headers.get('x-admin-password')
    
    if admin_password != ADMIN_PASSWORD:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    if method == 'GET':
        return get_all_sounds()
    elif method == 'POST':
        return add_sound(event)
    elif method == 'PUT':
        return update_sound(event)
    elif method == 'DELETE':
        return delete_sound(event)
    else:
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

def get_all_sounds() -> Dict[str, Any]:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id, title, description, file_url, category, downloads_count, created_at FROM wb_sounds ORDER BY created_at DESC"
    )
    
    sounds = []
    for row in cur.fetchall():
        sounds.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'file_url': row[3],
            'category': row[4],
            'downloads_count': row[5],
            'created_at': row[6].isoformat() if row[6] else None
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'sounds': sounds})
    }

def add_sound(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    title = body_data.get('title')
    description = body_data.get('description')
    file_url = body_data.get('file_url')
    category = body_data.get('category')
    
    if not title or not file_url or not category:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'title, file_url and category required'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO wb_sounds (title, description, file_url, category) VALUES (%s, %s, %s, %s) RETURNING id",
        (title, description, file_url, category)
    )
    sound_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'id': sound_id, 'success': True})
    }

def update_sound(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    sound_id = body_data.get('id')
    title = body_data.get('title')
    description = body_data.get('description')
    file_url = body_data.get('file_url')
    category = body_data.get('category')
    
    if not sound_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'id required'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE wb_sounds SET title = %s, description = %s, file_url = %s, category = %s WHERE id = %s",
        (title, description, file_url, category, sound_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True})
    }

def delete_sound(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    sound_id = body_data.get('id')
    
    if not sound_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'id required'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute("DELETE FROM wb_sounds WHERE id = %s", (sound_id,))
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True})
    }
