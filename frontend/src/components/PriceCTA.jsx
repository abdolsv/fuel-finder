export default function PriceCTA({ onReportClick }) {
  return (
    <section className="price-cta">
      <div>
        <h2>Spotted a price today?</h2>
        <p>Help other drivers by reporting the price and availability at a station near you.</p>
      </div>
      <button type="button" className="price-cta-btn" onClick={onReportClick}>
        Report a price
      </button>
    </section>
  );
}
