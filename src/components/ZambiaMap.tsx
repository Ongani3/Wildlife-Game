import React from 'react';
import { REGIONS } from '../data/regions';
import { RegionId } from '../types';
import { Compass, Sparkles, Trees, Eye } from 'lucide-react';

interface ZambiaMapProps {
  selectedRegion: RegionId;
  onSelectRegion: (id: RegionId) => void;
  onStartQuiz: (id: RegionId) => void;
}

export const ZambiaMap: React.FC<ZambiaMapProps> = ({
  selectedRegion,
  onSelectRegion,
  onStartQuiz,
}) => {
  const currentRegion = REGIONS.find((r) => r.id === selectedRegion) || REGIONS[0];

  return (
    <div id="zambia-map-section" className="w-full flex flex-col items-center">
      {/* Region quick selector pills */}
      <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-2 px-1 no-scrollbar text-xs font-semibold">
        {REGIONS.map((region) => {
          const isSelected = selectedRegion === region.id;
          return (
            <button
              key={region.id}
              id={`select-region-${region.id}`}
              onClick={() => onSelectRegion(region.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full transition-all duration-200 border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#1b4d31] text-amber-300 border-amber-400/50 shadow-md scale-102 font-bold'
                  : 'bg-white/80 text-stone-700 hover:bg-stone-100 border-stone-200/80'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: region.color }}
              />
              <span className="whitespace-nowrap">{region.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Stylized Zambia SVG Map Canvas */}
      <div className="relative w-full max-w-lg aspect-4/3 my-2 rounded-2xl bg-linear-to-b from-[#e8f1eb]/80 to-[#fbf9f4] border border-[#1b4d31]/15 p-2 shadow-inner overflow-hidden">
        {/* Decorative Grid & Compass Rose */}
        <div className="absolute top-2 right-2 pointer-events-none opacity-20 flex flex-col items-center">
          <Compass className="w-12 h-12 text-[#1b4d31]" />
          <span className="text-[9px] font-bold tracking-widest text-[#1b4d31]">ZAMBIA</span>
        </div>

        {/* The SVG Map of Zambia */}
        <svg
          viewBox="0 0 500 380"
          className="w-full h-full drop-shadow-sm select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="zambiaLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E5ECE5" />
              <stop offset="50%" stopColor="#D6E4D8" />
              <stop offset="100%" stopColor="#C5DAC9" />
            </linearGradient>
            <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1b4d31" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Stylized Zambia Country Boundary */}
          <path
            d="M130 50
               C180 40, 240 70, 275 80
               C300 70, 340 50, 375 70
               C410 90, 445 120, 420 160
               C395 200, 430 220, 395 260
               C360 300, 300 270, 260 280
               C220 290, 200 350, 160 340
               C120 330, 80 290, 75 250
               C70 210, 60 160, 85 110
               C100 80, 110 60, 130 50 Z"
            fill="url(#zambiaLandGrad)"
            stroke="#1b4d31"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            filter="url(#mapGlow)"
          />

          {/* Copperbelt / Central internal accent */}
          <path
            d="M210 130 Q250 140 280 180"
            fill="none"
            stroke="#1b4d31"
            strokeWidth="1.2"
            strokeOpacity="0.3"
          />

          {/* Major River: Luangwa River (Curving through Eastern Zambia) */}
          <path
            d="M390 100 Q360 150 340 200 T290 260"
            fill="none"
            stroke="#0284c7"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.75"
          />
          <text x="365" y="145" fill="#0284c7" fontSize="8" fontWeight="600" opacity="0.8" transform="rotate(50 365 145)">
            Luangwa River
          </text>

          {/* Major River: Kafue River */}
          <path
            d="M230 110 Q210 160 200 220 T240 270"
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.65"
          />
          <text x="180" y="190" fill="#0284c7" fontSize="8" fontWeight="600" opacity="0.8" transform="rotate(75 180 190)">
            Kafue River
          </text>

          {/* Major River: The Mighty Zambezi & Lake Kariba */}
          <path
            d="M130 330 Q180 325 240 290 T330 275 T395 260"
            fill="none"
            stroke="#0284c7"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.85"
          />
          <text x="250" y="305" fill="#0284c7" fontSize="9" fontWeight="700" opacity="0.85">
            Zambezi River
          </text>

          {/* Lake Bangweulu & Swamps (Shoebill territory) */}
          <ellipse cx="295" cy="115" rx="14" ry="9" fill="#0284c7" opacity="0.45" />
          <text x="280" y="102" fill="#0369a1" fontSize="7" fontWeight="bold">Bangweulu</text>

          {/* Park Region 1: Kafue National Park Polygon */}
          <g
            id="map-park-kafue"
            className="cursor-pointer transition-all duration-300 group"
            onClick={() => onSelectRegion('kafue')}
          >
            <path
              d="M170 140 L215 145 L205 240 L160 230 Z"
              fill={selectedRegion === 'kafue' ? '#24643F' : '#166534'}
              fillOpacity={selectedRegion === 'kafue' ? 0.85 : 0.35}
              stroke="#166534"
              strokeWidth={selectedRegion === 'kafue' ? 2.5 : 1.5}
            />
            <circle
              cx="190"
              cy="185"
              r={selectedRegion === 'kafue' ? 8 : 6}
              fill="#F59E0B"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="animate-pulse"
            />
            <text x="190" y="205" textAnchor="middle" fill="#0f291e" fontSize="10" fontWeight="bold">
              Kafue
            </text>
            <text x="190" y="215" textAnchor="middle" fill="#15803d" fontSize="7" fontWeight="semibold">
              Busanga Plains
            </text>
          </g>

          {/* Park Region 2: South Luangwa National Park Polygon */}
          <g
            id="map-park-south-luangwa"
            className="cursor-pointer transition-all duration-300 group"
            onClick={() => onSelectRegion('south-luangwa')}
          >
            <path
              d="M340 140 L380 150 L355 210 L325 195 Z"
              fill={selectedRegion === 'south-luangwa' ? '#1B4D31' : '#15803d'}
              fillOpacity={selectedRegion === 'south-luangwa' ? 0.9 : 0.4}
              stroke="#1B4D31"
              strokeWidth={selectedRegion === 'south-luangwa' ? 2.5 : 1.5}
            />
            <circle
              cx="352"
              cy="172"
              r={selectedRegion === 'south-luangwa' ? 8 : 6}
              fill="#D97706"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="animate-pulse"
            />
            <text x="352" y="132" textAnchor="middle" fill="#0f291e" fontSize="10" fontWeight="bold">
              South Luangwa
            </text>
            <text x="352" y="222" textAnchor="middle" fill="#b45309" fontSize="7" fontWeight="semibold">
              Leopard Valley
            </text>
          </g>

          {/* Park Region 3: Lower Zambezi National Park Polygon */}
          <g
            id="map-park-lower-zambezi"
            className="cursor-pointer transition-all duration-300 group"
            onClick={() => onSelectRegion('lower-zambezi')}
          >
            <path
              d="M285 250 L330 245 L320 270 L280 268 Z"
              fill={selectedRegion === 'lower-zambezi' ? '#0284C7' : '#0369a1'}
              fillOpacity={selectedRegion === 'lower-zambezi' ? 0.85 : 0.4}
              stroke="#0284C7"
              strokeWidth={selectedRegion === 'lower-zambezi' ? 2.5 : 1.5}
            />
            <circle
              cx="305"
              cy="258"
              r={selectedRegion === 'lower-zambezi' ? 8 : 6}
              fill="#38BDF8"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <text x="305" y="240" textAnchor="middle" fill="#0f291e" fontSize="9" fontWeight="bold">
              Lower Zambezi
            </text>
          </g>

          {/* Park Region 4: Mosi-oa-Tunya & Victoria Falls */}
          <g
            id="map-park-victoria-falls"
            className="cursor-pointer transition-all duration-300 group"
            onClick={() => onSelectRegion('victoria-falls')}
          >
            <circle
              cx="195"
              cy="325"
              r={selectedRegion === 'victoria-falls' ? 10 : 7}
              fill={selectedRegion === 'victoria-falls' ? '#EA580C' : '#c2410c'}
              stroke="#FFFFFF"
              strokeWidth="2"
              className="animate-bounce"
            />
            <text x="195" y="345" textAnchor="middle" fill="#0f291e" fontSize="9" fontWeight="bold">
              Victoria Falls
            </text>
            <text x="195" y="355" textAnchor="middle" fill="#7c2d12" fontSize="7" fontWeight="semibold">
              Mosi-oa-Tunya
            </text>
          </g>

          {/* Capital City: Lusaka indicator */}
          <g transform="translate(260, 235)">
            <rect x="-3" y="-3" width="6" height="6" fill="#1c1917" />
            <circle cx="0" cy="0" r="5" fill="none" stroke="#1c1917" strokeWidth="0.8" />
            <text x="8" y="3" fill="#44403c" fontSize="8" fontWeight="bold">Lusaka (Capital)</text>
          </g>
        </svg>

        {/* Quick legend on the map */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-stone-200/80 text-[10px] text-stone-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#1b4d31]"></span>
          <span>Tap park or button to preview expedition</span>
        </div>
      </div>

      {/* Selected Region Detailed Card */}
      <div className="w-full max-w-lg mt-2 bg-white rounded-2xl p-4 border border-[#1b4d31]/20 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentRegion.color }}
              />
              <h3 className="text-base font-bold font-display text-stone-900">
                {currentRegion.name}
              </h3>
            </div>
            <p className="text-xs font-semibold text-amber-700 mt-0.5">
              {currentRegion.tagline}
            </p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 font-medium text-stone-600">
            {currentRegion.areaKm2}
          </span>
        </div>

        <p className="text-xs text-stone-600 mt-2 leading-relaxed">
          {currentRegion.description}
        </p>

        {/* Highlight Species Chips */}
        <div className="mt-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-1">
            Iconic Wildlife In This Park:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentRegion.highlightSpecies.map((animal) => (
              <span
                key={animal}
                className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-medium flex items-center gap-1"
              >
                <Trees className="w-2.5 h-2.5 text-emerald-700" />
                {animal}
              </span>
            ))}
          </div>
        </div>

        {/* Start expedition button */}
        <button
          id={`start-expedition-${currentRegion.id}`}
          onClick={() => onStartQuiz(currentRegion.id)}
          className="mt-4 w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#1b4d31] to-[#24643f] hover:from-[#143622] hover:to-[#1b4d31] text-amber-300 font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition transform active:scale-98"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Embark on {currentRegion.shortName} Safari (10 Qs)</span>
        </button>
      </div>
    </div>
  );
};
