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
