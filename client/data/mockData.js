// Realistic mock data for EventFlow platform
// Using male persona data for organizers, staff, vendors, guests, and attendees as requested

export const initialEvents = [
  {
    id: "evt-101",
    title: "Tech Conference 2026",
    category: "Conference",
    description: "The flagship annual summit bringing together leading software engineers, AI researchers, and tech founders across South Asia.",
    venue: "Grand Convention Hall",
    venueId: "ven-1",
    startDate: "2026-10-15",
    endDate: "2026-10-17",
    expectedGuests: 500,
    budget: "$45,000",
    status: "Ongoing",
    progress: {
      venue: 100,
      vendors: 100,
      guests: 72,
      tasks: 60,
      schedule: 40,
      overall: 74
    },
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
    organizer: "Meyadur Rahman"
  },
  {
    id: "evt-102",
    title: "Annual Cultural Night",
    category: "Cultural",
    description: "An evening celebrating heritage music, theatrical arts, traditional poetry, and gourmet culinary traditions.",
    venue: "Royal Crown Auditorium",
    venueId: "ven-2",
    startDate: "2026-11-20",
    endDate: "2026-11-20",
    expectedGuests: 350,
    budget: "$18,000",
    status: "Planned",
    progress: {
      venue: 80,
      vendors: 60,
      guests: 45,
      tasks: 40,
      schedule: 50,
      overall: 55
    },
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
    organizer: "Meyadur Rahman"
  },
  {
    id: "evt-103",
    title: "Wedding Reception",
    category: "Wedding",
    description: "Exclusive traditional wedding reception banquet with floral canopy, live strings, and multi-course feast.",
    venue: "Lakeview Banquet Center",
    venueId: "ven-3",
    startDate: "2026-12-05",
    endDate: "2026-12-05",
    expectedGuests: 250,
    budget: "$25,000",
    status: "Planned",
    progress: {
      venue: 100,
      vendors: 85,
      guests: 80,
      tasks: 65,
      schedule: 70,
      overall: 80
    },
    bannerUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80",
    organizer: "Meyadur Rahman"
  },
  {
    id: "evt-104",
    title: "Corporate Meetup",
    category: "Corporate",
    description: "Quarterly executive round-table, investment strategy briefing, and business development networking mixer.",
    venue: "Silicon Bay Tech Hub",
    venueId: "ven-4",
    startDate: "2026-09-25",
    endDate: "2026-09-25",
    expectedGuests: 120,
    budget: "$12,000",
    status: "Planned",
    progress: {
      venue: 100,
      vendors: 100,
      guests: 90,
      tasks: 80,
      schedule: 85,
      overall: 91
    },
    bannerUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
    organizer: "Meyadur Rahman"
  },
  {
    id: "evt-105",
    title: "National Robotics Championship",
    category: "Workshop",
    description: "Collegiate autonomous rover showcase, battle bot arena, and hands-on microcontroller workshops.",
    venue: "Summit Palace Ballroom",
    venueId: "ven-5",
    startDate: "2026-07-14",
    endDate: "2026-07-15",
    expectedGuests: 400,
    budget: "$30,000",
    status: "Completed",
    progress: {
      venue: 100,
      vendors: 100,
      guests: 100,
      tasks: 100,
      schedule: 100,
      overall: 100
    },
    bannerUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80",
    organizer: "Meyadur Rahman"
  },
  {
    id: "evt-106",
    title: "Green Tech Venture Summit",
    category: "Seminar",
    description: "Sustainability innovators pitching renewable energy grids, carbon credit marketplaces, and agritech.",
    venue: "Emerald Garden Resort",
    venueId: "ven-6",
    startDate: "2026-05-10",
    endDate: "2026-05-10",
    expectedGuests: 180,
    budget: "$15,000",
    status: "Completed",
    progress: {
      venue: 100,
      vendors: 100,
      guests: 100,
      tasks: 100,
      schedule: 100,
      overall: 100
    },
    bannerUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80",
    organizer: "Meyadur Rahman"
  }
];

