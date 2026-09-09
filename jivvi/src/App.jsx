import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import About from "./components/About";
import CareSection from "./components/CareSection";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <About />
        <CareSection />
      </main>
      <Footer />
    </>
  );
}

export default App;