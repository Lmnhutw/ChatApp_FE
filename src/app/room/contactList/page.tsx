// src/app/components/UserList.tsx
import React from 'react';
import styles from './contactList.module.css';

const ContactList = () => {
    const users = [
        { name: 'Harry Maguire', status: 'You need to improve now' },
        { name: 'United Family', status: 'Rashford is typing...' },
        { name: 'Rasmus Hojlund', status: 'Bos, I need to talk today' },
        // Add more users here
    ];

    return (
        <div className={styles.userList}>
            {users.map((user, index) => (
                <div key={index} className={styles.user}>
                    <div className={styles.avatar}></div>
                    <div className={styles.details}>
                        <p className={styles.name}>{user.name}</p>
                        <p className={styles.status}>{user.status}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ContactList;
