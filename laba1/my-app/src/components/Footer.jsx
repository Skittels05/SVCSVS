import "./Footer.css"
import roby from "../images/roby.png"
function Footer()
{
    return(
        <footer> 
        <div className="social_logo">
            <img src={roby} alt="roby"/>
            <div className="social-icons">
                <a href="https://facebook.com" target="_blank"><i className="fab fa-facebook-f"></i></a>
                <a href="https://instagram.com" target="_blank"><i className="fab fa-instagram"></i></a>
                <a href="https://twitter.com" target="_blank"><i className="fab fa-twitter"></i></a>
                <a href="https://linkedin.com" target="_blank"><i className="fab fa-linkedin-in"></i></a>
                <a href="https://dribbble.com" target="_blank"><i className="fa-brands fa-dribbble"></i></a>
            </div>
        </div>
        <div className="prelast">
            <div className="addressf">
                <h5>address</h5>
                <p>14 New South Head Rd,</p>
                <p>Triple Bay 3148</p>
                <p>London, UK</p>
                <button className="map">find on map</button>
            </div>
            <div className="sitemapf">
                <h5>sitemap</h5>
                <nav>
                    <ul>
                        <li><a href=""></a>Home</li>
                        <li><a href=""></a>About</li>
                        <li><a href=""></a>News</li>
                        <li><a href=""></a>Pricing</li>
                        <li><a href=""></a>Style Guide</li>
                        <li><a href=""></a>Image Licensing</li>
                    </ul>
                </nav>
            </div>
            <div className="contactf">
                <h5>contact</h5>
                <p>
                    <span>P: 3740 213 301 <br/></span>
                    <span>E: contact@robi.com</span>
                </p>
            </div>
        </div>
        <p className="copyright">&copy; This is a Deni Bozo template powered by Webflow.</p>
    </footer> 
    );
}
export default Footer;