import { Link } from 'react-router-dom';

const FOOTER_COLUMNS = [
  {
    heading: 'App',
    links: [
      { to: '/', label: 'Find fuel' },
      { to: '/about', label: 'About' },
      { to: '/faq', label: 'FAQ' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { to: '/contact', label: 'Contact' },
      { to: '/admin/login', label: 'Admin' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link 
            to="/" 
            className="footer-brand-name" 
            style={{ textDecoration: 'none', fontSize: '26px' }}
          >
            Fuel Station Finder
          </Link>
          <p className="footer-tagline">
            Crowdsourced fuel prices and availability for drivers in Nigeria to check whether a station actually has fuel in stock before driving there.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer">
          {FOOTER_COLUMNS.map((column) => (
            <div className="footer-col" key={column.heading}>
              <h4>{column.heading}</h4>
              {column.links.map((link) => (
                <Link to={link.to} key={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="footer-bottom">
        <span>© {year} Fuel Station Finder. Built as a 3MTT capstone project.</span>
        <span>Station data © OpenStreetMap contributors</span>
      </div>
    </footer>
  );
}
