"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type RegisterProps  = {
    type: 'login' | 'register';
};

const Register: React.FC<RegisterProps > = ({ type }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    // const [userName, setUserName] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = type === 'register' ? 'https://localhost:5001/api/auth/register' : 'https://localhost:5001/api/auth/login';
        // const body = type === 'register' ? { email, password, fullName } : { email, password } ;
        const response = await fetch('https://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, fullName  }),
        });

        if (response.ok) {
            
            router.push('/'); // Redirect to login page after successful registration
        } else {
            console.error('Registration failed');
        }
    };

    return (
        <div className={styles.container} >
            <h1 className={styles.title}>Register</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <label>
                    <label className={styles.label}>Full Name</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                    />
                </label>
                {/* <label>
                    <label className={styles.label}>User Name</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="JohnDoe"
                    />
                </label> */}
                <label>
                    <label className={styles.label}>Email</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </label>
                <label>
                    <label className={styles.label}> Password </label>
                    <input
                        type="text"
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </label>
                <button type="submit" className={styles.button}>Register</button>
            </form>
            {type === 'register' ? (
                <div className={styles.footer}>
                    <p>
                    You don&apos;t have an account? <span onClick={() => router.push("/register")}className={styles.link}>Sign Up</span>

                    </p>
                </div>
            ) : (
                <div className={styles.footer}>
                    <p>
                    Already have an account? <span onClick={() => router.push("/")} className={styles.link}>Login</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default Register;
