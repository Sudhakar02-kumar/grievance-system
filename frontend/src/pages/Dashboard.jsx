import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API from '../api';

const CATEGORIES = ['Academic', 'Hostel', 'Transport', 'Other'];

const categoryEmoji = {
  Academic: '📚', Hostel: '🏠', Transport: '🚌', Other: '📋'
};

const catClass = {
  Academic: 'cat-academic', Hostel: 'cat-hostel',
  Transport: 'cat-transport', Other: 'cat-other'
};

const emptyForm = {
  title: '', description: '', category: 'Academic',
  date: new Date().toISOString().split('T')[0]
};

function Dashboard() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchGrievances = async () => {
    try {
      const res = await axios.get(`${API}/grievances`, { headers });
      setGrievances(res.data);
    } catch {
      setError('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGrievances(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description)
      return setError('Title and description are required');
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API}/grievances`, form, { headers });
      setForm(emptyForm);
      setFormSuccess('Grievance submitted successfully!');
      setTimeout(() => setFormSuccess(''), 3000);
      await fetchGrievances();
    } catch {
      setError('Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/grievances/search?title=${searchQuery}`, { headers });
      setGrievances(res.data);
    } catch {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    fetchGrievances();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grievance?')) return;
    try {
      await axios.delete(`${API}/grievances/${id}`, { headers });
      setGrievances(prev => prev.filter(g => g._id !== id));
    } catch {
      setError('Failed to delete grievance');
    }
  };

  const handleResolve = async (g) => {
    try {
      const res = await axios.put(`${API}/grievances/${g._id}`,
        { ...g, status: 'Resolved' }, { headers });
      setGrievances(prev => prev.map(x => x._id === g._id ? res.data : x));
    } catch {
      setError('Failed to update status');
    }
  };

  const openEdit = (g) => {
    setEditModal(g._id);
    setEditForm({
      title: g.title,
      description: g.description,
      category: g.category,
      status: g.status,
      date: g.date?.split('T')[0] || ''
    });
  };

  const handleUpdate = async () => {
    if (!editForm.title || !editForm.description)
      return setError('Title and description required');
    setUpdating(true);
    try {
      const res = await axios.put(`${API}/grievances/${editModal}`, editForm, { headers });
      setGrievances(prev => prev.map(g => g._id === editModal ? res.data : g));
      setEditModal(null);
    } catch {
      setError('Failed to update grievance');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = grievances.filter(g =>
    filterStatus === 'All' ? true : g.status === filterStatus
  );

  const totalCount = grievances.length;
  const pendingCount = grievances.filter(g => g.status === 'Pending').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📋 My Grievances</h2>
          <p>Submit, track, and manage all your complaints in one place</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info"><h3>{totalCount}</h3><p>Total Grievances</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info"><h3>{pendingCount}</h3><p>Pending</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info"><h3>{resolvedCount}</h3><p>Resolved</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{totalCount ? Math.round((resolvedCount / totalCount) * 100) : 0}%</h3>
              <p>Resolution Rate</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search grievances by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-search" onClick={handleSearch}>Search</button>
          {searchQuery && <button className="btn-clear" onClick={handleClear}>✕ Clear</button>}
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

        <div className="main-grid">
          {/* Submit Form */}
          <div className="form-card">
            <h3>📝 Submit New Grievance</h3>
            {formSuccess && <div className="success-msg">{formSuccess}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" name="title" placeholder="Brief title of your issue"
                  value={form.title} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" placeholder="Describe your grievance in detail..."
                  value={form.description} onChange={handleChange} rows={4} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{categoryEmoji[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} />
              </div>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Submitting...' : '📤 Submit Grievance'}
              </button>
            </form>
          </div>

          {/* Grievance List */}
          <div className="grievance-list-card">
            <div className="list-header">
              <h3>📑 Grievance History
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.82rem' }}>
                  &nbsp;({filtered.length})
                </span>
              </h3>
              <select className="filter-select" value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">⏳ Pending</option>
                <option value="Resolved">✅ Resolved</option>
              </select>
            </div>

            {loading ? (
              <div className="loading">⏳ Loading grievances...</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>{searchQuery ? 'No grievances found for your search.' : 'No grievances yet. Submit your first one!'}</p>
              </div>
            ) : (
              filtered.map(g => (
                <div key={g._id} className="grievance-item">
                  <div className="grievance-top">
                    <div className="grievance-title-row">
                      <span className="grievance-title">{categoryEmoji[g.category]} {g.title}</span>
                      <span className={`cat-badge ${catClass[g.category]}`}>{g.category}</span>
                      <span className={`badge ${g.status === 'Pending' ? 'badge-pending' : 'badge-resolved'}`}>
                        {g.status === 'Pending' ? '⏳' : '✅'} {g.status}
                      </span>
                    </div>
                  </div>
                  <p className="grievance-desc">{g.description}</p>
                  <div className="grievance-meta">
                    📅 {new Date(g.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </div>
                  <div className="grievance-actions">
                    <button className="btn-edit" onClick={() => openEdit(g)}>✏️ Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(g._id)}>🗑️ Delete</button>
                    {g.status === 'Pending' && (
                      <button className="btn-resolve" onClick={() => handleResolve(g)}>
                        ✅ Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>✏️ Edit Grievance</h3>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Grievance title" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={editForm.category}
                onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{categoryEmoji[c]} {c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={editForm.status}
                onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="Pending">⏳ Pending</option>
                <option value="Resolved">✅ Resolved</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-update" onClick={handleUpdate} disabled={updating}>
                {updating ? 'Updating...' : '💾 Update'}
              </button>
              <button className="btn-cancel" onClick={() => setEditModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;