import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Waves, TrendingUp, Clock, Users } from 'lucide-react';

import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { lessonPackages } from '../services/lessonPackages';

export function SurfLessons() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuthStore();

  const features = [
    {
      icon: Users,
      title: 'Small Groups',
      description: 'Small Group Options available upon request',
    },
    {
      icon: Clock,
      title: 'Weekend Only Scheduling',
      description: 'Morning and afternoon sessions available all weekend',
    },
    // {
    //   icon: Award,
    //   title: 'Quality Equipment',
    //   description: 'Top-tier beginner-friendly boards and premium wetsuits included',
    // },
  ];

  return (
    <section id="lessons" className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Surf Lessons</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Learn from experienced instructors in a safe, supportive environment. Whether you're
            catching your first wave or perfecting your technique, we'll help you progress.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Lesson Packages */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-12">
          {lessonPackages.map((lesson) => (
            <Card key={lesson.id} className="overflow-hidden">
              <div className="relative h-64">
                <ImageWithFallback
                  src={lesson.image}
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-blue-500">{lesson.level}</Badge>
                </div>
              </div>

              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                    <CardDescription>{lesson.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl text-blue-600">${lesson.price}</div>
                    <div className="text-sm text-slate-500">{lesson.duration}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h4>What You'll Learn</h4>
                  </div>
                  <ul className="space-y-2">
                    {lesson.goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Waves className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3">Included</h4>
                  <ul className="space-y-2">
                    {lesson.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-blue-500">✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center">
                  <Button
                    className="w-fit"
                    onClick={() => {
                      if (!user) return openAuthModal('/lessons/booking');
                      navigate(`/lessons/booking?packageId=${lesson.id}`);
                    }}
                  >
                    Book This Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle>What to Bring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="mb-2">Required</h4>
                <ul className="text-sm space-y-1 text-slate-600">
                  <li>• Swimsuit</li>
                  <li>• Towel</li>
                  <li>• Sunscreen</li>
                  <li>• Water bottle</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2">Optional</h4>
                <ul className="text-sm space-y-1 text-slate-600">
                  <li>• Wet suit</li>
                  <li>• Hat or visor</li>
                  <li>• Sunglasses</li>
                  <li>• Waterproof camera</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2">Good to Know</h4>
                <ul className="text-sm space-y-1 text-slate-600">
                  <li>• Lessons run rain or shine</li>
                  <li>• 24hr cancellation policy</li>
                  <li>• Minimum age: 8 years old</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
