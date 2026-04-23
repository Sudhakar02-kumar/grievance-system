import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Academic', 'Hostel', 'Transport', 'Other'];

const emptyForm = { title: '', description: '', category: 'Academic', status: 'Pending' };

export default function Dashboard() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [search, setSearch]         = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [loading, setLoading]       = useState(false);

  const fetchGrievances = async () => {
    try {
      const { data } = await API.get('/grievances');
      setGrievances(data);
    } catch {
      setError('Failed to fetch grievances');
    }
  };

  useEffect(() => { fetchGrievances(); }, []);

  const flash = (msg, type = 'success') => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    else { setError(msg); setTimeout(() => setError(''), 3000); }
  };

  const handleSearch = async () => {
    if (!search.trim()) return fetchGrievances();
    try {
      const { data } = await API.get(`/grievances/search?title=${search}`);
      setGrievances(data);
    } catch {
      flash('Search failed', 'error');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await API.put(`/grievances/${editId}`, form);
        flash('Grievance updated!');
      } else {
        await API.post('/grievances', form);
        flash('Grievance submitted!');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchGrievances();
    } catch (err) {
      flash(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = g => {
    setForm({ title: g.title, description: g.description, category: g.category, status: g.status });
    setEditId(g._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this grievance?')) return;
    try {
      await API.delete(`/grievances/${id}`);
      flash('Grievance deleted');
      fetchGrievances();
    } catch {
      flash('Delete failed', 'error');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const categoryColor = c => ({
    Academic: 'tag-blue', Hostel: 'tag-green', Transport: 'tag-amber', Other: 'tag-gray'
  }[c] || 'tag-gray');

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">🎓</span>
          <span>Student Grievance Portal</span>
        </div>
        <div className="navbar-right">
          <span className="student-name">👤 {student?.name}</span>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        {/* Alerts */}
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stat-card">
            <span className="stat-number">{grievances.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{grievances.filter(g => g.status === 'Pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{grievances.filter(g => g.status === 'Resolved').length}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>

        {/* Actions row */}
        <div className="actions-row">
          <div className="search-group">
            <input
              className="search-input"
              placeholder="🔍  Search by title…"
              value={search}
              onChange={e => { setSearch(e.target.value); if (!e.target.value) fetchGrievances(); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-secondary" onClick={handleSearch}>Search</button>
          </div>
          <button className="btn btn-primary" onClick={() => {
            setForm(emptyForm); setEditId(null); setShowForm(s => !s);
          }}>
            {showForm ? 'Cancel' : '+ New Grievance'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="form-card">
            <h2>{editId ? 'Edit Grievance' : 'Submit New Grievance'}</h2>
            <form onSubmit={handleSubmit} className="grievance-form">
              <div className="field">
                <label>Title</label>
                <input placeholder="Brief title of your issue" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea placeholder="Describe the issue in detail…" rows={4}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Category</label>
                  <select value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {editId && (
                  <div className="field">
                    <label>Status</label>
                    <select value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option>Pending</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                )}
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Saving…' : editId ? 'Update Grievance' : 'Submit Grievance'}
              </button>
            </form>
          </div>
        )}

        {/* Grievances list */}
        <div className="grievances-list">
          {grievances.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No grievances yet. Submit one above!</p>
            </div>
          ) : (
            grievances.map(g => (
              <div key={g._id} className="grievance-card">
                <div className="grievance-header">
                  <h3>{g.title}</h3>
                  <span className={`status-badge ${g.status === 'Resolved' ? 'badge-resolved' : 'badge-pending'}`}>
                    {g.status}
                  </span>
                </div>
                <p className="grievance-desc">{g.description}</p>
                <div className="grievance-footer">
                  <span className={`tag ${categoryColor(g.category)}`}>{g.category}</span>
                  <span className="grievance-date">
                    {new Date(g.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="card-actions">
                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(g)}>Edit</button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(g._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}