import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoMode, supabase, supabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);
const demoSession = { user: { email: 'demo@windsor.local' } };
const demoUsuario = { id: '00000000-0000-0000-0000-000000000001', nombre: 'Pablo', rol: 'admin' };

async function fetchUsuarioPorAuthId(authId) {
  if (!authId) throw new Error('No se encontró el ID de autenticación del usuario.');

  const { data, error } = await supabase
    .from('equipo')
    .select('id, nombre, rol')
    .eq('auth_id', authId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Tu usuario no está vinculado al equipo. Revisá auth_id en Supabase.');

  return {
    id: data.id,
    nombre: data.nombre,
    rol: data.rol ?? 'vendedor',
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(demoMode ? demoSession : null);
  const [loading, setLoading] = useState(!demoMode);
  const [usuario, setUsuario] = useState(demoMode ? demoUsuario : null);
  const [rol, setRol] = useState(demoMode ? 'admin' : null);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (demoMode) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      loadSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      loadSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const applyUsuario = (usuarioLogueado) => {
    setUsuario(usuarioLogueado);
    setRol(usuarioLogueado.rol);
    localStorage.setItem('windsor_persona', JSON.stringify(usuarioLogueado));
  };

  const clearUsuario = () => {
    setUsuario(null);
    setRol(null);
    localStorage.removeItem('windsor_persona');
  };

  const loadSession = async (nextSession) => {
    setLoading(true);
    setSession(nextSession);
    setAuthError('');

    if (!nextSession) {
      clearUsuario();
      setLoading(false);
      return;
    }

    try {
      const usuarioLogueado = await fetchUsuarioPorAuthId(nextSession.user.id);
      applyUsuario(usuarioLogueado);
    } catch (error) {
      clearUsuario();
      setAuthError(error.message ?? 'No pudimos cargar el usuario autenticado.');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    if (demoMode) {
      setSession(demoSession);
      setUsuario(demoUsuario);
      setRol(demoUsuario.rol);
      return;
    }
    if (!supabaseConfigured) throw new Error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el entorno.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const nextSession = data.session;
    const authId = nextSession?.user?.id;
    const usuarioLogueado = await fetchUsuarioPorAuthId(authId);

    setSession(nextSession);
    setAuthError('');
    applyUsuario(usuarioLogueado);
  };

  const logout = async () => {
    clearUsuario();
    if (demoMode) {
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const isAdmin = () => rol === 'admin';

  const value = useMemo(
    () => ({
      session,
      usuario,
      personaActiva: usuario,
      rol,
      loading,
      authError,
      signIn,
      logout,
      signOut: logout,
      isAdmin,
      demoMode,
    }),
    [session, usuario, rol, loading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