export const initialVenues = [
  {
    id: "ven-1",
    name: "Grand Convention Hall",
    location: "Dhaka, Bangladesh",
    capacity: 500,
    facilities: ["High-speed Wi-Fi", "LED Stage Screens", "Central AC", "VIP Lounge", "Dedicated Parking", "Audio Rigging"],
    availability: "Available",
    planningPrice: "$5,000 / day",
    bookingStatus: "Confirmed",
    assignedEventId: "evt-101",
    assignedEventTitle: "Tech Conference 2026",
    contactPerson: "Kamal Hossain (Manager)",
    phone: "+880 1712-889900",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "ven-2",
    name: "Royal Crown Auditorium",
    location: "Gulshan-2, Dhaka",
    capacity: 400,
    facilities: ["Acoustic Wall Paneling", "Stage Theatrical Lighting", "Green Rooms", "Backup Generator", "Balcony Seating"],
    availability: "Available",
    planningPrice: "$3,800 / day",
    bookingStatus: "Selected",
    assignedEventId: "evt-102",
    assignedEventTitle: "Annual Cultural Night",
    contactPerson: "Mahfuzur Rahman (Director)",
    phone: "+880 1813-776655",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "ven-3",
    name: "Lakeview Banquet Center",
    location: "Dhanmondi Lakefront, Dhaka",
    capacity: 300,
    facilities: ["Lake View Terrace", "In-house Catering Kitchen", "Valet Parking", "Bridal Suites", "Mood Ambience Lighting"],
    availability: "Available",
    planningPrice: "$2,900 / day",
    bookingStatus: "Confirmed",
    assignedEventId: "evt-103",
    assignedEventTitle: "Wedding Reception",
    contactPerson: "Dr. Salman Chowdhury (Estate Trustee)",
    phone: "+880 1914-665544",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "ven-4",
    name: "Silicon Bay Tech Hub",
    location: "Banani Commercial Zone, Dhaka",
    capacity: 150,
    facilities: ["Fiber Optic Connectivity", "Conference Pods", "Smart 4K Projectors", "Cafeteria & Bistro", "Keycard Access"],
    availability: "Available",
    planningPrice: "$2,200 / day",
    bookingStatus: "Confirmed",
    assignedEventId: "evt-104",
    assignedEventTitle: "Corporate Meetup",
    contactPerson: "Farhan Ahmed (Operations Lead)",
    phone: "+880 1615-554433",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "ven-5",
    name: "Summit Palace Ballroom",
    location: "Sector 4, Uttara, Dhaka",
    capacity: 650,
    facilities: ["Grand Crystal Chandeliers", "Modular Soundproof Partitions", "Stage Hydraulic Lift", "350 Car Parking"],
    availability: "Available",
    planningPrice: "$6,500 / day",
    bookingStatus: "Available",
    assignedEventId: null,
    assignedEventTitle: null,
    contactPerson: "Zubair Ahmed (Booking Officer)",
    phone: "+880 1716-443322",
    image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "ven-6",
    name: "Emerald Garden Resort",
    location: "Gazipur Safari Corridor",
    capacity: 800,
    facilities: ["Open Meadow Lawn", "Poolside Deck", "Guest Cottages", "Outdoor BBQ Kitchen", "Campfire Arena"],
    availability: "Booked",
    planningPrice: "$7,000 / day",
    bookingStatus: "Available",
    assignedEventId: null,
    assignedEventTitle: null,
    contactPerson: "Rayhan Kabir (General Manager)",
    phone: "+880 1817-332211",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80"
  }
];

