
import type { GraphData } from '../types';

export const initialGraphData: GraphData = {
  nodes: [
    { id: 'elysia', name: 'Elysia', group: 'location', details: 'A utopian city-state floating among the clouds.' },
    { id: 'kain', name: 'Kain', group: 'character', details: 'A stoic Guardian of Elysia, bound by an ancient oath.' },
    { id: 'lyra', name: 'Lyra', group: 'character', details: 'A rebellious musician who channels forgotten magics through her songs.' },
    { id: 'the_aetherium', name: 'The Aetherium', group: 'concept', details: 'The raw, chaotic energy that powers Elysia and its magic.' },
    { id: 'the_shattering', name: 'The Shattering', group: 'event', details: 'A cataclysmic event that broke the old world, leading to Elysia\'s creation.' },
    { id: 'the_silent_ones', name: 'The Silent Ones', group: 'faction', details: 'Ancient beings who existed before The Shattering, now dormant.' },
    { id: 'runesong', name: 'Runesong', group: 'concept', details: 'The magical art Lyra uses, weaving Aetherium into reality via music.' },
    { id: 'oathstone', name: 'Oathstone', group: 'object', details: 'The artifact that binds Kain to his duty as a Guardian.' }
  ],
  links: [
    { source: 'kain', target: 'elysia', label: 'Protects' },
    { source: 'lyra', target: 'elysia', label: 'Resides In' },
    { source: 'kain', target: 'lyra', label: 'Distrusts' },
    { source: 'lyra', target: 'runesong', label: 'Wields' },
    { source: 'runesong', target: 'the_aetherium', label: 'Manipulates' },
    { source: 'elysia', target: 'the_aetherium', label: 'Powered By' },
    { source: 'kain', target: 'oathstone', label: 'Bound To' },
    { source: 'the_shattering', target: 'elysia', label: 'Led to creation of' },
    { source: 'the_shattering', target: 'the_silent_ones', label: 'Caused dormancy of' },
    { source: 'lyra', target: 'the_silent_ones', label: 'Investigates' }
  ]
};
