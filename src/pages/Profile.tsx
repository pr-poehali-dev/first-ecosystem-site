import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState<{ username: string; email: string; avatar?: string; bio?: string; workplace?: string; fmonet_balance?: number; id?: number } | null>(null);
  const [bio, setBio] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const UPLOAD_URL = 'https://functions.poehali.dev/6e36b8f2-cf01-48f6-b0b3-3b1e2d3f4e5f';

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      navigate('/sounds');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setBio(parsedUser.bio || '');
    setWorkplace(parsedUser.workplace || '');
  }, [navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Можно загружать только изображения',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.url) {
        const updatedUser = { ...user!, avatar: data.url };
        setUser(updatedUser);
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        toast({
          title: 'Успешно!',
          description: 'Аватарка обновлена'
        });
      } else {
        throw new Error(data.error || 'Ошибка загрузки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить изображение',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    navigate('/sounds');
    toast({
      title: 'Выход выполнен',
      description: 'До встречи!'
    });
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
              Назад к звукам
            </Button>
          </div>
        </div>
      </nav>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Профиль</h1>
            <p className="text-lg text-muted-foreground">
              Управляйте своим профилем
            </p>
          </div>

          <Card className="p-8 glass-card shadow-lg">
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="User" size={64} className="text-white" />
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                >
                  <Icon name="Camera" size={32} className="text-white" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              <div className="w-full space-y-4">
                <div>
                  <Label>Имя пользователя</Label>
                  <Input value={user.username} disabled className="mt-2" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user.email} disabled className="mt-2" />
                </div>
                <div>
                  <Label>О себе</Label>
                  <Textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Расскажите о себе..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>
                <div>
                  <Label>Где работаете</Label>
                  <Input 
                    value={workplace} 
                    onChange={(e) => setWorkplace(e.target.value)}
                    placeholder="Wildberries, OZON..."
                    className="mt-2"
                  />
                </div>
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Баланс FMONET</span>
                    <span className="text-2xl font-bold text-primary">{user.fmonet_balance || 100}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={async () => {
                  setSaving(true);
                  const updatedUser = { ...user, bio, workplace };
                  localStorage.setItem('user_data', JSON.stringify(updatedUser));
                  setUser(updatedUser);
                  toast({ title: 'Сохранено!', description: 'Профиль обновлён' });
                  setSaving(false);
                }}
                className="w-full"
                disabled={saving}
              >
                <Icon name="Save" size={18} className="mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>

              <Button 
                onClick={handleLogout} 
                variant="destructive" 
                className="w-full mt-4"
              >
                <Icon name="LogOut" size={18} className="mr-2" />
                Выйти из аккаунта
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Profile;