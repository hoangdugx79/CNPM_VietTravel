export default function AdminEmptyState({
  icon = 'fa-inbox',
  title = 'Chưa có dữ liệu',
  description = 'Không có bản ghi nào phù hợp với bộ lọc hiện tại.',
}) {
  return (
    <div className="empty-state">
      <i className={`fas ${icon}`} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
