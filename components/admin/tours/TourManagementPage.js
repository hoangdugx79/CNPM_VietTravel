import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { adminAPI } from '../../../lib/api';
import { formatCurrency } from '../../../lib/format';
import { useToast } from '../../Toast';
import AdminConfirmDialog from '../common/AdminConfirmDialog';
import AdminEmptyState from '../common/AdminEmptyState';
import AdminPagination from '../common/AdminPagination';
import AdminStatusBadge from '../common/AdminStatusBadge';
import CustomSelect from '../../common/CustomSelect';
import TourDetailModal from './TourDetailModal';
import TourFormModal from './TourFormModal';

export default function TourManagementPage() {
  const { showToast, ToastContainer } = useToast();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', page: 1, limit: 10 });
  const [draftSearch, setDraftSearch] = useState('');
  const [lookups, setLookups] = useState({ categories: [], destinations: [] });
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [editingTour, setEditingTour] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const loadLookups = async () => {
    const { ok, data } = await adminAPI('/admin/tours/lookups');
    if (ok) {
      setLookups(data.data || { categories: [], destinations: [] });
      return;
    }

    showToast(data.message || 'Không thể tải dữ liệu bổ trợ.', 'error');
  };

  const loadTours = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(filters.page),
      limit: String(filters.limit),
    });

    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);

    const { ok, data } = await adminAPI(`/admin/tours?${params.toString()}`);

    if (ok) {
      setRows(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: filters.limit, totalPages: 1 });
    } else {
      showToast(data.message || 'Không thể tải danh sách tour.', 'error');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    loadTours();
  }, [filters.page, filters.limit, filters.search, filters.status]);

  const openCreate = () => {
    setEditingTour(null);
    setFormOpen(true);
  };

  const openEdit = async (tourId) => {
    const { ok, data } = await adminAPI(`/admin/tours/${tourId}`);
    if (!ok) {
      showToast(data.message || 'Không thể tải chi tiết tour.', 'error');
      return;
    }

    setEditingTour(data.data);
    setFormOpen(true);
  };

  const handleSubmitTour = async (payload) => {
    setSubmitting(true);
    const endpoint = editingTour?.TourId ? `/admin/tours/${editingTour.TourId}` : '/admin/tours';
    const method = editingTour?.TourId ? 'PUT' : 'POST';

    const { ok, data } = await adminAPI(endpoint, {
      method,
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!ok) {
      showToast(data.message || 'Không thể lưu tour.', 'error');
      return;
    }

    showToast(editingTour?.TourId ? 'Cập nhật tour thành công.' : 'Tạo tour thành công.', 'success');
    setFormOpen(false);
    setEditingTour(null);
    await loadTours();
  };

  const handleArchiveTour = async () => {
    if (!archiveTarget?.TourId) return;

    setArchiveLoading(true);
    const { ok, data } = await adminAPI(`/admin/tours/${archiveTarget.TourId}`, {
      method: 'DELETE',
    });
    setArchiveLoading(false);

    if (!ok) {
      showToast(data.message || 'Không thể lưu trữ tour.', 'error');
      return;
    }

    showToast('Lưu trữ tour thành công.', 'success');
    setArchiveTarget(null);
    await loadTours();
  };

  return (
    <AdminLayout title="Quản lý tour" subtitle="CRUD tour, lịch trình và lịch khởi hành từ một màn hình quản trị">
      <ToastContainer />
      <div className="page-header-bar">
        <h2>Danh sách tour</h2>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <i className="fas fa-plus" /> Tạo tour mới
        </button>
      </div>

      <div className="admin-card">
        <div className="card-body">
          <div className="data-controls">
            <form
              className="admin-filter-form"
              onSubmit={(event) => {
                event.preventDefault();
                setFilters((current) => ({ ...current, search: draftSearch.trim(), page: 1 }));
              }}
            >
              <div className="search-input">
                <i className="fas fa-search" />
                <input
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  placeholder="Tìm theo mã hoặc tên tour"
                />
              </div>
              <CustomSelect
                className="filter-select"
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
                options={[
                  { value: '', label: 'Tất cả trạng thái' },
                  { value: 'draft', label: 'Nháp' },
                  { value: 'active', label: 'Hoạt động' },
                  { value: 'inactive', label: 'Tạm dừng' },
                  { value: 'archived', label: 'Lưu trữ' },
                ]}
                placeholder="Tất cả trạng thái"
              />
              <button type="submit" className="btn btn-outline">Lọc</button>
            </form>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          ) : rows.length ? (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Tên tour</th>
                      <th>Thời lượng</th>
                      <th>Giá cơ bản</th>
                      <th>Booking</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.TourId}>
                        <td>{row.Code}</td>
                        <td>
                          <div className="admin-cell-title">{row.Title}</div>
                          <div className="admin-cell-subtitle">{row.DeparturePlaceName || row.Slug}</div>
                        </td>
                        <td>{row.DurationDays} ngày {row.DurationNights} đêm</td>
                        <td>{formatCurrency(row.BasePrice)}</td>
                        <td>{row.TotalBookings || 0}</td>
                        <td><AdminStatusBadge status={row.Status} /></td>
                        <td>
                          <div className="admin-inline-actions">
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(row.TourId)}>
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                setSelectedTourId(row.TourId);
                                setDetailOpen(true);
                              }}
                            >
                              Quản lý chi tiết
                            </button>
                            {row.Status !== 'archived' ? (
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => setArchiveTarget(row)}>
                                Lưu trữ
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminPagination
                pagination={pagination}
                onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
              />
            </>
          ) : (
            <AdminEmptyState
              icon="fa-map-marked-alt"
              title="Chưa có tour phù hợp"
              description="Tạo tour mới hoặc điều chỉnh bộ lọc để tiếp tục."
            />
          )}
        </div>
      </div>

      <TourFormModal
        open={formOpen}
        initialData={editingTour}
        lookups={lookups}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false);
          setEditingTour(null);
        }}
        onSubmit={handleSubmitTour}
      />

      <TourDetailModal
        open={detailOpen}
        tourId={selectedTourId}
        onClose={() => {
          setDetailOpen(false);
          setSelectedTourId(null);
        }}
        onUpdated={loadTours}
      />

      <AdminConfirmDialog
        open={Boolean(archiveTarget)}
        title="Lưu trữ tour"
        message={`Tour "${archiveTarget?.Title || ''}" sẽ được chuyển sang trạng thái lưu trữ. Bạn có muốn tiếp tục?`}
        confirmLabel="Lưu trữ"
        loading={archiveLoading}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchiveTour}
      />
    </AdminLayout>
  );
}
