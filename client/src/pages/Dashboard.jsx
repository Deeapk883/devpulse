import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import Layout from '../components/Layout';
import RepoCard from '../components/RepoCard';
import StatsCard from '../components/StatsCard';

const Dashboard = () => {
    const { user, setUser, logout } = useContext(AuthContext);
    const [repos, setRepos] = useState([]);
    const [trackedRepos, setTrackedRepos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in URL params (from OAuth redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // Clean up URL
            window.history.replaceState({}, document.title, '/dashboard');
            // Verify and set user
            verifyToken(token);
        }

        fetchRepos();
        fetchTrackedRepos();
    }, []);

    const verifyToken = async (token) => {
        try {
            const response = await fetch('http://localhost:5000/api/protected', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Token verification failed:', error);
        }
    };
    const fetchRepos = async () => {
        try {
            const response = await axios.get('/api/repos');
            setRepos(response.data);
        } catch (error) {
            console.error('Failed to fetch repos:', error);
        }
    };

    const fetchTrackedRepos = async () => {
        try {
            const response = await axios.get('/api/repos/tracked');
            setTrackedRepos(response.data);
        } catch (error) {
            console.error('Failed to fetch tracked repos:', error);
        } finally {
            setLoading(false);
        }
    };

    const trackRepo = async (repo) => {
        try {
            await axios.post('/api/repos', {
                github_repo_id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                html_url: repo.html_url,
                description: repo.description,
            });
            fetchTrackedRepos();
        } catch (error) {
            console.error('Failed to track repo:', error);
        }
    };

    const syncCommits = async (repoId) => {
        try {
            await axios.post(`/api/commits/sync/${repoId}`);
            alert('Commits synced successfully!');
        } catch (error) {
            console.error('Failed to sync commits:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="space-y-8">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.username}!</h1>
                    <p className="text-gray-400">Here's an overview of your development activity</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Tracked Repos"
                        value={trackedRepos.length}
                        change={12}
                        icon="📁"
                    />
                    <StatsCard
                        title="Total Commits"
                        value="1,234"
                        change={8}
                        icon="💻"
                    />
                    <StatsCard
                        title="Active Days"
                        value="28"
                        change={15}
                        icon="📅"
                    />
                    <StatsCard
                        title="Productivity Score"
                        value="87%"
                        change={5}
                        icon="🚀"
                    />
                </div>

                {/* GitHub Repositories Section */}
                <div>
                    <h2 className="text-2xl font-semibold text-white mb-6">Your GitHub Repositories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {repos.slice(0, 6).map(repo => (
                            <RepoCard
                                key={repo.id}
                                repo={repo}
                                onTrack={trackRepo}
                                isTracked={false} // TODO: check if tracked
                            />
                        ))}
                    </div>
                </div>

                {/* Tracked Repositories Section */}
                {trackedRepos.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-6">Tracked Repositories</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trackedRepos.map(repo => (
                                <RepoCard
                                    key={repo.id}
                                    repo={repo}
                                    onSync={syncCommits}
                                    isTracked={true}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-white mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        {/* Placeholder for recent commits */}
                        <div className="text-gray-400 text-center py-8">
                            Recent commits will appear here once repositories are tracked and synced.
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;