export const initialVendors = [
  {
    id: "vnd-1",
    name: "Bashir Gourmet Catering",
    category: "Catering",
    contact: "Bashir Uddin — +880 1711-234567, bashir@gourmetcater.com",
    availability: "Available",
    rating: 4.8,
    agreedPrice: "$12,500",
    bookingStatus: "Confirmed",
    eventId: "evt-101",
    specialty: "Artisan Buffets, Coffee Stations, VIP Executive Dining"
  },
  {
    id: "vnd-2",
    name: "Zayd Imperial Decor",
    category: "Decoration",
    contact: "Zayd Karim — +880 1819-345678, zayd@imperialdecor.com",
    availability: "Available",
    rating: 4.9,
    agreedPrice: "$6,000",
    bookingStatus: "Confirmed",
    eventId: "evt-101",
    specialty: "Minimalist Architectural Stages, Floral Installations, Custom Lighting"
  },
  {
    id: "vnd-3",
    name: "Ariful Haque Visuals",
    category: "Photography",
    contact: "Ariful Haque — +880 1912-456789, ariful@arifulhaque.photo",
    availability: "Available",
    rating: 4.9,
    agreedPrice: "$3,200",
    bookingStatus: "Confirmed",
    eventId: "evt-101",
    specialty: "High-Speed Keynote Portraits, Candids, High-Res Press Kits"
  },
  {
    id: "vnd-4",
    name: "FrameCraft Cinema",
    category: "Videography",
    contact: "Fahad Al Mamun — +880 1613-567890, fahad@framecraft.com",
    availability: "Available",
    rating: 4.7,
    agreedPrice: "$4,000",
    bookingStatus: "Pending",
    eventId: "evt-101",
    specialty: "4K Multi-Cam Switcher, Real-Time Livestream, Highlight Reels"
  },
  {
    id: "vnd-5",
    name: "Rafiqul Sound & Stage",
    category: "Sound & Lighting",
    contact: "Rafiqul Alam — +880 1714-678901, rafiq@rafiqsound.net",
    availability: "Available",
    rating: 4.9,
    agreedPrice: "$4,500",
    bookingStatus: "Confirmed",
    eventId: "evt-101",
    specialty: "Line Array Sound Reinforcement, Digital Audio Mixing, Wireless Mics"
  },
  {
    id: "vnd-6",
    name: "SpeedLine Chauffeur & Shuttles",
    category: "Transportation",
    contact: "Mustafizur Rahman — +880 1515-789012, mustafiz@speedline.com",
    availability: "Available",
    rating: 4.6,
    agreedPrice: "$1,800",
    bookingStatus: "Confirmed",
    eventId: "evt-101",
    specialty: "Airport VIP Transfers, Microbus Shuttles, Luggage Vans"
  },
  {
    id: "vnd-7",
    name: "Vanguard Tactical Security",
    category: "Security",
    contact: "Commander Jalal Uddin — +880 1816-890123, jalal@vanguardsec.com",
    availability: "Available",
    rating: 4.8,
    agreedPrice: "$2,200",
    bookingStatus: "Confirmed",
    eventId: "evt-101",
    specialty: "Gate Metal Detectors, Crowd Flow Control, Executive Escorts"
  },
  {
    id: "vnd-8",
    name: "PrintXpo Badge & Signage",
    category: "Other",
    contact: "Masud Rana — +880 1717-901234, masud@printxpo.com",
    availability: "Available",
    rating: 4.5,
    agreedPrice: "$1,100",
    bookingStatus: "Confirmed",
    eventId: "evt-101",
    specialty: "NFC Badges, Fabric Lanyards, Standees, Directional Signage"
  }
];

