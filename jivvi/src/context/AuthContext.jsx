// ==============================================================================
// AUTH CONTEXT
// File: src/context/AuthContext.jsx
// ==============================================================================

import { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { profileService } from "../services/profile";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("signin"); // 'signin' | 'signup' | 'forgot'

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Check for local demo user session
      const storedDemo = localStorage.getItem("jivvi_demo_user");
      if (storedDemo) {
        const parsed = JSON.parse(storedDemo);
        setUser(parsed.user);
        setProfile(parsed.profile);
      }
      setLoading(false);
      return;
    }

    // Initialize real Supabase session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } catch (err) {
        console.error("Auth session init error:", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen to real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const userProfile = await profileService.getProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.warn("Could not load user profile:", err);
    }
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      // Demo simulated login
      const role = email.toLowerCase().includes("admin") ? "admin" : "customer";
      const demoUser = { id: "demo-user-123", email };
      const demoProfile = {
        id: "demo-user-123",
        email,
        full_name: email.split("@")[0],
        phone: "+91 98861 93296",
        role,
      };
      setUser(demoUser);
      setProfile(demoProfile);
      localStorage.setItem("jivvi_demo_user", JSON.stringify({ user: demoUser, profile: demoProfile }));
      closeAuthModal();
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data?.user) {
      setUser(data.user);
      await loadUserProfile(data.user.id);
    }
    closeAuthModal();
    return { success: true };
  };

  const signUp = async ({ email, password, fullName, phone }) => {
    if (!isSupabaseConfigured) {
      const demoUser = { id: "demo-user-" + Date.now(), email };
      const demoProfile = {
        id: demoUser.id,
        email,
        full_name: fullName,
        phone,
        role: "customer",
      };
      setUser(demoUser);
      setProfile(demoProfile);
      localStorage.setItem("jivvi_demo_user", JSON.stringify({ user: demoUser, profile: demoProfile }));
      closeAuthModal();
      return { success: true };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });

    if (error) throw error;
    if (data?.user) {
      setUser(data.user);
      await loadUserProfile(data.user.id);
    }
    closeAuthModal();
    return { success: true };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem("jivvi_demo_user");
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) {
      return { success: true };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { success: true };
  };

  const openAuthModal = (mode = "signin") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile: () => user && loadUserProfile(user.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
