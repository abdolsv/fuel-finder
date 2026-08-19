import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { 
    isAuthenticated, 
    user, 
    logout 
  } = useAuth();
  
  const [
    menuOpen, 
    setMenuOpen
  ] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <nav className="nav-bar">
      <div className="nav-bar-top">
        <NavLink to="/" 
          className="nav-brand" 
          onClick={closeMenu}
        >
          Fuel Station Finder
        </NavLink>

        <button
          type="button"
          className="nav-hamburger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={menuOpen ? 'nav-links open' : 'nav-links'}>
        <NavLink to="/" 
          end className={linkClass} 
          onClick={closeMenu}
        >
          Find fuel
        </NavLink>
        
        <NavLink to="/about" 
          className={linkClass} 
          onClick={closeMenu}
        >
          About
        </NavLink>
        
        <NavLink to="/faq" 
          className={linkClass} 
          onClick={closeMenu}
        >
          FAQ
        </NavLink>
        
        <NavLink to="/contact" 
          className={linkClass} 
          onClick={closeMenu}
        >
          Contact
        </NavLink>

        {isAuthenticated ? (
          <>
            <NavLink to="/admin" 
              className={linkClass} 
              onClick={closeMenu}
            >
              Admin
            </NavLink>
            
            <span className="nav-user">{user?.email}</span>
            <button
              type="button"
              className="nav-logout"
              onClick={() => {
                logout();
                closeMenu();
              }}
            >
              Log out
            </button>
            
          </>
        ) : (
          <NavLink to="/admin/login" 
             className={linkClass} 
             onClick={closeMenu}
          >
            Admin
          </NavLink>
          
        )}
      </div>
    </nav>
  );
}
