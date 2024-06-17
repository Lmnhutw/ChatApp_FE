import React from 'react';
import styles from '../styles/Login.module.css';

interface LoginProps {
    type: 'login' | 'signup';
}

const Login: React.FC<LoginProps> = ({ type }) => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome to ChatApp</h1>
            <form className={styles.form}>
                <label className={styles.label}>
                    Email
                    <input type="email" className={styles.input} placeholder="you@example.com" />
                </label>
                <label className={styles.label}>
                    Password
                    <input type="password" className={styles.input} placeholder="••••••••" />
                </label>
                <button type="submit" className={styles.button}>
                    {type === 'login' ? 'Login' : 'Sign Up'}
                </button>
            </form>
        </div>
    );
};

export default Login;
