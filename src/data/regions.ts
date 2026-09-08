import { RegionInfo } from '../types';

export const REGIONS: RegionInfo[] = [
  {
    id: 'all-zambia',
    name: 'All Zambia Grand Safari',
    shortName: 'All Zambia',
    tagline: 'The Ultimate Wilderness Quest',
    description:
      'Spanning the mighty Zambezi, ancient Miombo woodlands, Bangweulu swamps, and Luangwa oxbow lagoons.',
    highlightSpecies: ['African Fish Eagle', 'Wild Dog', 'Leopard', 'Shoebill'],
    mapCoords: { x: 50, y: 50 },
    color: '#D97706',
    areaKm2: '752,614 km²',
    established: 'National Quest',
  },
  {
    id: 'south-luangwa',
    name: 'South Luangwa National Park',
    shortName: 'South Luangwa',
    tagline: 'Valley of the Leopard & Birthplace of Walking Safaris',
    description:
      'Renowned worldwide for its dense leopard population, Thornicroft’s giraffe, Cookson’s wildebeest, and sweeping Luangwa River oxbow lagoons.',
    highlightSpecies: ['Leopard', "Thornicroft's Giraffe", "Cookson's Wildebeest", 'Carmine Bee-eater'],
    mapCoords: { x: 74, y: 38 },
    color: '#1B4D31',
    areaKm2: '9,050 km²',
    established: '1972',
  },
  {
    id: 'kafue',
    name: 'Kafue National Park',
    shortName: 'Kafue',
    tagline: 'Zambia’s Oldest & Largest Untamed Wilderness',
    description:
      'Home to the iconic Busanga Plains where lions climb fig trees and thousands of red lechwe graze the flooded grasslands.',
    highlightSpecies: ['Tree-Climbing Lion', 'Cheetah', 'Kafue Red Lechwe', 'Puku Antelope'],
    mapCoords: { x: 38, y: 56 },
    color: '#24643F',
    areaKm2: '22,400 km²',
    established: '1950',
  },
  {
    id: 'lower-zambezi',
    name: 'Lower Zambezi National Park',
    shortName: 'Lower Zambezi',
    tagline: 'Water Safaris, Giant Elephant Herds & River Gods',
    description:
      'Fronting the mighty Zambezi River opposite Zimbabwe’s Mana Pools. Famous for canoe safaris past hippo pods and tigerfish waters.',
    highlightSpecies: ['African Elephant', 'Hippopotamus', 'Nile Crocodile', 'African Skimmer'],
    mapCoords: { x: 62, y: 66 },
    color: '#0284C7',
    areaKm2: '4,092 km²',
    established: '1983',
  },
  {
    id: 'victoria-falls',
    name: 'Mosi-oa-Tunya & Victoria Falls',
    shortName: 'Victoria Falls',
    tagline: 'The Smoke That Thunders & White Rhino Sanctuary',
    description:
      'Surrounding the world’s greatest falling sheet of water. The park shelters Zambia’s only closely guarded population of white rhinos.',
    highlightSpecies: ['Southern White Rhino', 'Chacma Baboon', 'Klipspringer', 'Trumpeter Hornbill'],
    mapCoords: { x: 42, y: 82 },
    color: '#EA580C',
    areaKm2: '66 km²',
    established: '1972',
  },
];
