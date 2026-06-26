function PageHeader({ title, description, right }) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {right && <div className="page-header-right">{right}</div>}
    </div>
  );
}

export default PageHeader;