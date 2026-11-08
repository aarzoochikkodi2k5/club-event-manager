import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { API_URL } from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = async () => {
    const res = await api.get(`/events/${id}`);
    setEvent(res.data);
    if (user?.role === 'student') {
      const mine = await api.get('/registrations/mine');
      setRegistered(mine.data.some((r) => r.event._id === id));
    } else {
      setRegistered(false);
    }
  };

  useEffect(() => {
    load().catch(() => setMsg({ type: 'error', text: 'Event not found' }));
  }, [id, user]);

  const act = async (method) => {
    try {
      await api[method](`/registrations/${id}`);
      setMsg({
        type: 'success',
        text: method === 'post' ? 'You are registered!' : 'Registration cancelled',
      });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Something went wrong' });
    }
    load();
  };

  if (!event) {
    return (
      <div className="container">
        {msg.text ? <p className="error">{msg.text}</p> : <p className="center">Loading...</p>}
      </div>
    );
  }

  const seatsLeft = event.capacity - event.registeredCount;
  const full = seatsLeft <= 0;

  return (
    <div className="container">
      <Link to={user?.role === 'admin' ? '/admin' : '/events'}>&larr; Back</Link>
      <div className="detail-box" style={{ marginTop: 12 }}>
        {event.poster && <img className="detail-img" src={API_URL + event.poster} alt={event.title} />}
        <span className="badge">{event.createdBy?.clubName}</span>
        <h2>{event.title}</h2>
        <p>{event.description}</p>
        <p><b>Date:</b> {formatDate(event.date)} &nbsp; <b>Time:</b> {event.time}</p>
        <p><b>Venue:</b> {event.venue}</p>
        <p><b>Seats:</b> {event.registeredCount} / {event.capacity} taken</p>

        {msg.text && <p className={msg.type === 'error' ? 'error' : 'success'}>{msg.text}</p>}

        {!user && <Link to="/login" className="btn">Log in to register</Link>}

        {user?.role === 'student' && (
          registered ? (
            <button className="btn btn-danger" onClick={() => act('delete')}>Cancel registration</button>
          ) : (
            <button className="btn" disabled={full} onClick={() => act('post')}>
              {full ? 'Event is full' : 'Register'}
            </button>
          )
        )}
      </div>
    </div>
  );
}