function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">

        <a href="/" className="logo">
          JIVVI
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
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