'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    role: string | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    signOut: async () => { },
});

function extractRoleFromSession(session: any): string | null {
    if (!session?.user) return null;

    // 1. App metadata (secure, server-set)
    if (session.user.app_metadata?.role) {
        return session.user.app_metadata.role;
    }

    // 2. Direct user_role or role on user object
    if (session.user.user_role || session.user.role) {
        return session.user.user_role || session.user.role;
    }

    // 3. User metadata
    if (session.user.user_metadata?.role) {
        return session.user.user_metadata.role;
    }

    // 4. Decode JWT access token claims (for Supabase custom claims / hooks)
    if (session.access_token) {
        try {
            const parts = session.access_token.split('.');
            if (parts.length >= 2) {
                const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
                const payload = JSON.parse(atob(padded));
                return (
                    payload?.app_metadata?.role ||
                    payload?.user_role ||
                    payload?.role ||
                    payload?.user_metadata?.role ||
                    null
                );
            }
        } catch {
            // ignore
        }
    }

    return null;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user and role
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                document.cookie = `token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; Secure`;
            } else {
                document.cookie = 'token=; path=/; max-age=0; SameSite=Lax; Secure';
            }
            setUser(session?.user ?? null);
            setRole(extractRoleFromSession(session));
            setLoading(false);
        };

        fetchSession();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                document.cookie = `token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; Secure`;
            } else {
                document.cookie = 'token=; path=/; max-age=0; SameSite=Lax; Secure';
            }
            setUser(session?.user ?? null);
            setRole(extractRoleFromSession(session));
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
