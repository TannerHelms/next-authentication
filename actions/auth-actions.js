'use server';
import { createAuthSession, destroySession } from '@/lib/auth';
import { hashUserPassword, verifyPassword } from '@/lib/hash'
import CreateUser, { getUserByEmail } from "@/lib/user";
import { redirect } from 'next/navigation';

export async function signup(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    let errors = {}
    if (!email || !email.includes('@')) {
        errors.email = 'Please enter a valid email address';
    }
    if (password.trim().length < 8) {
        errors.password = 'Password must be at least 8 characters long';
    }

    if (Object.keys(errors).length > 0) {
        return {
            errors
        }
    }

    const hashedPassword = hashUserPassword(password);
    try {
        const id = CreateUser(email, hashedPassword);
        createAuthSession(id);
        redirect('/training')
    } catch (error) {
        if (error.code === 'SQLITE_CONTRAINT_UNIQUE') {
            return {
                errors: {
                    email: 'Email already exists'
                }
            }
        }
        throw error;
    }
}

export async function login(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    const user = getUserByEmail(email);
    if (!user) {
        return {
            errors: {
                email: 'Email does not exist'
            }
        }
    }

    if (verifyPassword(user.password, password)) {
        createAuthSession(user.id);
        redirect('/training')
    } else {
        return {
            errors: {
                password: 'Password is incorrect'
            }
        }
    }
}

export async function logout(prevState, formData) {
    destroySession();
    redirect('/');
}

export async function auth(mode, prevState, formData) {
    if (mode === 'login') {
        return login(prevState, formData);
    }
    return signup(prevState, formData);
}