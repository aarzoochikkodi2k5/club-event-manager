import { Link } from 'react-router-dom';
import { API_URL } from '../api';
import { formatDate } from '../utils';

export default function EventCard({ event, registered }) {
  const seatsLeft = event.capacity - event.registeredCount;
  const full = seatsLeft <= 0;

  return (
    <div className="card">
      {event.poster ? (
        <img src={API_URL + event.poster} alt={event.title} />
      ) : (
        <div className="card-img-empty">No poster</div>
      )}
      <div className="card-body">
        <span className="badge">{event.createdBy?.clubName || 'Club'}</span>
        <h3>{event.title}</h3>
        <span className="muted">{formatDate(event.date)} at {event.time}</span>
        <span className="muted">{event.venue}</span>

        {registered ? (
          <span className="badge badge-ok">You are registered</span>
        ) : full ? (
          <span className="badge badge-full">Full</span>
        ) : (
          <span className="badge badge-ok">{seatsLeft} seats left</span>
        )}

        <Link to={`/events/${event._id}`} className="btn btn-small" style={{ textAlign: 'center' }}>
          View details
        </Link>
      </div>
    </div>
  );
}