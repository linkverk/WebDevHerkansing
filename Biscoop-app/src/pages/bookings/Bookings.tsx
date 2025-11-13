import React, { useEffect, useState } from 'react';
import './bookings.css';
import { useNavigate } from 'react-router-dom';
import { getUserBookings, getCurrentUserId } from '../../api/users';
import type { UserBooking } from '../../api/users';

const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userBookings = await getUserBookings(userId);
      setBookings(userBookings);
      setError('');
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return {
      date: date.toLocaleDateString('en-US', dateOptions),
      time: date.toLocaleTimeString('en-US', timeOptions)
    };
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <header className="bookings-header">
          <h2>Your Bookings</h2>
        </header>
        <main>
          <p style={{ textAlign: 'center', color: '#666' }}>Loading bookings...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <header className="bookings-header">
        <h2>Your Bookings</h2>
        <div className="bookings-actions">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">Back</button>
        </div>
      </header>

      {error && (
        <div style={{ 
          color: '#e74c3c', 
          marginBottom: '1rem', 
          padding: '0.75rem',
          backgroundColor: '#fee',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <main>
        {bookings.length === 0 ? (
          <p className="empty">You have no bookings yet.</p>
        ) : (
          <ul className="bookings-list">
            {bookings.map((booking) => {
              const { date, time } = formatDateTime(booking.show.begintijd);
              const seatNumbers = booking.seats.map(s => s.stoelnummer).join(', ');
              
              return (
                <li key={booking.id} className="booking-item">
                  <div className="booking-left">
                    <strong className="movie">{booking.show.film.name}</strong>
                    <div className="meta">
                      {date} · {time} · Room: {booking.show.zaal.naam}
                    </div>
                  </div>
                  <div className="booking-right">
                    <div className="seats">Seats: {seatNumbers}</div>
                    <div className="meta">
                      {booking.show.film.genre} · {booking.show.film.duration} min · {booking.show.film.rating}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};

export default Bookings;