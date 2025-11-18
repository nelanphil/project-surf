import React from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Logo } from './Logo';
import { useAuthStore } from '../stores/authStore';

export function Hero() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const onBookRepair = () => {
    if (!user) return navigate('/signin?from=%2Frepairs');
    navigate('/repairs');
  };

  const onSurfLessons = () => {
    if (!user) return navigate('/signin?from=%2Flessons');
    navigate('/lessons');
  };
  return (
    <div className="relative h-screen w-full overflow-hidden -mt-20 md:-mt-24">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1676355195623-d03d68804b0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJmZXIlMjByaWRpbmclMjB3YXZlfGVufDF8fHx8MTc2MTgxMzE3MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Surfer riding wave"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 pt-20 md:pt-24">
        <Logo className="h-16 md:h-24 w-auto mb-6" variant="light" />
        <p className="text-xl md:text-2xl mb-12 text-center max-w-2xl">
          Expert Surfboard Repairs & Professional Surf Lessons
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="bg-blue-500 hover:bg-blue-600" onClick={onBookRepair}>
            Book a Repair
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white"
            onClick={onSurfLessons}
          >
            Surf Lessons
          </Button>
        </div>
      </div>
    </div>
  );
}
