import styles from './AuthForm.module.css';
import Link from 'next/link';

type AuthFormProps = {
    type: 'login' | 'register';
};

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome to ChatApp</h1>
            <form className={styles.form}>
                <label className={styles.label}>
                    Email
                    <input type="email" className={styles.input} placeholder="you@example.com" />
                </label>
                <label className={styles.label}>
                    Passwords
                    <input type="password" className={styles.input} placeholder="••••••••" />
                </label>
                <button type="submit" className={styles.button}>
                    {type === 'login' ? 'Login' : 'Sign Up'}
                </button>
            </form>
            {type === 'login' ? (
                <div className={styles.footer}>
                    <p>
                        
                        You don&apos;t have an account? <Link href="/register">Sign Up</Link>
                    </p>
                </div>
            ) : (
                <div className={styles.footer}>
                    <p>
                        Already have an account? <Link href="/login">Login</Link>
                    </p>
                </div>
            )}
        </div>
    );
};

export default AuthForm;
