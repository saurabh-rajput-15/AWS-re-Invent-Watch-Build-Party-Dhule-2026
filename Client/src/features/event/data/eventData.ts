import { AgendaSession, Speaker, FAQItem, EventBenefit, TeamMember } from '../../../types';

export const EVENT_DETAILS = {
  name: 'AWS re:Invent Watch & Build Party Dhule',
  tagline: 'Watch the biggest cloud announcements together, then build something groundbreaking with them.',
  organizer: 'AWS Student Builder Group Dhule',
  contactEmail: 'info@reinvent.awssbgdhule.in',
  organizers: [
    {
      name: 'Soham Chaudhari',
      role: 'Organizer (SBG Lead)',
      phone: '9834382337',
      phoneFormatted: '+91 98343 82337',
      image: '/team/team-01.png'
    },
    {
      name: 'Saurabh Rajput',
      role: 'Organizer',
      phone: '9890991510',
      phoneFormatted: '+91 98909 91510',
      image: '/team/team-03.png'
    }
  ],
  dateString: 'Friday, 04 December 2026',
  timeString: '09:00 AM – 04:00 PM IST',
  startTimestamp: new Date('2026-12-04T09:00:00+05:30').getTime(),
  endTimestamp: new Date('2026-12-04T16:00:00+05:30').getTime(),
  venueName: 'Hotel Anand Regency Riverfront',
  venueCity: 'Dhule, Maharashtra, India',
  venueCoordinates: {
    lat: 20.906515,
    lng: 74.775224
  },
  seatsTotal: 300,
  bannerPath: '/assets/aistudio/AWS_reInvent_Watch_and_Build_Party_Dhule_Banner_546ae98e.png',
  videoBgUrl: 'https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/events/approved/reinvent26/video/RIV%20Website%20Loop_Foyer_v2.c6bbccb6cb4e0256ab5c1b7d63c862ddf2dd6636.mp4',
  googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Hotel+Anand+Regency+Riverfront,+Dhule',
  builderCenterEventUrl: 'https://builder.aws.com/connect/event/c8a38d77-8262-34c4-b744-ea8dfb7b35a6',
  calendarGoogleUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=AWS+re%3AInvent+Watch+%26+Build+Party+Dhule&dates=20261204T033000Z%2F20261204T103000Z&details=Watch+the+biggest+AWS+re%3AInvent+announcements+together+and+build+hands-on+projects+with+mentors.&location=Hotel+Anand+Regency+Riverfront%2C+Dhule'
};

