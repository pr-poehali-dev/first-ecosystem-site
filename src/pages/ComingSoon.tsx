import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-2xl animate-fade-in">
        <div className="mb-8">
          <Icon name="Clock" size={80} className="mx-auto text-primary mb-6" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Совсем скоро
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Совсем скоро поставим вас в курс дела, проявите каплю терпения
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/')} size="lg">
            <Icon name="Home" size={20} className="mr-2" />
            На главную
          </Button>
          <Button onClick={() => navigate('/sounds')} variant="outline" size="lg">
            <Icon name="Music" size={20} className="mr-2" />
            К звукам
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
