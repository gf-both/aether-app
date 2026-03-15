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
      key: `${lifesWork.gate}.${lifesWork.line}`,
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

  return { SPHERES, GK_LIST, profile }
}

// Default exports for backward compatibility (computed for Gaston's birth data)
const { SPHERES: defaultSpheres, GK_LIST: defaultGKList } = computeGeneKeysData()

export const SPHERES = defaultSpheres
export const GK_LIST = defaultGKList
export { GENE_KEYS_DATA }
