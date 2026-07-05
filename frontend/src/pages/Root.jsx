import { Outlet } from 'react-router-dom';
import Navbar from '@components/Navbar';
import { AuthProvider } from '@context/AuthContext';
import { useState } from 'react';

function Root()  {
return (
    <AuthProvider>
        <PageRoot/>
    </AuthProvider>
);
}

function PageRoot() {
const [sidebarOpen, setSidebarOpen] = useState(true);

return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        <Navbar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((current) => !current)} />
        <main className="app-content">
            <Outlet />
        </main>
    </div>
);
}

export default Root;