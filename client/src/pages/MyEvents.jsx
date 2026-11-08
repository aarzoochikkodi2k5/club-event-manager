import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { formatDate } from '../utils';

export default function MyEvents() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get('/registrations/mine')
      .then((res) => setRegs(res.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const cancel = async (eventId) => {
    if (!window.confirm('Cancel this registration?')) return;
    await api.delete(`/registrations/${eventId}`);
    load();
  };

  if (loading) return <p className="center">Loading...</p>;

  return (
    <div className="container">
      <h2 className="page-title">My Events</h2>
      {regs.length === 0 ? (
        <p className="muted">You haven't registered for any events yet. <Link to="/events">Browse events</Link></p>
      ) : (
        <table>
          <thead>
            <tr><th>Event</th><th>Date</th><th>Venue</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {regs.map((r) => (
              <tr key={r._id}>
                <td><Link to={`/events/${r.event._id}`}>{r.event.title}</Link></td>
                <td>{formatDate(r.event.date)} {r.event.time}</td>
                <td>{r.event.venue}</td>
                <td>
                  {r.attended
                    ? <span className="badge badge-ok">Attended</span>
                    : <span className="badge">Registered</span>}
                </td>
                <td>
                  {!r.attended && (
                    <button className="btn btn-small btn-danger" onClick={() => cancel(r.event._id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}