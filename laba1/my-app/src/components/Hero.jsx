import './Hero.css';

function Hero() {
  return (
    <div className="hero">
      <div className="roby">
        <img src="../images/roby.png" alt="roby" className="name" />
      </div>
      <div className="moto">
        <img src="../images/man.png" alt="Мужик" className="man" />
        <div>
          <h1>
            <span className="x1">“</span>
            <span className="bold">WE BELIEVE THAT<br /></span>
            <span className="regular">THE POWER OF DESIGN<br /></span>
            <span className="bold">HELPS <br />BUSINESSES</span>
            <span className="x2">.”</span>
          </h1>
          <div className="circle-container">
            <button className="circle">
              WORK<br />WITH US
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;