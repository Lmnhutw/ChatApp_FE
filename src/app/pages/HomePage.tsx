import React from 'react';
import styles from '../styles/page.module.css';

const HomePage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <h1>Welcome to ChatApp Home</h1>
            {/* Add your home page content here */}
        </div>
    );
};

export default HomePage;
