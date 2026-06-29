import AdminModal from './AdminModal';

export default function AdminConfirmDialog({
  open,
  title = 'Xác nhận thao tác',
  message,
  confirmLabel = 'Xác nhận',
  confirmClassName = 'btn-danger',
  loading = false,
  onClose,
  onConfirm,
}) {
  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onClose}
      maxWidth={520}
      footer={(
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Đóng
          </button>
          <button type="button" className={`btn ${confirmClassName}`} onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </>
      )}
    >
      <p style={{ color: 'var(--gray)', lineHeight: 1.6 }}>{message}</p>
    </AdminModal>
  );
}
