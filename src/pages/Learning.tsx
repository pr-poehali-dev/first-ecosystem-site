import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  cover_url: string;
  status: string;
}

const Learning = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCourses([
      {
        id: 1,
        title: 'Основы фотографии',
        category: 'photography',
        description: 'Научитесь создавать профессиональные фотографии с нуля',
        cover_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800',
        status: 'coming_soon'
      },
      {
        id: 2,
        title: 'Видеомонтаж для начинающих',
        category: 'video',
        description: 'Освойте видеомонтаж и создавайте крутые ролики',
        cover_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
        status: 'coming_soon'
      },
      {
        id: 3,
        title: 'Графический дизайн',
        category: 'design',
        description: 'Создавайте потрясающие дизайны для соцсетей и брендов',
        cover_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        status: 'coming_soon'
      }
    ]);
  }, []);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      photography: 'Фотография',
      video: 'Видео',
      design: 'Дизайн'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      photography: 'bg-blue-500',
      video: 'bg-purple-500',
      design: 'bg-pink-500'
    };
    return colors[category] || 'bg-gray-500';
  };

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
            <div className="flex gap-3">
              <Button onClick={() => navigate('/sounds')} variant="ghost">
                <Icon name="Music" size={18} className="mr-2" />
                Звуки
              </Button>
              <Button onClick={() => navigate('/profile')} variant="ghost">
                <Icon name="User" size={18} className="mr-2" />
                Профиль
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4 px-4 py-2 text-base bg-gradient-to-r from-primary to-secondary">
              <Icon name="GraduationCap" size={18} className="mr-2" />
              Обучающая платформа
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">FIRST-21</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Бесплатные курсы по фотографии, видео и дизайну от профессионалов Wildberries
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {courses.map((course) => (
              <Card 
                key={course.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.cover_url} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={`${getCategoryColor(course.category)} text-white`}>
                      {getCategoryLabel(course.category)}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-yellow-500 text-black">
                      <Icon name="Clock" size={14} className="mr-1" />
                      Скоро
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-muted-foreground mb-4">{course.description}</p>
                  <Button className="w-full" disabled>
                    <Icon name="Lock" size={18} className="mr-2" />
                    В разработке
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 glass-card text-center">
            <div className="max-w-2xl mx-auto">
              <Icon name="Rocket" size={48} className="mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Мы работаем над запуском!</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Наша команда активно разрабатывает образовательную платформу FIRST-21. 
                Совсем скоро вы сможете начать бесплатное обучение у лучших специалистов индустрии.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                  <span>Видеоуроки</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                  <span>Практические задания</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                  <span>Сертификаты</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                  <span>Обратная связь</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Learning;
