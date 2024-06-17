import React from 'react';
import Login from '../components/Login';
import styles from '../styles/Page.module.css';

const AuthPage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <Login type="login" />
        </div>
    );
};

export default AuthPage;