export const AGENDA_SESSIONS: AgendaSession[] = [
  {
    id: 'checkin',
    time: '09:00 AM – 09:30 AM',
    title: 'Attendee Check-In & Builder Welcome Kit',
    category: 'workshop',
    categoryLabel: 'Registration & Welcome',
    speaker: 'Organizing Committee',
    speakerRole: 'AWS Student Builder Group Leads',
    description: 'Pick up your official digital conference lanyard, collector re:Invent stickers, and take your seat in Symphony Hall for the opening keynote.',
    location: '2nd Floor · Symphony Hall (Reception)',
    accentColor: '#3FB1FF'
  },
  {
    id: 'inauguration',
    time: '09:30 AM – 10:00 AM',
    title: 'Opening Inauguration & Cloud Keynote Welcome',
    category: 'keynote',
    categoryLabel: 'Opening Ceremony',
    speaker: 'Community Leadership & Faculty Mentors',
    speakerRole: 'AWS Student Builder Group & Department Mentors',
    description: 'Setting the stage for the watch party: how AWS re:Invent transforms cloud computing, AI, and the developer ecosystem, and what we will build today.',
    location: '2nd Floor · Symphony Hall',
    accentColor: '#AB5CFF'
  },
  {
    id: 'keynote-stream',
    time: '10:00 AM – 11:30 AM',
    title: 're:Invent Keynote Watch Session: GenAI & Infrastructure',
    category: 'keynote',
    categoryLabel: 'Keynote Screening',
    speaker: 'Dr. Werner Vogels & AWS Leadership',
    speakerRole: 'CTO, Amazon.com (Live Recorded Stream)',
    description: 'High-definition big-screen screening of curated re:Invent breakthrough releases—focusing on foundation models, Amazon Bedrock updates, and next-gen serverless compute.',
    location: '2nd Floor · Symphony Hall',
    accentColor: '#FF57E8'
  },
  {
    id: 'tech-talk',
    time: '11:30 AM – 12:30 PM',
    title: 'Deconstructing the Announcements: Architecture Deep-Dive',
    category: 'workshop',
    categoryLabel: 'Technical Breakdown',
    speaker: 'Abhishek Maurya',
    speakerRole: 'Senior Cloud Engineer, Orange Business India | AWS Community Builder | CKA',
    description: 'Practical translation of the morning announcements: How student builders can immediately leverage Bedrock, AWS Lambda functions, and Q Developer in academic and production projects.',
    location: '2nd Floor · Symphony Hall',
    prerequisites: ['AWS Free Tier Account', 'Curiosity for Cloud Architecture'],
    accentColor: '#05E08A'
  },
  {
    id: 'lunch',
    time: '12:30 PM – 01:30 PM',
    title: 'Networking Lunch & Community Mixer',
    category: 'workshop',
    categoryLabel: 'Community & Lunch',
    speaker: 'All Attendees & Mentors',
    speakerRole: 'Peer Networking & Discussions',
    description: 'Buffet lunch served at Harmony Hall (3rd Floor), Hotel Anand Regency Riverfront. Connect with fellow attendees, discuss the morning keynote releases, and gear up for the afternoon Kahoot battles.',
    location: '3rd Floor · Harmony Hall',
    accentColor: '#FF9F1C'
  },
  {
    id: 'kahoot-arena',
    time: '01:30 PM – 03:00 PM',
    title: 'The Great Kahoot Cloud Arena: re:Invent Trivia & Battle',
    category: 'build',
    categoryLabel: 'Live Kahoot Battles',
    speaker: 'Saurabh Rajput & Quiz Hosts',
    speakerRole: 'AWS Student Builder Group',
    description: 'Grab your smartphones and join the ultimate multiplayer live Kahoot battle! Multi-round cloud trivia covering the morning keynote announcements, AWS architectural fundamentals, and tech puzzles with real-time big-screen leaderboards.',
    location: '2nd Floor · Symphony Hall',
    prerequisites: ['Smartphone with web browser (kahoot.it)', 'Quick reflexes & cloud enthusiasm'],
    accentColor: '#05E08A'
  },
  {
    id: 'demos',
    time: '03:00 PM – 03:45 PM',
    title: 'Kahoot Championship Finals, Podium & Lightning Talks',
    category: 'build',
    categoryLabel: 'Finals & Podium',
    speaker: 'Top Kahoot Finalists & Mentors',
    speakerRole: 'Championship Stage',
    description: 'Top leaderboard champions face off on stage in the rapid-fire championship round. Plus 5-minute lightning talks on student cloud breakthroughs and community announcements.',
    location: '2nd Floor · Symphony Hall Stage',
    accentColor: '#3FB1FF'
  },
  {
    id: 'closing',
    time: '03:45 PM – 04:00 PM',
    title: 'Closing Ceremony, Swag Distribution & Group Photo',
    category: 'workshop',
    categoryLabel: 'Wrap-Up',
    speaker: 'AWS Student Builder Group Team',
    speakerRole: 'AWS Student Builder Group Dhule',
    description: 'Presentation of Participation Certificates, distribution of AWS winner swags, and official group photo celebration.',
    location: '2nd Floor · Symphony Hall',
    accentColor: '#AB5CFF'
  }
];

export const SPEAKERS: Speaker[] = [
  {
    id: 'speaker-1',
    name: 'Abhishek Maurya',
    role: 'Senior Cloud Engineer',
    organization: 'Orange Business India',
    bio: 'Senior Cloud Engineer specializing in enterprise Kubernetes infrastructure, cloud-native deployments, and container orchestration. AWS Community Builder and Certified Kubernetes Administrator (CKA).',
    topic: 'Architecting Enterprise Kubernetes & Cloud Workloads on AWS',
    avatarSeed: 'Abhishek',
    tags: ['AWS Community Builder', 'CKA', 'Senior Cloud Engineer', 'Kubernetes'],
    linkedin: 'https://www.linkedin.com/in/abhitnc/',
    accent: '#3FB1FF',
    image: '/speakers/Abhishek-Maurya.jpeg'
  },
  {
    id: 'speaker-2',
    name: 'To Be Announced',
    role: 'Industry Leader & Cloud Expert',
    organization: 'Announcing Soon',
    bio: 'We are locking in another industry leader to guide and inspire student builders during our watch and build sessions. Stay tuned for the official reveal!',
    topic: 'Keynote Cloud Session & Technical Deep Dive',
    avatarSeed: 'TBA',
    tags: ['Keynote Speaker', 'Industry Mentor', 'Announcing Soon'],
    accent: '#FF57E8',
    isAnnouncingSoon: true
  }
];


