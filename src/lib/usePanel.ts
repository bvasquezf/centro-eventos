import { withBase } from './paths';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { isManager, signIn, signOut, recover, updatePassword } from './auth';
import { supabase } from './supabase';
import { listRequests, pageSize, type Filters } from './requests';
import type { RequestRecord } from '../../shared/request';
export function usePanel() {
  const [access, setAccess] = useState<'loading' | 'login' | 'authorized' | 'denied' | 'recovery'>('loading');
  const [rows, setRows] = useState<RequestRecord[]>([]); const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<RequestRecord | null>(null);
  const [filters, setFilters] = useState<Filters>({ from: '', to: '', type: '', page: 0 });
  const [loading, setLoading] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState(''); const [revision, setRevision] = useState(0);
  const recovering = useRef(false);
  useEffect(() => {
    if (!supabase) { setAccess('login'); return; }
    let live = true; let epoch = 0;
    recovering.current = new URLSearchParams(location.search).get('recovery') === '1';
    async function check() {
      const token = ++epoch;
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (live && token === epoch) setAccess('login'); return; }
      const allowed = await isManager();
      if (live && token === epoch) setAccess(recovering.current ? 'recovery' : allowed ? 'authorized' : 'denied');
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') { recovering.current = true; ++epoch; setAccess('recovery'); }
      else if (event === 'SIGNED_OUT') { recovering.current = false; ++epoch; setAccess('login'); setRows([]); setSelected(null); setCount(0); }
      else { setTimeout(() => { if (live && !recovering.current) void check(); }, 0); }
    });
    void check();
    return () => { live = false; subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (access !== 'authorized') return;
    let live = true; setLoading(true); setLoadError(''); setSelected(null); setRows([]);
    if (filters.from && filters.to && filters.from > filters.to) { setLoadError('La fecha inicial debe ser anterior a la final.'); setLoading(false); return; }
    listRequests(filters).then(result => { if (live) { setRows(result.rows); setCount(result.count); } })
      .catch(error => { if (live) setLoadError(error.message); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [access, filters, revision]);
  async function onAuth(event: SubmitEvent<HTMLFormElement>, action: 'login' | 'recover' | 'password') {
    event.preventDefault(); if (busy) return; setBusy(true); setMessage('');
    const form = new FormData(event.currentTarget); const email = String(form.get('email') ?? ''); const password = String(form.get('password') ?? '');
    try {
      if (action === 'recover') { await recover(email); setMessage('Si la cuenta está habilitada, recibirás un enlace de recuperación.'); }
      else if (action === 'password') { await updatePassword(password); history.replaceState(null, '', withBase('/panel/')); await signOut(); setMessage('Contraseña actualizada. Inicia sesión con tu nueva contraseña.'); }
      else { await signIn(email, password); setAccess(await isManager() ? 'authorized' : 'denied'); }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo completar la acción.'); }
    finally { setBusy(false); }
  }
  async function logout() {
    try { await signOut(); setAccess('login'); setRows([]); setSelected(null); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo cerrar sesión.'); }
  }
  return { access, rows, count, selected, filters, loading, busy, message, loadError, pageSize,
    demo: !supabase, onAuth, logout, select: setSelected,
    retry: () => setRevision(n => n + 1),
    filter: (key: 'from' | 'to' | 'type', value: string) => setFilters(old => ({ ...old, [key]: value, page: 0 })),
    page: (page: number) => setFilters(old => ({ ...old, page })),
  };
}
export type PanelContract = ReturnType<typeof usePanel>;
