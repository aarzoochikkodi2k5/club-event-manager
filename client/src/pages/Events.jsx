import { useEffect, useState } from 'react';
import api from '../api';
import EventCard from '../components/EventCard';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [myEventIds, setMyEventIds] = useState([]);
  const [search, setSearch] = useState('');
  const [upcoming, setUpcoming] = useState(true);
  const [loading, setLoading] = useState(true);

  // Which events am I already registered for? (runs once)
  useEffect(() => {
    api.get('/registrations/mine')
      .then((res) => setMyEventIds(res.data.map((r) => r.event._id)))
      .catch(() => {});
  }, []);

  // Load events whenever the search text or filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      api.get('/events', { params: { search, upcoming } })
        .then((res) => setEvents(res.data))
        .finally(() => setLoading(false));
    }, 300);                              // wait 300ms after the last keystroke
    return () => clearTimeout(timer);     // cancel if the user keeps typing
  }, [search, upcoming]);

  return (
    <div className="container">
      <div className="hero">
  <h1>Discover campus events</h1>
  <p>Find what's happening and grab your seat before it fills up.</p>
</div>

      <div className="toolbar">
        <input
          placeholder="Search by event title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={upcoming} onChange={(e) => setUpcoming(e.target.value === 'true')}>
          <option value="true">Upcoming only</option>
          <option value="false">All events</option>
        </select>
      </div>

      {loading ? (
        <p className="center">Loading...</p>
      ) : events.length === 0 ? (
        <p className="center muted">No events found.</p>
      ) : (
        <div className="grid">
          {events.map((ev) => (
            <EventCard key={ev._id} event={ev} registered={myEventIds.includes(ev._id)} />
          ))}
        </div>
      )}
    </div>
  );
}