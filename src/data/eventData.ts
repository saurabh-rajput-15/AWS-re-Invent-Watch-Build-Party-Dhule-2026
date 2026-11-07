import { AgendaSession, Speaker, FAQItem } from '../types';

export const EVENT_DETAILS = {
  name: 'AWS re:Invent Watch & Build Party Dhule',
  tagline: 'Watch the biggest cloud announcements together, then build something groundbreaking with them.',
  organizer: 'AWS Student Builder Group · SVKM’s Institute of Technology, Dhule',
  organizers: [
    {
      name: 'Soham Chaudhari',
      role: 'Organizer (SBG Lead)',
      phone: '9834382337',
      phoneFormatted: '+91 98343 82337'
    },
    {
      name: 'Saurabh Rajput',
      role: 'Organizer',
      phone: '9890991510',
      phoneFormatted: '+91 98909 91510',
      email: 'developersaurabhrajput@gmail.com'
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
  googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=20.906515,74.775224',
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
    description: 'Pick up your official digital conference lanyard, collector re:Invent stickers, Wi-Fi credentials, and claim your designated workstation.',
    location: 'Main Reception & Atrium',
    accentColor: '#3FB1FF'
  },
  {
    id: 'inauguration',
    time: '09:30 AM – 10:00 AM',
    title: 'Opening Inauguration & Cloud Keynote Welcome',
    category: 'keynote',
    categoryLabel: 'Opening Ceremony',
    speaker: 'SVKM Leadership & Faculty Mentors',
    speakerRole: 'Department of Computer Engineering, SVKM’s IOT Dhule',
    description: 'Setting the stage for the watch party: how AWS re:Invent transforms cloud computing, AI, and the developer ecosystem, and what we will build today.',
    location: 'Riverfront Auditorium',
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
    location: 'Riverfront Auditorium Screen A',
    accentColor: '#FF57E8'
  },
  {
    id: 'tech-talk',
    time: '11:30 AM – 12:30 PM',
    title: 'Deconstructing the Announcements: Architecture Deep-Dive',
    category: 'workshop',
    categoryLabel: 'Technical Breakdown',
    speaker: 'Community Solutions Architect',
    speakerRole: 'AWS Community Builder & Senior Cloud Consultant',
    description: 'Practical translation of the morning announcements: How student builders can immediately leverage Bedrock, AWS Lambda functions, and Q Developer in academic and production projects.',
    location: 'Riverfront Auditorium',
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
    description: 'Buffet lunch served by Hotel Anand Regency Riverfront. Connect with fellow attendees, discuss the morning keynote releases, and gear up for the afternoon Kahoot battles.',
    location: 'Riverfront Terrace Dining',
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
    location: 'Riverfront Auditorium Arena',
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
    location: 'Riverfront Auditorium Stage',
    accentColor: '#3FB1FF'
  },
  {
    id: 'closing',
    time: '03:45 PM – 04:00 PM',
    title: 'Closing Ceremony, Swag Distribution & Group Photo',
    category: 'workshop',
    categoryLabel: 'Wrap-Up',
    speaker: 'AWS Student Builder Group Team',
    speakerRole: 'SVKM’s IOT Dhule',
    description: 'Presentation of Participation Certificates, distribution of AWS winner swags, and official group photo celebration.',
    location: 'Riverfront Auditorium',
    accentColor: '#AB5CFF'
  }
];

export const SPEAKERS: Speaker[] = [
  {
    id: 'speaker-1',
    name: 'Saurabh Rajput',
    role: 'AWS Community Builder & Lead Organizer',
    organization: 'AWS Student Builder Group · SVKM’s IOT Dhule',
    bio: 'Passionate cloud evangelist and open-source contributor leading student builder initiatives across North Maharashtra.',
    topic: 'Demystifying Cloud-Native Architecture with AWS Lambda & Q Developer',
    avatarSeed: 'Saurabh',
    tags: ['Serverless', 'Generative AI', 'Cloud Architecture'],
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    accent: '#3FB1FF'
  },
  {
    id: 'speaker-2',
    name: 'Prof. Milind Patil',
    role: 'Faculty Advisor & Cloud Mentor',
    organization: 'Department of Computer Engineering, SVKM’s IOT Dhule',
    bio: 'Guiding student researchers in distributed computing, edge deployments, and enterprise cloud migration strategies.',
    topic: 'Bridging Academic Engineering with Real-World Cloud Ecosystems',
    avatarSeed: 'Milind',
    tags: ['Distributed Systems', 'Cloud Security', 'Mentorship'],
    linkedin: 'https://linkedin.com',
    accent: '#FF57E8'
  },
  {
    id: 'speaker-3',
    name: 'Tanvi Shinde',
    role: 'Senior DevOps Architect',
    organization: 'CloudScale Technologies',
    bio: 'Specialist in Kubernetes, Terraform, and automated CI/CD pipelines on AWS. Active mentor for collegiate developer circles.',
    topic: 'Zero-to-Production: Deploying Scalable Full-Stack Apps in 20 Minutes',
    avatarSeed: 'Tanvi',
    tags: ['DevOps', 'Terraform', 'Containers'],
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    accent: '#05E08A'
  },
  {
    id: 'speaker-4',
    name: 'Aniket Deshmukh',
    role: 'AI/ML Solutions Lead',
    organization: 'Enterprise Solutions Group',
    bio: 'Working with LLM fine-tuning, RAG pipelines, and Bedrock agent workflows to solve industrial data challenges.',
    topic: 'Building Multimodal GenAI Applications with Amazon Bedrock',
    avatarSeed: 'Aniket',
    tags: ['Amazon Bedrock', 'RAG', 'Prompt Engineering'],
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    accent: '#FF9F1C'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Who can attend the AWS re:Invent Watch & Build Party?',
    answer: 'Any student enrolled in engineering, computer science, BCA/MCA, or related technical disciplines from SVKM’s IOT Dhule or neighboring colleges in Maharashtra is eligible. Working professionals and cloud enthusiasts are also welcome!'
  },
  {
    id: 'faq-2',
    question: 'What is the entry fee for the event?',
    answer: 'The event is 100% free of cost for all registered attendees, sponsored by the AWS Student Builder Group at SVKM’s IOT Dhule. This includes access to the screening auditorium, workshop sessions, lunch, and official swag kits.'
  },
  {
    id: 'faq-3',
    question: 'What do I need to bring with me on the day of the event?',
    answer: 'Please bring your laptop, charger, student ID card, and have an active AWS account (Free Tier is sufficient). If you have registered through this portal, have your registration confirmation ready on your phone for lightning check-in.'
  },
  {
    id: 'faq-4',
    question: 'Do I need prior experience with AWS or cloud computing?',
    answer: 'No prior advanced experience is required! We have curated sessions tailored for both beginners and experienced cloud developers. The Kahoot Cloud Arena is fun and engaging for everyone—from first-year learners to senior cloud developers.'
  },
  {
    id: 'faq-5',
    question: 'How do I participate in the Kahoot Cloud Arena?',
    answer: 'Everyone participates live on their own smartphone via kahoot.it! No coding setup or team formation needed. Multiple rounds will test your speed and knowledge on re:Invent keynote highlights, AWS service knowledge, and tech trivia. Top scorers win exclusive AWS swag kits and podium certificates.'
  },
  {
    id: 'faq-6',
    question: 'Will certificates and swag be provided?',
    answer: 'Yes! All verified attendees who participate in the sessions and Kahoot battles will receive an official Digital Certificate of Participation and exclusive AWS re:Invent stickers, badge lanyards, and winner swags.'
  }
];
