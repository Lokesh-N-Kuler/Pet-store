function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">

        <a href="/" className="logo">
          JIVVI
        </a>

        <div className="nav-links">
          <a href="#home" className="Home">Home</a>
          <a href="#products" className="Home">Products</a>
          <a href="#about" className="Home" >About</a>
          <a href="#contact" className="Home">Contact</a>
        </div>

        <a
          href="#products"
          className="nav-button"
        >
          Shop Now
        </a>

      </div>
    </nav>
  );
}

export default Navbar;