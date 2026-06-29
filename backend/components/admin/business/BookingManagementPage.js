import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { adminAPI } from '../../../lib/api';
import { formatCurrency, formatDate, formatDateTime } from '../../../lib/format';
import { useToast } from '../../Toast';
import AdminEmptyState from '../common/AdminEmptyState';
import AdminModal from '../common/AdminModal';
import AdminPagination from '../common/AdminPagination';
import AdminStatusBadge from '../common/AdminStatusBadge';

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
      showToast(data.message || 'Khong the tai danh sach booking.', 'error');
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
    else showToast(data.message || 'Khong the tai chi tiet booking.', 'error');
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
    if (!ok) return showToast(data.message || 'Khong the cap nhat booking.', 'error');
    showToast('Cap nhat booking thanh cong.', 'success');
    loadData();
    if (detail?.BookingId === bookingId) openDetail(bookingId);
  };

  return (
    <AdminLayout title="Quan ly Booking" subtitle="Van hanh booking, xac nhan va cap nhat trang thai thanh toan">
      <ToastContainer />
      <div className="page-header-bar"><h2>Danh sach booking</h2></div>
      <div className="admin-card">
        <div className="card-body">
          <div className="data-controls">
            <form className="admin-filter-form" onSubmit={(event) => { event.preventDefault(); setFilters((current) => ({ ...current, search: draftSearch.trim(), page: 1 })); }}>
              <div className="search-input"><i className="fas fa-search" /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Ma booking, ten khach, sdt..." /></div>
              <select className="filter-select" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
                <option value="">Tat ca booking status</option>
                <option value="pending">Cho xu ly</option>
                <option value="confirmed">Da xac nhan</option>
                <option value="cancelled">Da huy</option>
                <option value="completed">Hoan thanh</option>
              </select>
              <select className="filter-select" value={filters.paymentStatus} onChange={(event) => setFilters((current) => ({ ...current, paymentStatus: event.target.value, page: 1 }))}>
                <option value="">Tat ca payment status</option>
                <option value="unpaid">Chua thanh toan</option>
                <option value="partial">Thanh toan 1 phan</option>
                <option value="paid">Da thanh toan</option>
              </select>
              <button type="submit" className="btn btn-outline">Loc</button>
            </form>
          </div>
          {loading ? <div className="loading-spinner"><div className="spinner" /></div> : rows.length ? (
            <>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Ma</th><th>Khach hang</th><th>Tour</th><th>Tong tien</th><th>Thanh toan</th><th>Booking</th><th>Thao tac</th></tr></thead>
                  <tbody>
                    {rows.map((item) => (
                      <tr key={item.BookingId}>
                        <td>{item.BookingCode}</td>
                        <td><div className="admin-cell-title">{item.CustomerFullName}</div><div className="admin-cell-subtitle">{item.CustomerPhone || item.CustomerEmail}</div></td>
                        <td>{item.TourTitleSnapshot}</td>
                        <td>{formatCurrency(item.TotalAmount)}</td>
                        <td><AdminStatusBadge status={item.PaymentStatus} /></td>
                        <td><AdminStatusBadge status={item.Status} /></td>
                        <td><div className="admin-inline-actions"><button type="button" className="btn btn-success btn-sm" onClick={() => openDetail(item.BookingId)}>Chi tiet</button>{item.Status === 'pending' ? <button type="button" className="btn btn-outline btn-sm" onClick={() => handleAction(item.BookingId, 'confirm')} disabled={actionLoading}>Xac nhan</button> : null}{item.Status !== 'cancelled' ? <button type="button" className="btn btn-danger btn-sm" onClick={() => handleAction(item.BookingId, 'cancel')} disabled={actionLoading}>Huy</button> : null}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminPagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
            </>
          ) : <AdminEmptyState icon="fa-suitcase" title="Chua co booking" description="Danh sach booking hien dang trong." />}
        </div>
      </div>
      <AdminModal open={detailOpen} title={detail ? `Booking ${detail.BookingCode}` : 'Chi tiet booking'} onClose={() => setDetailOpen(false)} maxWidth={980} footer={<button type="button" className="btn btn-outline" onClick={() => setDetailOpen(false)}>Dong</button>}>
        {detailLoading ? <div className="loading-spinner"><div className="spinner" /></div> : detail ? (
          <div className="admin-stack">
            <div className="admin-summary-grid">
              <div className="admin-summary-card"><div className="summary-label">Trang thai booking</div><div className="summary-value"><AdminStatusBadge status={detail.Status} /></div></div>
              <div className="admin-summary-card"><div className="summary-label">Thanh toan</div><div className="summary-value"><AdminStatusBadge status={detail.PaymentStatus} /></div></div>
              <div className="admin-summary-card"><div className="summary-label">Tong tien</div><div className="summary-value">{formatCurrency(detail.TotalAmount)}</div></div>
            </div>
            <div className="admin-section-card"><div className="admin-section-header"><div><h3>Thong tin booking</h3></div><div className="admin-inline-actions">{detail.Status === 'pending' ? <button type="button" className="btn btn-success btn-sm" onClick={() => handleAction(detail.BookingId, 'confirm')} disabled={actionLoading}>Xac nhan</button> : null}{detail.Status !== 'cancelled' ? <button type="button" className="btn btn-danger btn-sm" onClick={() => handleAction(detail.BookingId, 'cancel')} disabled={actionLoading}>Huy booking</button> : null}</div></div><div className="card-body"><p><strong>Khach:</strong> {detail.CustomerFullName}</p><p><strong>Email:</strong> {detail.CustomerEmail || '-'}</p><p><strong>Dien thoai:</strong> {detail.CustomerPhone || '-'}</p><p><strong>Tour:</strong> {detail.TourTitleSnapshot}</p><p><strong>Ngay tao:</strong> {formatDateTime(detail.CreatedAt)}</p><p><strong>So luong:</strong> {detail.AdultQuantity} nguoi lon, {detail.ChildQuantity} tre em, {detail.InfantQuantity} em be</p><p><strong>Da thanh toan:</strong> {formatCurrency(detail.PaidAmount)}</p><p><strong>Con lai:</strong> {formatCurrency(detail.RemainingAmount)}</p></div></div>
            <div className="admin-section-card"><div className="admin-section-header"><div><h3>Cap nhat nhanh trang thai</h3></div></div><div className="card-body"><div className="admin-inline-actions">{['pending', 'confirmed', 'completed', 'cancelled'].map((status) => <button key={status} type="button" className="btn btn-outline btn-sm" onClick={() => handleAction(detail.BookingId, 'status', status)} disabled={actionLoading}>{status}</button>)}</div></div></div>
          </div>
        ) : <p>Khong tai duoc booking.</p>}
      </AdminModal>
    </AdminLayout>
  );
}
