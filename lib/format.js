export function formatCurrency(amount) {
  if (!amount) return '0đ';
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
    active: ['success', 'Hoạt động'],
    inactive: ['gray', 'Không hoạt động'],
    available: ['success', 'Sẵn sàng'],
    blocked: ['danger', 'Đã khóa'],
    open: ['success', 'Mở bán'],
    closed: ['gray', 'Đóng bán'],
    pending: ['warning', 'Chờ xử lý'],
    confirmed: ['success', 'Đã xác nhận'],
    completed: ['info', 'Hoàn thành'],
    cancelled: ['danger', 'Đã hủy'],
    paid: ['success', 'Đã thanh toán'],
    unpaid: ['danger', 'Chưa thanh toán'],
    partial: ['warning', 'Thanh toán một phần'],
    draft: ['gray', 'Nháp'],
    archived: ['gray', 'Lưu trữ'],
  };
  const [color, label] = map[status] || ['gray', status];
  return { color, label };
}
