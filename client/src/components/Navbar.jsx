import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-white">Dashboard</h2>
            </div>
            <div className="flex items-center space-x-4">
                {user && (
                    <>
                        <span className="text-gray-300">{user.username}</span>
                        {user.avatarUrl && (
                            <img
                                src={user.avatarUrl}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full"
                            />
                        )}
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;