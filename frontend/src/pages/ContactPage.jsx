import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page contact-page">
      <header style={{ textAlign: 'center' }}>
        <h1>Contact us</h1>
        <p>Questions, feedback, or found a bug? Reach out.</p>
      </header>

      <p className="contact-direct" style={{ textAlign: 'center' }}>
        You can also email us directly at{' '}
        <a href="mailto:abdulwasiuabdulmajeed89@gmail.com">abdulwasiuabdulmajeed89@gmail.com</a>.
      </p>

      {submitted ? (
        <p className="success-msg" style={{ textAlign: 'center' }}>Thanks for reaching out — we'll get back to you soon.</p>
      ) : (
        <form style={{ margin: '0 auto', width: '100%', maxWidth: '480px' }} className="price-report-form contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            required
          />
          <button type="submit">Send message</button>
        </form>
      )}
    </div>
  );
}
