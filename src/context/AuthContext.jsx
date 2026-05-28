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

    cargarUsuarioDesdeSesionActual();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession) cargarUsuarioDesdeSesionActual();
      else loadSession(null);
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
      const usuarioLogueado = await buscarMiembroPorAuthId(nextSession.user.id);
      applyUsuario(usuarioLogueado);
    } catch (error) {
      clearUsuario();
      setAuthError(error.message ?? 'No pudimos cargar el usuario autenticado.');
    } finally {
      setLoading(false);
    }
  };

  const buscarMiembroPorAuthId = async (userId) => {
    if (!userId) throw new Error('No se encontró el ID de autenticación del usuario.');

    const { data: miembro, error } = await supabase
      .from('equipo')
      .select('id, nombre, rol')
      .eq('auth_id', userId)
      .single();

    if (error) throw error;
    if (!miembro) throw new Error('Tu usuario no está vinculado al equipo. Revisá auth_id en Supabase.');

    return {
      id: miembro.id,
      nombre: miembro.nombre,
      rol: miembro.rol ?? 'vendedor',
    };
  };

  const cargarUsuarioDesdeSesionActual = async () => {
    setLoading(true);
    setAuthError('');

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession) {
        setSession(null);
        clearUsuario();
        return;
      }

      const userId = currentSession.user.id;
      const usuarioLogueado = await buscarMiembroPorAuthId(userId);

      setSession(currentSession);
      applyUsuario(usuarioLogueado);
    } catch (error) {
      setSession(null);
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await cargarUsuarioDesdeSesionActual();
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
