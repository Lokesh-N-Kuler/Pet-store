function Categories() {
  return (
    <section
      className="categories"
      id="products"
    >

      <div className="section-heading">

        <p>WHAT THEY NEED</p>

        <h2>
          Everything They Need
        </h2>

        <span>
          Quality Food, Care and Accessories
          for your beloved pets.
        </span>

      </div>

      <div className="category-grid">

        <div className="category-card">

          <img className="dogs"
            src="/images/dogs.jpg"
            alt="Dogs"
          />

          <div className="category-content">

            <h3>Dogs</h3>

            <p>
              Premium nutrition, durable toys,
              and essential wellness products
              for every breed.
            </p>

            <a href="#contact">
              Explore Dogs →
            </a>

          </div>

        </div>


        <div className="category-card">

          <img className="cats"
            src="/images/cats.jpg"
            alt="Cats"
          />

          <div className="category-content">

            <h3>Cats</h3>

            <p>
              Healthy food options, engaging
              accessories, and grooming tools
              for your feline friends.
            </p>

            <a href="#contact">
              Explore Cats →
            </a>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Categories;