export const initialGuests = [
  {
    id: "gst-1",
    eventId: "evt-101",
    name: "Dr. Salman Chowdhury",
    email: "salman.chowdhury@techasia.org",
    phone: "+880 1711-100200",
    invitationStatus: "Sent",
    rsvpStatus: "Accepted",
    organization: "Asia AI Research Institute",
    role: "Keynote Speaker"
  },
  {
    id: "gst-2",
    eventId: "evt-101",
    name: "Kamal Hossain",
    email: "kamal.hossain@cybernet.io",
    phone: "+880 1812-200300",
    invitationStatus: "Sent",
    rsvpStatus: "Accepted",
    organization: "CyberNet Security",
    role: "VIP Delegate"
  },
  {
    id: "gst-3",
    eventId: "evt-101",
    name: "Nabil Mahmud",
    email: "nabil.mahmud@cloudmatrix.com",
    phone: "+880 1913-300400",
    invitationStatus: "Sent",
    rsvpStatus: "Accepted",
    organization: "CloudMatrix DevOps",
    role: "Panelist"
  },
  {
    id: "gst-4",
    eventId: "evt-101",
    name: "Fahim Shahriar",
    email: "fahim.shahriar@datalink.org",
    phone: "+880 1614-400500",
    invitationStatus: "Sent",
    rsvpStatus: "Accepted",
    organization: "DataLink Systems",
    role: "Delegate"
  },
  {
    id: "gst-5",
    eventId: "evt-101",
    name: "Mahfuzur Rahman",
    email: "mahfuz.rahman@fintechgroup.com",
    phone: "+880 1715-500600",
    invitationStatus: "Sent",
    rsvpStatus: "Accepted",
    organization: "FinTech Capital",
    role: "Sponsor Representative"
  },
  {
    id: "gst-6",
    eventId: "evt-101",
    name: "Zubair Ahmed",
    email: "zubair.ahmed@innoai.net",
    phone: "+880 1816-600700",
    invitationStatus: "Sent",
    rsvpStatus: "Declined",
    organization: "InnoAI Labs",
    role: "Delegate"
  },
  {
    id: "gst-7",
    eventId: "evt-101",
    name: "Asif Iqbal",
    email: "asif.iqbal@globalventures.com",
    phone: "+880 1917-700800",
    invitationStatus: "Sent",
    rsvpStatus: "Accepted",
    organization: "Global Tech Ventures",
    role: "Investor"
  },
  {
    id: "gst-8",
    eventId: "evt-101",
    name: "Sajjad Karim",
    email: "sajjad.karim@nexussoft.com",
    phone: "+880 1518-800900",
    invitationStatus: "Sent",
    rsvpStatus: "No Response",
    organization: "Nexus Software",
    role: "Delegate"
  },
  {
    id: "gst-9",
    eventId: "evt-101",
    name: "Rayhan Kabir",
    email: "rayhan.kabir@apexlogistics.com",
    phone: "+880 1719-901001",
    invitationStatus: "Sent",
    rsvpStatus: "Accepted",
    organization: "Apex Logistics",
    role: "Delegate"
  },
  {
    id: "gst-10",
    eventId: "evt-101",
    name: "Shahadat Hossain",
    email: "shahadat.h@quantumsys.org",
    phone: "+880 1820-012112",
    invitationStatus: "Sent",
    rsvpStatus: "Accepted",
    organization: "Quantum Systems",
    role: "Panelist"
  },
  {
    id: "gst-11",
    eventId: "evt-101",
    name: "Hasanul Banna",
    email: "hasanul.banna@designstudio.bd",
    phone: "+880 1921-123223",
    invitationStatus: "Sent",
    rsvpStatus: "Invited",
    organization: "Pixel Studios",
    role: "Delegate"
  },
  {
    id: "gst-12",
    eventId: "evt-101",
    name: "Imran Nazir",
    email: "imran.nazir@synergycorp.com",
    phone: "+880 1725-567667",
    invitationStatus: "Sent",
    rsvpStatus: "Declined",
    organization: "Synergy Corp",
    role: "Delegate"
  },
  {
    id: "gst-13",
    eventId: "evt-101",
    name: "Shakib Al Hasan",
    email: "shakib.hasan@sportstech.io",
    phone: "+880 1926-678778",
    invitationStatus: "Sent",
    rsvpStatus: "Accepted",
    organization: "SportsTech Analytics",
    role: "Honorary Guest"
  },
  {
    id: "gst-14",
    eventId: "evt-101",
    name: "Mehedi Hasan",
    email: "mehedi.hasan@alphastack.dev",
    phone: "+880 1527-789889",
    invitationStatus: "Sent",
    rsvpStatus: "Accepted",
    organization: "AlphaStack",
    role: "Workshop Leader"
  },
  {
    id: "gst-15",
    eventId: "evt-101",
    name: "Shafiul Alam",
    email: "shafiul.alam@telecomnet.bd",
    phone: "+880 1729-901101",
    invitationStatus: "Sent",
    rsvpStatus: "No Response",
    organization: "Telecom Net",
    role: "Delegate"
  },
  {
    id: "gst-16",
    eventId: "evt-101",
    name: "Saifur Rahman",
    email: "saifur.rahman@biogenlabs.com",
    phone: "+880 1630-012212",
    invitationStatus: "Sent",
    rsvpStatus: "Accepted",
    organization: "BioGen Labs",
    role: "Delegate"
  }
];

