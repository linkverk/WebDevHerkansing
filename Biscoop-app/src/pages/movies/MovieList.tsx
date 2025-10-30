import React, { useEffect, useState } from 'react';
import './movies.css';
import ReviewList from '../movie-detail/ReviewList';
import { fetchReviews, postReview } from '../../api/reviews';

type Review = {
  name: string;
  text: string;
  rating: number;
};

type Movie = {
  id: string;
  title: string;
  year: string;
  description?: string;
};

const DUMMY_MOVIES: Movie[] = [
  { id: 'm1', title: 'The Grand Adventure', year: '2025', description: 'An epic road trip.' },
  { id: 'm2', title: 'Space Between Worlds', year: '2025', description: 'A sci-fi mystery.' },
  { id: 'm3', title: 'Silent Streets', year: '2024', description: 'A quiet drama.' },
];



const MovieList: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null); // movieId showing reviews/form
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});

  useEffect(() => {
    // load reviews for all dummy movies via API (with localStorage fallback inside the API)
    let mounted = true;
    (async () => {
      const token = localStorage.getItem('token') ?? undefined;
      const map: Record<string, Review[]> = {};
      await Promise.all(
        DUMMY_MOVIES.map(async (m) => {
          map[m.id] = await fetchReviews(m.id, token);
        })
      );
      if (mounted) setReviewsMap(map);
    })();
    return () => {
      mounted = false;
    };
  }, []);
  async function handleSubmit(movieId: string, name: string, text: string, rating: number) {
    const next: Review = { name, text, rating };
    const token = localStorage.getItem('token') ?? undefined;
    const updated = await postReview(movieId, next, token);
    setReviewsMap((prev) => ({ ...prev, [movieId]: updated }));
  }

  return (
    <div className="movies-page">
      <h2>Movies</h2>
      <div className="movies-grid">
        {DUMMY_MOVIES.map((m) => (
          <div key={m.id} className="movie-card">
            <div className="poster">🎞️</div>
            <div className="movie-info">
              <h3>{m.title} <span className="year">({m.year})</span></h3>
              <p className="desc">{m.description}</p>
              <div className="movie-actions">
                <button onClick={() => setExpanded(expanded === m.id ? null : m.id)} className="btn">{expanded === m.id ? 'Hide reviews' : 'Reviews & Rate'}</button>
              </div>

              {expanded === m.id && (
                <div className="reviews-panel">
                  <h4>Reviews</h4>
                  <ReviewList reviews={reviewsMap[m.id] ?? []} />

                  <ReviewForm
                    onSubmit={(name, text, rating) => handleSubmit(m.id, name, text, rating)}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReviewForm: React.FC<{ onSubmit: (name: string, text: string, rating: number) => void | Promise<void> }> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim() || !text.trim()) return;
    await onSubmit(name.trim(), text.trim(), rating);
    setName('');
    setText('');
    setRating(5);
  }

  return (
    <form className="review-form" onSubmit={submit}>
      <div className="row">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="row">
        <label>Review</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="row">
        <label>Rating</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={4}>4</option>
          <option value={3}>3</option>
          <option value={2}>2</option>
          <option value={1}>1</option>
        </select>
      </div>
      <div className="row actions">
        <button type="submit" className="btn">Submit review</button>
      </div>
    </form>
  );
};

export default MovieList;
