/**
 * geneKeysData.js
 *
 * Derived from the Gene Keys engine. At app startup the engine calculates
 * the Hologenetic Profile dynamically from birth data stored in the store.
 *
 * For static display and fallback, SPHERES and GK_LIST are pre-computed
 * for the default profile (Gaston Frydlewski, Jan 23 1981, 10:10 PM, Buenos Aires).
 *
 * To recompute dynamically, import getGeneKeysProfile from '../engines/geneKeysEngine'.
 */

import { getGeneKeysProfile, GENE_KEYS_DATA } from '../engines/geneKeysEngine'

// Default birth data (Gaston)
const DEFAULT_BIRTH = {
  day: 23, month: 1, year: 1981,
  hour: 22, minute: 10,
  timezone: -3,
}

/**
 * Compute the Gene Keys profile and return SPHERES + GK_LIST.
 * Pass custom birth data to override the default.
 */
export function computeGeneKeysData(birthData = DEFAULT_BIRTH) {
  const profile = getGeneKeysProfile(birthData)
  const { lifesWork, evolution, radiance, purpose } = profile.spheres

  const SPHERES = [
    {
      key: lifesWork.gate,
      role: "Life's Work",
      line: lifesWork.line,
      xf: .50, yf: .22,
      col: 'rgba(80,180,220,',
      sphere: 'lifesWork',
      ...lifesWork,
    },
    {
      key: evolution.gate,
      role: 'Evolution',
      line: evolution.line,
      xf: .74, yf: .52,
      col: 'rgba(220,80,80,',
      sphere: 'evolution',
      ...evolution,
    },
    {
      key: radiance.gate,
      role: 'Radiance',
      line: radiance.line,
      xf: .26, yf: .52,
      col: 'rgba(220,80,80,',
      sphere: 'radiance',
      ...radiance,
    },
    {
      key: purpose.gate,
      role: 'Purpose',
      line: purpose.line,
      xf: .50, yf: .80,
      col: 'rgba(220,80,80,',
      sphere: 'purpose',
      ...purpose,
    },
    {
      key: lifesWork.gate,
      role: 'Gene Key',
      line: lifesWork.line,
      xf: .50, yf: .52,
      col: 'rgba(100,180,80,',
      center: true,
      sphere: 'center',
    },
  ]

  const GK_LIST = [
    {
      num: lifesWork.gate,
      role: "Life's Work · Vocation",
      gift: `Gift: ${lifesWork.gift} · Ln ${lifesWork.line}`,
      shadow: `Shadow: ${lifesWork.shadow} → ${lifesWork.siddhi}`,
      bars: [7, 13, 9],
    },
    {
      num: evolution.gate,
      role: 'Evolution · Challenge',
      gift: `Gift: ${evolution.gift} · Ln ${evolution.line}`,
      shadow: `Shadow: ${evolution.shadow} → ${evolution.siddhi}`,
      bars: [11, 15, 8],
    },
    {
      num: radiance.gate,
      role: 'Radiance · Culture',
      gift: `Gift: ${radiance.gift} · Ln ${radiance.line}`,
      shadow: `Shadow: ${radiance.shadow} → ${radiance.siddhi}`,
      bars: [9, 17, 13],
    },
    {
      num: purpose.gate,
      role: 'Purpose · Attraction',
      gift: `Gift: ${purpose.gift} · Ln ${purpose.line}`,
      shadow: `Shadow: ${purpose.shadow} → ${purpose.siddhi}`,
      bars: [8, 14, 17],
    },
  ]

  // Venus Sequence spheres — with wheel positions (diamond layout)
  const venus = profile.venusSequence || {}
  const VENUS_SPHERES = venus.attraction ? [
    { key: venus.attraction.gate, role: 'Attraction', line: venus.attraction.line, xf: .50, yf: .18, col: 'rgba(212,48,112,', sphere: 'attraction', ...venus.attraction },
    { key: venus.iq.gate, role: 'IQ', line: venus.iq.line, xf: .78, yf: .48, col: 'rgba(80,180,220,', sphere: 'iq', ...venus.iq },
    { key: venus.eq.gate, role: 'EQ', line: venus.eq.line, xf: .22, yf: .48, col: 'rgba(144,80,224,', sphere: 'eq', ...venus.eq },
    { key: venus.sq.gate, role: 'SQ', line: venus.sq.line, xf: .50, yf: .78, col: 'rgba(201,168,76,', sphere: 'sq', ...venus.sq },
  ] : []

  // Pearl Sequence spheres — with wheel positions (diamond layout)
  const pearl = profile.pearlSequence || {}
  const PEARL_SPHERES = pearl.vocation ? [
    { key: pearl.vocation.gate, role: 'Vocation', line: pearl.vocation.line, xf: .50, yf: .18, col: 'rgba(240,192,64,', sphere: 'vocation', ...pearl.vocation },
    { key: pearl.culture.gate, role: 'Culture', line: pearl.culture.line, xf: .78, yf: .48, col: 'rgba(100,180,80,', sphere: 'culture', ...pearl.culture },
    { key: pearl.brand.gate, role: 'Brand', line: pearl.brand.line, xf: .22, yf: .48, col: 'rgba(80,180,220,', sphere: 'brand', ...pearl.brand },
    { key: pearl.pearl.gate, role: 'Pearl', line: pearl.pearl.line, xf: .50, yf: .78, col: 'rgba(201,168,76,', sphere: 'pearl', ...pearl.pearl },
  ] : []

  // Hologenetic (all sequences combined) — reposition for unified wheel layout
  const outerActivation = SPHERES.filter(s => !s.center)
  const ALL_SPHERES_WHEEL = [
    // Activation — top arc
    ...outerActivation.map((s, i) => ({
      ...s,
      xf: [.50, .82, .18, .50][i] ?? s.xf,
      yf: [.14, .38, .38, .62][i] ?? s.yf,
    })),
    // Venus — right arc
    ...VENUS_SPHERES.map((s, i) => ({
      ...s,
      xf: [.68, .88, .68, .50][i] ?? s.xf,
      yf: [.68, .48, .28, .48][i] ?? s.yf,
    })),
    // Pearl — left arc
    ...PEARL_SPHERES.map((s, i) => ({
      ...s,
      xf: [.32, .12, .32, .50][i] ?? s.xf,
      yf: [.68, .48, .28, .82][i] ?? s.yf,
    })),
    // Center sphere
    ...SPHERES.filter(s => s.center),
  ]

  return { SPHERES, GK_LIST, VENUS_SPHERES, PEARL_SPHERES, ALL_SPHERES_WHEEL, profile }
}

// Default exports for backward compatibility (computed for Gaston's birth data)
const { SPHERES: defaultSpheres, GK_LIST: defaultGKList } = computeGeneKeysData()

export const SPHERES = defaultSpheres
export const GK_LIST = defaultGKList
export { GENE_KEYS_DATA }
