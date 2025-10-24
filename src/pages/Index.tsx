import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const projects = [
    {
      title: 'WB PVZ Кастомизация',
      description: 'Разработка звуков и визуального оформления для программы выдачи заказов Wildberries. Создаём уникальный опыт для пользователей.',
      icon: 'Package',
      link: '/sounds'
    },
    {
      title: 'Социальные инициативы',
      description: 'Реализация проектов в рамках добровольного сотрудничества с ООН, направленных на улучшение качества жизни людей.',
      icon: 'Users',
      link: '/coming-soon'
    },
    {
      title: 'FIRST-21',
      description: 'Бесплатная обучающая платформа с курсами по фотографии, видео и дизайну от профессионалов.',
      icon: 'GraduationCap',
      link: '/learning'
    },
    {
      title: 'Друзья и Сообщество',
      description: 'Находите коллег, общайтесь, обменивайтесь стикерами и зарабатывайте FMONET.',
      icon: 'MessageCircle',
      link: '/friends'
    }
  ];

  const faqItems = [
    {
      question: 'Что такое экосистема FIRST?',
      answer: 'FIRST — это экосистема проектов, направленных на улучшение качества жизни людей через инновационные технологические решения и социальные инициативы.'
    },
    {
      question: 'Как FIRST связан с ООН?',
      answer: 'Мы являемся частью ООН на добровольной основе, реализуя социально значимые проекты и инициативы в рамках глобальных целей устойчивого развития.'
    },
    {
      question: 'Что такое WB PVZ проект?',
      answer: 'Это энтузиастский проект по кастомизации программы выдачи заказов Wildberries, где мы создаём уникальные звуки и визуальное оформление для улучшения пользовательского опыта.'
    },
    {
      question: 'Как я могу присоединиться к проектам?',
      answer: 'Свяжитесь с нами через форму обратной связи или напишите на нашу электронную почту. Мы всегда открыты для сотрудничества и новых участников.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <nav className="fixed top-0 left-0 right-0 glass border-b border-white/30 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://v3b.fal.media/files/b/lion/v0M59GSTZ6WYWlnE5fPVA_output.png" 
                alt="FIRST Logo" 
                className="h-12"
              />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('home')} className="text-sm font-medium hover:text-primary transition-colors">
                Главная
              </button>
              <button onClick={() => scrollToSection('ecosystem')} className="text-sm font-medium hover:text-primary transition-colors">
                Экосистема
              </button>
              <button onClick={() => scrollToSection('projects')} className="text-sm font-medium hover:text-primary transition-colors">
                Проекты
              </button>
              <button onClick={() => scrollToSection('partners')} className="text-sm font-medium hover:text-primary transition-colors">
                Партнёры
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-sm font-medium hover:text-primary transition-colors">
                FAQ
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-sm font-medium hover:text-primary transition-colors">
                Контакты
              </button>
              <Button onClick={() => window.location.href = '/sounds'} variant="default" size="sm" className="ml-4">
                <Icon name="Music" size={16} className="mr-2" />
                WB Звуки
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-center text-center animate-fade-in">
            <h1 className="text-6xl md:text-7xl mb-6 tracking-tight font-bold">ANDREAS FIRST
</h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-12 leading-relaxed">Создаём проекты, которые делают жизнь людей и сотрудников Wildberries проще</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => scrollToSection('projects')}
                className="text-base px-8 py-6"
              >
                Наши проекты
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => scrollToSection('contact')}
                className="text-base px-8 py-6"
              >
                Связаться с нами
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="ecosystem" className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Экосистема проектов</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Объединяем инновации, социальную ответственность и технологии для создания позитивного влияния на общество
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 glass-card glass-hover animate-scale-in shadow-lg">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Icon name="Target" className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Миссия</h3>
              <p className="text-muted-foreground leading-relaxed">
                Реализация проектов, которые делают повседневную жизнь людей удобнее и комфортнее
              </p>
            </Card>
            <Card className="p-8 glass-card glass-hover animate-scale-in shadow-lg" style={{ animationDelay: '0.1s' }}>
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                <Icon name="Globe" className="text-secondary" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Партнёрство с ООН</h3>
              <p className="text-muted-foreground leading-relaxed">
                Являемся частью ООН на добровольной основе, поддерживая глобальные цели устойчивого развития
              </p>
            </Card>
            <Card className="p-8 glass-card glass-hover animate-scale-in shadow-lg" style={{ animationDelay: '0.2s' }}>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Icon name="Sparkles" className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Инновации</h3>
              <p className="text-muted-foreground leading-relaxed">
                Используем современные технологии для создания уникальных решений и улучшения пользовательского опыта
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="projects" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Наши проекты</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              От социальных инициатив до технологических решений
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <Card 
                key={index} 
                className="p-8 glass-card glass-hover shadow-lg cursor-pointer"
                onClick={() => project.link && (window.location.href = project.link)}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <Icon name={project.icon as any} className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-semibold mb-4">{project.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
                {project.link && (
                  <div className="mt-4 flex items-center gap-2 text-primary">
                    <span className="text-sm font-medium">
                      {project.link === '/coming-soon' ? 'Скоро' : 'Перейти'}
                    </span>
                    <Icon name={project.link === '/coming-soon' ? 'Clock' : 'ArrowRight'} size={16} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Партнёры</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Работаем вместе с ведущими организациями для достижения глобальных целей
            </p>
          </div>
          <div className="flex flex-col items-center gap-12">
            <Card className="p-12 w-full max-w-md text-center glass-card shadow-xl">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Earth" className="text-blue-600" size={48} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Организация Объединённых Наций</h3>
              <p className="text-muted-foreground">
                Добровольное партнёрство в рамках программ устойчивого развития
              </p>
            </Card>
            <Card className="p-12 w-full max-w-md text-center glass-card shadow-xl">
              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Package" className="text-purple-600" size={48} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Wildberries</h3>
              <p className="text-muted-foreground">
                Энтузиастский проект по улучшению пользовательского опыта программы выдачи заказов
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Вопросы и ответы</h2>
            <p className="text-lg text-muted-foreground">
              Ответы на часто задаваемые вопросы о нашей экосистеме
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="glass-card rounded-xl px-6 shadow-md"
              >
                <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="contact" className="py-24 px-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Свяжитесь с нами</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Готовы присоединиться к нашим проектам или узнать больше? Мы всегда открыты для диалога
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Card className="p-6 flex items-center gap-4 glass-card glass-hover shadow-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon name="Mail" className="text-primary" size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">hello@first-ecosystem.org</p>
                </div>
              </Card>
              <Card className="p-6 flex items-center gap-4 glass-card glass-hover shadow-lg">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Icon name="Phone" className="text-secondary" size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Телефон</p>
                  <p className="font-semibold">+7 (999) 123-45-67</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://v3b.fal.media/files/b/lion/v0M59GSTZ6WYWlnE5fPVA_output.png" 
                alt="FIRST Logo" 
                className="h-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 FIRST Ecosystem. Делаем жизнь людей проще
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/admin'}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <Icon name="Settings" size={14} className="mr-1" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;