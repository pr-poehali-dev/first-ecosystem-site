import json
import os
import hashlib
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Регистрация и авторизация пользователей
    Args: event с httpMethod, body
    Returns: HTTP response с токеном или ошибкой
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    if action == 'register':
        return register_user(body_data)
    elif action == 'login':
        return login_user(body_data)
    else:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid action'})
        }

def register_user(data: Dict[str, Any]) -> Dict[str, Any]:
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    
    if not email or not password or not username:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Email, password and username required'})
        }
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'User already exists'})
        }
    
    cur.execute(
        "INSERT INTO users (email, password_hash, username) VALUES (%s, %s, %s) RETURNING id",
        (email, password_hash, username)
    )
    user_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    
    token = jwt.encode(
        {'user_id': user_id, 'email': email, 'exp': datetime.utcnow() + timedelta(days=30)},
        os.environ['JWT_SECRET'],
        algorithm='HS256'
    )
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'token': token, 'username': username, 'email': email})
    }

def login_user(data: Dict[str, Any]) -> Dict[str, Any]:
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Email and password required'})
        }
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id, username, email FROM users WHERE email = %s AND password_hash = %s",
        (email, password_hash)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid credentials'})
        }
    
    user_id, username, user_email = user
    
    token = jwt.encode(
        {'user_id': user_id, 'email': user_email, 'exp': datetime.utcnow() + timedelta(days=30)},
        os.environ['JWT_SECRET'],
        algorithm='HS256'
    )
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'token': token, 'username': username, 'email': user_email})
    }
