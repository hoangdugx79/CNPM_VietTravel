export function formatCurrency(amount) {
  if (!amount) return '0d';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDate(dateStr, opts = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('vi-VN', opts).format(new Date(dateStr));
}

export function formatDateTime(d) {
  return d ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d)) : '';
}

export function statusBadge(status) {
  const map = {
    active: ['success', 'Hoat dong'],
    inactive: ['gray', 'Khong hoat dong'],
    available: ['success', 'San sang'],
    blocked: ['danger', 'Da khoa'],
    open: ['success', 'Mo ban'],
    closed: ['gray', 'Dong ban'],
    pending: ['warning', 'Cho xu ly'],
    confirmed: ['success', 'Da xac nhan'],
    completed: ['info', 'Hoan thanh'],
    cancelled: ['danger', 'Da huy'],
    paid: ['success', 'Da thanh toan'],
    unpaid: ['danger', 'Chua thanh toan'],
    partial: ['warning', 'Thanh toan 1 phan'],
    draft: ['gray', 'Nhap'],
    archived: ['gray', 'Luu tru'],
  };
  const [color, label] = map[status] || ['gray', status];
  return { color, label };
}
