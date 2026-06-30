import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { adminAPI } from '../../../lib/api';
import { formatCurrency } from '../../../lib/format';
import { useToast } from '../../Toast';
import AdminConfirmDialog from '../common/AdminConfirmDialog';
import AdminEmptyState from '../common/AdminEmptyState';
import AdminPagination from '../common/AdminPagination';
import AdminStatusBadge from '../common/AdminStatusBadge';
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

    showToast(data.message || 'Khong the tai du lieu bo tro.', 'error');
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
      showToast(data.message || 'Khong the tai danh sach tour.', 'error');
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
      showToast(data.message || 'Khong the tai chi tiet tour.', 'error');
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
      showToast(data.message || 'Khong the luu tour.', 'error');
      return;
    }

    showToast(editingTour?.TourId ? 'Cap nhat tour thanh cong.' : 'Tao tour thanh cong.', 'success');
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
      showToast(data.message || 'Khong the luu tru tour.', 'error');
      return;
    }

    showToast('Luu tru tour thanh cong.', 'success');
    setArchiveTarget(null);
    await loadTours();
  };

  return (
    <AdminLayout title="Quan ly Tours" subtitle="CRUD tour, lich trinh va lich khoi hanh tu mot man hinh quan tri">
      <ToastContainer />
      <div className="page-header-bar">
        <h2>Danh sach Tours</h2>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <i className="fas fa-plus" /> Tao tour moi
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
                  placeholder="Tim theo ma hoac ten tour"
                />
              </div>
              <select
                className="filter-select"
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
              >
                <option value="">Tat ca trang thai</option>
                <option value="draft">Nhap</option>
                <option value="active">Hoat dong</option>
                <option value="inactive">Tam dung</option>
                <option value="archived">Luu tru</option>
              </select>
              <button type="submit" className="btn btn-outline">Loc</button>
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
                      <th>Ma</th>
                      <th>Ten tour</th>
                      <th>Thoi luong</th>
                      <th>Gia co ban</th>
                      <th>Booking</th>
                      <th>Trang thai</th>
                      <th>Thao tac</th>
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
                        <td>{row.DurationDays} ngay {row.DurationNights} dem</td>
                        <td>{formatCurrency(row.BasePrice)}</td>
                        <td>{row.TotalBookings || 0}</td>
                        <td><AdminStatusBadge status={row.Status} /></td>
                        <td>
                          <div className="admin-inline-actions">
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(row.TourId)}>
                              Sua
                            </button>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                setSelectedTourId(row.TourId);
                                setDetailOpen(true);
                              }}
                            >
                              Quan ly chi tiet
                            </button>
                            {row.Status !== 'archived' ? (
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => setArchiveTarget(row)}>
                                Luu tru
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
              title="Chua co tour phu hop"
              description="Tao tour moi hoac dieu chinh bo loc de tiep tuc."
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
        title="Luu tru tour"
        message={`Tour "${archiveTarget?.Title || ''}" se duoc chuyen sang trang thai luu tru. Ban co muon tiep tuc?`}
        confirmLabel="Luu tru"
        loading={archiveLoading}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchiveTour}
      />
    </AdminLayout>
  );
}
