import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

interface Sound {
  id: number;
  title: string;
  description: string;
  file_url: string;
  category: string;
  downloads_count: number;
}

const Sounds = () => {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [playingSound, setPlayingSound] = useState<number | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const AUTH_URL = 'https://functions.poehali.dev/d10a7354-e22a-4a86-ac62-30159875cce8';
  const SOUNDS_URL = 'https://functions.poehali.dev/ccb5e2b4-c56a-4f01-a7b2-49c6c500422f';

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    
    fetchSounds();
  }, []);

  const fetchSounds = async () => {
    try {
      const response = await fetch(SOUNDS_URL);
      const data = await response.json();
      setSounds(data.sounds || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить звуки',
        variant: 'destructive'
      });
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('register-email') as string;
    const password = formData.get('register-password') as string;
    const username = formData.get('username') as string;

    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password, username })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify({ username: data.username, email: data.email }));
        setIsAuthenticated(true);
        setUser({ username: data.username, email: data.email });
        toast({
          title: 'Успешно!',
          description: `Добро пожаловать, ${data.username}!`
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось зарегистрироваться',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('login-email') as string;
    const password = formData.get('login-password') as string;

    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify({ username: data.username, email: data.email }));
        setIsAuthenticated(true);
        setUser({ username: data.username, email: data.email });
        toast({
          title: 'Успешно!',
          description: `С возвращением, ${data.username}!`
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверные данные',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setUser(null);
    toast({
      title: 'Выход выполнен',
      description: 'До встречи!'
    });
  };

  const togglePlayPause = (sound: Sound) => {
    if (playingSound === sound.id) {
      audioRef.current?.pause();
      setPlayingSound(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = sound.file_url;
        audioRef.current.volume = volume;
        audioRef.current.play();
        setPlayingSound(sound.id);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('ended', () => {
      setPlayingSound(null);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleDownload = async (sound: Sound) => {
    if (!isAuthenticated) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите или зарегистрируйтесь для скачивания',
        variant: 'destructive'
      });
      return;
    }

    try {
      await fetch(SOUNDS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sound_id: sound.id })
      });

      window.open(sound.file_url, '_blank');
      
      setSounds(sounds.map(s => 
        s.id === sound.id ? { ...s, downloads_count: s.downloads_count + 1 } : s
      ));

      toast({
        title: 'Скачивание начато',
        description: `${sound.title} скачивается...`
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скачать файл',
        variant: 'destructive'
      });
    }
  };

  const categories = ['Все', ...new Set(sounds.map(s => s.category))];
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const filteredSounds = selectedCategory === 'Все' 
    ? sounds 
    : sounds.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <nav className="glass border-b border-white/30 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://v3b.fal.media/files/b/lion/v0M59GSTZ6WYWlnE5fPVA_output.png" 
                alt="FIRST Logo" 
                className="h-12"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => window.location.href = '/'}>
                Главная
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/admin'}>
                <Icon name="Settings" size={16} className="mr-1" />
                Админка
              </Button>
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => window.location.href = '/profile'}>
                    <Icon name="User" size={16} className="mr-2" />
                    {user?.username}
                  </Button>
                  <Button variant="outline" onClick={handleLogout} size="sm">
                    Выйти
                  </Button>
                </div>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Войти / Регистрация</Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card">
                    <DialogHeader>
                      <DialogTitle>Авторизация</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="login">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Вход</TabsTrigger>
                        <TabsTrigger value="register">Регистрация</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div>
                            <Label htmlFor="login-email">Email</Label>
                            <Input id="login-email" name="login-email" type="email" required />
                          </div>
                          <div>
                            <Label htmlFor="login-password">Пароль</Label>
                            <Input id="login-password" name="login-password" type="password" required />
                          </div>
                          <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Загрузка...' : 'Войти'}
                          </Button>
                        </form>
                      </TabsContent>
                      <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4">
                          <div>
                            <Label htmlFor="username">Имя пользователя</Label>
                            <Input id="username" name="username" required />
                          </div>
                          <div>
                            <Label htmlFor="register-email">Email</Label>
                            <Input id="register-email" name="register-email" type="email" required />
                          </div>
                          <div>
                            <Label htmlFor="register-password">Пароль</Label>
                            <Input id="register-password" name="register-password" type="password" required />
                          </div>
                          <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Звуки для WB PVZ</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Кастомизируйте программу выдачи заказов Wildberries уникальными звуками
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="glass-card"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSounds.map((sound) => (
              <Card key={sound.id} className="p-6 glass-card glass-hover shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Icon name="Music" className="text-white" size={24} />
                  </div>
                  <span className="text-xs px-3 py-1 bg-muted rounded-full">{sound.category}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{sound.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {sound.description}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => togglePlayPause(sound)} 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                    >
                      <Icon name={playingSound === sound.id ? "Pause" : "Play"} size={16} className="mr-1" />
                      {playingSound === sound.id ? 'Пауза' : 'Прослушать'}
                    </Button>
                    <Button onClick={() => handleDownload(sound)} size="sm">
                      <Icon name="Download" size={16} className="mr-1" />
                      Скачать
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Download" size={14} />
                    <span>{sound.downloads_count} скачиваний</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredSounds.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Music" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Звуки не найдены</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Sounds;