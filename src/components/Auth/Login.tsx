"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';
import Link from 'next/link';

type LoginProps = {
    type: 'login' | 'register';
};

const Login: React.FC<LoginProps> = ({ type }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [userName, setUserName] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = type === 'login' ? 'https://localhost:5001/api/auth/login' : 'https://localhost:5001/api/auth/register';
        const body = type === 'login' ? { email, password } : { email, password, fullName, userName };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const redirectTo = type === 'login' ? '/chat' : '/login';
            router.push(redirectTo);
        } else {
            console.error(type === 'login' ? 'Login failed' : 'Registration failed');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome to ChatApp</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                {type === 'register' && (
                    <>
                        <label className={styles.label}>
                            Full Name
                            <input
                                type="text"
                                className={styles.input}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </label>
                        <label className={styles.label}>
                            User Name
                            <input
                                type="text"
                                className={styles.input}
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="john_doe"
                            />
                        </label>
                    </>
                )}
                <label className={styles.label}>
                    Email
                    <input
                        type="email"
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </label>
                <label className={styles.label}>
                    Password
                    <input
                        type="password"
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </label>
                <button type="submit" className={styles.button}>
                    {type === 'login' ? 'Login' : 'Sign Up'}
                </button>
            </form>
            {type === 'login' ? (
                <div className={styles.footer}>
                    <p>
                        You don&apos;t have an account?  <span onClick={() => router.push("/register")}className={styles.link}>Sign Up</span>
                    </p>
                </div>
            ) : (
                <div className={styles.footer}>
                    <p>
                        Already have an account? <span onClick={() => router.push("/login")} className={styles.link}>Login</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default Login;
