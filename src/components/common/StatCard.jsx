function StatCard({
  label,
  value,
  sub,
  description,
  badge,
  icon,
  tone = "green",
}) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-card-top">
        <div className="stat-icon">{icon}</div>
        {badge && <span className={`stat-badge ${tone}`}>{badge}</span>}
      </div>

      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {sub && <span>{sub}</span>}
      </div>

      {description && <em>{description}</em>}
    </div>
  );
}

export default StatCard;