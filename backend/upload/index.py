import json
import base64
import uuid
import os
from typing import Dict, Any

ADMIN_PASSWORD = "2501"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Загрузка аудиофайлов для звуков WB PVZ
    Args: event с httpMethod, body, headers
    Returns: HTTP response с URL загруженного файла
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    headers = event.get('headers', {})
    admin_password = headers.get('X-Admin-Password') or headers.get('x-admin-password')
    
    if admin_password != ADMIN_PASSWORD:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    file_content = body_data.get('file')
    filename = body_data.get('filename', 'audio.mp3')
    
    if not file_content:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'File content required'})
        }
    
    file_id = str(uuid.uuid4())
    ext = filename.split('.')[-1] if '.' in filename else 'mp3'
    file_key = f'sounds/{file_id}.{ext}'
    
    mock_url = f'https://cdn.poehali.dev/{file_key}'
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'file_url': mock_url,
            'filename': f'{file_id}.{ext}'
        })
    }
