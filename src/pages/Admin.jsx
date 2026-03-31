import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TapForm from '../components/TapForm';
import { fetchTaps, createTap, updateTap, deleteTap, reorderTaps } from '../lib/taps';
import './Admin.css';

const EMPTY_TAP = {
  name: '', brewery: '', location: '', style: '', abv: '', price: '', logo: '', staffPick: false,
};

export default function Admin() {
  const [taps, setTaps] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) { navigate('/admin/login'); return; }
    load();
  }, []);

  async function load() {
    setTaps(await fetchTaps());
  }

  function logout() {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  }

  async function saveTap(tapData, logoFile) {
    setSaving(true);
    try {
      let logoUrl = tapData.logo;
      if (logoFile) {
        const { uploadLogo } = await import('../lib/taps');
        logoUrl = await uploadLogo(logoFile);
      }
      const payload = { ...tapData, logo: logoUrl };
      if (editing) {
        await updateTap(editing.tap, payload);
      } else {
        await createTap(payload);
      }
      await load();
      setEditing(null);
      setAdding(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tap) {
    if (!confirm(`Delete "${tap.name}"?`)) return;
    await deleteTap(tap.tap);
    await load();
  }

  async function move(index, direction) {
    const next = [...taps];
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
    const renumbered = next.map((t, i) => ({ ...t, tap: i + 1 }));
    await reorderTaps(renumbered);
    setTaps(renumbered);
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-title">
          <span className="admin-venue">Sun Oaks</span>
          <span className="admin-subtitle">Taplist Admin</span>
        </div>
        <div className="admin-actions">
          <a href="/" target="_blank" className="btn-ghost">View Display</a>
          <button className="btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="admin-body">
        <div className="admin-toolbar">
          <h2>Taps <span className="tap-count">{taps.length}</span></h2>
          <button className="btn-primary" onClick={() => { setAdding(true); setEditing(null); }}>
            + Add Tap
          </button>
        </div>

        {(adding || editing) && (
          <TapForm
            initial={editing || EMPTY_TAP}
            onSave={saveTap}
            onCancel={() => { setEditing(null); setAdding(false); }}
            saving={saving}
          />
        )}

        <div className="tap-list">
          {taps.map((tap, i) => (
            <div key={tap.tap} className="tap-row">
              <div className="tap-row-order">
                <button className="order-btn" onClick={() => move(i, -1)} disabled={i === 0}>▲</button>
                <span className="tap-row-num">{String(tap.tap).padStart(2, '0')}</span>
                <button className="order-btn" onClick={() => move(i, 1)} disabled={i === taps.length - 1}>▼</button>
              </div>
              {tap.logo
                ? <img src={tap.logo.startsWith('http') ? tap.logo : `/logos/${tap.logo}`} alt="logo" className="tap-row-logo" />
                : <div className="tap-row-logo-placeholder" />
              }
              <div className="tap-row-info">
                <span className="tap-row-name">{tap.name || <em>Unnamed</em>}</span>
                <span className="tap-row-brewery">{tap.brewery}</span>
              </div>
              <div className="tap-row-meta">
                <span className="tap-row-style">{tap.style}</span>
                <span className="tap-row-abv">{tap.abv}% ABV</span>
                {tap.price > 0 && <span className="tap-row-price">${Number(tap.price).toFixed(2)}</span>}
              </div>
              {tap.staffPick && <span className="tap-row-pick">STAFF PICK</span>}
              <div className="tap-row-btns">
                <button className="btn-edit" onClick={() => { setEditing(tap); setAdding(false); }}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(tap)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
