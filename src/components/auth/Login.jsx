import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Hardcoded admin login (fallback)
        if (email === 'admin@libsys.com' && password === 'admin123') {
            const adminUser = {
                id: 0,
                name: 'System Admin',
                email: 'admin@libsys.com',
                role: 'Admin',
                status: 'Active'
            };
            localStorage.setItem('user', JSON.stringify(adminUser));
            setLoading(false);
            navigate('/admin');
            return;
        }

        // Regular database authentication

        try {
            const response = await api.post('/users/login', {
                email: email,
                password: password
            });

            if (response.data.success) {
                // Store user info in localStorage
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Redirect based on role
                if (response.data.user.role === 'Admin' || response.data.user.role === 'Librarian') {
                    navigate('/admin');
                } else {
                    // Members go to member dashboard
                    navigate('/member');
                }
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Login failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-small">📚 LibSys</div>
                    <h2>Welcome Back</h2>
                    <p>Please sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? Contact your administrator</p>
                    <div className="demo-credentials">
                        <p><strong>Demo Admin Login:</strong></p>
                        <p>Email: admin@libsys.com</p>
                        <p>Password: admin123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