export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Who can attend the AWS re:Invent Watch & Build Party?',
    answer: 'If technology excites you, coding inspires you, or cloud computing sparks your curiosity, YOU BELONG HERE! Engineering, Computer Science, BCA/MCA students and tech enthusiasts from colleges across Dhule and Maharashtra are welcome. Developers, working professionals, faculty members, and cloud enthusiasts are equally invited. No gatekeeping, just great people, exciting technology, and an incredible community!'
  },
  {
    id: 'faq-2',
    question: 'What is the entry fee for the event?',
    answer: 'IT IS ABSOLUTELY FREE! ZERO RUPEES! Your pass to an incredible tech experience includes AWS re:Invent keynote screening, hands on technical masterclasses, delicious lunch, community networking, and exclusive AWS swag. All you need to do is register, get your confirmation, and show up ready to LEVEL UP!'
  },
  {
    id: 'faq-3',
    question: 'Will food, refreshments, and lunch be provided?',
    answer: 'We fuel both brains and builders! Confirmed attendees will enjoy complimentary welcome drinks, delicious snacks, and a full buffet lunch at Harmony Hall (3rd Floor). Great conversations, amazing food, and an even better tech community. Come hungry for knowledge and stay for the experience!'
  },
  {
    id: 'faq-4',
    question: 'What should I bring to the event?',
    answer: 'Keep your event essentials ready! A smartphone for Kahoot battles and interactive activities, your college ID for verification, and your digital ticket with QR code for a smooth check in. Most importantly, bring your curiosity and enthusiasm. A laptop is completely optional. Your excitement to learn is mandatory!'
  },
  {
    id: 'faq-5',
    question: 'What is an AWS Builder ID, and why do I need one?',
    answer: 'Think of your AWS Builder ID as your personal passport to the AWS developer universe! It is a free identity that connects you with the global AWS builder community. Use it to RSVP through AWS Builder Center, join our regional student chapter, explore developer tools, and unlock official digital badges. One ID, endless opportunities, and absolutely no cost!'
  },
  {
    id: 'faq-6',
    question: 'How will I know if my registration is confirmed?',
    answer: 'Because seats are strictly limited (300 capacity) and we are receiving a very high number of responses along with 100+ emails and calls, our team personally reviews every application and confirms selected attendees by phone call along with sending an official confirmation email containing your verified Digital Ticket Pass (riv-26-XXXX) and personal QR code. Please be patient, keep your phone reachable, and thank you for your support!'
  },
  {
    id: 'faq-7',
    question: 'Do I need prior experience with AWS or cloud computing?',
    answer: 'Absolutely NOT! Beginners are welcome, and experienced developers have plenty to explore too. Our sessions are designed for everyone, from curious first year students to seasoned engineers. No prior cloud experience is required. Just bring your curiosity, ask questions, explore new technologies, and discover your potential as a builder. Every expert starts somewhere!'
  },
  {
    id: 'faq-8',
    question: 'Should I bring my laptop to the event?',
    answer: 'Your laptop is welcome, but it is not mandatory! It can be useful during the Kubernetes masterclass and for taking notes. However, keynote screening, networking, and interactive quizzes can all be enjoyed without one. Please note that event Wi-Fi will be available, but charging points will NOT be provided. Make sure your devices are fully charged before arriving!'
  },
  {
    id: 'faq-9',
    question: 'How do I participate in the Kahoot Cloud Arena?',
    answer: 'WELCOME TO THE BATTLEFIELD! Get your smartphone ready, visit kahoot.it, enter the game PIN, and you are officially in! Compete through exciting challenges covering AWS fundamentals, re:Invent highlights, and mind bending tech trivia. Think fast, answer smart, climb the leaderboard, and challenge fellow builders. Exclusive AWS swag and podium certificates await our champions. LET THE BEST BUILDER WIN!'
  },
  {
    id: 'faq-10',
    question: 'Will certificates and exclusive AWS swag be provided?',
    answer: 'YOU BRING THE ENERGY, WE BRING THE GOODIES! Verified attendees who check in and participate in the sessions will receive an official Certificate of Participation from AWS Student Builder Group Dhule, along with exclusive AWS stickers and conference badge lanyards. Our Kahoot podium finishers can also look forward to special prizes. Come for the knowledge, connect with the community, and leave with unforgettable memories!'
  },
  {
    id: 'faq-11',
    question: 'Where is the venue, and is parking available?',
    answer: 'Your next tech destination is Hotel Anand Regency Riverfront, beautifully located along the Panzara Riverfront in Dhule, Maharashtra, 424001. Travelling by two wheeler or four wheeler? We have got you covered! Complimentary parking is available on the hotel premises. Arrive, check in, connect with fellow builders, and get ready for an incredible experience!'
  },
  {
    id: 'faq-12',
    question: 'Can I register on the spot at the venue?',
    answer: 'DON’T GAMBLE WITH YOUR SPOT! The event has a maximum auditorium capacity of 300 attendees. Food and event arrangements are planned according to confirmed registrations, so walk in entry is NOT guaranteed. Register online, get your confirmation, secure your QR pass, and avoid the last minute disappointment. Limited seats, unlimited opportunities. Make sure you are on the list!'
  },
  {
    id: 'faq-13',
    question: 'How can I contact the organizing team if I need help?',
    answer: 'Due to limited seats and an overwhelming response, we are receiving 100+ emails and calls every day. Please be patient and avoid repeat calls or emails just for confirmation status — our team is reviewing every request and confirming attendees directly by phone call! Thank you for your support. For urgent queries, reach out at info@reinvent.awssbgdhule.in or connect with our leads: Soham Chaudhari (+91 98343 82337) or Saurabh Rajput (+91 98909 91510).'
  }
];

