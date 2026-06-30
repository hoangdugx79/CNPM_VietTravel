import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { adminAPI } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import { useToast } from '../../Toast';
import AdminConfirmDialog from '../common/AdminConfirmDialog';
import AdminEmptyState from '../common/AdminEmptyState';
import AdminModal from '../common/AdminModal';
import AdminPagination from '../common/AdminPagination';
import AdminStatusBadge from '../common/AdminStatusBadge';
import CustomSelect from '../../common/CustomSelect';

function getInitialForm(item) {
  return {
    code: item?.Code || '',
    name: item?.Name || '',
    description: item?.Description || '',
    discountType: item?.DiscountType || 'percent',
    discountValue: item?.DiscountValue || 0,
    maxDiscountAmount: item?.MaxDiscountAmount || '',
    minOrderAmount: item?.MinOrderAmount || '',
    startDate: item?.StartDate ? new Date(item.StartDate).toISOString().slice(0, 10) : '',
    endDate: item?.EndDate ? new Date(item.EndDate).toISOString().slice(0, 10) : '',
    usageLimit: item?.UsageLimit || '',
    status: item?.Status || 'active',
  };
}

export default function PromotionManagementPage() {
  const { showToast, ToastContainer } = useToast();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '', page: 1, limit: 10 });
  const [draftSearch, setDraftSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(getInitialForm());
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [lookups, setLookups] = useState({ tours: [] });
  const [manageOpen, setManageOpen] = useState(false);
  const [manageItem, setManageItem] = useState(null);
  const [manageDetail, setManageDetail] = useState(null);
  const [selectedTourIds, setSelectedTourIds] = useState([]);

  const loadLookups = async () => {
    const { ok, data } = await adminAPI('/admin/promotions/lookups');
    if (ok) setLookups(data.data || { tours: [] });
  };

  const loadData = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit) });
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    const { ok, data } = await adminAPI(`/admin/promotions?${params.toString()}`);
    if (ok) {
      setRows(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } else showToast(data.message || 'Không thể tải khuyến mãi.', 'error');
    setLoading(false);
  };

  useEffect(() => { loadLookups(); }, []);
  useEffect(() => { loadData(); }, [filters.page, filters.limit, filters.search, filters.status]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const endpoint = editingItem ? `/admin/promotions/${editingItem.PromotionId}` : '/admin/promotions';
    const method = editingItem ? 'PUT' : 'POST';
    const { ok, data } = await adminAPI(endpoint, { method, body: JSON.stringify(form) });
    setSubmitting(false);
    if (!ok) return showToast(data.message || 'Không thể lưu khuyến mãi.', 'error');
    showToast(editingItem ? 'Cập nhật khuyến mãi thành công.' : 'Tạo khuyến mãi thành công.', 'success');
    setFormOpen(false);
    setEditingItem(null);
    loadData();
  };

  const openManageTours = async (item) => {
    setManageItem(item);
    setManageOpen(true);
    setManageDetail(null);
    const { ok, data } = await adminAPI(`/admin/promotions/${item.PromotionId}`);
    if (!ok) return showToast(data.message || 'Không thể tải chi tiết khuyến mãi.', 'error');
    setManageDetail(data.data);
    setSelectedTourIds([]);
  };

  const handleAssignTours = async () => {
    const { ok, data } = await adminAPI(`/admin/promotions/${manageItem.PromotionId}/tours`, {
      method: 'POST',
      body: JSON.stringify({ tourIds: selectedTourIds }),
    });
    if (!ok) return showToast(data.message || 'Không thể gán tour.', 'error');
    showToast('Gán tour thành công.', 'success');
    openManageTours(manageItem);
    loadData();
  };

  const handleRemoveTour = async (tourId) => {
    const { ok, data } = await adminAPI(`/admin/promotions/${manageItem.PromotionId}/tours/${tourId}`, { method: 'DELETE' });
    if (!ok) return showToast(data.message || 'Không thể gỡ tour.', 'error');
    showToast('Gỡ tour thành công.', 'success');
    openManageTours(manageItem);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { ok, data } = await adminAPI(`/admin/promotions/${deleteTarget.PromotionId}`, { method: 'DELETE' });
    setDeleteLoading(false);
    if (!ok) return showToast(data.message || 'Không thể lưu trữ khuyến mãi.', 'error');
    showToast('Lưu trữ khuyến mãi thành công.', 'success');
    setDeleteTarget(null);
    loadData();
  };

  return (
    <AdminLayout title="Khuyến mãi" subtitle="CRUD chương trình khuyến mãi và phạm vi áp dụng tour">
      <ToastContainer />
      <div className="page-header-bar"><h2>Danh sách khuyến mãi</h2><button type="button" className="btn btn-primary" onClick={() => { setEditingItem(null); setForm(getInitialForm()); setFormOpen(true); }}><i className="fas fa-plus" /> Thêm khuyến mãi</button></div>
      <div className="admin-card"><div className="card-body">
        <div className="data-controls"><form className="admin-filter-form" onSubmit={(event) => { event.preventDefault(); setFilters((current) => ({ ...current, search: draftSearch.trim(), page: 1 })); }}><div className="search-input"><i className="fas fa-search" /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Mã hoặc tên khuyến mãi..." /></div><CustomSelect className="filter-select" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))} options={[{ value: '', label: 'Tất cả trạng thái' }, { value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Không hoạt động' }]} placeholder="Tất cả trạng thái" /><button type="submit" className="btn btn-outline">Lọc</button></form></div>
        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : rows.length ? <>
          <div className="table-wrap"><table><thead><tr><th>Mã</th><th>Tên</th><th>Loại giảm</th><th>Hiệu lực</th><th>Số tour</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{rows.map((item) => <tr key={item.PromotionId}><td>{item.Code}</td><td><div className="admin-cell-title">{item.Name}</div><div className="admin-cell-subtitle">{item.Description || '-'}</div></td><td>{item.DiscountType} / {item.DiscountValue}</td><td>{formatDate(item.StartDate)} - {formatDate(item.EndDate)}</td><td>{item.TourCount || 0}</td><td><AdminStatusBadge status={item.Status} /></td><td><div className="admin-inline-actions"><button type="button" className="btn btn-success btn-sm" onClick={() => openManageTours(item)}>Gán tour</button><button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditingItem(item); setForm(getInitialForm(item)); setFormOpen(true); }}>Sửa</button><button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(item)}>Lưu trữ</button></div></td></tr>)}</tbody></table></div>
          <AdminPagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
        </> : <AdminEmptyState icon="fa-tag" title="Chưa có khuyến mãi" description="Tạo khuyến mãi mới để hỗ trợ kinh doanh." />}
      </div></div>
      <AdminModal open={formOpen} title={editingItem ? 'Cập nhật khuyến mãi' : 'Thêm khuyến mãi'} onClose={() => setFormOpen(false)} footer={<><button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)} disabled={submitting}>Đóng</button><button type="submit" form="promotion-form" className="btn btn-primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu'}</button></>}>
        <form id="promotion-form" onSubmit={handleSubmit}>
          <div className="form-row"><div className="form-group"><label className="form-label">Mã</label><input className="form-control" value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))} required /></div><div className="form-group"><label className="form-label">Tên</label><input className="form-control" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required /></div></div>
          <div className="form-row-3"><div className="form-group"><label className="form-label">Loại giảm</label><CustomSelect className="admin-select" value={form.discountType} onChange={(e) => setForm((c) => ({ ...c, discountType: e.target.value }))} options={[{ value: 'percent', label: 'Percent' }, { value: 'fixed', label: 'Fixed' }]} /></div><div className="form-group"><label className="form-label">Giá trị giảm</label><input className="form-control" type="number" min="0" value={form.discountValue} onChange={(e) => setForm((c) => ({ ...c, discountValue: e.target.value }))} required /></div><div className="form-group"><label className="form-label">Trạng thái</label><CustomSelect className="admin-select" value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))} options={[{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Không hoạt động' }]} /></div></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Ngày bắt đầu</label><input className="form-control" type="date" value={form.startDate} onChange={(e) => setForm((c) => ({ ...c, startDate: e.target.value }))} required /></div><div className="form-group"><label className="form-label">Ngày kết thúc</label><input className="form-control" type="date" value={form.endDate} onChange={(e) => setForm((c) => ({ ...c, endDate: e.target.value }))} required /></div></div>
          <div className="form-row-3"><div className="form-group"><label className="form-label">Giảm tối đa</label><input className="form-control" type="number" min="0" value={form.maxDiscountAmount} onChange={(e) => setForm((c) => ({ ...c, maxDiscountAmount: e.target.value }))} /></div><div className="form-group"><label className="form-label">Đơn tối thiểu</label><input className="form-control" type="number" min="0" value={form.minOrderAmount} onChange={(e) => setForm((c) => ({ ...c, minOrderAmount: e.target.value }))} /></div><div className="form-group"><label className="form-label">Giới hạn sử dụng</label><input className="form-control" type="number" min="0" value={form.usageLimit} onChange={(e) => setForm((c) => ({ ...c, usageLimit: e.target.value }))} /></div></div>
          <div className="form-group"><label className="form-label">Mô tả</label><textarea className="form-control" rows="4" value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} /></div>
        </form>
      </AdminModal>
      <AdminModal open={manageOpen} title={`Gán tour - ${manageItem?.Name || ''}`} onClose={() => setManageOpen(false)} maxWidth={980} footer={<button type="button" className="btn btn-outline" onClick={() => setManageOpen(false)}>Đóng</button>}>
        {!manageDetail ? <div className="loading-spinner"><div className="spinner" /></div> : <div className="admin-stack"><div className="form-group"><label className="form-label">Chọn tour để gán</label><select className="form-control admin-multi-select" multiple value={selectedTourIds} onChange={(event) => setSelectedTourIds(Array.from(event.target.options).filter((option) => option.selected).map((option) => option.value))}>{(lookups.tours || []).map((item) => <option key={item.TourId} value={item.TourId}>{item.Title}</option>)}</select><div className="admin-inline-actions" style={{ marginTop: 12 }}><button type="button" className="btn btn-primary" onClick={handleAssignTours} disabled={!selectedTourIds.length}>Gán tour đã chọn</button></div></div><div className="table-wrap"><table><thead><tr><th>Mã</th><th>Tên tour</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{manageDetail.tours?.length ? manageDetail.tours.map((item) => <tr key={item.TourId}><td>{item.Code}</td><td>{item.Title}</td><td><AdminStatusBadge status={item.Status} /></td><td><button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveTour(item.TourId)}>Gỡ</button></td></tr>) : <tr><td colSpan="4">Chưa gán tour nào.</td></tr>}</tbody></table></div></div>}
      </AdminModal>
      <AdminConfirmDialog open={Boolean(deleteTarget)} title="Lưu trữ khuyến mãi" message={`Bạn sắp lưu trữ khuyến mãi "${deleteTarget?.Name || ''}".`} loading={deleteLoading} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </AdminLayout>
  );
}
