import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="page about-page">
      <header style={{ textAlign: 'center' }}>
        <h1>About Fuel Station Finder</h1>
        <p>Built for the 3MTT capstone to solve a real driver problem in Nigeria.</p>
      </header>

      <section>
        <h2>Why this exists</h2>
        <p>
          Fuel prices in Nigeria change from station to station and from day to day, and
          the official pump price you hear about rarely matches what a driver actually
          finds once they get there. In a lot of cases, the bigger headache isn't even the
          price. It's simply whether a station has fuel at all. A station can be the
          cheapest one around and still be completely useless to you if the pumps are dry.
          Fuel Station Finder was built to track both sides of that problem at once, so
          drivers can make a decision before they waste time and fuel driving somewhere
          that might not even have what they need.
        </p>
      </section>

      <section>
        <h2>Where the data comes from</h2>
        <ul>
          <li>
            <strong>Station locations</strong> come from OpenStreetMap. If a station near you
            hasn't been added to our database yet, we look it up automatically and live from
            OpenStreetMap, so you're not limited to only the stations we've manually added
            ourselves.
          </li>
          <li>
            <strong>Prices and fuel availability</strong> are reported by everyday drivers,
            usually right after they've visited a station. There isn't an official live
            pricing API for Nigeria that we could plug into, so this kind of crowdsourced
            reporting is honestly the most accurate and up to date source available right
            now, and it only gets better the more people use it.
          </li>
        </ul>
      </section>

      <section>
        <h2>How to use it</h2>
        <ol>
          <li>Search for a location or let the app use your current location.</li>
          <li>Filter results by fuel type, price, distance, or whether fuel is currently available.</li>
          <li>Tap on a station to see more detail, and report a price yourself if you've visited it recently.</li>
        </ol>
      </section>

      <section>
        <h2>Have a question or spotted a problem?</h2>
        <p>
          If something looks wrong, a price seems off, or you just want to ask about how
          the app works, we'd genuinely like to hear about it. Head over to the{' '}
          <Link to="/contact" style={{ textDecoration: 'none' }}>Contact us</Link> page and send a message. It helps make the
          app better for every other driver using it too.
        </p>
      </section>

      <section className="price-cta">
        <div>
          <h2>Ready to help other drivers?</h2>
          <p>Find a station near you and report the price and availability you see today.</p>
        </div>
        <Link 
          to="/" 
          className="price-cta-btn" 
          style={{ textDecoration: 'none' }}
        >
          Find a station
        </Link>
      </section>
    </div>
  );
}