export const initialTasks = [
  {
    id: "tsk-1",
    eventId: "evt-101",
    eventTitle: "Tech Conference 2026",
    title: "Confirm catering head count and dietary requirements",
    description: "Finalize buffet meal count for 500 guests with Bashir Gourmet Catering including diabetic and vegetarian options.",
    assignedTo: "Tanvir Hasan",
    assignedStaffEmail: "tanvir.hasan@infraedge.net",
    dueDate: "2026-10-05",
    priority: "High",
    status: "Done"
  },
  {
    id: "tsk-2",
    eventId: "evt-101",
    eventTitle: "Tech Conference 2026",
    title: "Arrange stage decoration and 4K LED backdrop",
    description: "Coordinate installation of 40ft LED screen and custom timber podium with Zayd Imperial Decor.",
    assignedTo: "Tariqul Islam",
    assignedStaffEmail: "tariqul.islam@eventflow.org",
    dueDate: "2026-10-10",
    priority: "High",
    status: "In Progress"
  },
  {
    id: "tsk-3",
    eventId: "evt-101",
    eventTitle: "Tech Conference 2026",
    title: "Prepare VIP delegate guest list & security passes",
    description: "Audit VIP responses, generate QR access codes, and coordinate clearance with Vanguard Security.",
    assignedTo: "Meyadur Rahman",
    assignedStaffEmail: "meyadurrahman777@gmail.com",
    dueDate: "2026-10-02",
    priority: "Medium",
    status: "Done"
  },
  {
    id: "tsk-4",
    eventId: "evt-101",
    eventTitle: "Tech Conference 2026",
    title: "Test sound system, wireless lavs & delay rigs",
    description: "Perform acoustic sweeps and frequency calibration across main auditorium and breakout rooms with Rafiqul Sound.",
    assignedTo: "Farhan Ahmed",
    assignedStaffEmail: "farhan.ahmed@devsquad.com",
    dueDate: "2026-10-14",
    priority: "High",
    status: "In Progress"
  },
  {
    id: "tsk-5",
    eventId: "evt-101",
    eventTitle: "Tech Conference 2026",
    title: "Print event badges, lanyards and conference booklets",
    description: "Inspect sample press proofs and verify badge batch delivery from PrintXpo Solutions.",
    assignedTo: "Tanvir Hasan",
    assignedStaffEmail: "tanvir.hasan@infraedge.net",
    dueDate: "2026-10-08",
    priority: "Medium",
    status: "Pending"
  },
  {
    id: "tsk-6",
    eventId: "evt-101",
    eventTitle: "Tech Conference 2026",
    title: "Configure Livestream CDN & AV Recording Rigs",
    description: "Test dual gigabit fiber backup, OBS multi-track recording, and private YouTube stream links with FrameCraft.",
    assignedTo: "Farhan Ahmed",
    assignedStaffEmail: "farhan.ahmed@devsquad.com",
    dueDate: "2026-10-12",
    priority: "Medium",
    status: "Pending"
  },
  {
    id: "tsk-7",
    eventId: "evt-101",
    eventTitle: "Tech Conference 2026",
    title: "Brief venue security personnel on escort protocols",
    description: "Conduct mandatory briefing for 18 on-site security guards and entrance magnetometers.",
    assignedTo: "Tariqul Islam",
    assignedStaffEmail: "tariqul.islam@eventflow.org",
    dueDate: "2026-10-14",
    priority: "High",
    status: "Pending"
  },
  {
    id: "tsk-8",
    eventId: "evt-102",
    eventTitle: "Annual Cultural Night",
    title: "Rehearse stage lighting cues and acoustic sound check",
    description: "Dry run with musical ensemble, choral artists, and poetry reciters.",
    assignedTo: "Tariqul Islam",
    assignedStaffEmail: "tariqul.islam@eventflow.org",
    dueDate: "2026-11-18",
    priority: "High",
    status: "Pending"
  },
  {
    id: "tsk-9",
    eventId: "evt-103",
    eventTitle: "Wedding Reception",
    title: "Inspect fresh floral table runners and bridal stage canopy",
    description: "Review flower delivery freshness and entrance archway arch with wedding stylist.",
    assignedTo: "Tanvir Hasan",
    assignedStaffEmail: "tanvir.hasan@infraedge.net",
    dueDate: "2026-12-03",
    priority: "Medium",
    status: "Pending"
  }
];

