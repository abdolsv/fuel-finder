import { FAQS } from '../data/faqs';

export default function FAQPage() {
  return (
    <div className="page faq-page">
      <header style={{ textAlign: 'center' }}>
        <h1>Frequently asked questions</h1>
      </header>

      <div className="faq-list">
        {FAQS.map((item) => (
          <details className="faq-item" key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
