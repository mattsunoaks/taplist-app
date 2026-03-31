import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } else {
      setError('Incorrect password');
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Sun Oaks</h1>
        <p>Admin Login</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
}
