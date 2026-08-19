import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="page legal-page">
      <header>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: 2026</p>
      </header>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Price reports:</strong> the fuel type, price, and availability you
            choose to submit, along with an optional name you can enter if you'd like
            (it defaults to "anonymous" if you leave it blank). We don't require an account
            or verify your identity in any way to submit a report.
          </li>
          <li>
            <strong>Location:</strong> if you search by place name or tap "Use my location",
            that location is sent to our server so we can find stations near you. We don't
            store your device's live location anywhere. It's only used to run that one
            search and then it's done.
          </li>
          <li>
            <strong>Admin accounts:</strong> an email address and a securely hashed
            password, used only to access the admin dashboard. Admin accounts are created
            directly by the site operator rather than through any kind of public signup
            form.
          </li>
        </ul>
      </section>

      <section>
        <h2>What we don't do</h2>
        <ul>
          <li>We don't sell or share your data with advertisers.</li>
          <li>We don't track you across other websites.</li>
          <li>We don't require an account to use any of the core features of this app.</li>
        </ul>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>
          Station locations and place search are powered by OpenStreetMap's Overpass and
          Nominatim services. Searches you make may be sent to these services so they can
          return results back to us. You can read{' '}
          <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            OpenStreetMap Foundation's privacy policy
          </a>{' '}
          to see how they handle that data on their end.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          If you have any questions about this policy, or about how any of your
          information is handled, please reach out any time via the{' '}
          <Link to="/contact" style={{ textDecoration: 'none' }}>Contact page</Link>. We're happy to explain anything in more
          detail.
        </p>
      </section>

      <section className="price-cta">
        <div>
          <h2>Ready to keep exploring?</h2>
          <p>Head back to the app and see what's happening at stations near you.</p>
        </div>
        <Link to="/" className="price-cta-btn" style={{ textDecoration: 'none' }}>
          Back to the app
        </Link>
      </section>
    </div>
  );
}
