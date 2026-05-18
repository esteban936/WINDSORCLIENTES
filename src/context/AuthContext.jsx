import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoMode, supabase, supabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);
const demoSession = { user: { email: 'demo@windsor.local' } };
const demoPersona = { id: '00000000-0000-0000-0000-000000000001', nombre: 'Pablo' };

export function AuthProvider({ children }) {
  const [session, setSession] = useState(demoMode ? demoSession : null);
  const [loading, setLoading] = useState(!demoMode);
  const [personaActiva, setPersonaActivaState] = useState(() => {
    const saved = localStorage.getItem('windsor_persona');
    return saved ? JSON.parse(saved) : (demoMode ? demoPersona : null);
  });

  useEffect(() => {
    if (demoMode) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) setPersonaActiva(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const setPersonaActiva = (persona) => {
    setPersonaActivaState(persona);
    if (persona) localStorage.setItem('windsor_persona', JSON.stringify(persona));
    else localStorage.removeItem('windsor_persona');
  };

  const signIn = async (email, password) => {
    if (demoMode) {
      setSession(demoSession);
      if (!personaActiva) setPersonaActiva(demoPersona);
      return;
    }
    if (!supabaseConfigured) throw new Error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el entorno.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    setPersonaActiva(null);
    if (demoMode) {
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({ session, loading, personaActiva, setPersonaActiva, signIn, signOut, demoMode }),
    [session, loading, personaActiva],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
