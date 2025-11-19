import "../css/Dashboard/LandingPage.css";

export default function Dashboard() {
  return (
    <>
      <header className="header">
        <div className="logo">MyBrand</div>

        <nav className="nav">
          {/* <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Features</a>
          <a href="#" className="nav-link">About</a>
          <a href="#" className="nav-link">Contact</a> */}
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Welcome to My Landing Page</h1>
          <p>This is a simple placeholder built inside React.</p>
          <button className="cta-btn">Get Started</button>
        </section>

        <section className="section">
          <h2>Features Section</h2>
          <p>Placeholder text for features or services.</p>
        </section>

        <section className="section">
          <h2>Another Section</h2>
          <p>More placeholder content.</p>
        </section>
      </main>

      <footer className="footer">
        © 2025 MyBrand — All rights reserved.
      </footer>
    </>
  );
}
