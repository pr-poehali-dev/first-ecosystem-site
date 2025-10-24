import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Единый API для друзей и сообщений - поиск, заявки, чаты
    Args: event - dict с httpMethod, body, queryStringParameters
          context - object с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            action = params.get('action', 'search')
            user_id = params.get('user_id')
            
            if action == 'search':
                search_query = params.get('q', '')
                cursor.execute(
                    "SELECT id, username, email, bio, workplace, avatar_url FROM users WHERE username ILIKE %s OR email ILIKE %s LIMIT 20",
                    (f'%{search_query}%', f'%{search_query}%')
                )
                users = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'users': [dict(u) for u in users]})
                }
            
            elif action == 'friends':
                cursor.execute(
                    """SELECT u.id, u.username, u.email, u.bio, u.workplace, u.avatar_url
                       FROM friendships f
                       JOIN users u ON (f.friend_id = u.id)
                       WHERE f.user_id = %s AND f.status = 'accepted'""",
                    (user_id,)
                )
                friends = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'friends': [dict(f) for f in friends]})
                }
            
            elif action == 'requests':
                cursor.execute(
                    """SELECT u.id, u.username, u.email, u.bio, u.workplace, u.avatar_url, f.id as request_id, f.created_at
                       FROM friendships f
                       JOIN users u ON (f.user_id = u.id)
                       WHERE f.friend_id = %s AND f.status = 'pending'""",
                    (user_id,)
                )
                requests = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'requests': [dict(r) for r in requests]}, default=str)
                }
            
            elif action == 'messages':
                friend_id = params.get('friend_id')
                cursor.execute(
                    """SELECT m.*, 
                       u1.username as sender_name, u1.avatar_url as sender_avatar,
                       u2.username as receiver_name, u2.avatar_url as receiver_avatar
                       FROM messages m
                       JOIN users u1 ON m.sender_id = u1.id
                       JOIN users u2 ON m.receiver_id = u2.id
                       WHERE (m.sender_id = %s AND m.receiver_id = %s) 
                          OR (m.sender_id = %s AND m.receiver_id = %s)
                       ORDER BY m.created_at ASC
                       LIMIT 100""",
                    (user_id, friend_id, friend_id, user_id)
                )
                messages = cursor.fetchall()
                
                cursor.execute(
                    "UPDATE messages SET is_read = true WHERE receiver_id = %s AND sender_id = %s",
                    (user_id, friend_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'messages': [dict(m) for m in messages]}, default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'send_request':
                user_id = body_data.get('user_id')
                friend_id = body_data.get('friend_id')
                cursor.execute(
                    "INSERT INTO friendships (user_id, friend_id, status) VALUES (%s, %s, 'pending') ON CONFLICT DO NOTHING",
                    (user_id, friend_id)
                )
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': 'Заявка отправлена'})
                }
            
            elif action == 'accept_request':
                request_id = body_data.get('request_id')
                cursor.execute("UPDATE friendships SET status = 'accepted' WHERE id = %s", (request_id,))
                cursor.execute("SELECT user_id, friend_id FROM friendships WHERE id = %s", (request_id,))
                friendship = cursor.fetchone()
                if friendship:
                    cursor.execute(
                        "INSERT INTO friendships (user_id, friend_id, status) VALUES (%s, %s, 'accepted') ON CONFLICT DO NOTHING",
                        (friendship['friend_id'], friendship['user_id'])
                    )
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': 'Заявка принята'})
                }
            
            elif action == 'reject_request':
                request_id = body_data.get('request_id')
                cursor.execute("UPDATE friendships SET status = 'rejected' WHERE id = %s", (request_id,))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': 'Заявка отклонена'})
                }
            
            elif action == 'send_message':
                sender_id = body_data.get('sender_id')
                receiver_id = body_data.get('receiver_id')
                message_type = body_data.get('message_type', 'text')
                content = body_data.get('content')
                media_url = body_data.get('media_url')
                
                cursor.execute(
                    """INSERT INTO messages (sender_id, receiver_id, message_type, content, media_url)
                       VALUES (%s, %s, %s, %s, %s) RETURNING id, created_at""",
                    (sender_id, receiver_id, message_type, content, media_url)
                )
                new_message = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'message_id': new_message['id'],
                        'created_at': str(new_message['created_at'])
                    })
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
