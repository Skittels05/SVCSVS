import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  logo: string;
}

const Header = ({ logo }: HeaderProps) => {
  return (
    <header>
      <img src={logo} alt="roby_header" />
      <div>
        <p className="header">A creative agency based in Helsinki.</p>
        <p className="email">hello@robi.com</p>
      </div>

      <input type="checkbox" id="burger-toggle" className="burger-toggle" />
      <label htmlFor="burger-toggle" className="burger-btn">
        <span></span>
        <span></span>
        <span></span>
      </label>

      <nav className="nav-container">
        <ul className="nav">
          <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
          <li><NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""}>About</NavLink></li>
          <li><NavLink to="/blog" className={({ isActive }) => isActive ? "active" : ""}>Blog</NavLink></li>
          <li><NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""}>Contact</NavLink></li>
          <li><NavLink to="/cart" className={({ isActive }) => isActive ? "active" : ""}>Cart (0)</NavLink></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;