export default function AdminEmptyState({
  icon = 'fa-inbox',
  title = 'Chua co du lieu',
  description = 'Khong co ban ghi nao phu hop voi bo loc hien tai.',
}) {
  return (
    <div className="empty-state">
      <i className={`fas ${icon}`} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
