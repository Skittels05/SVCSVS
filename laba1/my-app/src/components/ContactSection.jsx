import './ContactSection.css';

function ContactSection() {
  return (
    <section className="contact">
      <div>
        <h2>
          <span className="bold4">let's</span>
          <span className="regular11">talk</span>
        </h2>
        <p>Feel free to contact us</p>
      </div>
      <button className="circle3">
        view on <br />designer
      </button>
    </section>
  );
}

export default ContactSection;