import React from 'react';
import './Header.css';

class Header extends React.Component {
  render() {
    return (
      <header>
        <img src={this.props.logo} alt="roby_header" />
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
            <li><a href="a">Home</a></li>
            <li><a href="a">About</a></li>
            <li><a href="a">News</a></li>
            <li><a href="a">Contact</a></li>
            <li><a href="a">Cart (0)</a></li>
          </ul>
        </nav>
      </header>
    );
  }
}

export default Header;