export const initialSchedule = [
  {
    id: "sch-1",
    eventId: "evt-101",
    startTime: "09:00",
    endTime: "10:00",
    activity: "Guest Registration & Welcome Coffee",
    location: "Main Foyer & Reception Hall",
    notes: "NFC badge scan, distribution of delegate conference kits, hot espresso and pastry service."
  },
  {
    id: "sch-2",
    eventId: "evt-101",
    startTime: "10:00",
    endTime: "10:30",
    activity: "Opening Ceremony & Inaugural Address",
    location: "Main Stage Auditorium",
    notes: "Welcome remarks by Meyadur Rahman (Lead Organizer) and lighting of ceremonial lamp."
  },
  {
    id: "sch-3",
    eventId: "evt-101",
    startTime: "10:30",
    endTime: "11:45",
    activity: "Keynote Speech: 'Autonomous Intelligent Systems'",
    location: "Main Stage Auditorium",
    notes: "Delivered by Dr. Salman Chowdhury, Fellow at Asia AI Research Institute."
  },
  {
    id: "sch-4",
    eventId: "evt-101",
    startTime: "12:00",
    endTime: "01:30",
    activity: "Executive Networking Lunch & Showcase",
    location: "Grand Banquet Dining Area",
    notes: "Five-course culinary buffet managed by Bashir Gourmet Catering, sponsor tech booths open."
  },
  {
    id: "sch-5",
    eventId: "evt-101",
    startTime: "02:00",
    endTime: "03:45",
    activity: "Hands-on Workshop: High-Scale Cloud Architecture",
    location: "Innovation Workshop Hall B",
    notes: "Led by Mehedi Hasan and Nabil Mahmud. Attendees must bring configured laptops."
  },
  {
    id: "sch-6",
    eventId: "evt-101",
    startTime: "04:00",
    endTime: "05:00",
    activity: "Closing Ceremony & Outstanding Innovation Awards",
    location: "Main Stage Auditorium",
    notes: "Presentation of delegate trophies, group photos, and closing vote of thanks."
  }
];

export const initialFeedback = [
  {
    id: "fb-1",
    eventId: "evt-101",
    guestName: "Dr. Salman Chowdhury",
    rating: 5,
    comment: "Flawless organization! The acoustic setup and projection delay were perfectly calibrated. Meyadur and his team did an outstanding job coordinating the speakers.",
    date: "2026-10-17"
  },
  {
    id: "fb-2",
    eventId: "evt-101",
    guestName: "Kamal Hossain",
    rating: 5,
    comment: "The check-in process was lightning quick with NFC badges. Catering was delicious and well managed throughout the lunch hour.",
    date: "2026-10-17"
  },
  {
    id: "fb-3",
    eventId: "evt-101",
    guestName: "Nabil Mahmud",
    rating: 4,
    comment: "Fantastic panel session and great audience engagement. Would appreciate slightly wider seating spacing in Workshop Hall B next time.",
    date: "2026-10-16"
  },
  {
    id: "fb-4",
    eventId: "evt-101",
    guestName: "Asif Iqbal",
    rating: 5,
    comment: "One of the best tech gatherings I have attended in Dhaka. High quality attendees and seamless timekeeping by the stage coordinators.",
    date: "2026-10-16"
  },
  {
    id: "fb-5",
    eventId: "evt-101",
    guestName: "Shakib Al Hasan",
    rating: 4,
    comment: "Very energetic atmosphere and well-organized security flow. Looking forward to the next edition in 2027.",
    date: "2026-10-16"
  }
];

