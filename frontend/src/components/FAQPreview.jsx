import { Link } from 'react-router-dom';
import { FAQS } from '../data/faqs';

export default function FAQPreview({ count = 3 }) {
  const items = FAQS.slice(0, count);

  return (
    <section className="faq-preview">
      <div className="faq-preview-header">
        <h2>Frequently asked questions</h2>
        <Link to="/faq" className="faq-preview-link">
          Read all FAQs →
        </Link>
      </div>

      <div className="faq-list">
        {items.map((item) => (
          <details className="faq-item" key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
