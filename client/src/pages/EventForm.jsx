import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';
import { toInputDate } from '../utils';

const empty = { title: '', description: '', date: '', time: '', venue: '', capacity: '' };

export default function EventForm() {
  const { id } = useParams();                  // exists only on the edit URL
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [poster, setPoster] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit mode: load the event and fill the boxes
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/events/${id}`).then((res) => {
      const e = res.data;
      setForm({
        title: e.title, description: e.description, date: toInputDate(e.date),
        time: e.time, venue: e.venue, capacity: e.capacity,
      });
    });
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // FormData lets us send text fields AND a file together
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (poster) data.append('poster', poster);

      if (isEdit) await api.put(`/events/${id}`, data);
      else await api.post('/events', data);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2 className="page-title">{isEdit ? 'Edit event' : 'Create event'}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" rows="4" value={form.description} onChange={handleChange} required />

          <label>Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} required />

          <label>Time</label>
          <input name="time" type="time" value={form.time} onChange={handleChange} required />

          <label>Venue</label>
          <input name="venue" value={form.venue} onChange={handleChange} required />

          <label>Capacity (max students)</label>
          <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required />

          <label>Poster image (optional, max 2 MB){isEdit && ' - leave empty to keep the old one'}</label>
          <input type="file" accept="image/*" onChange={(e) => setPoster(e.target.files[0])} />

          <div className="actions" style={{ marginTop: 14 }}>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}
            </button>
            <Link to="/admin">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}