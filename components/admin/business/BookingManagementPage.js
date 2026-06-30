import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { adminAPI } from '../../../lib/api';
import { formatCurrency, formatDateTime } from '../../../lib/format';
import { useToast } from '../../Toast';
import AdminEmptyState from '../common/AdminEmptyState';
import AdminModal from '../common/AdminModal';
import AdminPagination from '../common/AdminPagination';
import AdminStatusBadge from '../common/AdminStatusBadge';
import CustomSelect from '../../common/CustomSelect';

export default function BookingManagementPage() {
  const { showToast, ToastContainer } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '', paymentStatus: '', page: 1, limit: 10 });
  const [draftSearch, setDraftSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit) });
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
    const { ok, data } = await adminAPI(`/admin/bookings?${params.toString()}`);
    if (ok) {
      setRows(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } else {
      showToast(data.message || 'Không thể tải danh sách booking.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filters.page, filters.limit, filters.search, filters.status, filters.paymentStatus]);

  const openDetail = async (bookingId) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    const { ok, data } = await adminAPI(`/admin/bookings/${bookingId}`);
    if (ok) setDetail(data.data);
    else showToast(data.message || 'Không thể tải chi tiết booking.', 'error');
    setDetailLoading(false);
  };

  const handleAction = async (bookingId, action, status) => {
    setActionLoading(true);
    const endpoint = action === 'status' ? `/admin/bookings/${bookingId}/status` : `/admin/bookings/${bookingId}/${action}`;
    const options = {
      method: 'PUT',
      body: action === 'status' ? JSON.stringify({ status }) : undefined,
    };
    const { ok, data } = await adminAPI(endpoint, options);
    setActionLoading(false);
    if (!ok) return showToast(data.message || 'Không thể cập nhật booking.', 'error');
    showToast('Cập nhật booking thành công.', 'success');
    loadData();
    if (detail?.BookingId === bookingId) openDetail(bookingId);
  };

  return (
    <AdminLayout title="Quản lý booking" subtitle="Vận hành booking, xác nhận và cập nhật trạng thái thanh toán">
      <ToastContainer />
      <div className="page-header-bar"><h2>Danh sách booking</h2></div>
      <div className="admin-card">
        <div className="card-body">
          <div className="data-controls">
            <form className="admin-filter-form" onSubmit={(event) => { event.preventDefault(); setFilters((current) => ({ ...current, search: draftSearch.trim(), page: 1 })); }}>
              <div className="search-input"><i className="fas fa-search" /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Mã booking, tên khách, SĐT..." /></div>
              <CustomSelect
                className="filter-select"
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
                options={[
                  { value: '', label: 'Tất cả trạng thái booking' },
                  { value: 'pending', label: 'Chờ xử lý' },
                  { value: 'confirmed', label: 'Đã xác nhận' },
                  { value: 'cancelled', label: 'Đã hủy' },
                  { value: 'completed', label: 'Hoàn thành' },
                ]}
                placeholder="Tất cả trạng thái booking"
              />
              <CustomSelect
                className="filter-select"
                value={filters.paymentStatus}
                onChange={(event) => setFilters((current) => ({ ...current, paymentStatus: event.target.value, page: 1 }))}
                options={[
                  { value: '', label: 'Tất cả trạng thái thanh toán' },
                  { value: 'unpaid', label: 'Chưa thanh toán' },
                  { value: 'partial', label: 'Thanh toán một phần' },
                  { value: 'paid', label: 'Đã thanh toán' },
                ]}
                placeholder="Tất cả trạng thái thanh toán"
              />
              <button type="submit" className="btn btn-outline">Lọc</button>
            </form>
          </div>
          {loading ? <div className="loading-spinner"><div className="spinner" /></div> : rows.length ? (
            <>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Mã</th><th>Khách hàng</th><th>Tour</th><th>Tổng tiền</th><th>Thanh toán</th><th>Booking</th><th>Thao tác</th></tr></thead>
                  <tbody>
                    {rows.map((item) => (
                      <tr key={item.BookingId}>
                        <td>{item.BookingCode}</td>
                        <td><div className="admin-cell-title">{item.CustomerFullName}</div><div className="admin-cell-subtitle">{item.CustomerPhone || item.CustomerEmail}</div></td>
                        <td>{item.TourTitleSnapshot}</td>
                        <td>{formatCurrency(item.TotalAmount)}</td>
                        <td><AdminStatusBadge status={item.PaymentStatus} /></td>
                        <td><AdminStatusBadge status={item.Status} /></td>
                        <td><div className="admin-inline-actions"><button type="button" className="btn btn-success btn-sm" onClick={() => openDetail(item.BookingId)}>Chi tiết</button>{item.Status === 'pending' ? <button type="button" className="btn btn-outline btn-sm" onClick={() => handleAction(item.BookingId, 'confirm')} disabled={actionLoading}>Xác nhận</button> : null}{item.Status !== 'cancelled' ? <button type="button" className="btn btn-danger btn-sm" onClick={() => handleAction(item.BookingId, 'cancel')} disabled={actionLoading}>Hủy</button> : null}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminPagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
            </>
          ) : <AdminEmptyState icon="fa-suitcase" title="Chưa có booking" description="Danh sách booking hiện đang trống." />}
        </div>
      </div>
      <AdminModal open={detailOpen} title={detail ? `Booking ${detail.BookingCode}` : 'Chi tiết booking'} onClose={() => setDetailOpen(false)} maxWidth={980} footer={<button type="button" className="btn btn-outline" onClick={() => setDetailOpen(false)}>Đóng</button>}>
        {detailLoading ? <div className="loading-spinner"><div className="spinner" /></div> : detail ? (
          <div className="admin-stack">
            <div className="admin-summary-grid">
              <div className="admin-summary-card"><div className="summary-label">Trạng thái booking</div><div className="summary-value"><AdminStatusBadge status={detail.Status} /></div></div>
              <div className="admin-summary-card"><div className="summary-label">Thanh toán</div><div className="summary-value"><AdminStatusBadge status={detail.PaymentStatus} /></div></div>
              <div className="admin-summary-card"><div className="summary-label">Tổng tiền</div><div className="summary-value">{formatCurrency(detail.TotalAmount)}</div></div>
            </div>
            <div className="admin-section-card"><div className="admin-section-header"><div><h3>Thông tin booking</h3></div><div className="admin-inline-actions">{detail.Status === 'pending' ? <button type="button" className="btn btn-success btn-sm" onClick={() => handleAction(detail.BookingId, 'confirm')} disabled={actionLoading}>Xác nhận</button> : null}{detail.Status !== 'cancelled' ? <button type="button" className="btn btn-danger btn-sm" onClick={() => handleAction(detail.BookingId, 'cancel')} disabled={actionLoading}>Hủy booking</button> : null}</div></div><div className="card-body"><p><strong>Khách:</strong> {detail.CustomerFullName}</p><p><strong>Email:</strong> {detail.CustomerEmail || '-'}</p><p><strong>Điện thoại:</strong> {detail.CustomerPhone || '-'}</p><p><strong>Tour:</strong> {detail.TourTitleSnapshot}</p><p><strong>Ngày tạo:</strong> {formatDateTime(detail.CreatedAt)}</p><p><strong>Số lượng:</strong> {detail.AdultQuantity} người lớn, {detail.ChildQuantity} trẻ em, {detail.InfantQuantity} em bé</p><p><strong>Đã thanh toán:</strong> {formatCurrency(detail.PaidAmount)}</p><p><strong>Còn lại:</strong> {formatCurrency(detail.RemainingAmount)}</p></div></div>
            <div className="admin-section-card"><div className="admin-section-header"><div><h3>Cập nhật nhanh trạng thái</h3></div></div><div className="card-body"><div className="admin-inline-actions">{['pending', 'confirmed', 'completed', 'cancelled'].map((status) => <button key={status} type="button" className="btn btn-outline btn-sm" onClick={() => handleAction(detail.BookingId, 'status', status)} disabled={actionLoading}>{status}</button>)}</div></div></div>
          </div>
        ) : <p>Không tải được booking.</p>}
      </AdminModal>
    </AdminLayout>
  );
}
