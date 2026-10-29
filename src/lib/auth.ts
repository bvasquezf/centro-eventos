import { withBase } from './paths';
import { supabase } from './supabase';
export async function isManager() {
  if (!supabase) return false;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return false;
  const { data, error: denied } = await supabase.from('managers').select('user_id').eq('user_id', user.id).maybeSingle();
  return !denied && !!data;
}
export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Demostración: autenticación no configurada.');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('No se pudo iniciar sesión. Revisa tus credenciales.');
}
export async function signOut() {
  const result = await supabase?.auth.signOut();
  if (result?.error) throw new Error('No se pudo cerrar sesión. Reintenta.');
}
export async function recover(email: string) {
  if (!supabase) throw new Error('Demostración: recuperación no configurada.');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}${withBase('/panel/')}?recovery=1` });
  if (error) throw new Error('No se pudo procesar la recuperación. Reintenta más tarde.');
}
export async function updatePassword(password: string) {
  if (!supabase || password.length < 12) throw new Error('Usa al menos 12 caracteres.');
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error('No se pudo actualizar la contraseña. Solicita un nuevo enlace.');
}
