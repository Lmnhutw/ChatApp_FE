import React from 'react';
import Layout from './Layout';
import AuthPage from './AuthPage';

const App: React.FC = () => {
    return (
        <Layout>
            <AuthPage />
        </Layout>
    );
};

export default App;
