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
