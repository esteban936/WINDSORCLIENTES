import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoMode, supabase, supabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);
const demoSession = { user: { email: 'demo@windsor.local' } };
const demoUsuario = { id: '00000000-0000-0000-0000-000000000001', nombre: 'Pablo', rol: 'admin' };

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

  const loadSession = async (nextSession) => {
    setLoading(true);
    setSession(nextSession);
    setAuthError('');

    if (!nextSession) {
      setUsuario(null);
      setRol(null);
      localStorage.removeItem('windsor_persona');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('equipo')
      .select('id, nombre, rol')
      .eq('auth_id', nextSession.user.id)
      .single();

    if (error) {
      setUsuario(null);
      setRol(null);
      setAuthError(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setUsuario(null);
      setRol(null);
      setAuthError('Tu usuario no está vinculado al equipo. Revisá auth_id en Supabase.');
      setLoading(false);
      return;
    }

    const usuarioLogueado = {
      id: data.id,
      nombre: data.nombre,
      rol: data.rol ?? 'vendedor',
    };

    setUsuario(usuarioLogueado);
    setRol(usuarioLogueado.rol);
    localStorage.setItem('windsor_persona', JSON.stringify(usuarioLogueado));
    setLoading(false);
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
    await loadSession(data.session);
  };

  const logout = async () => {
    setUsuario(null);
    setRol(null);
    localStorage.removeItem('windsor_persona');
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
