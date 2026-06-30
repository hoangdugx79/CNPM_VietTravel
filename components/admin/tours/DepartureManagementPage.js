import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { adminAPI } from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/format';
import { useToast } from '../../Toast';
import AdminConfirmDialog from '../common/AdminConfirmDialog';
import AdminEmptyState from '../common/AdminEmptyState';
import AdminModal from '../common/AdminModal';
import AdminPagination from '../common/AdminPagination';
import AdminStatusBadge from '../common/AdminStatusBadge';

function getInitialForm(item) {
  return {
    tourId: item?.TourId || '',
    departureCode: item?.DepartureCode || '',
    startDate: item?.StartDate ? new Date(item.StartDate).toISOString().slice(0, 10) : '',
    endDate: item?.EndDate ? new Date(item.EndDate).toISOString().slice(0, 10) : '',
    capacity: item?.Capacity || 1,
    adultPrice: item?.AdultPrice || 0,
    childPrice: item?.ChildPrice || 0,
    infantPrice: item?.InfantPrice || 0,
    status: item?.Status || 'open',
  };
}

export default function DepartureManagementPage() {
  const { showToast, ToastContainer } = useToast();
  const [rows, setRows] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ tourId: '', page: 1, limit: 10 });
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(getInitialForm());
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadTours = async () => {
    const { ok, data } = await adminAPI('/admin/tours?page=1&limit=200');
    if (ok) setTours(data.data || []);
  };

  const loadData = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit) });
    if (filters.tourId) params.set('tourId', filters.tourId);
    const { ok, data } = await adminAPI(`/admin/tours/all-departures?${params.toString()}`);
    if (ok) {
      setRows(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } else showToast(data.message || 'Khong the tai lich khoi hanh.', 'error');
    setLoading(false);
  };

  useEffect(() => { loadTours(); }, []);
  useEffect(() => { loadData(); }, [filters.page, filters.limit, filters.tourId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const endpoint = editingItem ? `/admin/tours/departures/${editingItem.DepartureId}` : `/admin/tours/${form.tourId}/departures`;
    const method = editingItem ? 'PUT' : 'POST';
    const { ok, data } = await adminAPI(endpoint, { method, body: JSON.stringify(form) });
    setSubmitting(false);
    if (!ok) return showToast(data.message || 'Khong the luu lich khoi hanh.', 'error');
    showToast(editingItem ? 'Cap nhat lich khoi hanh thanh cong.' : 'Them lich khoi hanh thanh cong.', 'success');
    setFormOpen(false);
    setEditingItem(null);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { ok, data } = await adminAPI(`/admin/tours/departures/${deleteTarget.DepartureId}`, { method: 'DELETE' });
    setDeleteLoading(false);
    if (!ok) return showToast(data.message || 'Khong the xoa lich khoi hanh.', 'error');
    showToast('Xoa lich khoi hanh thanh cong.', 'success');
    setDeleteTarget(null);
    loadData();
  };

  return (
    <AdminLayout title="Lich khoi hanh" subtitle="Quan ly dot mo ban, gia va suc chua theo tour">
      <ToastContainer />
      <div className="page-header-bar"><h2>Danh sach lich khoi hanh</h2><button type="button" className="btn btn-primary" onClick={() => { setEditingItem(null); setForm(getInitialForm()); setFormOpen(true); }}><i className="fas fa-plus" /> Them lich khoi hanh</button></div>
      <div className="admin-card"><div className="card-body">
        <div className="data-controls"><form className="admin-filter-form" onSubmit={(event) => event.preventDefault()}><select className="filter-select" value={filters.tourId} onChange={(event) => setFilters((current) => ({ ...current, tourId: event.target.value, page: 1 }))}><option value="">Tat ca tour</option>{tours.map((item) => <option key={item.TourId} value={item.TourId}>{item.Title}</option>)}</select></form></div>
        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : rows.length ? <>
          <div className="table-wrap"><table><thead><tr><th>Tour</th><th>Ma</th><th>Ngay di</th><th>Ngay ve</th><th>Suc chua</th><th>Gia nguoi lon</th><th>Trang thai</th><th>Thao tac</th></tr></thead><tbody>{rows.map((item) => <tr key={item.DepartureId}><td><div className="admin-cell-title">{item.TourTitle}</div><div className="admin-cell-subtitle">{item.TourCode || '-'}</div></td><td>{item.DepartureCode}</td><td>{formatDate(item.StartDate)}</td><td>{formatDate(item.EndDate)}</td><td>{item.Capacity}</td><td>{formatCurrency(item.AdultPrice)}</td><td><AdminStatusBadge status={item.Status} /></td><td><div className="admin-inline-actions"><button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditingItem(item); setForm(getInitialForm(item)); setFormOpen(true); }}>Sua</button><button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(item)}>Xoa</button></div></td></tr>)}</tbody></table></div>
          <AdminPagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
        </> : <AdminEmptyState icon="fa-calendar-alt" title="Chua co lich khoi hanh" description="Them lich khoi hanh de mo ban cho tour." />}
      </div></div>
      <AdminModal open={formOpen} title={editingItem ? 'Cap nhat lich khoi hanh' : 'Them lich khoi hanh'} onClose={() => setFormOpen(false)} footer={<><button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)} disabled={submitting}>Dong</button><button type="submit" form="departure-form" className="btn btn-primary" disabled={submitting}>{submitting ? 'Dang luu...' : 'Luu'}</button></>}>
        <form id="departure-form" onSubmit={handleSubmit}>
          {!editingItem ? <div className="form-group"><label className="form-label">Tour</label><select className="form-select" value={form.tourId} onChange={(event) => setForm((current) => ({ ...current, tourId: event.target.value }))} required><option value="">Chon tour</option>{tours.map((item) => <option key={item.TourId} value={item.TourId}>{item.Title}</option>)}</select></div> : null}
          <div className="form-row-3"><div className="form-group"><label className="form-label">Ma lich</label><input className="form-control" value={form.departureCode} onChange={(event) => setForm((current) => ({ ...current, departureCode: event.target.value }))} required /></div><div className="form-group"><label className="form-label">Ngay di</label><input className="form-control" type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} required /></div><div className="form-group"><label className="form-label">Ngay ve</label><input className="form-control" type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} required /></div></div>
          <div className="form-row-3"><div className="form-group"><label className="form-label">Suc chua</label><input className="form-control" type="number" min="1" value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} required /></div><div className="form-group"><label className="form-label">Gia nguoi lon</label><input className="form-control" type="number" min="0" value={form.adultPrice} onChange={(event) => setForm((current) => ({ ...current, adultPrice: event.target.value }))} required /></div><div className="form-group"><label className="form-label">Gia tre em</label><input className="form-control" type="number" min="0" value={form.childPrice} onChange={(event) => setForm((current) => ({ ...current, childPrice: event.target.value }))} required /></div></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Gia em be</label><input className="form-control" type="number" min="0" value={form.infantPrice} onChange={(event) => setForm((current) => ({ ...current, infantPrice: event.target.value }))} /></div><div className="form-group"><label className="form-label">Trang thai</label><select className="form-select" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option value="open">Mo ban</option><option value="closed">Dong ban</option><option value="cancelled">Da huy</option></select></div></div>
        </form>
      </AdminModal>
      <AdminConfirmDialog open={Boolean(deleteTarget)} title="Xoa lich khoi hanh" message={`Ban sap xoa lich khoi hanh "${deleteTarget?.DepartureCode || ''}". He thong se chan neu lich da co cho dat.`} loading={deleteLoading} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </AdminLayout>
  );
}
