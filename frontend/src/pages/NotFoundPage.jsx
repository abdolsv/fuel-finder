import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page not-found-page">
      <h1>404</h1>
      <p>That page doesn't exist.</p>
      <Link to="/">← Back to fuel search</Link>
    </div>
  );
}
