import { useState, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export function useAuth() {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            await auth().signInWithEmailAndPassword(email, password);
        } catch (error) {
            throw error;
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            await auth().createUserWithEmailAndPassword(email, password);
        } catch (error) {
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await auth().signOut();
        } catch (error) {
            throw error;
        }
    };

    return {
        user,
        loading,
        signIn,
        signUp,
        signOut,
    };
} 