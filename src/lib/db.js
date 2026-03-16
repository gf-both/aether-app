import { supabase } from './supabase';

// ── BIRTH PROFILES ──────────────────────────────────────────────────────────

export async function getPrimaryProfile(userId) {
  const { data, error } = await supabase
    .from('birth_profiles')
    .select('*')
    .eq('owner_id', userId)
    .eq('is_primary', true)
    .single();
  return { data, error };
}

export async function saveBirthProfile(profile, userId) {
  const { data, error } = await supabase
    .from('birth_profiles')
    .upsert({
      ...profile,
      owner_id: userId,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  return { data, error };
}

export async function getAllProfiles(userId) {
  const { data, error } = await supabase
    .from('birth_profiles')
    .select('*')
    .eq('owner_id', userId)
    .order('is_primary', { ascending: false });
  return { data, error };
}

// ── SESSIONS ────────────────────────────────────────────────────────────────

export async function getSessions(practitionerId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, birth_profiles(full_name, birth_date)')
    .eq('practitioner_id', practitionerId)
    .order('session_date', { ascending: false });
  return { data, error };
}

export async function saveSession(session, practitionerId) {
  const { data, error } = await supabase
    .from('sessions')
    .upsert({ ...session, practitioner_id: practitionerId })
    .select()
    .single();
  return { data, error };
}

// ── PRACTITIONER CLIENTS ────────────────────────────────────────────────────

export async function getPractitionerClients(practitionerId) {
  const { data, error } = await supabase
    .from('practitioner_clients')
    .select('*, birth_profiles(*)')
    .eq('practitioner_id', practitionerId)
    .eq('status', 'active');
  return { data, error };
}

// ── USER PROFILE ────────────────────────────────────────────────────────────

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

// ── BIRTH PROFILE SYNC ───────────────────────────────────────────────────────

// Save or update a birth profile (upsert by owner_id + is_primary for primary)
export async function upsertBirthProfile(userId, profileData, isPrimary = false) {
  const payload = {
    owner_id: userId,
    full_name: profileData.name || '',
    birth_date: profileData.dob || null,
    birth_time: profileData.tob || null,
    birth_city: profileData.pob || '',
    birth_lat: profileData.birthLat || null,
    birth_lon: profileData.birthLon || null,
    birth_timezone: profileData.birthTimezone != null ? String(profileData.birthTimezone) : null,
    is_primary: isPrimary,
    label: isPrimary ? 'Me' : (profileData.label || profileData.name || 'Person'),
    updated_at: new Date().toISOString(),
  }

  if (isPrimary) {
    // Try update first, then insert
    const { data: existing } = await supabase
      .from('birth_profiles')
      .select('id')
      .eq('owner_id', userId)
      .eq('is_primary', true)
      .single()

    if (existing?.id) {
      return supabase.from('birth_profiles').update(payload).eq('id', existing.id).select().single()
    } else {
      return supabase.from('birth_profiles').insert(payload).select().single()
    }
  } else {
    return supabase.from('birth_profiles').upsert({ ...payload, id: profileData.id }).select().single()
  }
}

// Get all birth profiles for a user (primary first)
export async function getAllBirthProfiles(userId) {
  return supabase
    .from('birth_profiles')
    .select('*')
    .eq('owner_id', userId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })
}
