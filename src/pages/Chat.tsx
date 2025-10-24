import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_type: string;
  content?: string;
  media_url?: string;
  created_at: string;
  sender_name: string;
  sender_avatar?: string;
}

const Chat = () => {
  const { friendId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const SOCIAL_URL = 'https://functions.poehali.dev/1cf48b55-dd92-484a-9d87-5d9d4b8bbf88';
  const UPLOAD_URL = 'https://functions.poehali.dev/6e36b8f2-cf01-48f6-b0b3-3b1e2d3f4e5f';

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      navigate('/sounds');
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    loadMessages(parsed.id);

    const interval = setInterval(() => loadMessages(parsed.id), 3000);
    return () => clearInterval(interval);
  }, [friendId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (userId: number) => {
    try {
      const response = await fetch(`${SOCIAL_URL}?action=messages&user_id=${userId}&friend_id=${friendId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  const sendMessage = async (type: string = 'text', content?: string, mediaUrl?: string) => {
    if (!content && !mediaUrl) return;
    
    setLoading(true);
    try {
      const response = await fetch(SOCIAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          sender_id: user.id,
          receiver_id: parseInt(friendId!),
          message_type: type,
          content,
          media_url: mediaUrl
        })
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages(user.id);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (response.ok && data.url) {
        const fileType = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('video/') ? 'video' : 
                        file.type.startsWith('audio/') ? 'voice' : 'file';
        await sendMessage(fileType, undefined, data.url);
        toast({ title: 'Успешно!', description: 'Файл отправлен' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить файл', variant: 'destructive' });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button onClick={() => navigate('/friends')} variant="ghost">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              К друзьям
            </Button>
            <div className="flex items-center gap-3">
              <img 
                src="https://v3b.fal.media/files/b/lion/v0M59GSTZ6WYWlnE5fPVA_output.png" 
                alt="FIRST Logo" 
                className="h-10"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 container mx-auto max-w-4xl px-6 py-6 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <Card className={`p-4 max-w-[70%] ${isOwn ? 'bg-primary text-primary-foreground' : ''}`}>
                  {msg.message_type === 'text' && <p>{msg.content}</p>}
                  {msg.message_type === 'image' && (
                    <img src={msg.media_url} alt="Image" className="max-w-full rounded" />
                  )}
                  {msg.message_type === 'video' && (
                    <video src={msg.media_url} controls className="max-w-full rounded" />
                  )}
                  {msg.message_type === 'voice' && (
                    <audio src={msg.media_url} controls className="w-full" />
                  )}
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </Card>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <Card className="p-4">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="Paperclip" size={20} />
            </Button>
            <Input
              placeholder="Напишите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage('text', newMessage)}
              disabled={loading}
            />
            <Button 
              onClick={() => sendMessage('text', newMessage)} 
              disabled={loading || !newMessage.trim()}
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
