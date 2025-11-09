import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const { userProfile, isAuthenticated, isRegistered, isAdmin, signOut } = useAuth();
  const [theme, setTheme] = useState('light');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  if (!isAuthenticated || !isRegistered) {
    return null;
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/feed" className="logo">
            🎭 Joke Platform
          </Link>

          <nav className="nav">
            <Link to="/feed" className="nav-link">Feed</Link>
            {isAdmin && (
              <Link to="/admin" className="nav-link">Admin</Link>
            )}
            
            <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className="user-menu-container">
              <button
                className="user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt={userProfile.displayName} />
                ) : (
                  <div className="avatar-placeholder">
                    {userProfile?.displayName?.charAt(0) || '?'}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <p className="user-menu-name">{userProfile?.displayName}</p>
                    <p className="user-menu-email">{userProfile?.email}</p>
                    {isAdmin && <span className="admin-badge">Admin</span>}
                  </div>
                  <div className="user-menu-divider"></div>
                  <Link
                    to="/profile"
                    className="user-menu-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  <button className="user-menu-item" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
