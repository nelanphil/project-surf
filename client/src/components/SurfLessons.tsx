import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Waves, TrendingUp, Award, Clock, Users, Shield } from "lucide-react";

export function SurfLessons() {
  const lessonPackages = [
    {
      id: 1,
      title: "Novice to Beginner",
      level: "Starter Package",
      duration: "1 Hour Session",
      description: "Perfect for first-timers ready to catch their first wave",
      goals: [
        "Ocean safety and surf etiquette basics",
        "Proper paddling technique",
        "Understanding wave selection",
        "Pop-up fundamentals on the board",
        "Standing up and riding your first waves",
        "Basic balance and positioning"
      ],
      highlights: [
        "All equipment provided (board, wetsuit, rash guard)",
        "Beach safety orientation",
        "1-on-1 personalized instruction",
        "Photo documentation of your session"
      ],
      price: "$75",
      image: "https://images.unsplash.com/photo-1722087814088-0c8557c4a41a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEYXl0b25hJTIwYmVhY2glMjBzYW5kfGVufDF8fHx8MTc2MTgyMTQ5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 2,
      title: "Beginner to Advanced",
      level: "Progress Package",
      duration: "1 Hour Session",
      description: "Take your surfing to the next level with advanced techniques",
      goals: [
        "Refining your pop-up and stance",
        "Wave reading and positioning mastery",
        "Bottom turns and top turns",
        "Generating speed down the line",
        "Cutbacks and basic maneuvers",
        "Advanced wave selection strategy"
      ],
      highlights: [
        "Video analysis of your technique",
        "Personalized progression plan",
        "Board selection guidance",
        "Competition-ready fundamentals"
      ],
      price: "$85",
      image: "https://images.unsplash.com/photo-1613486185372-e830f4e8a13f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJmYm9hcmQlMjBvY2VhbiUyMHdhdmVzfGVufDF8fHx8MTc2MTgyMTA3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Certified Instructors",
      description: "All instructors are CPR and First Aid certified with years of teaching experience"
    },
    {
      icon: Users,
      title: "Small Groups",
      description: "Small Group Options available upon request"
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Morning and afternoon sessions available 7 days a week"
    },
    {
      icon: Award,
      title: "Quality Equipment",
      description: "Top-tier beginner-friendly boards and premium wetsuits included"
    }
  ];

  return (
    <section id="lessons" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Surf Lessons</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Learn from experienced instructors in a safe, supportive environment. 
            Whether you're catching your first wave or perfecting your technique, we'll help you progress.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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
                    <div className="text-3xl text-blue-600">{lesson.price}</div>
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

                <Button className="w-full">Book This Lesson</Button>
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
                  <li>• Hat or visor</li>
                  <li>• Sunglasses</li>
                  <li>• Change of clothes</li>
                  <li>• Waterproof camera</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2">Good to Know</h4>
                <ul className="text-sm space-y-1 text-slate-600">
                  <li>• Lessons run rain or shine</li>
                  <li>• 24hr cancellation policy</li>
                  <li>• Minimum age: 8 years old</li>
                  <li>• Gift certificates available</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}