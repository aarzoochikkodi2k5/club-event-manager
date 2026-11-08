import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { formatDate } from '../utils';


export default function AdminDashboard() {
  const [data, setData] = useState(null);

  const load = () => api.get('/dashboard').then((res) => setData(res.data));
  useEffect(() => { load(); }, []);

  const remove = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? All its registrations will be removed too.`)) return;
    await api.delete(`/events/${id}`);
    load();
  };

  if (!data) return <p className="center">Loading...</p>;

  return (
    <div className="container">
      <h2 className="page-title">Dashboard</h2>

      <div className="stats">
        <div className="stat"><h1>{data.totalEvents}</h1><span className="muted">Events</span></div>
        <div className="stat"><h1>{data.totalRegistrations}</h1><span className="muted">Registrations</span></div>
        <div className="stat"><h1>{data.totalAttended}</h1><span className="muted">Attended</span></div>
        <div className="stat"><h1>{data.attendanceRate}%</h1><span className="muted">Attendance rate</span></div>
      </div>

      <div className="actions" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Your events</h3>
        <Link to="/admin/events/new" className="btn btn-small">+ Create event</Link>
      </div>

      {data.perEvent.length === 0 ? (
        <p className="muted">No events yet. Create your first one.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Title</th><th>Date</th><th>Registered</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {data.perEvent.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{formatDate(e.date)}</td>
                <td>{e.registered} / {e.capacity}</td>
                <td>
                  <div className="actions">
                    <Link to={`/admin/events/${e.id}/registrants`} className="btn btn-small btn-green">Registrants</Link>
                    <Link to={`/admin/events/${e.id}/edit`} className="btn btn-small">Edit</Link>
                    <button className="btn btn-small btn-danger" onClick={() => remove(e.id, e.title)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}