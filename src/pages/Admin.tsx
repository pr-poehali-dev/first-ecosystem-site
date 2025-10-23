import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Sound {
  id: number;
  title: string;
  description: string;
  file_url: string;
  category: string;
  downloads_count: number;
  created_at?: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSound, setEditingSound] = useState<Sound | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const ADMIN_URL = 'https://functions.poehali.dev/4d17a761-5d43-44ce-b352-abea791cfd9d';

  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password');
    if (savedPassword === '2501') {
      setIsAuthenticated(true);
      fetchSounds(savedPassword);
    }
  }, []);

  const handleLogin = () => {
    if (password === '2501') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_password', password);
      fetchSounds(password);
      toast({
        title: 'Вход выполнен',
        description: 'Добро пожаловать в админ-панель'
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive'
      });
    }
  };

  const fetchSounds = async (adminPassword: string) => {
    setLoading(true);
    try {
      const response = await fetch(ADMIN_URL, {
        headers: {
          'X-Admin-Password': adminPassword
        }
      });
      const data = await response.json();
      setSounds(data.sounds || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить звуки',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSound = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const newSound = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      file_url: formData.get('file_url') as string,
      category: formData.get('category') as string
    };

    try {
      const response = await fetch(ADMIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': localStorage.getItem('admin_password') || ''
        },
        body: JSON.stringify(newSound)
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Звук добавлен'
        });
        setIsAddDialogOpen(false);
        fetchSounds(localStorage.getItem('admin_password') || '');
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось добавить звук',
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

  const handleUpdateSound = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSound) return;
    
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const updatedSound = {
      id: editingSound.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      file_url: formData.get('file_url') as string,
      category: formData.get('category') as string
    };

    try {
      const response = await fetch(ADMIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': localStorage.getItem('admin_password') || ''
        },
        body: JSON.stringify(updatedSound)
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Звук обновлён'
        });
        setEditingSound(null);
        fetchSounds(localStorage.getItem('admin_password') || '');
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось обновить звук',
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

  const handleDeleteSound = async (id: number) => {
    if (!confirm('Удалить этот звук?')) return;
    
    setLoading(true);

    try {
      const response = await fetch(ADMIN_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': localStorage.getItem('admin_password') || ''
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Звук удалён'
        });
        fetchSounds(localStorage.getItem('admin_password') || '');
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить звук',
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
    localStorage.removeItem('admin_password');
    setIsAuthenticated(false);
    setPassword('');
    toast({
      title: 'Выход выполнен',
      description: 'До встречи!'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <Card className="p-8 w-full max-w-md glass-card shadow-xl">
          <div className="text-center mb-6">
            <Icon name="Lock" size={48} className="mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Админ-панель</h1>
            <p className="text-muted-foreground">Введите пароль для доступа</p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Войти
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <nav className="glass border-b border-white/30 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Settings" size={32} className="text-primary" />
              <h1 className="text-xl font-bold">Админ-панель</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => window.location.href = '/sounds'}>
                Перейти к звукам
              </Button>
              <Button variant="outline" onClick={handleLogout} size="sm">
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Управление звуками</h2>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить звук
            </Button>
          </div>

          {loading && sounds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sounds.map((sound) => (
                <Card key={sound.id} className="p-6 glass-card shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="Music" className="text-primary" size={24} />
                        <h3 className="text-xl font-semibold">{sound.title}</h3>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full">{sound.category}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{sound.description}</p>
                      <a href={sound.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all">
                        {sound.file_url}
                      </a>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Download" size={14} />
                          {sound.downloads_count} скачиваний
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingSound(sound)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteSound(sound.id)}>
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Добавить новый звук</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSound} className="space-y-4">
            <div>
              <Label htmlFor="add-title">Название</Label>
              <Input id="add-title" name="title" required />
            </div>
            <div>
              <Label htmlFor="add-description">Описание</Label>
              <Textarea id="add-description" name="description" />
            </div>
            <div>
              <Label htmlFor="add-file-url">URL файла</Label>
              <Input id="add-file-url" name="file_url" type="url" required />
            </div>
            <div>
              <Label htmlFor="add-category">Категория</Label>
              <Input id="add-category" name="category" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Добавление...' : 'Добавить'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingSound} onOpenChange={() => setEditingSound(null)}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Редактировать звук</DialogTitle>
          </DialogHeader>
          {editingSound && (
            <form onSubmit={handleUpdateSound} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Название</Label>
                <Input id="edit-title" name="title" defaultValue={editingSound.title} required />
              </div>
              <div>
                <Label htmlFor="edit-description">Описание</Label>
                <Textarea id="edit-description" name="description" defaultValue={editingSound.description} />
              </div>
              <div>
                <Label htmlFor="edit-file-url">URL файла</Label>
                <Input id="edit-file-url" name="file_url" type="url" defaultValue={editingSound.file_url} required />
              </div>
              <div>
                <Label htmlFor="edit-category">Категория</Label>
                <Input id="edit-category" name="category" defaultValue={editingSound.category} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
