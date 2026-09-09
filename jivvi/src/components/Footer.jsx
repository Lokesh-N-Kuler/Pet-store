function Footer() {

  const whatsappNumber = "919999999999";

  return (
    <footer
      className="footer"
      id="contact"
    >

      <div className="footer-top">

        <div>

          <h2>
            Need personalized care?
          </h2>

          <p>
            Have a question about your pet?
            Chat with us.
          </p>

        </div>

        <a
          href={`https://wa.me/${9886193296}`}
          target="_blank"
          rel="noreferrer"
          className="whatsapp-button"
        >
          Chat with us
        </a>

      </div>


      <div className="footer-bottom">

        <div className="footer-logo">
          JIVVI
        </div>

        <div>
          Bengaluru
        </div>

        <div>
          © 2026 JIVVI. All rights reserved.
        </div>

      </div>

    </footer>
  );
}

export default Footer;