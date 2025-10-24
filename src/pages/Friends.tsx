import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  workplace?: string;
  avatar_url?: string;
}

interface FriendRequest {
  id: number;
  username: string;
  email: string;
  bio?: string;
  workplace?: string;
  avatar_url?: string;
  request_id: number;
}

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const SOCIAL_URL = 'https://functions.poehali.dev/1cf48b55-dd92-484a-9d87-5d9d4b8bbf88';

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      navigate('/sounds');
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    loadFriends(parsed.id);
    loadRequests(parsed.id);
  }, [navigate]);

  const loadFriends = async (userId: number) => {
    try {
      const response = await fetch(`${SOCIAL_URL}?action=friends&user_id=${userId}`);
      const data = await response.json();
      setFriends(data.friends || []);
    } catch (error) {
      console.error('Failed to load friends', error);
    }
  };

  const loadRequests = async (userId: number) => {
    try {
      const response = await fetch(`${SOCIAL_URL}?action=requests&user_id=${userId}`);
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to load requests', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${SOCIAL_URL}?action=search&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить поиск',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: number) => {
    try {
      const response = await fetch(SOCIAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_request', user_id: user.id, friend_id: friendId })
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Успешно!', description: 'Заявка отправлена' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить заявку', variant: 'destructive' });
    }
  };

  const acceptRequest = async (requestId: number) => {
    try {
      const response = await fetch(SOCIAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept_request', request_id: requestId })
      });
      if (response.ok) {
        toast({ title: 'Успешно!', description: 'Заявка принята' });
        loadFriends(user.id);
        loadRequests(user.id);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось принять заявку', variant: 'destructive' });
    }
  };

  const rejectRequest = async (requestId: number) => {
    try {
      const response = await fetch(SOCIAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject_request', request_id: requestId })
      });
      if (response.ok) {
        toast({ title: 'Отклонено', description: 'Заявка отклонена' });
        loadRequests(user.id);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отклонить заявку', variant: 'destructive' });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src="https://v3b.fal.media/files/b/lion/v0M59GSTZ6WYWlnE5fPVA_output.png" 
                alt="FIRST Logo" 
                className="h-10"
              />
            </div>
            <Button onClick={() => navigate('/sounds')} variant="ghost">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад
            </Button>
          </div>
        </div>
      </nav>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Друзья</h1>
            <p className="text-lg text-muted-foreground">
              Найдите коллег и единомышленников
            </p>
          </div>

          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="friends">
                <Icon name="Users" size={18} className="mr-2" />
                Мои друзья ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="search">
                <Icon name="Search" size={18} className="mr-2" />
                Поиск
              </TabsTrigger>
              <TabsTrigger value="requests">
                <Icon name="UserPlus" size={18} className="mr-2" />
                Заявки ({requests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-4">
              {friends.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">У вас пока нет друзей</p>
                  <p className="text-sm text-muted-foreground mt-2">Используйте поиск, чтобы найти коллег</p>
                </Card>
              ) : (
                friends.map((friend) => (
                  <Card key={friend.id} className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                        {friend.avatar_url ? (
                          <img src={friend.avatar_url} alt={friend.username} className="w-full h-full object-cover" />
                        ) : (
                          <Icon name="User" size={32} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{friend.username}</h3>
                        {friend.workplace && (
                          <Badge variant="secondary" className="mt-1">
                            <Icon name="Briefcase" size={14} className="mr-1" />
                            {friend.workplace}
                          </Badge>
                        )}
                        {friend.bio && <p className="text-sm text-muted-foreground mt-2">{friend.bio}</p>}
                      </div>
                      <Button onClick={() => navigate(`/chat/${friend.id}`)}>
                        <Icon name="MessageCircle" size={18} className="mr-2" />
                        Написать
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Имя или email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Icon name="Search" size={18} />
                </Button>
              </div>

              {searchResults.map((result) => (
                <Card key={result.id} className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                      {result.avatar_url ? (
                        <img src={result.avatar_url} alt={result.username} className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="User" size={32} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{result.username}</h3>
                      <p className="text-sm text-muted-foreground">{result.email}</p>
                      {result.workplace && (
                        <Badge variant="secondary" className="mt-1">
                          <Icon name="Briefcase" size={14} className="mr-1" />
                          {result.workplace}
                        </Badge>
                      )}
                    </div>
                    {result.id !== user.id && (
                      <Button onClick={() => sendFriendRequest(result.id)}>
                        <Icon name="UserPlus" size={18} className="mr-2" />
                        Добавить
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              {requests.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icon name="UserPlus" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">Нет новых заявок</p>
                </Card>
              ) : (
                requests.map((request) => (
                  <Card key={request.request_id} className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                        {request.avatar_url ? (
                          <img src={request.avatar_url} alt={request.username} className="w-full h-full object-cover" />
                        ) : (
                          <Icon name="User" size={32} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{request.username}</h3>
                        {request.workplace && (
                          <Badge variant="secondary" className="mt-1">
                            <Icon name="Briefcase" size={14} className="mr-1" />
                            {request.workplace}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => acceptRequest(request.request_id)}>
                          <Icon name="Check" size={18} className="mr-2" />
                          Принять
                        </Button>
                        <Button variant="outline" onClick={() => rejectRequest(request.request_id)}>
                          <Icon name="X" size={18} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Friends;
