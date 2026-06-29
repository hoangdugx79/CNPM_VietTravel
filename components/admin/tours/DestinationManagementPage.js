import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { adminAPI } from '../../../lib/api';
import { useToast } from '../../Toast';
import AdminConfirmDialog from '../common/AdminConfirmDialog';
import AdminEmptyState from '../common/AdminEmptyState';
import AdminModal from '../common/AdminModal';
import AdminPagination from '../common/AdminPagination';
import AdminStatusBadge from '../common/AdminStatusBadge';

function getInitialFormState(item) {
  return {
    name: item?.Name || '',
    slug: item?.Slug || '',
    province: item?.Province || '',
    region: item?.Region || '',
    country: item?.Country || 'Vietnam',
    imageUrl: item?.ImageUrl || '',
    status: item?.Status || 'active',
    description: item?.Description || '',
  };
}

export default function DestinationManagementPage() {
  const { showToast, ToastContainer } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '', page: 1, limit: 10 });
  const [draftSearch, setDraftSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(getInitialFormState());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit) });
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    const { ok, data } = await adminAPI(`/admin/destinations?${params.toString()}`);
    if (ok) {
      setRows(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } else {
      showToast(data.message || 'Không thể tải danh sách điểm đến.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filters.page, filters.limit, filters.search, filters.status]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(getInitialFormState());
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm(getInitialFormState(item));
    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const endpoint = editingItem ? `/admin/destinations/${editingItem.DestinationId}` : '/admin/destinations';
    const method = editingItem ? 'PUT' : 'POST';
    const { ok, data } = await adminAPI(endpoint, {
      method,
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!ok) {
      showToast(data.message || 'Không thể lưu điểm đến.', 'error');
      return;
    }
    showToast(editingItem ? 'Cập nhật điểm đến thành công.' : 'Thêm điểm đến thành công.', 'success');
    setFormOpen(false);
    setEditingItem(null);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { ok, data } = await adminAPI(`/admin/destinations/${deleteTarget.DestinationId}`, { method: 'DELETE' });
    setDeleteLoading(false);
    if (!ok) {
      showToast(data.message || 'Không thể xóa điểm đến.', 'error');
      return;
    }
    showToast('Xóa điểm đến thành công.', 'success');
    setDeleteTarget(null);
    loadData();
  };

  return (
    <AdminLayout title="Điểm đến" subtitle="CRUD điểm đến, dữ liệu nền cho bộ lọc và tour">
      <ToastContainer />
      <div className="page-header-bar">
        <h2>Danh sách điểm đến</h2>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <i className="fas fa-plus" /> Thêm điểm đến
        </button>
      </div>
      <div className="admin-card">
        <div className="card-body">
          <div className="data-controls">
            <form className="admin-filter-form" onSubmit={(event) => { event.preventDefault(); setFilters((current) => ({ ...current, search: draftSearch.trim(), page: 1 })); }}>
              <div className="search-input">
                <i className="fas fa-search" />
                <input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Tìm tên, slug, tỉnh thành..." />
              </div>
              <select className="filter-select" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
              <button type="submit" className="btn btn-outline">Lọc</button>
            </form>
          </div>
          {loading ? <div className="loading-spinner"><div className="spinner" /></div> : rows.length ? (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Slug</th>
                      <th>Khu vực</th>
                      <th>Tour hoạt động</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item) => (
                      <tr key={item.DestinationId}>
                        <td>
                          <div className="admin-cell-title">{item.Name}</div>
                          <div className="admin-cell-subtitle">{item.Province || item.Country}</div>
                        </td>
                        <td>{item.Slug}</td>
                        <td>{item.Region || '-'}</td>
                        <td>{item.TourCount || 0}</td>
                        <td><AdminStatusBadge status={item.Status} /></td>
                        <td>
                          <div className="admin-inline-actions">
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Sửa</button>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(item)}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminPagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
            </>
          ) : <AdminEmptyState icon="fa-compass" title="Chưa có điểm đến" description="Thêm điểm đến để liên kết với tour." />}
        </div>
      </div>

      <AdminModal
        open={formOpen}
        title={editingItem ? 'Cập nhật điểm đến' : 'Thêm điểm đến'}
        onClose={() => setFormOpen(false)}
        footer={(
          <>
            <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)} disabled={submitting}>Đóng</button>
            <button type="submit" form="destination-form" className="btn btn-primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu'}</button>
          </>
        )}
      >
        <form id="destination-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tên</label>
              <input className="form-control" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Slug</label>
              <input className="form-control" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder="Để trống để giữ hoặc tự sinh" />
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Tỉnh/Thành</label>
              <input className="form-control" value={form.province} onChange={(event) => setForm((current) => ({ ...current, province: event.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Khu vực</label>
              <input className="form-control" value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Quốc gia</label>
              <input className="form-control" value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ảnh</label>
              <input className="form-control" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select className="form-select" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea className="form-control" rows="4" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa điểm đến"
        message={`Xóa điểm đến "${deleteTarget?.Name || ''}". Hệ thống sẽ chặn nếu điểm đến đang được sử dụng trong tour.`}
        loading={deleteLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
