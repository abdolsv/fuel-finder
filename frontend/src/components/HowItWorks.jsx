const STEPS = [
  {
    title: 'Search or share your location',
    text: 'Type a neighborhood like "Ikeja" or just tap to find filling stations right around you.',
  },
  {
    title: 'Filter for what you need',
    text: 'Sort by fuel type, cheapest price, or find out who actually has stock right now.',
  },
  {
    title: 'Choose your stop',
    text: 'Tap any station on the map or list to check live prices, updates, and recent reports.',
  },
  {
    title: 'Help the community',
    text: 'Just left a station? Drop a quick price or availability update to help the next driver out.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2>How it works</h2>
      <div className="how-it-works-steps">
        {STEPS.map((step, i) => (
          <div className="how-it-works-step" key={step.title}>
            <div className="how-it-works-step-number">Step {i + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
