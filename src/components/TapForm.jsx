import { useState } from 'react';
import './TapForm.css';

function logoSrc(logo) {
  if (!logo) return null;
  return logo.startsWith('http') ? logo : `/logos/${logo}`;
}

export default function TapForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...initial });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(logoSrc(initial.logo));

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function removeLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    set('logo', '');
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form, logoFile);
  }

  return (
    <form className="tap-form" onSubmit={handleSubmit}>
      <h3>{initial.name ? `Editing: ${initial.name}` : 'New Tap'}</h3>
      <div className="form-grid">
        <label>
          Beer Name
          <input value={form.name} onChange={e => set('name', e.target.value)} required />
        </label>
        <label>
          Brewery
          <input value={form.brewery} onChange={e => set('brewery', e.target.value)} />
        </label>
        <label>
          Location
          <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, ST" />
        </label>
        <label>
          Style
          <input value={form.style} onChange={e => set('style', e.target.value)} />
        </label>
        <label>
          ABV %
          <input type="number" step="0.1" min="0" max="30" value={form.abv} onChange={e => set('abv', e.target.value)} />
        </label>
        <label>
          Price $
          <input type="number" step="0.25" min="0" value={form.price} onChange={e => set('price', e.target.value)} />
        </label>
      </div>

      <div className="form-logo">
        <span>Logo</span>
        {logoPreview
          ? (
            <div className="logo-preview">
              <img src={logoPreview} alt="logo preview" />
              <button type="button" className="remove-logo" onClick={removeLogo}>Remove</button>
            </div>
          )
          : (
            <label className="logo-upload-btn">
              Choose Image
              <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
            </label>
          )
        }
      </div>

      <label className="form-staff-pick">
        <input type="checkbox" checked={form.staffPick} onChange={e => set('staffPick', e.target.checked)} />
        Staff Pick
      </label>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Tap'}
        </button>
      </div>
    </form>
  );
}
