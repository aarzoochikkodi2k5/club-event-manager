import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { formatDate } from '../utils';

export default function Registrants() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [regs, setRegs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/events/${id}`), api.get(`/events/${id}/registrations`)])
      .then(([evRes, regRes]) => { setEvent(evRes.data); setRegs(regRes.data); })
      .catch((err) => setError(err.response?.data?.message || 'Could not load'));
  }, [id]);

  const toggle = async (reg) => {
    try {
      const res = await api.patch(`/registrations/${reg._id}/attendance`, { attended: !reg.attended });
      setRegs(regs.map((r) => (r._id === reg._id ? { ...r, ...res.data } : r)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update');
    }
  };

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!event) return <p className="center">Loading...</p>;

  const attendedCount = regs.filter((r) => r.attended).length;

  return (
    <div className="container">
      <Link to="/admin">&larr; Back to dashboard</Link>
      <h2 className="page-title" style={{ marginTop: 12 }}>{event.title}</h2>
      <p className="muted">
        {formatDate(event.date)} at {event.time} &middot; {event.venue} &middot;{' '}
        {regs.length} registered, {attendedCount} attended
      </p>

      {regs.length === 0 ? (
        <p className="muted">No one has registered yet.</p>
      ) : (
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Registered on</th><th>Attendance</th></tr>
          </thead>
          <tbody>
            {regs.map((r, i) => (
              <tr key={r._id}>
                <td>{i + 1}</td>
                <td>{r.student?.name}</td>
                <td>{r.student?.email}</td>
                <td>{formatDate(r.createdAt)}</td>
                <td>
                  <button
                    className={`btn btn-small ${r.attended ? 'btn-green' : ''}`}
                    onClick={() => toggle(r)}
                  >
                    {r.attended ? 'Present (click to undo)' : 'Mark present'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}