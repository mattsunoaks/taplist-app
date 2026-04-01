export default function TapCard({ tap }) {
  return (
    <div className={`tap-card ${tap.staffPick ? 'staff-pick' : ''}`}>
      <div className="tap-card-header">
        <span className="tap-number">TAP {String(tap.tap).padStart(2, '0')}</span>
        {tap.staffPick && <span className="staff-pick-badge">STAFF PICK</span>}
      </div>
      {tap.logo && (
        <img
          src={tap.logo.startsWith('http') ? tap.logo : `/logos/${tap.logo}`}
          alt={`${tap.brewery} logo`}
          className="brewery-logo"
        />
      )}
      <h2 className="beer-name">{tap.name}</h2>
      <p className="brewery-name">{tap.brewery}</p>
      <div className="beer-meta">
        <span className="style-pill">{tap.style}</span>
        <span className="abv">{tap.abv}% ABV</span>
      </div>
      <p className="location">{tap.location}</p>
    </div>
  );
}
