import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load notes');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/notes/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('Note updated');
      } else {
        await axios.post('http://localhost:5000/notes', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('Note added');
      }

      setFormData({ title: '', description: '' });
      setEditingId(null);
      fetchNotes();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Action failed');
    }
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setFormData({ title: note.title, description: note.description });
  };

  const deleteNote = async (id) => {
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`http://localhost:5000/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Note deleted');
      fetchNotes();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Delete failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="container py-4">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded mb-4 px-3">
        <span className="navbar-brand mb-0 h1">Personal Notes</span>
        <div className="ms-auto">
          <span className="navbar-text text-white me-3">Welcome, {user.name || 'User'}</span>
          <button className="btn btn-outline-light" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="row">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="mb-3">{editingId ? 'Edit Note' : 'Add Note'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button className="btn btn-success w-100" type="submit">
                  {editingId ? 'Update Note' : 'Save Note'}
                </button>
              </form>
              {message && <p className="mt-3 text-center">{message}</p>}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <h3 className="mb-3">Your Notes</h3>
          {notes.length === 0 ? (
            <p>No notes yet. Create your first note.</p>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{note.title}</h5>
                  <p className="card-text">{note.description}</p>
                  <p className="text-muted small">
                    Created: {new Date(note.createdAt).toLocaleString()}
                  </p>
                  <button className="btn btn-outline-primary btn-sm me-2" onClick={() => startEdit(note)}>
                    Edit
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => deleteNote(note._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notes;
