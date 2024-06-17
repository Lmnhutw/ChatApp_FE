import React from 'react';
import styles from '../styles/Register.module.css';

const Register: React.FC = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Register for ChatApp</h1>
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
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default Register;
