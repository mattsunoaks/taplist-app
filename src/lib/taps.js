import { supabase } from '../supabase';

export function toClient(row) {
  return {
    tap: row.tap,
    name: row.name,
    brewery: row.brewery,
    location: row.location,
    style: row.style,
    abv: row.abv,
    price: row.price,
    logo: row.logo,
    staffPick: row.staff_pick,
  };
}

export function toDb(obj) {
  const row = {};
  if (obj.tap !== undefined) row.tap = obj.tap;
  if (obj.name !== undefined) row.name = obj.name;
  if (obj.brewery !== undefined) row.brewery = obj.brewery;
  if (obj.location !== undefined) row.location = obj.location;
  if (obj.style !== undefined) row.style = obj.style;
  if (obj.abv !== undefined) row.abv = Number(obj.abv);
  if (obj.price !== undefined) row.price = Number(obj.price);
  if (obj.logo !== undefined) row.logo = obj.logo;
  if (obj.staffPick !== undefined) row.staff_pick = obj.staffPick;
  return row;
}

export async function fetchTaps() {
  const { data, error } = await supabase.from('taps').select('*').order('tap');
  if (error) throw error;
  return data.map(toClient);
}

export async function createTap(tapData) {
  const { data: existing } = await supabase.from('taps').select('tap').order('tap', { ascending: false }).limit(1);
  const nextTap = existing?.length ? existing[0].tap + 1 : 1;
  const { data, error } = await supabase.from('taps').insert(toDb({ ...tapData, tap: nextTap })).select().single();
  if (error) throw error;
  return toClient(data);
}

export async function updateTap(tapNum, tapData) {
  const { data, error } = await supabase.from('taps').update(toDb(tapData)).eq('tap', tapNum).select().single();
  if (error) throw error;
  return toClient(data);
}

export async function deleteTap(tapNum) {
  const { error } = await supabase.from('taps').delete().eq('tap', tapNum);
  if (error) throw error;
}

export async function reorderTaps(taps) {
  const { error } = await supabase.from('taps').upsert(taps.map(toDb));
  if (error) throw error;
}

export async function uploadLogo(file) {
  const ext = file.name.split('.').pop();
  const filename = `logo-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('logos').upload(filename, file);
  if (error) throw error;
  const { data } = supabase.storage.from('logos').getPublicUrl(filename);
  return data.publicUrl;
}

export async function deleteLogo(url) {
  // Extract filename from full URL
  const filename = url.split('/').pop();
  await supabase.storage.from('logos').remove([filename]);
}
