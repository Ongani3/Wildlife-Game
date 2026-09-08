# Luangwa Legends – Zambian Wildlife Safari Quiz 🇿🇲

A lightweight, mobile-first Progressive Web App (PWA) celebrating the wildlife, national parks, and frontline conservation of Zambia.

Built with **React 18 + TypeScript + Vite + Tailwind CSS**, hosted on **Firebase**, and architected for offline play in the remote Zambian bush.

---

## 🌟 Key Features

1. **Interactive Stylized Map of Zambia**:
   - Geographically styled vector map showing the Luangwa, Kafue, and Zambezi river systems, Lake Kariba, and Lake Bangweulu.
   - Interactive selection of premier national parks:
     - **South Luangwa National Park** (Birthplace of the walking safari, leopard density)
     - **Kafue National Park** (Busanga plains, tree-climbing lions)
     - **Lower Zambezi National Park** (Canoeing safaris, tigerfish, elephant herds)
     - **Victoria Falls / Mosi-oa-Tunya** (The Smoke that Thunders, white rhinos)
     - **All-Zambia Grand Safari** (Nationwide expedition)
2. **Dynamic Quiz Engine**:
   - 10–12 question rounds with 3 question types:
     - Multiple Choice (4 options)
     - True/False (fast reaction)
     - Photo Identification (specimen photography with zoom preview)
   - Dynamic scoring: Base points (100) + Speed bonus (up to 120 pts based on 15s timer) + Streak multiplier (1.0x to 2.0x).
   - Instant visual and text feedback with Safari Ranger Bush Facts after every question.
3. **Daily Challenge ("Dawn Patrol")**:
   - Deterministic seed based on the current calendar date. Every player in the world answers the exact same 10 questions on any given day.
4. **Offline Safari Engine (PWA)**:
   - Built-in service worker caching all assets and question banks.
   - Works 100% offline without mobile reception or Wi-Fi.
   - Custom in-app PWA install prompt with dedicated iOS Safari step-by-step guidance.
5. **Safari Trophy Collection (Badges)**:
   - 9 collectible badges celebrating iconic Zambian animals and milestones:
     - Fish Eagle Feather (*Haliaeetus vocifer*, national bird)
     - Luangwa Sentinel (Thornicroft's giraffe)
     - Tree-Climbing Pride (Kafue lions)
     - Blessing of Nyami Nyami (Zambezi River God)
     - Painted Wolf Guardian (*Lycaon pictus*)
     - Speed Tracker (Cheetah speed answers)
     - Unbroken Spoor (8x answer streak)
     - Dawn Patrol Scout (Daily challenge complete)
     - Luangwa Legend (Supreme mastery)
6. **Shareable HTML5 Canvas Safari Certificates**:
   - Generates high-resolution PNG certificate cards with player rank, score, accuracy, and park spoor.
   - Native Web Share API integration + one-tap PNG download.
7. **Firebase & Local Leaderboard**:
   - Dual-tier storage: Saves scores locally instantly, and seamlessly submits to Firestore cloud leaderboard when connected.
   - Google Sign-In or Anonymous exploration.

---

## 🚀 Firebase Setup & Deployment

### 1. Configure Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Firestore Database** in test mode or production mode.
3. Enable **Firebase Authentication** and turn on:
   - **Google** provider
   - **Anonymous** provider
4. In Project Settings, create a Web App and copy your configuration values into `.env` (or set environment variables):
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

### 2. Deploy Security Rules
The repository contains hardened, zero-trust `firestore.rules` adhering to role-based access:
- **Questions**: Public read for all quiz takers; client write disabled.
- **Scores**: Authenticated create allowed with data format validation (prevents tampered score figures); immutable records.
- **Users**: Owner-only read/write for user profile documents.

Deploy rules via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 3. Build & Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

---

## 📖 How to Add More Questions

Question data is structured in `src/data/questions.ts`. To add a new question, append an object following the `Question` interface:

```typescript
{
  id: 'sl-unique-id',
  region: 'south-luangwa', // 'south-luangwa' | 'kafue' | 'lower-zambezi' | 'victoria-falls' | 'all-zambia'
  questionText: 'What is the primary prey of leopards in South Luangwa during the dry season?',
  type: 'multiple-choice', // 'multiple-choice' | 'true-false' | 'photo-id'
  options: ['Impala and puku', 'Warthogs only', 'Fish eagle chicks', 'Hippo calves'],
  correctAnswer: 'Impala and puku',
  funFact: 'Puku antelope are grazing specialists found in massive herds on the Luangwa floodplains, providing steady sustenance for leopards and lions.',
  difficulty: 'medium', // 'easy' | 'medium' | 'hard'
  category: 'Mammals', // 'Mammals' | 'Birds' | 'Parks & Geography' | 'Conservation' | 'Folklore & History'
  imageUrl: 'https://images.unsplash.com/photo-...', // Optional: required if type is 'photo-id'
}
```

---

## 🌿 Conservation Partners

Luangwa Legends promotes awareness of frontline conservation efforts in Zambia:
- **Conservation South Luangwa (CSL)**: Anti-poaching patrols and community human-wildlife conflict mitigation.
- **Zambian Carnivore Programme (ZCP)**: Research and protection of wild dogs, cheetahs, lions, and leopards.
- **Department of National Parks & Wildlife (DNPW)**: Statutory guardians of Zambia's 20 national parks.
