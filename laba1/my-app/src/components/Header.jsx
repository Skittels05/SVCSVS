import "./Header.css";
import roby from "../images/roby.png"

function Header()
{
    return(
        <header>
        <img src={roby} alt="roby_header"/>
        <div>
            <p className="header">A creative agency based in Helsinki.</p>
            <p className="email">hello@robi.com</p>
        </div>
        <input type="checkbox" id="burger-toggle" className="burger-toggle"/>
        <label for="burger-toggle" className="burger-btn">
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
export default Header;