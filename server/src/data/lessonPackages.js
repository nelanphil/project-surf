export const lessonPackages = [
  {
    id: 1,
    title: 'Novice to Beginner',
    level: 'Starter Package',
    duration: '1 Hour Session',
    description: 'Perfect for first-timers ready to catch their first wave',
    goals: [
      'Ocean safety and surf etiquette basics',
      'Proper paddling technique',
      'Understanding wave selection',
      'Pop-up fundamentals on the board',
      'Standing up and riding your first waves',
      'Basic balance and positioning',
    ],
    highlights: [
      'Our foam board (optional to bring your own board)',
      'Beach safety orientation',
      '1-on-1 personalized instruction',
      'Photos of your session',
    ],
    price: 75, // Price as a number
    image:
      'https://images.unsplash.com/photo-1722087814088-0c8557c4a41a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEYXl0b25hJTIwYmVhY2glMjBzYW5kfGVufDF8fHx8MTc2MTgyMTQ5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  // {
  //   id: 2,
  //   title: 'Beginner to Advanced',
  //   level: 'Progress Package',
  //   duration: '1 Hour Session',
  //   description: 'Take your surfing to the next level with advanced techniques',
  //   goals: [
  //     'Refining your pop-up and stance',
  //     'Wave reading and positioning mastery',
  //     'Bottom turns and top turns',
  //     'Generating speed down the line',
  //     'Cutbacks and basic maneuvers',
  //     'Advanced wave selection strategy',
  //   ],
  //   highlights: [
  //     'Video analysis of your technique',
  //     'Personalized progression plan',
  //     'Board selection guidance',
  //     'Competition-ready fundamentals',
  //   ],
  //   price: 85, // Price as a number
  //   image:
  //     'https://images.unsplash.com/photo-1613486185372-e830f4e8a13f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJmYm9hcmQlMjBvY2VhbiUyMHdhdmVzfGVufDF8fHx8MTc2MTgyMTA3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  // },
];

export const getLessonPackageById = (id) => {
  return lessonPackages.find((pkg) => pkg.id === id);
};

