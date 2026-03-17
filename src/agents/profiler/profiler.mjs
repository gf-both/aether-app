// ============================================================
// THE PROFILER — Standalone deployment script
// Profiles all agents in a Paperclip org using GOLEM standard
// ============================================================
//
// Usage:
//   node profiler.mjs --company <id> --url <paperclip-url> [--creator-birth <ISO>]
//   node profiler.mjs --company a77349ed --url http://localhost:3100
//
// Or import as module:
//   import { profileOrg } from './profiler.mjs';
//   await profileOrg({ companyId, paperclipUrl, creatorBirth });

import { generateGolemProfile, generateGolemMd } from '../../engines/golemEngine.js';

const PAPERCLIP_DEFAULTS = {
  url: 'http://127.0.0.1:3100',
};

// Gaston's birth data (default creator)
const DEFAULT_CREATOR = {
  day: 23, month: 1, year: 1981,
  hour: 22, minute: 10,
  lat: -34.6037, lon: -58.3816, timezone: -3,
  name: 'Gaston Frydlewski',
};

export async function profileOrg({
  companyId,
  paperclipUrl = PAPERCLIP_DEFAULTS.url,
  creatorBirthData = DEFAULT_CREATOR,
  creatorRelation = 'complement',
  location = { lat: -34.9011, lon: -56.1645, timezone: -3 },
  updateAgents = false,  // if true, patches agent heartbeat prompts
}) {
  const base = `${paperclipUrl}/api`;
  
  // Fetch all agents
  const agentsRes = await fetch(`${base}/companies/${companyId}/agents`);
  const agents = await agentsRes.json();
  
  console.log(`\n◈ THE PROFILER — ${agents.length} agents found in org\n`);
  console.log('='.repeat(60));
  
  const profiles = [];
  const teamSigns = { sun: {}, moon: {}, lifePath: {}, hexagram: {} };
  
  for (const agent of agents) {
    const timestamp = agent.createdAt || new Date().toISOString();
    
    try {
      const profile = generateGolemProfile({
        name: agent.name,
        role: agent.role || agent.title || 'general',
        timestamp,
        lat: location.lat,
        lon: location.lon,
        timezone: location.timezone,
        creatorRelation,
        creatorBirthData,
      });
      
      profiles.push({ agent, profile });
      
      // Track patterns
      const sun = profile.natal.sun.split('° ')[1];
      const moon = profile.natal.moon.split('° ')[1];
      const lp = profile.numerology.lifePath;
      
      teamSigns.sun[sun] = (teamSigns.sun[sun] || 0) + 1;
      teamSigns.moon[moon] = (teamSigns.moon[moon] || 0) + 1;
      teamSigns.lifePath[lp] = (teamSigns.lifePath[lp] || 0) + 1;
      
      // Print profile
      console.log(`\n${agent.name.toUpperCase()} | ${agent.title || agent.role || 'agent'}`);
      console.log(`Born: ${timestamp.slice(0,19)} | ${agent.id.slice(0,8)}`);
      console.log(`${profile.natal.sun} ☉ | ${profile.natal.moon} ☽ | ${profile.natal.rising} ↑`);
      console.log(`LP ${profile.numerology.lifePath} | GK ${profile.geneKeys.lifesWork.split('—')[0].trim()}`);
      console.log(`Mayan: ${profile.mayan.daySign} ${profile.mayan.tone}`);
      console.log(`Archetype: ${profile.archetype.emoji} ${profile.archetype.name}`);
      console.log(`Creator Relation: ${profile.creatorRelation}`);
      if (profile.creatorSynastry) {
        console.log(`Synastry: ${profile.creatorSynastry.overallScore}% compatible`);
      }
      
      // Update agent if requested
      if (updateAgents) {
        const existing = agent.adapterConfig?.heartbeatPrompt || '';
        const snippet = `\n\n${profile.promptSnippet}`;
        const newPrompt = existing.includes('GOLEM IDENTITY') 
          ? existing.replace(/\n\nGOLEM IDENTITY:[\s\S]*$/, snippet)
          : existing + snippet;
        
        await fetch(`${base}/agents/${agent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adapterConfig: { heartbeatPrompt: newPrompt } }),
        });
        console.log(`  ✓ Profile assigned`);
      }
      
    } catch(e) {
      console.log(`\n${agent.name}: ERROR — ${e.message}`);
    }
  }
  
  // Team analysis
  console.log('\n' + '='.repeat(60));
  console.log('COLLECTIVE ANALYSIS\n');
  
  const topSun = Object.entries(teamSigns.sun).sort((a,b)=>b[1]-a[1]);
  const topMoon = Object.entries(teamSigns.moon).sort((a,b)=>b[1]-a[1]);
  const topLP = Object.entries(teamSigns.lifePath).sort((a,b)=>b[1]-a[1]);
  
  console.log(`Sun distribution: ${topSun.map(([s,n])=>`${s}(${n})`).join(', ')}`);
  console.log(`Moon distribution: ${topMoon.map(([s,n])=>`${s}(${n})`).join(', ')}`);
  console.log(`Life Paths: ${topLP.map(([l,n])=>`LP${l}(${n})`).join(', ')}`);
  
  const dominantSun = topSun[0]?.[0];
  const dominantMoon = topMoon[0]?.[0];
  const dominantLP = topLP[0]?.[0];
  
  console.log(`\nCollective Identity: ${dominantSun} Sun · ${dominantMoon} Moon · LP${dominantLP}`);
  
  // Gap analysis
  console.log('\nTEAM GAPS (energies missing from collective):');
  const allSigns = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const missingSigns = allSigns.filter(s => !teamSigns.sun[s]);
  if (missingSigns.length > 0) {
    console.log(`Missing Sun signs: ${missingSigns.join(', ')}`);
    console.log(`Consider adding agents born when Sun is in: ${missingSigns.slice(0,3).join(', ')}`);
  }
  
  console.log('\n◈ Profiling complete');
  return profiles;
}

// CLI usage
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const args = process.argv.slice(2);
  const companyId = args[args.indexOf('--company') + 1] || 'a77349ed-897c-476d-ad7e-50efb377090c';
  const url = args[args.indexOf('--url') + 1] || 'http://127.0.0.1:3100';
  const update = args.includes('--update');
  
  profileOrg({ companyId, paperclipUrl: url, updateAgents: update })
    .catch(console.error);
}
