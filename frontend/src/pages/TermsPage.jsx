import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="page legal-page">
      <header>
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: 2026</p>
      </header>

      <section>
        <h2>Using this app</h2>
        <p>
          Fuel Station Finder is provided as-is to help drivers find nearby fuel stations
          and share up to date pricing and availability information with each other. It's a
          community tool built almost entirely on data that other drivers have submitted, so
          please use your own judgement when relying on it. Treat every price and every
          availability status you see as a recent report from someone who was there, not as
          a guarantee of what you'll actually find when you arrive.
        </p>
      </section>

      <section>
        <h2>Price reports</h2>
        <p>
          Anyone can submit a price report without needing to create an account. When you
          submit a report, you're confirming that the information is accurate to the best of
          your knowledge at the time you visited the station. We reserve the right to remove
          any report that turns out to be spam, clearly false, or abusive, so that the data
          stays useful for everyone else using the app.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          We can't guarantee that any price, availability status, or station location shown
          in the app is accurate, current, or complete. Station and map data comes partly
          from OpenStreetMap contributors, and like any community maintained source, it can
          sometimes contain errors, outdated details, or gaps.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          These terms may be updated from time to time as the app continues to evolve.
          If you keep using the app after a change has been made, that means you accept the
          updated terms.
        </p>
      </section>

      <section className="price-cta">
        <div>
          <h2>Got a question about any of this?</h2>
          <p>
            Reach out through the <Link to="/contact" style={{ textDecoration: 'none' }}>Contact us</Link> page, or head back
            and keep helping other drivers by reporting a price you've seen.
          </p>
        </div>
        <Link to="/" className="price-cta-btn" style={{ textDecoration: 'none' }}>
          Back to the app
        </Link>
      </section>
    </div>
  );
}
