import { useEffect, useState } from 'react';
import TapCard from './components/TapCard';
import { supabase } from './supabase';
import { toClient } from './lib/taps';
import './App.css';

export default function App() {
  const [taps, setTaps] = useState([]);

  useEffect(() => {
    supabase
      .from('taps')
      .select('*')
      .order('tap')
      .then(({ data }) => data && setTaps(data.map(toClient)));

    const channel = supabase
      .channel('taps-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'taps' }, () => {
        supabase
          .from('taps')
          .select('*')
          .order('tap')
          .then(({ data }) => data && setTaps(data.map(toClient)));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="taplist">
      <header className="taplist-header">
        <div className="venue-name">
          <span className="venue-primary">Sun Oaks</span>
          <span className="venue-secondary">BEER ON TAP</span>
        </div>
      </header>
      <hr className="divider" />
      <div className="tap-grid">
        {taps.map((tap) => (
          <TapCard key={tap.tap} tap={tap} />
        ))}
      </div>
    </div>
  );
}