export const initialUsers = [
  {
    id: "usr-1",
    name: "Meyadur Rahman",
    email: "meyadurrahman777@gmail.com",
    role: "Organizer",
    status: "Active",
    eventsCount: 12,
    avatar: "MR"
  },
  {
    id: "usr-2",
    name: "Tariqul Islam",
    email: "tariqul.islam@eventflow.org",
    role: "Staff",
    status: "Active",
    eventsCount: 4,
    avatar: "TI"
  },
  {
    id: "usr-3",
    name: "Farhan Ahmed",
    email: "farhan.ahmed@devsquad.com",
    role: "Staff",
    status: "Active",
    eventsCount: 3,
    avatar: "FA"
  },
  {
    id: "usr-4",
    name: "Tanvir Hasan",
    email: "tanvir.hasan@infraedge.net",
    role: "Staff",
    status: "Active",
    eventsCount: 3,
    avatar: "TH"
  },
  {
    id: "usr-5",
    name: "Zayd Karim",
    email: "zayd@imperialdecor.com",
    role: "Admin",
    status: "Active",
    eventsCount: 8,
    avatar: "ZK"
  },
  {
    id: "usr-6",
    name: "Dr. Salman Chowdhury",
    email: "salman.chowdhury@techasia.org",
    role: "Guest",
    status: "Active",
    eventsCount: 2,
    avatar: "SC"
  },
  {
    id: "usr-7",
    name: "Kamal Hossain",
    email: "kamal.hossain@cybernet.io",
    role: "Guest",
    status: "Active",
    eventsCount: 1,
    avatar: "KH"
  },
  {
    id: "usr-8",
    name: "Bashir Uddin",
    email: "bashir@gourmetcater.com",
    role: "Staff",
    status: "Active",
    eventsCount: 5,
    avatar: "BU"
  }
];

export const initialCategories = [
  { id: "cat-1", name: "Conference", count: 4, color: "blue", description: "Large professional, educational, or industry gatherings" },
  { id: "cat-2", name: "Wedding", count: 3, color: "amber", description: "Traditional ceremonies, banquets, and family celebrations" },
  { id: "cat-3", name: "Corporate", count: 5, color: "indigo", description: "Board meetings, investor mixers, and company retreats" },
  { id: "cat-4", name: "Cultural", count: 3, color: "emerald", description: "Music festivals, heritage exhibitions, and theater nights" },
  { id: "cat-5", name: "Workshop", count: 4, color: "purple", description: "Hands-on technical training, masterclasses, and bootcamps" },
  { id: "cat-6", name: "Seminar", count: 2, color: "cyan", description: "Academic talks, paper presentations, and research panels" },
  { id: "cat-7", name: "Birthday", count: 2, color: "rose", description: "Milestone anniversaries, birthday bashes, and private parties" },
  { id: "cat-8", name: "Other", count: 1, color: "slate", description: "Custom social gatherings and community meetups" }
];

export const initialActivities = [
  {
    id: "act-1",
    title: "Guest accepted invitation",
    description: "Dr. Salman Chowdhury confirmed attendance for Tech Conference 2026",
    timestamp: "10 minutes ago",
    type: "guest"
  },
  {
    id: "act-2",
    title: "Vendor booking confirmed",
    description: "Rafiqul Sound & Stage signed equipment rider for Main Auditorium",
    timestamp: "45 minutes ago",
    type: "vendor"
  },
  {
    id: "act-3",
    title: "Staff completed task",
    description: "Tanvir Hasan marked 'Confirm catering head count' as Done",
    timestamp: "2 hours ago",
    type: "task"
  },
  {
    id: "act-4",
    title: "New task assigned",
    description: "'Configure Livestream CDN & AV' assigned to Farhan Ahmed",
    timestamp: "3 hours ago",
    type: "task"
  },
  {
    id: "act-5",
    title: "Schedule updated",
    description: "Keynote speech duration adjusted to 75 minutes",
    timestamp: "5 hours ago",
    type: "schedule"
  }
];
