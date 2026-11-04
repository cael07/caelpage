// ==========================================================================
// CAEL HUB — APPLICATIONS CATALOG & 10-SCREEN INTERACTIVE GALLERY DATA
// ==========================================================================

function createSvgScreen(title, subtitle, category, themeColor, secondaryColor, widgets = []) {
  const c1 = themeColor || '#00f3ff';
  const c2 = secondaryColor || '#a855f7';
  
  let widgetXml = '';
  widgets.forEach((w, idx) => {
    const yPos = 240 + idx * 85;
    widgetXml += `
      <g transform="translate(60, ${yPos})">
        <rect width="880" height="70" rx="10" fill="#0c1633" stroke="${c1}" stroke-opacity="0.3" stroke-width="1.5" />
        <rect width="6" height="70" rx="3" fill="${idx % 2 === 0 ? c1 : c2}" />
        <text x="24" y="30" fill="#ffffff" font-family="'Inter', sans-serif" font-size="16" font-weight="700">${w.label || ''}</text>
        <text x="24" y="52" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="13">${w.desc || ''}</text>
        <rect x="730" y="18" width="130" height="34" rx="6" fill="${c1}" fill-opacity="0.15" stroke="${c1}" stroke-opacity="0.5" />
        <text x="795" y="40" fill="${c1}" font-family="'Inter', sans-serif" font-size="12" font-weight="700" text-anchor="middle">${w.value || 'ACTIVE'}</text>
      </g>
    `;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650" width="1000" height="650">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#050914" />
        <stop offset="50%" stop-color="#09132c" />
        <stop offset="100%" stop-color="#030611" />
      </linearGradient>
      <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${c1}" stroke-opacity="0.05" stroke-width="1" />
      </pattern>
    </defs>

    <!-- Deep Space Background -->
    <rect width="1000" height="650" fill="url(#bgGrad)" />
    <rect width="1000" height="650" fill="url(#grid)" />

    <!-- Cyber HUD Borders -->
    <rect x="20" y="20" width="960" height="610" rx="14" fill="none" stroke="${c1}" stroke-opacity="0.25" stroke-width="1.5" />
    <path d="M 20 50 L 50 20 M 950 20 L 980 50 M 20 600 L 50 630 M 950 630 L 980 600" stroke="${c1}" stroke-width="3" stroke-linecap="round" />

    <!-- Top Status Bar -->
    <rect x="40" y="35" width="920" height="45" rx="8" fill="#081024" stroke="#1e293b" />
    <circle cx="65" cy="57" r="6" fill="#10b981" />
    <text x="82" y="62" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="12" font-weight="600">CAEL OS v4.2 • QUANTUM SYNC: ONLINE</text>
    <rect x="740" y="44" width="105" height="26" rx="4" fill="${c1}" fill-opacity="0.15" stroke="${c1}" stroke-opacity="0.4" />
    <text x="792" y="61" fill="${c1}" font-family="'Inter', sans-serif" font-size="11" font-weight="700" text-anchor="middle">${category.toUpperCase()}</text>
    <text x="930" y="61" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="12" text-anchor="end">⚡ SUB-SECOND</text>

    <!-- Screen Title & Header Card -->
    <rect x="40" y="95" width="920" height="120" rx="12" fill="#0a142e" stroke="${c1}" stroke-opacity="0.4" />
    <path d="M 40 95 L 120 95" stroke="${c1}" stroke-width="4" />
    <text x="70" y="145" fill="url(#primaryGrad)" font-family="'Inter', sans-serif" font-size="28" font-weight="900" letter-spacing="1">${title.toUpperCase()}</text>
    <text x="70" y="180" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="15">${subtitle}</text>

    <!-- Center Interactive Content Widgets -->
    ${widgetXml}

    <!-- Bottom Telemetry HUD Line -->
    <rect x="40" y="585" width="920" height="35" rx="6" fill="#060d1f" />
    <text x="60" y="607" fill="#64748b" font-family="'Inter', sans-serif" font-size="11">LATENCY: 12ms • ENCRYPTION: 360° TLS 1.3 • BIOMETRIC GEOPROTECTION: ACTIVE</text>
    <text x="940" y="607" fill="${c1}" font-family="'Inter', sans-serif" font-size="11" font-weight="700" text-anchor="end">CAEL HUB ZERO-FEE ARCHITECTURE</text>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export const APPS_CATALOG = {
  ridehailing: {
    id: 'ridehailing',
    title: 'CAEL RIDE HAILING APP',
    badge: 'CAEL RIDE',
    subtitle: 'Ride Hailing, Courier & Delivery Service Mobile App',
    pitch: 'A free mobile app ready for your own business and own logo with sub-second GPS dispatch and in-app payroll.',
    gallery: [
      {
        image: './cael_ride_motorcycle_1791599622441.jpg?v=2',
        title: 'Motorcycle Taxi & Express Courier Fleet',
        tag: 'PRIMARY INTERFACE',
        desc: 'High-agility motorcycle taxi and on-demand parcel delivery workflow optimized for rapid urban navigation.'
      },
      {
        image: './ridehailing_mkt_hero.jpg',
        title: 'Passenger, Driver & Admin Super App Ecosystem',
        tag: 'ECOSYSTEM OVERVIEW',
        desc: 'Complete white-label ride hailing, motorcycle taxi, and express courier suite with sub-second GPS dispatch and cloud admin control.'
      },
      {
        image: './ridehailing_mkt_passenger.jpg',
        title: 'Multi-Service Passenger Booking App',
        tag: 'PASSENGER APP',
        desc: 'Sleek dark-mode passenger hub with one-tap mode selection for Motorcycle Taxi, Document Courier, and Private Car rides plus 24/7 live support.'
      },
      {
        image: './ridehailing_mkt_choose_ride.jpg',
        title: 'Real-Time GPS Route Pinning & Upfront Fares',
        tag: 'ROUTE & FARE ENGINE',
        desc: 'Interactive dual-pin pickup and drop-off map routing with transparent upfront pricing (e.g., MC Taxi ₱50) before booking confirmation.'
      },
      {
        image: './ridehailing_mkt_driver_mode.jpg',
        title: 'Driver Mode & Auto-Accept Dispatch Radar',
        tag: 'DRIVER CONSOLE',
        desc: 'High-contrast driver console featuring hands-free Auto-Accept Rides toggle, live GPS map, and instant Incoming Request cards.'
      },
      {
        image: './ridehailing_mkt_chat.jpg',
        title: 'Real-Time Free In-App Driver Messaging',
        tag: 'IN-APP CHAT ENGINE',
        desc: 'Zero-cost real-time WebSocket messaging drawer between passenger and assigned driver overlaid directly on the active route map.'
      },
      {
        image: './ridehailing_mkt_doc_proof.jpg?v=2',
        title: '3-Way Verified Document & Parcel Delivery Proof',
        tag: 'COURIER PROOF',
        desc: 'End-to-end delivery accountability capturing Item Dispatch Photo, Receiver Handover Photo, and on-screen Digital E-Signature.'
      },
      {
        image: './ridehailing_mkt_admin.jpg?v=2',
        title: 'Complete Administration System with Revenue, Fleet & Workforce',
        tag: 'ENTERPRISE ADMIN',
        desc: 'Unified command dashboard tracking Total Income Fees, Load Wallet revenue, Completed Rides, System Balance Timeline, HR Attendance, and Payroll.'
      }
    ],
    features: [
      { title: 'Administrative, Workforce & Operation Portal', desc: 'Centralized cloud dashboard to manage drivers, verify vehicle documents, assign shifts, and oversee city-wide operational zones.' },
      { title: 'Automated Time Attendance & Payroll System', desc: 'Drivers clock in with biometric facial verification and GPS geofence validation. Fares and commissions are calculated and disbursed automatically.' },
      { title: 'Dedicated Driver Dispatch & Turn-by-Turn Navigation', desc: 'Custom high-contrast driver application with instant ride alerts, audio navigation, offline map routing, and earnings meters.' },
      { title: 'Passenger On-Demand Booking & Sub-Second Tracking', desc: 'Sleek passenger interface with pickup/dropoff selection, live vehicle arrival countdown, route preview, and upfront pricing.' },
      { title: 'Realtime Customer Support & Emergency SOS', desc: 'Integrated panic button broadcasting instant GPS coordinates to emergency dispatch and family contacts with ambient audio recording.' },
      { title: 'Multi-Tier Vehicle Classification', desc: 'Support for motorcycle taxis, sedans, 6-seater MPVs, delivery vans, and courier parcels under a single unified platform.' },
      { title: 'Surge Pricing & Dynamic Waybill Invoicing', desc: 'Configurable automated surge tariffs based on weather, peak rush hours, and local demand without third-party commission cuts.' },
      { title: 'Cashless Digital Wallet & Instant Payouts', desc: 'Seamless QR payments, credit card processing, cash-on-delivery logging, and zero-fee driver wallet top-ups.' }
    ],
    details: {
      overview: 'Cael Ride is an enterprise-grade on-demand transport and courier platform engineered to empower entrepreneurs to launch their own branded ride-hailing business for free. Packed with sub-second GPS telematics and an autonomous operational core, it eliminates the need for expensive SaaS subscriptions.',
      workforce: 'Equipped with in-app biometric attendance, geofenced shift logging, automated trip compensation, and real-time ledger accounting. Drivers never need to submit manual trip sheets, and management enjoys full visibility into driver hours and road safety compliance.',
      monetization: '100% white-label ready. Apply your own business logo, custom color palette, local tariffs, and operator commission rates. Keep all profits without paying per-seat or per-ride licensing fees to overseas corporations.',
      security: '360° Bank-grade security architecture with end-to-end TLS 1.3 encryption, passenger identity verification, geofenced route deviation monitors, and tamper-proof financial transaction logs.'
    },
    specs: [
      { label: 'Supported Platforms', value: 'Native Android (Kotlin/Jetpack), iOS (Swift), Web PWA' },
      { label: 'GPS Precision', value: 'Sub-second latency (<250ms), sub-meter accuracy with dead-reckoning' },
      { label: 'Workforce Engine', value: 'Biometric facial clocking, geofenced shifts, automated payroll' },
      { label: 'Security & Encryption', value: '360° TLS 1.3, AES-256 at rest, GDPR & DPA compliant' },
      { label: 'Backend Architecture', value: 'Node.js Fastify / Python Microservices / Redis Geohash' },
      { label: 'Database & Sync', value: 'PostgreSQL with PostGIS geospatial indexing, WebSockets' },
      { label: 'Offline Resilience', value: 'Offline trip caching with auto-reconciliation on signal recovery' },
      { label: 'Licensing Model', value: '100% Free Ecosystem for Business Dreamers' }
    ]
  },

  timelock: {
    id: 'timelock',
    title: 'CAEL CHILD TIME LOCK',
    badge: 'CAEL TIME LOCK',
    subtitle: 'Protect Child From Phone Overuse And Misuse',
    pitch: 'A free mobile app to solve your child\'s phone overuse, screen addiction, and late-night gaming problems.',
    gallery: [
      {
        image: './timelock.jpg?v=2',
        title: 'Active Child Lock Screen & Parental Protection',
        tag: 'ACTIVE LOCK SCREEN',
        desc: 'Real-time child device lock screen disabling touch input with custom sleep messages and parent-only unlock protection.'
      },
      {
        image: './timelock_mkt_home.jpg',
        title: 'Timelock Home Page — Parent & Child Mode Selection',
        tag: 'HOME PAGE',
        desc: 'Unified role selection screen allowing instant setup as either Parent Mode (remote controller) or Child Mode (protected device).'
      },
      {
        image: './timelock_mkt_parent_dashboard.jpg',
        title: 'Parent Dashboard & Link Child Device',
        tag: 'PARENT DASHBOARD',
        desc: 'Centralized parent control hub displaying unique 9-digit Parent ID, Global Lock Message, Linked Devices list, and 1-tap Remotely Lock Child.'
      },
      {
        image: './timelock_mkt_child_dashboard.jpg',
        title: 'Child Dashboard & Unique Pairing Code',
        tag: 'CHILD DASHBOARD',
        desc: 'Child device setup screen featuring its 9-digit Unique Pairing Code, verified Connected Parent status, and Instant Manual Lock button.'
      },
      {
        image: './timelock_mkt_lock_screen.jpg',
        title: 'Timelock Lock Screen — Touch Screen Disabled',
        tag: 'LOCK SCREEN',
        desc: 'Full-screen hardware lockout interface disabling touch screen actions while displaying current time, custom parent prompt, and Parent Unlock.'
      },
      {
        image: './timelock_mkt_bedtime.jpg',
        title: 'Child Bedtime Auto Lock & Auto Open Schedule',
        tag: 'BEDTIME AUTO LOCK',
        desc: 'Automated schedule configuration with Bedtime Lock Enabled toggle, Lock Start Time (Activate), and Lock End Time (Deactivate).'
      },
      {
        image: './timelock_mkt_remote_capture.jpg',
        title: 'Parent Remote Child Screen Capture',
        tag: 'REMOTE SCREEN CAPTURE',
        desc: 'On-demand live screen capture command delivering an instant Recent Capture Received preview of the child\'s active phone screen.'
      },
      {
        image: './timelock_mkt_captures_gallery.jpg',
        title: 'Remote Capture Child Screenshot History',
        tag: 'SCREENSHOT GALLERY',
        desc: 'Visual gallery of captured child device screenshots (Captures: John) allowing parents to review active apps, games, and browsing.'
      },
      {
        image: './timelock_mkt_location.jpg',
        title: 'Mother Remote Child Location & Live Map',
        tag: 'REMOTE CHILD LOCATION',
        desc: 'Real-time GPS location pin and Last Known Address lookup for the child\'s phone with 1-tap navigation via Google Maps or Waze.'
      },
      {
        image: './timelock_mkt_go_to_child.jpg',
        title: 'Parent Go To Child Turn-by-Turn Navigation',
        tag: 'GO TO CHILD',
        desc: 'Live turn-by-turn street navigation guiding the parent directly to the child\'s real-time GPS coordinates with arrival ETA and distance.'
      }
    ],
    features: [
      { title: 'Multiple Child Phone Management', desc: 'Control and monitor multiple devices from a single parent phone with individualized age-appropriate rules.' },
      { title: 'Remote Parental Device Control & Oversight', desc: 'Adjust rules, grant extra time, or freeze devices remotely from anywhere in the world.' },
      { title: 'Automated Bedtime & Sleep Schedule Lockout', desc: 'Ensure consistent sleep by locking social and gaming apps automatically every evening.' },
      { title: 'Instant On-Demand Remote Device Lockout', desc: 'Freeze child screens instantly during dinner, study sessions, or family time with custom messages.' },
      { title: 'Remote Screen Capture & Activity Monitoring', desc: 'Inspect current app usage and verify activities with encrypted parent-only snapshot requests.' },
      { title: 'Granular App & Web Category Firewall', desc: 'Permit unlimited educational and school apps while enforcing strict daily caps on social media.' },
      { title: 'Gamified Chore & Homework Reward Engine', desc: 'Empower children to earn extra playtime by reading books, finishing chores, and completing homework.' },
      { title: 'Tamper-Proof Anti-Uninstall Security', desc: 'Device Admin and Accessibility enforcement ensures the app cannot be disabled or uninstalled.' }
    ],
    details: {
      overview: 'Cael Child Time Lock solves modern screen addiction by giving parents flexible, respectful, yet unbreachable oversight over their children\'s mobile habits. Completely free of subscription fees and advertising tracking.',
      workforce: 'Parents pair child handsets via a simple 5-second QR code handshake. Once paired, cloud rules synchronize in real time over cellular or Wi-Fi networks.',
      monetization: '100% Free. No monthly paywalls, no in-app purchases required to unlock basic features. Gives every family the tools to cultivate healthy digital balance.',
      security: 'Child privacy is paramount. Usage statistics and screenshots are encrypted end-to-end with the parent\'s personal key and never sold to third-party ad networks.'
    },
    specs: [
      { label: 'Supported Platforms', value: 'Android (Device Owner / Accessibility API), iOS (Screen Time API)' },
      { label: 'Sync Latency', value: 'Under 350ms instant command execution over 4G/5G/Wi-Fi' },
      { label: 'Battery Consumption', value: 'Ultra-optimized low background drain (<1.4% per 24 hours)' },
      { label: 'Security & Anti-Tamper', value: 'Knox / Device Administrator lockdown, Factory Reset shield' },
      { label: 'Parent Device Pairing', value: 'Zero-configuration QR code handshake, multi-child grouping' },
      { label: 'Data Privacy', value: 'Zero ad telemetry, client-side encryption, COPPA compliant' },
      { label: 'Emergency Override', value: 'Always-accessible emergency contact whitelist (911/Parents)' },
      { label: 'Cost to Family', value: '100% Free Enterprise-Grade Mobile Application' }
    ]
  },

  childzones: {
    id: 'childzones',
    title: 'CAEL CHILD SAFETY ZONES',
    badge: 'CAEL SAFETY ZONES',
    subtitle: 'Child Realtime Safety Zones and Alerts',
    pitch: 'A free mobile app to make you worry-free from your child\'s safety in real-time with GPS perimeter radar.',
    gallery: [
      {
        image: './childlogin.jpg?v=3',
        title: 'SafeTrack Real-Time Family Safety Radar & Map',
        tag: 'PRIMARY INTERFACE',
        desc: 'Interactive live satellite map showing real-time location pins for all family members with geofence rings.'
      },
      {
        image: './safetrack_mkt_mother_dashboard.jpg',
        title: 'Mother Dashboard & Linked Child Device',
        tag: 'PARENT DASHBOARD',
        desc: 'Parent command center displaying unique Parent ID, linked children list (Jane), camera actions, and quick zone tracking controls.'
      },
      {
        image: './safetrack_mkt_child_dashboard.jpg',
        title: 'Child Dashboard & Active Protection Status',
        tag: 'CHILD DASHBOARD',
        desc: 'Child device interface showing active geofence protection status, device ID, connected parent ID, and tamper-proof uninstall lock.'
      },
      {
        image: './safetrack_mkt_create_safe_zones.jpg',
        title: 'Parent Create & Manage Safe Zones',
        tag: 'SAFE ZONES',
        desc: 'Set up circular geofence perimeters and linear corridors around home, school, tuition centers, and approved walking routes.'
      },
      {
        image: './safetrack_mkt_locate_child.jpg',
        title: 'Parent Locate Child on Real-Time Map',
        tag: 'LIVE CHILD LOCATE',
        desc: 'Sub-second satellite GPS map showing child\'s exact position with avatar pin, street landmarks, and current address bar.'
      },
      {
        image: './safetrack_mkt_create_line_path.jpg',
        title: 'Create Safe Corridor & Line Path Route',
        tag: 'SAFE PATH CORRIDOR',
        desc: 'Draw approved commuting corridors on the live interactive map from school to home with path deviation detection.'
      },
      {
        image: './safetrack_mkt_safety_map.jpg',
        title: 'SafeTrack Interactive Safety Map Engine',
        tag: 'SAFETY MAP ENGINE',
        desc: 'Comprehensive interactive map console featuring active geofence rings, child avatar telemetry, and address decoding.'
      },
      {
        image: './safetrack_mkt_child_out_of_zone.jpg',
        title: 'Child Out of Safe Zone Geofence Breach',
        tag: 'PERIMETER BREACH',
        desc: 'Visual perimeter breach indicator illustrating when child moves beyond the designated circular safe boundary.'
      },
      {
        image: './safetrack_mkt_parent_alerted.jpg',
        title: 'Parent Real-Time Out of Safe Zone Alerts',
        tag: 'BREACH NOTIFICATION',
        desc: 'High-priority red alert cards delivered immediately to parent phone showing timestamp, child name, and breach address.'
      },
      {
        image: './safetrack_mkt_camera_gallery.jpg',
        title: 'Remote Child Camera Capture Front & Back Gallery',
        tag: 'CAMERA CAPTURE',
        desc: 'Remote parent-triggered camera snapshots capturing front and back views with 24-hour image history gallery.'
      }
    ],
    features: [
      { title: 'Create Unlimited Safe Zones', desc: 'Draw unlimited virtual safety zones around home, school, grandparents\' residence, and sports centers.' },
      { title: 'Create Safe Corridors & Commute Routes', desc: 'Define approved walking routes from school to home with deviation alarms if the child leaves the designated corridor.' },
      { title: 'Real-Time Perimeter Breach Alerts', desc: 'Instant siren notifications sent to parents\' phones if the child steps outside the safe boundary or if the phone is switched off.' },
      { title: 'Precise Real-Time GPS Tracking', desc: 'Sub-second multi-satellite GNSS tracking delivering accurate coordinates with 1.8-meter precision.' },
      { title: 'Auto Camera Capture If Stolen', desc: 'Automatic front-camera snapshot taken and uploaded to parents\' cloud dashboard upon unauthorized handling.' },
      { title: 'Silent Covert SOS Distress Beacon', desc: 'Triple-tap power button trigger immediately transmits emergency coordinates and live microphone audio.' },
      { title: 'Device Battery & Shutdown Telemetry', desc: 'Receive advance warnings when battery is low and capture final GPS pin before phone powers off.' },
      { title: '90-Day Route Playback History', desc: 'Inspect full historical breadcrumb trails to verify past commutes and after-school destinations.' }
    ],
    details: {
      overview: 'Child Safety Zones is an advanced real-time geofence and family telematics mobile platform built to protect children from route deviation, kidnapping incidents, and disorientation. Free for all families worldwide.',
      workforce: 'Equipped with background geofence engines that monitor location without burning handset battery. Alerts trigger in under 500ms across LTE and Wi-Fi networks.',
      monetization: '100% Free Ecosystem. No monthly subscriptions, no fees for setting unlimited geofence zones, and no advertisements.',
      security: 'End-to-end military grade encryption. Only authorized family members hold cryptographic keys to view child location data.'
    },
    specs: [
      { label: 'GPS Precision', value: 'Dual-frequency GNSS (GPS, GLONASS, Galileo) ±1.8m accuracy' },
      { label: 'Geofence Trigger Latency', value: '<500ms perimeter entry/exit notification trigger' },
      { label: 'Battery Impact', value: 'Dynamic geofencing engine uses <2% battery over 24-hour cycle' },
      { label: 'Security & Privacy', value: '360° TLS 1.3 cryptographic tunnel, private guardian keys' },
      { label: 'Emergency Modes', value: 'Silent SOS beacon, live ambient audio stream, auto-camera' },
      { label: 'Offline Backup', value: 'Encrypted SMS fallback when cellular mobile data is disconnected' },
      { label: 'Multi-Guardian Support', value: 'Unlimited trusted family circle members (Mom, Dad, Grandparents)' },
      { label: 'Licensing Model', value: '100% Free Mobile Application for All Families' }
    ]
  },

  massageservice: {
    id: 'massageservice',
    title: 'CAEL MASSAGE SERVICE APP',
    badge: 'CAEL MASSAGE APP',
    subtitle: 'On-Demand Spa & Home Massage Service',
    pitch: 'A free mobile app ready for your own massage & wellness service business with therapist dispatch and payroll.',
    gallery: [
      {
        image: './massageservice.jpg?v=3',
        title: 'Spa & Home Massage Booking Interface',
        tag: 'HERO SHOWCASE',
        desc: 'Elegant mobile client app allowing clients to book home massages, choose certified therapists, and track arrival in real-time.'
      },
      {
        image: './cael_massage_mkt_admin_dashboard.jpg',
        title: 'Admin Command Center & Revenue Operations',
        tag: 'ADMIN & FLEET COMMAND',
        desc: 'Comprehensive web-based command console to manage therapist rosters, duty shifts, multi-branch coverage, and live daily revenues.'
      },
      {
        image: './cael_massage_mkt_client_dashboard.jpg',
        title: 'Intuitive Client Home & Treatment Discovery',
        tag: 'CLIENT DISCOVERY HUB',
        desc: 'Clean mobile client portal allowing customers to explore specialized wellness packages, browse top-rated therapists, and book in seconds.'
      },
      {
        image: './cael_massage_mkt_realtime_booking.jpg',
        title: 'Dynamic Real-Time Booking & Custom Oils',
        tag: 'DYNAMIC BOOKING ENGINE',
        desc: 'Tailor every appointment with custom durations, organic essential oils (Lavender, Eucalyptus), and target muscle tension zones.'
      },
      {
        image: './cael_massage_mkt_massager_to_client.jpg',
        title: 'Therapist Turn-by-Turn GPS Navigation HUD',
        tag: 'THERAPIST GPS NAVIGATION',
        desc: 'Dedicated therapist transit console offering turn-by-turn routing with traffic avoidance, client residence notes, and 1-tap arrival check-in.'
      },
      {
        image: './cael_massage_mkt_realtime_tracking.jpg',
        title: 'Real-Time Radar & Live Therapist ETA Countdown',
        tag: 'LIVE RADAR TRACKER',
        desc: 'Clients watch the assigned therapist approach on an interactive satellite map with continuous sub-second GPS updates and arrival timer.'
      },
      {
        image: './cael_massage_mkt_realtime_chatting.jpg',
        title: 'Encrypted In-App Chat & Arrival Coordination',
        tag: 'SECURE IN-APP CHAT',
        desc: 'Private messaging allowing clients and therapists to communicate gate codes, elevator access, and room setup without sharing personal phone numbers.'
      },
      {
        image: './cael_massage_mkt_video_call_safety.jpg',
        title: 'Dual Safety Pre-Arrival Video Call Verification',
        tag: 'DUAL SAFETY VIDEO CALL',
        desc: 'Industry-first face-to-face video verification protocol confirming therapist credentials, uniform, and residential safety before home entry.'
      },
      {
        image: './cael_massage_mkt_write_review.jpg',
        title: '5-Star Service Rating & Direct Cashless Tipping',
        tag: 'FEEDBACK & REVIEWS',
        desc: 'Post-service rating screen allowing clients to review technique, award 100% direct tips with zero platform fee, and bookmark to favorites.'
      },
      {
        image: './cael_massage_mkt_favorite_rebooking.jpg',
        title: 'Curated Favorites Hub & 1-Tap VIP Rebooking',
        tag: 'FAVORITE THERAPIST HUB',
        desc: 'Quickly access saved go-to therapists with live duty status indicators and 1-tap express rebooking using saved preferences.'
      }
    ],
    features: [
      { title: 'Admin & Multi-Branch Management Portal', desc: 'Manage clinic branches, therapist rosters, operating hours, and customer bookings from a unified dashboard.' },
      { title: 'Therapist Portal with Live GPS Navigation', desc: 'Turn-by-turn navigation with dynamic traffic avoidance and 1-tap client arrival notification.' },
      { title: 'Client On-Demand Booking & Service Selection', desc: 'Clients browse Swedish, Deep Tissue, Shiatsu, and Aromatherapy services with transparent upfront prices.' },
      { title: 'Real-Time Therapist Dispatch & Satellite Radar', desc: 'Sub-second GPS routing provides clients with live map arrival countdowns and traffic updates.' },
      { title: 'Dual Safety Pre-Arrival Video Call Verification', desc: 'Face-to-face identity check protects both clients and therapists before home entry.' },
      { title: 'Encrypted In-App Chat & Private Coordination', desc: 'Clients and therapists coordinate gate passes and room setup without sharing private numbers.' },
      { title: '5-Star Review System & 100% Direct Digital Tips', desc: 'Transparent client rating engine with cashless tipping credited directly to therapist wallets.' },
      { title: 'Favorites Hub & 1-Tap Express Rebooking', desc: 'Bookmark preferred practitioners for instant 1-tap rebooking and live availability monitoring.' }
    ],
    details: {
      overview: 'Cael Massage Service App provides spa owners, licensed massage therapists, and wellness entrepreneurs with a complete turnkey mobile ecosystem. Supports both home-service house calls and salon appointment bookings.',
      workforce: 'Eliminate manual commission spreadsheets. The built-in attendance and payroll engine calculates therapist percentages, transport reimbursements, and client tips automatically after every completed session.',
      monetization: 'Ready for your own business brand. Customize logos, service categories, pricing packages, and operating territories without ongoing platform commissions.',
      security: 'Privacy-first architecture with masked VoIP communications, secure digital health questionnaires, and customer emergency panic buttons for lone therapists.'
    },
    specs: [
      { label: 'Supported Platforms', value: 'Native Android, iOS, Desktop Web Receptionist Portal' },
      { label: 'Booking Modes', value: 'On-Demand Immediate Dispatch & Scheduled Advance Bookings' },
      { label: 'Workforce Engine', value: 'Biometric clocking, automated commission split, tip ledger' },
      { label: 'GPS Precision', value: 'Real-time therapist location updates with sub-second ETA sync' },
      { label: 'Privacy & Comms', value: 'Masked VoIP telephone tunnel, encrypted in-app chat' },
      { label: 'Payment Gateway', value: 'Credit/Debit, QR digital wallet, and Cash on Finish logging' },
      { label: 'Health Compliance', value: 'Digital consultation questionnaire & contraindication alerts' },
      { label: 'Licensing Model', value: '100% Free Mobile Application Suite' }
    ]
  },

  truckdelivery: {
    id: 'truckdelivery',
    title: 'CAEL TRUCKING DELIVERY APP',
    badge: 'CAEL TRUCKING APP',
    subtitle: 'Heavy Cargo & Commercial Freight Dispatch',
    pitch: 'A free mobile app ready for your commercial trucking, freight, and cargo logistics business.',
    gallery: [
      {
        image: './truckdelivery.jpg?v=6',
        title: 'Heavy Cargo Fleet & Freight Dispatch Hub',
        tag: 'HERO SHOWCASE',
        desc: 'Enterprise logistics console with real-time delivery monitoring showing active cargo routing, consignee ETA, and CAEL Haulers branding.'
      },
      {
        image: './cael_truck_mkt_admin_tracking.jpg',
        title: 'Fleet Satellite Radar & Real-Time Tracking',
        tag: 'FLEET SATELLITE RADAR',
        desc: 'Central web console tracking active commercial trucks, route lines, highway speeds, cargo weight, and live arrival ETAs.'
      },
      {
        image: './cael_truck_mkt_admin_booking.jpg',
        title: 'Commercial Freight Booking & Vehicle Allocation',
        tag: 'CARGO BOOKING DISPATCH',
        desc: 'Schedule recurring distributor shipments, auto-match vehicle tonnage and capacity, and issue digital bills of lading.'
      },
      {
        image: './cael_truck_mkt_admin_finance.jpg',
        title: 'Financial Ledger & Route Profitability Audit',
        tag: 'FLEET FINANCIAL LEDGER',
        desc: 'Real-time freight accounting tracking gross billings, diesel fuel receipts, highway RFID tolls, and net profitability per haul.'
      },
      {
        image: './cael_truck_mkt_owner_monitoring.jpg',
        title: 'Truck Owners & Driver Roster Management',
        tag: 'OWNER-OPERATOR COMMAND',
        desc: 'Operator dashboard monitoring driver safety scorecards, preventative maintenance intervals, and automated commission splits.'
      },
      {
        image: './cael_truck_mkt_dispatch_cockpit.jpg',
        title: 'Yard Dispatch & Warehouse Dock Cockpit',
        tag: 'YARD DISPATCH COCKPIT',
        desc: 'Ruggedized tablet console for warehouse dock masters to inspect truck seals, allocate loading bays, and dispatch standby drivers.'
      },
      {
        image: './cael_truck_mkt_client_booking.jpg',
        title: 'Client Truck Class Booking & Freight Quotes',
        tag: 'CLIENT FREIGHT BOOKING',
        desc: 'Mobile app for commercial shippers to choose vehicle size, select immediate or scheduled dispatch, and lock in upfront rates.'
      },
      {
        image: './cael_truck_mkt_delivery_monitoring.jpg',
        title: 'Real-Time Cargo Delivery & Live ETA Radar',
        tag: 'LIVE DELIVERY RADAR',
        desc: 'Consignee live delivery tracking displaying sub-second truck GPS, driver verified credentials, and CAEL Haulers branding.'
      },
      {
        image: './cael_truck_mkt_pickup_tracking.jpg',
        title: 'Pickup Approach Radar & Dock Preparation',
        tag: 'PICKUP APPROACH RADAR',
        desc: 'Shipper-facing tracking screen displaying truck transit to warehouse origin so loading crews can stage freight prior to arrival.'
      },
      {
        image: './cael_truck_mkt_chat_call.jpg',
        title: 'Encrypted In-App Dispatch & Driver Calling',
        tag: 'SECURE DISPATCH CHAT',
        desc: 'Encrypted messaging bridge connecting dispatchers, shippers, and truckers to share gate passes, seal photos, and voice directions.'
      }
    ],
    features: [
      { title: 'Fleet & Multi-Truck Dispatch Operations', desc: 'Centrally oversee flatbeds, 10-wheelers, refrigerated reefers, and container chassis across multiple dispatch yards.' },
      { title: 'Cargo Booking, Waybill & Weight Rate Calculator', desc: 'Automated distance, weight, and volume tariff computation with instantly generated Bill of Lading documents.' },
      { title: 'Driver Live GPS Routing & Truck Height Restrictions', desc: 'Turn-by-turn commercial navigation avoiding low bridges, tight residential streets, and axle weight bans.' },
      { title: 'Digital Proof of Delivery & E-Signature Capture', desc: 'Capture container seal photos, consignee touchscreen signatures, and geo-stamped delivery certificates.' },
      { title: 'Driver Electronic Logbook (ELD) & Shift Clocking', desc: 'Biometric driver check-in with automatic driving-hours tracking to prevent fatigue and ensure regulatory compliance.' },
      { title: 'Automated Per-Mile & Per-Ton Freight Payroll', desc: 'Eliminate manual trip settlements with automated mileage pay, tonnage bonuses, and fuel reimbursement logs.' },
      { title: 'Live Cargo Temperature & Trailer Sensor Telemetry', desc: 'IoT monitoring for refrigerated cargo, trailer doors, and shock sensors with automatic deviation alerts.' },
      { title: 'Weigh Station & Expense Slip OCR Scanner', desc: 'Scan weigh station receipts and fuel slips with camera OCR to automatically update logistics expense ledgers.' }
    ],
    details: {
      overview: 'Cael Trucking Delivery App provides commercial freight carriers, independent truckers, and logistics forwarders with an enterprise transport management system at zero software cost.',
      workforce: 'Modernize driver compensation and compliance. Drivers clock in biometrically, log mandatory rest breaks on digital ELD interfaces, and receive automated per-kilometer trip disbursements.',
      monetization: 'White-label ready for your trucking enterprise. Brand the shipper tracking portal and driver apps with your company name, color scheme, and freight tariffs.',
      security: '360° Industrial security with digital BOL verification, tamper-evident e-signatures, GPS container geofencing, and automated incident broadcasting.'
    },
    specs: [
      { label: 'Supported Platforms', value: 'Android (Ruggedized In-Cab Tablets), iOS, Web Dispatch Center' },
      { label: 'Navigation Engine', value: 'Commercial truck routing with axle, height, weight, and hazmat profiles' },
      { label: 'Logistics Hardware', value: 'Compatible with OBD-II / J1939 CAN bus and Bluetooth TPMS sensors' },
      { label: 'Workforce Engine', value: 'Digital ELD logbook, biometric shift clocking, per-km payroll ledger' },
      { label: 'Proof of Delivery', value: 'High-res seal photo capture, GPS coordinate tag, touch signature' },
      { label: 'Document System', value: 'Automated PDF Bill of Lading (BOL), Waybill, and Freight Invoicing' },
      { label: 'Tracking Latency', value: 'Sub-second real-time satellite updates shareable with cargo consignees' },
      { label: 'Licensing Model', value: '100% Free Ecosystem for Commercial Freight Operators' }
    ]
  },

  colorgame: {
    id: 'colorgame',
    title: 'CAEL TWO COLOR GAME APP',
    badge: 'CAEL COLOR GAME',
    subtitle: 'Interactive Two-Color Betting & Entertainment App',
    pitch: 'A free mobile app ready for your own interactive color guessing and community game business.',
    gallery: [
      {
        image: './colorgame.jpg',
        title: 'Two-Color Red & White Arena',
        tag: 'GAME ARENA',
        desc: 'Vibrant modern gaming arena featuring dynamic round betting between Red and White with real-time pools.'
      },
      {
        image: './two_color_wheel_1791725698392.jpg',
        title: 'Physics-Based Spinning Color Wheel Arena',
        tag: 'COLOR WHEEL',
        desc: 'Stunning 3D rendered dual-color spinning wheel with smooth physics decel and provably fair landing.'
      },
      {
        image: './two_color_game_1791725308774.jpg',
        title: 'Interactive Live Bet Pool, Odds & Player HUD',
        tag: 'LIVE BET POOL',
        desc: 'Real-time betting chips, dynamic pool distribution bar, and live multipliers updated every round.'
      },
      {
        image: createSvgScreen(
          'Instant Payout E-Wallet & Real-Time Balance',
          'Immediate winning balance crediting with zero processing fees and instant withdrawals',
          'Fintech Wallet',
          '#10b981',
          '#f59e0b',
          [
            { label: 'Player Wallet Available Balance', desc: 'Secure digital wallet balance ready for live round betting or cashout', value: '₱4,820.50' },
            { label: 'Last Round Winning Payout', desc: 'Placed ₱500 on RED (2.0x Multiplier) • Instant Payout: +₱1,000.00', value: '+₱1,000.00 WON' },
            { label: 'Deposit / Cash-In Channels', desc: 'Instant QR code, bank transfer, and verified community agent top-ups', value: 'INSTANT QR' },
            { label: 'Cashout Request Processing', desc: 'Automated payout processed in under 15 seconds to player GCash/Maya', value: '< 15s PAYOUT' }
          ]
        ),
        title: 'Instant Automated Payout E-Wallet',
        tag: 'E-WALLET PAYOUT',
        desc: 'Instant winning credits, transparent transaction ledger, and sub-15-second cashout processing.'
      },
      {
        image: createSvgScreen(
          'Game Round History, Probability & Statistics',
          'Detailed trend roadmaps, streak counters, and statistical frequency charts',
          'Game Stats',
          '#3b82f6',
          '#00f3ff',
          [
            { label: 'Last 100 Rounds Distribution', desc: 'Red: 51 Rounds (51%) • White: 49 Rounds (49%) • Perfect fair balance', value: '51% RED / 49% WHT' },
            { label: 'Current Active Streak', desc: 'RED has won 3 consecutive rounds • Historical max streak: 8 rounds', value: '3x RED STREAK' },
            { label: 'Community Bet Volume', desc: 'Total community chips placed on current active round: ₱128,400', value: '₱128,400 POOL' },
            { label: 'Big Winner Leaderboard', desc: 'Top daily winner: Player @LuckyAce77 (+₱42,000.00 won today)', value: 'TOP WINNER' }
          ]
        ),
        title: 'Round History, Probabilities & Streaks',
        tag: 'STATISTICS HUD',
        desc: 'Visual trend roadmaps, hot/cold streak analysis, and real-time community pool distribution.'
      },
      {
        image: createSvgScreen(
          'Multiplayer Live Chat & Winner Celebration Ticker',
          'Interactive community chat with animated victory emojis and winning announcements',
          'Live Social',
          '#a855f7',
          '#f59e0b',
          [
            { label: 'Live Active Players Online', desc: '1,420 Players currently connected to live round broadcast room', value: '1,420 ONLINE' },
            { label: 'Winner Announcement Ticker', desc: 'Player @CryptoKing won ₱10,000 on RED (Round #492)', value: '₱10,000 WIN' },
            { label: 'Community Chat Room', desc: 'Encrypted low-latency chat with animated reaction stickers', value: 'ACTIVE CHAT' },
            { label: 'Community Tip & Rain System', desc: 'Big winners can trigger lucky coin rains for the community', value: 'COIN RAIN READY' }
          ]
        ),
        title: 'Multiplayer Live Chat & Winner Ticker',
        tag: 'COMMUNITY CHAT',
        desc: 'Social community chat room with real-time victory announcements, emotes, and celebratory coin rain.'
      },
      {
        image: createSvgScreen(
          'Provably Fair RNG Engine & Seed Verifier',
          'SHA-256 cryptographic verification allows players to audit round fairness independently',
          'Fairness Audit',
          '#00f3ff',
          '#10b981',
          [
            { label: 'Server Seed Hash (Pre-committed)', desc: 'SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', value: 'VERIFIED HASH' },
            { label: 'Client Seed (Community Generated)', desc: 'Player client seed combined with server seed prior to wheel spin', value: 'CLIENT SEED' },
            { label: 'Cryptographic Round Integrity', desc: 'Outcome mathematically impossible to manipulate or predict by operator', value: 'PROVABLY FAIR' },
            { label: 'Audit Verification Tool', desc: 'Built-in verifier lets players paste hashes to confirm results anytime', value: 'OPEN VERIFIER' }
          ]
        ),
        title: 'Provably Fair RNG & SHA-256 Verifier',
        tag: 'PROVABLY FAIR',
        desc: 'Cryptographic proof of fairness: players can verify every spin was random and unmanipulated.'
      },
      {
        image: createSvgScreen(
          'Operator Revenue Ledger & Agent Commission',
          'Complete financial dashboard tracking gross bets, house hold, and agent referral cuts',
          'Admin Ledger',
          '#10b981',
          '#a855f7',
          [
            { label: 'Today Total Bets Placed', desc: 'Gross volume wagered across 240 completed rounds today', value: '₱342,800.00' },
            { label: 'Total Player Winnings Paid', desc: 'Automated instant payouts settled to winning player wallets', value: '₱325,660.00' },
            { label: 'Operator Net Gross Revenue', desc: 'Net house earnings retained with 0% software royalty deductions', value: '₱17,140.00 NET' },
            { label: 'Agent Referral Network', desc: 'Multi-level agent commission tier automatically distributed', value: 'AGENT PAYOUTS OK' }
          ]
        ),
        title: 'Operator Revenue Ledger & Agent Cuts',
        tag: 'OPERATOR LEDGER',
        desc: 'Comprehensive operator revenue reporting with automated agent affiliate commission splits.'
      },
      {
        image: createSvgScreen(
          'Daily Attendance Login Bonus & Lucky Wheel',
          'Engage and retain players with daily check-in rewards and streak incentives',
          'Player Retention',
          '#f59e0b',
          '#00f3ff',
          [
            { label: 'Day 5 Consecutive Check-In', desc: 'Daily attendance reward claimed: +50 Free Community Chips', value: '+50 CHIPS' },
            { label: 'Free Daily Lucky Wheel Spin', desc: 'Every player gets 1 free lucky spin every 24 hours to win bonus coins', value: '1 SPIN READY' },
            { label: 'Weekly VIP Loyalty Level', desc: 'Player tier: Silver VIP (Earns 5% weekly cashback on net losses)', value: 'SILVER VIP' },
            { label: 'Achievement Quests', desc: 'Win 5 rounds on RED to unlock custom animated victory avatar border', value: 'QUEST: 3/5' }
          ]
        ),
        title: 'Daily Attendance Bonus & Lucky Spins',
        tag: 'ATTENDANCE REWARDS',
        desc: 'Daily check-in bonuses, free wheel spins, and VIP loyalty tiers that keep players engaged daily.'
      },
      {
        image: createSvgScreen(
          'Anti-Fraud Safeguards & Responsible Gaming',
          'Real-time fraud prevention, bot detection, table bet limits, and player protection',
          'Anti-Fraud',
          '#ef4444',
          '#3b82f6',
          [
            { label: 'Bot & Multi-Account Detection', desc: 'Device fingerprinting and IP heuristics prevent bot collusion', value: '0 BOTS DETECTED' },
            { label: 'Table Maximum Bet Limit', desc: 'Prevents disproportionate exposure: Max chip bet per user set to ₱5,000', value: '₱5,000 CAP' },
            { label: 'Responsible Gaming Timeouts', desc: 'Players can configure self-exclusion cooling-off periods and loss limits', value: 'SAFETY TOOLS' },
            { label: 'Transaction Audit Trail', desc: 'Every bet, spin, win, and withdrawal logged in immutable tamper-evident log', value: '100% AUDITED' }
          ]
        ),
        title: 'Anti-Fraud Guard & Responsible Gaming',
        tag: 'SECURITY SAFEGUARDS',
        desc: 'Automated anti-collusion bot protection, configurable table limits, and responsible gaming controls.'
      }
    ],
    features: [
      { title: 'Real-Time 2-Color Round Betting Engine', desc: 'Dynamic round timer with sub-second betting chips on Red or White, complete with live odds calculations.' },
      { title: 'Provably Fair Random Number Generator (RNG)', desc: 'Cryptographic SHA-256 server-seed/client-seed commitments allowing players to verify round fairness independently.' },
      { title: 'Dynamic Multi-Player Pool & Odds Calculator', desc: 'Real-time pool bar visualizes bets on Red vs. White with automated multiplier adjustments and zero latency.' },
      { title: 'Instant Automated Winning Payout & Wallet System', desc: 'Winnings are credited to player accounts within seconds of the wheel stopping, ready for immediate withdrawal.' },
      { title: 'Game History, Probability Stats & Live Dashboard', desc: 'Full trend roadmaps, streak tracking, frequency graphs, and top daily winner leaderboards.' },
      { title: 'Multiplayer Live Chat & Winner Celebration Ticker', desc: 'Engaging real-time community chat room with reaction emojis, coin rain giveaways, and win tickers.' },
      { title: 'Admin Round Control & Fraud Prevention Audit Log', desc: 'Host controls to adjust round speeds, maximum table limits, house fee percentages, and view audit reports.' },
      { title: 'Daily Attendance Login Bonus & Loyalty Quests', desc: 'Incentivize retention with daily check-in chips, free daily wheel spins, and multi-tier VIP cashback programs.' }
    ],
    details: {
      overview: 'Cael Two Color Game App provides community entertainment operators and gaming entrepreneurs with a turnkey, high-engagement red vs. white color wheel platform. Built for fair, thrilling, and transparent gameplay.',
      workforce: 'Full operator and agent back-office suite. Manage sub-agents, track deposit cash-in volumes, calculate revenue shares, and monitor live round liquidity with zero manual spreadsheet work.',
      monetization: '100% Free White-Label App. Customize the game with your own branding, logos, color wheel themes, minimum/maximum bet stakes, and house fee structures.',
      security: 'Provably fair cryptographic architecture, device fingerprinting for bot prevention, encrypted digital wallets, and immutable transaction audit trails.'
    },
    specs: [
      { label: 'Supported Platforms', value: 'Mobile Web, Android APK, iOS WebApp, Desktop Browser' },
      { label: 'Fairness Technology', value: 'SHA-256 Provably Fair RNG with publicly auditable client/server seeds' },
      { label: 'Round Sync Latency', value: 'WebSocket real-time synchronized state updates under 80ms' },
      { label: 'Wallet Infrastructure', value: 'Instant digital wallet with automated payout gateway integration' },
      { label: 'Affiliate & Agent Engine', value: 'Multi-level agent referral tracking with automated commission ledger' },
      { label: 'Security & Anti-Bot', value: 'Device fingerprinting, rate-limiting, and encrypted sessions' },
      { label: 'Retention Tools', value: 'Daily attendance bonus, streak quests, and VIP loyalty cashback' },
      { label: 'Licensing Model', value: '100% Free Turnkey Application for Community Dreamers' }
    ]
  },

  oncallservice: {
    id: 'oncallservice',
    title: 'CAEL ONCALL SERVICE APP',
    badge: 'CAEL ONCALL APP',
    subtitle: 'All Home Services • Closest To You • One Call Away',
    pitch: 'A free mobile app connecting home and business owners with the closest verified lock technicians, appliance repairers, plumbers, and carpenters in real-time with 1-call dispatch.',
    gallery: [
      {
        image: './caeloncall.jpg',
        title: 'All Home Services Proximity Radar & 1-Call Dispatch',
        tag: 'HERO SHOWCASE',
        desc: 'Interactive live radar map showing the nearest available verified technicians, travel ETAs, and instant 1-call booking.'
      },
      {
        image: createSvgScreen(
          'Real-Time Proximity Radar & Nearest Discovery',
          'Sub-second GPS matching showing nearby verified technicians on map with live ETAs',
          'Proximity Radar',
          '#00f3ff',
          '#3b82f6',
          [
            { label: 'Sub-Minute Location Matching', desc: 'Identifies the closest technician within a 5-km radius to minimize emergency wait times', value: '0.4 KM NEAREST' },
            { label: 'Live Technician Radar Pulse', desc: 'Real-time GPS markers show active technicians on duty with live transit speeds', value: 'LIVE RADAR' },
            { label: 'Estimated Arrival Countdown', desc: 'Continuous dynamic ETA calculation updating every 3 seconds based on traffic', value: '4 MINS ETA' },
            { label: 'Multi-Service Map Filtering', desc: 'Filter map by Lock Technicians, Plumbers, Electricians, or Appliance Specialists', value: 'MULTI-CATEGORY' }
          ]
        ),
        title: 'Real-Time Proximity Radar & Discovery',
        tag: 'PROXIMITY RADAR',
        desc: 'Live map tracking nearby technicians with arrival countdowns and category filters.'
      },
      {
        image: createSvgScreen(
          '24/7 Emergency Locksmith & Lock Technicians',
          'Rapid lockout assistance, master rekeying, and smart lock biometric installation',
          'Lock Technician',
          '#f59e0b',
          '#00f3ff',
          [
            { label: 'Emergency Home & Auto Lockout', desc: 'Damage-free lock picking and bypass for residential doors, gates, and vehicles', value: '24/7 EMERGENCY' },
            { label: 'Smart Lock & Biometric Setup', desc: 'Professional installation and programming of digital keypads and fingerprint deadbolts', value: 'SMART LOCKS' },
            { label: 'Cylinder Rekeying & Duplication', desc: 'Immediate on-site key duplication and security cylinder tumblers rekeying', value: 'ON-SITE REKEY' },
            { label: 'Licensed Locksmith Badge', desc: 'Background-cleared and certified locksmiths with verified security clearance', value: 'VERIFIED PRO' }
          ]
        ),
        title: '24/7 Emergency Locksmith & Security',
        tag: 'LOCK TECHNICIAN',
        desc: 'Rapid lockout response, master rekeying, and certified smart lock installation.'
      },
      {
        image: createSvgScreen(
          'Home Appliance & Refrigerator Repair Dispatch',
          'Certified diagnosis and repairs for washers, chillers, microwaves, and AC units',
          'Appliance Repair',
          '#10b981',
          '#00f3ff',
          [
            { label: 'Refrigerator & Freezer Cooling', desc: 'Freon leak detection, compressor replacement, and temperature thermostat calibration', value: 'SAME-DAY FIX' },
            { label: 'Washing Machine & Dryer Repairs', desc: 'Motor belt replacement, drainage pump clearing, and spin cycle troubleshooting', value: 'ALL MAJOR BRANDS' },
            { label: 'Inverter AC Cleaning & Service', desc: 'Hydro-pressure coil wash, chemical flush, and capacitor circuit testing', value: 'AC SPECIALIST' },
            { label: 'Warranty-Backed Spare Parts', desc: 'Genuine OEM replacement components with digital 90-day parts warranty certificate', value: '90-DAY WARRANTY' }
          ]
        ),
        title: 'Home Appliance & AC Repair Dispatch',
        tag: 'APPLIANCE REPAIR',
        desc: 'Certified technicians for refrigerators, washing machines, dryers, and AC units.'
      },
      {
        image: createSvgScreen(
          'Emergency Plumbing & High-Pressure Leak Fix',
          '24/7 rapid response for pipe bursts, clogged sewers, and water pressure restoration',
          'Emergency Plumber',
          '#3b82f6',
          '#10b981',
          [
            { label: 'High-Pressure Pipe Burst Repair', desc: 'Immediate water main shutoff, copper/PVC pipe welding, and pressure isolation', value: '15-MIN RESPONSE' },
            { label: 'Drain & Sewer Camera Inspection', desc: 'Flexible video camera snaking to pinpoint blockages in residential main lines', value: 'SEWER CAMERA' },
            { label: 'Water Heater & Booster Pumps', desc: 'Instant electric shower heater installation and booster pump pressure tuning', value: 'PUMP EXPERT' },
            { label: 'Toilet & Faucet Overhauls', desc: 'Silent fill valve replacements, ceramic cartridge fixes, and water-saving aerators', value: 'ZERO LEAKS' }
          ]
        ),
        title: 'Emergency Plumbing & Pipe Leak Fix',
        tag: 'EMERGENCY PLUMBING',
        desc: 'Rapid pipe repair, video drain declogging, and water heater overhauls.'
      },
      {
        image: createSvgScreen(
          'Master Carpentry, Handyman & Door Works',
          'Custom cabinetry, door re-hanging, drywall patching, and furniture assembly',
          'Carpentry & Handyman',
          '#ec4899',
          '#f59e0b',
          [
            { label: 'Door Alignment & Jam Repair', desc: 'Re-align swollen wooden doors, install heavy-duty hinges, and weather-stripping', value: 'DOOR SPECIALIST' },
            { label: 'Custom Shelving & Kitchen Cabinets', desc: 'Cabinet hinge tuning, drawer slide replacements, and modular shelf fabrication', value: 'CABINETRY' },
            { label: 'Drywall & Ceiling Patching', desc: 'Seamless gypsum drywall hole repairs, taping, sanding, and primer texture match', value: 'DRYWALL FIX' },
            { label: 'Flat-Pack Furniture Assembly', desc: 'Expert assembly of IKEA, modular beds, office desks, and wall-mounted anchors', value: 'FAST ASSEMBLY' }
          ]
        ),
        title: 'Master Carpentry & Handyman Works',
        tag: 'CARPENTRY & HANDYMAN',
        desc: 'Door repairs, custom cabinetry, drywall patching, and precision furniture assembly.'
      },
      {
        image: createSvgScreen(
          'Certified Electrical & Home Circuit Repair',
          'Short circuit diagnosis, main breaker replacements, and surge protector installation',
          'Electrical Repair',
          '#f59e0b',
          '#10b981',
          [
            { label: 'Circuit Breaker Trip Diagnosis', desc: 'Megger insulation testing to locate ground faults and overloaded circuit lines', value: 'FAULT CLEARED' },
            { label: 'Main Distribution Panel Upgrades', desc: 'Breaker panel replacement, grounding rod installation, and load balancing', value: 'LICENSED ELECTRICIAN' },
            { label: 'Outlet & Light Fixture Installs', desc: 'GFCI wet-area outlets, smart dimmers, chandelier hanging, and LED recessed cans', value: 'SAFE WIRING' },
            { label: 'Whole-Home Surge Protection', desc: 'Protects expensive home electronics from grid voltage spikes and lightning', value: 'SURGE SHIELD' }
          ]
        ),
        title: 'Certified Electrical & Circuit Repair',
        tag: 'ELECTRICAL REPAIR',
        desc: 'Licensed electricians for short circuits, breaker panels, and safe wiring.'
      },
      {
        image: createSvgScreen(
          '1-Call Masked Voice Connect & Video Assessment',
          'Direct encrypted voice tunnel and video check for instant diagnostic estimates',
          '1-Call Tunnel',
          '#00f3ff',
          '#a855f7',
          [
            { label: 'Masked VoIP Telephone Tunnel', desc: 'Connects client and technician immediately without revealing private mobile numbers', value: 'PRIVACY SHIELD' },
            { label: 'Live Video Diagnostic Assessment', desc: 'Stream live camera video of the broken appliance or leak for instant estimates', value: 'LIVE VIDEO' },
            { label: 'Voice Recording & Safety Policy', desc: 'Encrypted call logs ensure professional courteous conduct and clear quote terms', value: 'ENCRYPTED' },
            { label: '1-Tap Emergency SOS Escalation', desc: 'Instant support hotline access during all active technician service appointments', value: '24/7 SUPPORT' }
          ]
        ),
        title: '1-Call Masked Voice & Video Diagnostics',
        tag: '1-CALL TUNNEL',
        desc: 'Masked VoIP and live video assessments provide accurate quotes with zero privacy leak.'
      },
      {
        image: createSvgScreen(
          'Standardized Upfront Price & Zero-Surge Quotes',
          'Transparent hourly and labor rates with digital parts receipts and no hidden fees',
          'Upfront Rates',
          '#10b981',
          '#f59e0b',
          [
            { label: 'Standardized Labor Rate Catalog', desc: 'Clear task-based pricing: You know the inspection and repair cost before work starts', value: 'NO HIDDEN FEES' },
            { label: 'Digital Parts Cost Receipts', desc: 'Technicians upload photos of official store receipts with zero markup commission', value: 'STORE RECEIPTS' },
            { label: 'Zero Surge Emergency Pricing', desc: 'Fair, transparent rates even during late-night lockouts or holiday pipe emergencies', value: 'ZERO SURGE' },
            { label: 'Cashless QR & Digital Payment', desc: 'Pay via GCash, Maya, card, or Cash on Completion with digital warranty receipt', value: 'EASY PAY' }
          ]
        ),
        title: 'Standardized Rates & Zero-Surge Quotes',
        tag: 'TRANSPARENT RATES',
        desc: 'Upfront labor catalog, official store parts receipts, and cashless QR payouts.'
      },
      {
        image: createSvgScreen(
          'Verified Technician Identity & Background Shield',
          'NBI/police cleared badges, licensing credentials, and customer safety ratings',
          'Verified Shield',
          '#00f3ff',
          '#10b981',
          [
            { label: 'Police & NBI Security Clearance', desc: '100% of on-call technicians undergo criminal background checks and identity verification', value: 'NBI CLEARED' },
            { label: 'Trade Certification & Licenses', desc: 'Verified vocational diplomas, master plumber certificates, and electrical licenses', value: 'TRADE CERTIFIED' },
            { label: 'Customer Trust & Review Score', desc: 'Live feedback scores and verified client reviews updated after every service call', value: '4.96 ★★★★★' },
            { label: 'CAEL Service Guarantee Shield', desc: 'Guaranteed technician arrival within estimated window or priority reassignment', value: 'CAEL SHIELD' }
          ]
        ),
        title: 'Verified Technician Identity Shield',
        tag: 'VERIFIED SHIELD',
        desc: 'Police background checks, trade licenses, and 5-star customer trust ratings.'
      }
    ],
    features: [
      { title: 'Sub-Minute Proximity GPS Radar', desc: 'Real-time location matching identifies the closest available home technician to minimize wait times.' },
      { title: '24/7 Emergency Lock Technician Service', desc: 'Rapid lockout rescue, smart lock installations, and master rekeying for home and auto security.' },
      { title: 'Certified Appliance & AC Repair Dispatch', desc: 'Same-day diagnostics for refrigerators, washing machines, dryers, and inverter air conditioning units.' },
      { title: 'Emergency Plumbing & High-Pressure Leaks', desc: 'Rapid 15-minute response for burst pipes, clogged sewers, drain cameras, and booster pumps.' },
      { title: 'Master Carpentry & Handyman Services', desc: 'Door alignments, custom cabinetry, drywall repair, ceiling patching, and flat-pack assembly.' },
      { title: 'Licensed Electrical & Circuit Repair', desc: 'Professional troubleshooting for breaker trips, panel upgrades, rewiring, and surge protection.' },
      { title: '1-Call Masked VoIP & Live Video Diagnostics', desc: 'Instant private voice calling and video diagnostics to assess repair scope without sharing phone numbers.' },
      { title: 'Standardized Pricing & Background-Checked Shield', desc: 'Transparent task-based labor rates, digital parts receipts, and 100% police/NBI-cleared technicians.' }
    ],
    details: {
      overview: 'CAEL OnCall Service App is an on-demand marketplace connecting households and business owners with the nearest verified technicians across locksmithing, appliance repair, plumbing, carpentry, and electrical works.',
      workforce: 'Empower local trade professionals and handymen. Independent technicians set their own service radius, receive direct dispatch calls from nearby clients, and keep 100% of their earnings with zero commission deductions.',
      monetization: '100% Free Open Platform. Community service providers and trade entrepreneurs can launch their own on-call dispatch network with zero ongoing platform subscription fees.',
      security: 'Comprehensive customer protection featuring NBI background checks, trade license verification, masked VoIP tunnels, and standardized task pricing.'
    },
    specs: [
      { label: 'Supported Platforms', value: 'Native Android, iOS, Web Reception & Dispatch Console' },
      { label: 'Dispatch Latency', value: 'Sub-minute nearest technician matching via real-time GPS proximity radar' },
      { label: 'Service Coverage', value: 'Locksmith, Appliance, Plumbing, Carpentry, Electrical, Handyman, AC' },
      { label: 'Communication Mode', value: 'Masked VoIP telephone tunnel, encrypted in-app chat, live video diagnostics' },
      { label: 'Pricing Model', value: 'Standardized catalog labor rates, zero surge pricing, official parts receipts' },
      { label: 'Technician Clearance', value: 'Mandatory NBI/Police background check, trade license verification' },
      { label: 'Payment Options', value: 'Cashless QR digital wallet, debit/credit cards, and Cash on Completion' },
      { label: 'Licensing Model', value: '100% Free Ecosystem for Tradespeople and Home Service Dreamers' }
    ]
  }
};