export const EVENT_BENEFITS: EventBenefit[] = [
  {
    id: 'lunch',
    title: 'Premium Restaurant Lunch',
    description: 'Enjoy a guaranteed premium lunch experience at Hotel Anand Regency Riverfront.',
    category: 'Hospitality & Dining',
    accent: '#FF9F1C',
    tag: 'Guaranteed Buffet Lunch'
  },
  {
    id: 'swags',
    title: 'Exclusive Event Swags',
    description: 'Take home exciting goodies and event merchandise provided by aws.',
    category: 'Official Merchandise',
    accent: '#FF57E8',
    tag: 'Limited Edition Swags'
  },
  {
    id: 'credits',
    title: 'AWS Credits & Giveaways',
    description: 'Opportunities to get AWS credits and exciting surprises.',
    category: 'Builder Rewards',
    accent: '#3FB1FF',
    tag: 'Cloud Vouchers'
  },
  {
    id: 'networking',
    title: 'Meaningful Networking',
    description: 'Connect with AWS community leaders, developers, industry professionals, and fellow builders.',
    category: 'Community & Peer Group',
    accent: '#05E08A',
    tag: '300+ Tech Builders'
  },
  {
    id: 'learning',
    title: 'Hands-on Learning',
    description: 'Explore AWS technologies through practical sessions, demonstrations, and building activities.',
    category: 'Interactive Labs',
    accent: '#AB5CFF',
    tag: 'Practical Sprints'
  },
  {
    id: 'announcements',
    title: 'Latest re:Invent Announcements',
    description: "Discover what's new and exciting in the AWS ecosystem.",
    category: 'Keynotes & Deep-dives',
    accent: '#3FB1FF',
    tag: 'Direct from Las Vegas'
  },
  {
    id: 'activities',
    title: 'Fun Community Activities',
    description: 'Enjoy interactive challenges, engaging discussions, and plenty of memorable moments.',
    category: 'Kahoot & Quizzes',
    accent: '#FF9F1C',
    tag: 'Live Stage Contests'
  }
];

export const CREW: TeamMember[] = [
  {
    name: "Soham Chaudhari",
    role: "AWS Cloud Club Captain",
    description: "AWS Cloud Club Captain leading the community and driving cloud innovation at SVKM IOT Dhule.",
    image: "/team/team-01.png",
    linkedin: "https://www.linkedin.com/in/soham-chaudhari-174b4b287/",
    github: "https://github.com/Soham156"
  },
  {
    name: "Vaibhav Chaudhari",
    role: "Admin & Operations Lead",
    description: "Overseeing administration and operations, ensuring smooth execution of all community events and activities.",
    image: "/team/team-02.png",
    linkedin: "https://www.linkedin.com/in/vaibhav-chaudhari-1355a3281/",
    github: "https://github.com/VaibhavChaudhari07"
  },
  {
    name: "Saurabh Girase",
    role: "IT Support & Management",
    description: "Managing IT infrastructure and technical support for all AWS community events and digital initiatives.",
    image: "/team/team-03.png",
    linkedin: "https://www.linkedin.com/in/saurabhrajput15/",
    github: "https://github.com/saurabh-rajput-15"
  },
  {
    name: "Abdullah Bandukwala",
    role: "Technical Lead",
    description: "Leading the technical direction of the club, mentoring members on AWS services, DevOps, and cloud architecture.",
    image: "/team/team-04.png",
    linkedin: "https://www.linkedin.com/in/abdullah-bandukwala-74848b231/",
    github: "https://github.com/abdullahb07"
  },
  {
    name: "Aashish Ingale",
    role: "Social Media Head",
    description: "Crafting the digital presence and social media strategy for the AWS Student Community.",
    image: "/team/team-05.png",
    linkedin: "https://www.linkedin.com/in/aashish-ingale-276bb2298/",
    github: "https://github.com/aashishingale27"
  },
  {
    name: "Bhavesh Dev",
    role: "Event Management Lead",
    description: "Planning and executing community events, workshops, and meetups for the AWS Student Community.",
    image: "/team/team-06.png",
    linkedin: "https://www.linkedin.com/in/bhavesh-dev-118b472a9/",
    github: "https://github.com/bhavesh-k-dev"
  },
];

export const crew = CREW;
export const CORE_TEAM = CREW;
