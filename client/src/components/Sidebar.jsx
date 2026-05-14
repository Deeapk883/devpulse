import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/repositories', label: 'Repositories', icon: '📁' },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
    ];

    return (
        <div className="w-64 bg-gray-900 h-full flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-white">DevPulse</h1>
            </div>
            <nav className="flex-1 px-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;