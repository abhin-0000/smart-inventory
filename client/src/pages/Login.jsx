import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Sparkles, Package, TrendingUp, Shield } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (isRegistering) {
                await register(name, email, password);
            } else {
                await login(email, password);
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { icon: Package, title: 'Smart Inventory', desc: 'AI-powered stock management' },
        { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Track performance instantly' },
        { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security' },
    ];

    return (
        <div className="auth-container">
            {/* Animated Background */}
            <div className="auth-bg">
                <div className="auth-blob auth-blob-1"></div>
                <div className="auth-blob auth-blob-2"></div>
                <div className="auth-blob auth-blob-3"></div>
            </div>

            <div className="auth-content">
                {/* Left Side - Branding */}
                <div className="auth-branding">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <Sparkles size={32} />
                        </div>
                        <span className="auth-logo-text">G-mart</span>
                    </div>

                    <h1 className="auth-headline">
                        Your Smart<br />
                        <span className="auth-headline-accent">Shopping Destination</span>
                    </h1>

                    <p className="auth-tagline">
                        Shop smarter with great deals, easy ordering, and seamless delivery
                    </p>

                    <div className="auth-features">
                        {features.map((feature, index) => (
                            <div key={index} className="auth-feature">
                                <div className="auth-feature-icon">
                                    <feature.icon size={20} />
                                </div>
                                <div>
                                    <div className="auth-feature-title">{feature.title}</div>
                                    <div className="auth-feature-desc">{feature.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-container">
                    <div className="auth-card">
                        <div className="auth-card-header">
                            <h2 className="auth-title">
                                {isRegistering ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            <p className="auth-subtitle">
                                {isRegistering
                                    ? 'Start your inventory management journey'
                                    : 'Sign in to continue to your dashboard'}
                            </p>
                        </div>

                        {error && (
                            <div className="auth-error">
                                <div className="auth-error-icon">!</div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {isRegistering && (
                                <div className="auth-input-group">
                                    <label className="auth-label">Full Name</label>
                                    <div className="auth-input-wrapper">
                                        <User className="auth-input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="auth-input"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="auth-input-group">
                                <label className="auth-label">Email Address</label>
                                <div className="auth-input-wrapper">
                                    <Mail className="auth-input-icon" size={18} />
                                    <input
                                        type="email"
                                        className="auth-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <label className="auth-label">Password</label>
                                <div className="auth-input-wrapper">
                                    <Lock className="auth-input-icon" size={18} />
                                    <input
                                        type="password"
                                        className="auth-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {!isRegistering && (
                                <div className="auth-forgot">
                                    <button type="button" className="auth-forgot-link">
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`auth-submit ${isLoading ? 'auth-submit-loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="auth-spinner"></div>
                                ) : (
                                    <>
                                        {isRegistering ? 'Create Account' : 'Sign In'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        <div className="auth-switch">
                            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError('');
                                }}
                                className="auth-switch-link"
                            >
                                {isRegistering ? 'Sign In' : 'Create one'}
                            </button>
                        </div>
                    </div>

                    <p className="auth-footer">
                        By continuing, you agree to our{' '}
                        <a href="#" className="auth-link">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="auth-link">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
