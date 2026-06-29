import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { adminAPI } from '../../../lib/api';
import { useToast } from '../../Toast';
import AdminConfirmDialog from '../common/AdminConfirmDialog';
import AdminEmptyState from '../common/AdminEmptyState';
import AdminModal from '../common/AdminModal';
import AdminPagination from '../common/AdminPagination';
import AdminStatusBadge from '../common/AdminStatusBadge';

function useAdminList(loadFn, deps) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const result = await loadFn();
    setRows(result.rows);
    setPagination(result.pagination);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, deps);

  return { rows, setRows, pagination, setPagination, loading, reload };
}

function ProviderForm({ form, setForm }) {
  return (
    <>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Ten</label><input className="form-control" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required /></div>
        <div className="form-group"><label className="form-label">Loai</label><input className="form-control" value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Nguoi lien he</label><input className="form-control" value={form.contactPersonName} onChange={(e) => setForm((c) => ({ ...c, contactPersonName: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Dien thoai</label><input className="form-control" value={form.contactPhone} onChange={(e) => setForm((c) => ({ ...c, contactPhone: e.target.value }))} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={form.contactEmail} onChange={(e) => setForm((c) => ({ ...c, contactEmail: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Trang thai</label><select className="form-select" value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}><option value="active">Hoat dong</option><option value="inactive">Khong hoat dong</option></select></div>
      </div>
      <div className="form-group"><label className="form-label">Loai dich vu</label><input className="form-control" value={form.serviceTypes} onChange={(e) => setForm((c) => ({ ...c, serviceTypes: e.target.value }))} /></div>
      <div className="form-group"><label className="form-label">Dia chi</label><textarea className="form-control" rows="3" value={form.contactAddress} onChange={(e) => setForm((c) => ({ ...c, contactAddress: e.target.value }))} /></div>
    </>
  );
}

function VehicleForm({ form, setForm, providers }) {
  return (
    <>
      <div className="form-row-3">
        <div className="form-group"><label className="form-label">Nha cung cap</label><select className="form-select" value={form.providerId} onChange={(e) => setForm((c) => ({ ...c, providerId: e.target.value }))} required><option value="">Chon nha cung cap</option>{providers.map((p) => <option key={p.ProviderId} value={p.ProviderId}>{p.Name}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Ma xe</label><input className="form-control" value={form.vehicleCode} onChange={(e) => setForm((c) => ({ ...c, vehicleCode: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Bien so</label><input className="form-control" value={form.plateNumber} onChange={(e) => setForm((c) => ({ ...c, plateNumber: e.target.value }))} required /></div>
      </div>
      <div className="form-row-3">
        <div className="form-group"><label className="form-label">Loai</label><input className="form-control" value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Hang</label><input className="form-control" value={form.brand} onChange={(e) => setForm((c) => ({ ...c, brand: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Model</label><input className="form-control" value={form.model} onChange={(e) => setForm((c) => ({ ...c, model: e.target.value }))} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">So ghe</label><input className="form-control" type="number" min="0" value={form.seatCapacity} onChange={(e) => setForm((c) => ({ ...c, seatCapacity: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Trang thai</label><select className="form-select" value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}><option value="available">San sang</option><option value="inactive">Khong hoat dong</option></select></div>
      </div>
      <div className="form-group"><label className="form-label">Tien ich</label><textarea className="form-control" rows="3" value={form.amenities} onChange={(e) => setForm((c) => ({ ...c, amenities: e.target.value }))} /></div>
      <div className="form-group"><label className="form-label">Anh</label><input className="form-control" value={form.imageUrl} onChange={(e) => setForm((c) => ({ ...c, imageUrl: e.target.value }))} /></div>
    </>
  );
}

function DriverForm({ form, setForm, providers }) {
  return (
    <>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Nha cung cap</label><select className="form-select" value={form.providerId} onChange={(e) => setForm((c) => ({ ...c, providerId: e.target.value }))} required><option value="">Chon nha cung cap</option>{providers.map((p) => <option key={p.ProviderId} value={p.ProviderId}>{p.Name}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Ho ten</label><input className="form-control" value={form.fullName} onChange={(e) => setForm((c) => ({ ...c, fullName: e.target.value }))} required /></div>
      </div>
      <div className="form-row-3">
        <div className="form-group"><label className="form-label">Dien thoai</label><input className="form-control" value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Trang thai</label><select className="form-select" value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}><option value="available">San sang</option><option value="inactive">Khong hoat dong</option></select></div>
      </div>
      <div className="form-row-3">
        <div className="form-group"><label className="form-label">So GPLX</label><input className="form-control" value={form.licenseNumber} onChange={(e) => setForm((c) => ({ ...c, licenseNumber: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Hang GPLX</label><input className="form-control" value={form.licenseClass} onChange={(e) => setForm((c) => ({ ...c, licenseClass: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Nam kinh nghiem</label><input className="form-control" type="number" min="0" value={form.experienceYears} onChange={(e) => setForm((c) => ({ ...c, experienceYears: e.target.value }))} /></div>
      </div>
    </>
  );
}

function RouteForm({ form, setForm }) {
  return (
    <>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Ma tuyen</label><input className="form-control" value={form.routeCode} onChange={(e) => setForm((c) => ({ ...c, routeCode: e.target.value }))} required /></div>
        <div className="form-group"><label className="form-label">Ten tuyen</label><input className="form-control" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Diem di</label><input className="form-control" value={form.fromName} onChange={(e) => setForm((c) => ({ ...c, fromName: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Loai diem di</label><input className="form-control" value={form.fromType} onChange={(e) => setForm((c) => ({ ...c, fromType: e.target.value }))} /></div>
      </div>
      <div className="form-group"><label className="form-label">Dia chi diem di</label><input className="form-control" value={form.fromAddress} onChange={(e) => setForm((c) => ({ ...c, fromAddress: e.target.value }))} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Diem den</label><input className="form-control" value={form.toName} onChange={(e) => setForm((c) => ({ ...c, toName: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Loai diem den</label><input className="form-control" value={form.toType} onChange={(e) => setForm((c) => ({ ...c, toType: e.target.value }))} /></div>
      </div>
      <div className="form-group"><label className="form-label">Dia chi diem den</label><input className="form-control" value={form.toAddress} onChange={(e) => setForm((c) => ({ ...c, toAddress: e.target.value }))} /></div>
      <div className="form-row-3">
        <div className="form-group"><label className="form-label">Khoang cach km</label><input className="form-control" type="number" min="0" value={form.distanceKm} onChange={(e) => setForm((c) => ({ ...c, distanceKm: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Thoi gian du kien phut</label><input className="form-control" type="number" min="0" value={form.estimatedDurationMinutes} onChange={(e) => setForm((c) => ({ ...c, estimatedDurationMinutes: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Trang thai</label><select className="form-select" value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}><option value="active">Hoat dong</option><option value="inactive">Khong hoat dong</option></select></div>
      </div>
    </>
  );
}

function PickupManagementModal({ open, routeItem, onClose }) {
  const { showToast, ToastContainer } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', address: '', pickupTimeOffsetMinutes: 0, status: 'active' });
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRows = async () => {
    if (!routeItem?.RouteId) return;
    setLoading(true);
    const { ok, data } = await adminAPI(`/admin/transport/routes/${routeItem.RouteId}/pickups`);
    if (ok) setRows(data.data || []);
    else showToast(data.message || 'Khong the tai diem don.', 'error');
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadRows();
  }, [open, routeItem?.RouteId]);

  const resetForm = () => {
    setEditingItem(null);
    setForm({ code: '', name: '', address: '', pickupTimeOffsetMinutes: 0, status: 'active' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!routeItem?.RouteId) return;
    setSubmitting(true);
    const endpoint = editingItem ? `/admin/transport/pickups/${editingItem._id}` : `/admin/transport/routes/${routeItem.RouteId}/pickups`;
    const method = editingItem ? 'PUT' : 'POST';
    const { ok, data } = await adminAPI(endpoint, { method, body: JSON.stringify(form) });
    setSubmitting(false);
    if (!ok) return showToast(data.message || 'Khong the luu diem don.', 'error');
    showToast(editingItem ? 'Cap nhat diem don thanh cong.' : 'Them diem don thanh cong.', 'success');
    resetForm();
    loadRows();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xoa diem don "${item.name}"?`)) return;
    const { ok, data } = await adminAPI(`/admin/transport/pickups/${item._id}`, { method: 'DELETE' });
    if (!ok) return showToast(data.message || 'Khong the xoa diem don.', 'error');
    showToast('Xoa diem don thanh cong.', 'success');
    loadRows();
  };

  return (
    <AdminModal open={open} title={`Diem don - ${routeItem?.Name || ''}`} onClose={onClose} maxWidth={980} footer={<button type="button" className="btn btn-outline" onClick={onClose}>Dong</button>}>
      <ToastContainer />
      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        <div className="admin-stack">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Ma</th><th>Ten</th><th>Dia chi</th><th>Lech phut</th><th>Trang thai</th><th>Thao tac</th></tr></thead>
              <tbody>
                {rows.length ? rows.map((item) => (
                  <tr key={item._id}>
                    <td>{item.code || '-'}</td>
                    <td>{item.name}</td>
                    <td>{item.address || '-'}</td>
                    <td>{item.pickupTimeOffsetMinutes || 0}</td>
                    <td><AdminStatusBadge status={item.status} /></td>
                    <td><div className="admin-inline-actions"><button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditingItem(item); setForm({ code: item.code || '', name: item.name || '', address: item.address || '', pickupTimeOffsetMinutes: item.pickupTimeOffsetMinutes || 0, status: item.status || 'active' }); }}>Sua</button><button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(item)}>Xoa</button></div></td>
                  </tr>
                )) : <tr><td colSpan="6">Chua co diem don.</td></tr>}
              </tbody>
            </table>
          </div>
          <form className="admin-inline-form" onSubmit={handleSubmit}>
            <div className="form-row-3">
              <div className="form-group"><label className="form-label">Ma</label><input className="form-control" value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Ten</label><input className="form-control" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Lech phut</label><input className="form-control" type="number" min="0" value={form.pickupTimeOffsetMinutes} onChange={(e) => setForm((c) => ({ ...c, pickupTimeOffsetMinutes: e.target.value }))} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Dia chi</label><input className="form-control" value={form.address} onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Trang thai</label><select className="form-select" value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}><option value="active">Hoat dong</option><option value="inactive">Khong hoat dong</option></select></div>
            </div>
            <div className="admin-inline-actions">{editingItem ? <button type="button" className="btn btn-outline" onClick={resetForm}>Huy sua</button> : null}<button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Dang luu...' : 'Luu diem don'}</button></div>
          </form>
        </div>
      )}
    </AdminModal>
  );
}

function getModuleConfig(pageKey, providers) {
  const configs = {
    providers: {
      title: 'Nha cung cap',
      subtitle: 'Quan ly doi tac van tai',
      endpoint: '/admin/transport/providers',
      filters: ['status'],
      createLabel: 'Them nha cung cap',
      emptyTitle: 'Chua co nha cung cap',
      initialForm: { name: '', type: 'company', serviceTypes: '', contactPersonName: '', contactPhone: '', contactEmail: '', contactAddress: '', status: 'active' },
      renderForm: ProviderForm,
      mapItemToForm: (item) => ({ name: item.Name || '', type: item.Type || 'company', serviceTypes: item.ServiceTypes || '', contactPersonName: item.ContactPersonName || '', contactPhone: item.ContactPhone || '', contactEmail: item.ContactEmail || '', contactAddress: item.ContactAddress || '', status: item.Status || 'active' }),
      columns: (openEdit, setDeleteTarget) => [
        ['Ten', (item) => <><div className="admin-cell-title">{item.Name}</div><div className="admin-cell-subtitle">{item.ContactPersonName || '-'}</div></>],
        ['Loai', (item) => item.Type || '-'],
        ['So xe', (item) => item.VehicleCount || 0],
        ['Trang thai', (item) => <AdminStatusBadge status={item.Status} />],
        ['Thao tac', (item) => <div className="admin-inline-actions"><button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Sua</button><button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(item)}>Luu tru</button></div>],
      ],
      getId: (item) => item.ProviderId,
      getName: (item) => item.Name,
    },
    vehicles: {
      title: 'Quan ly Xe',
      subtitle: 'Quan ly tai san va doi xe',
      endpoint: '/admin/transport/vehicles',
      filters: ['status', 'provider'],
      createLabel: 'Them xe',
      emptyTitle: 'Chua co xe',
      initialForm: { providerId: '', vehicleCode: '', plateNumber: '', type: '', brand: '', model: '', seatCapacity: 0, amenities: '', imageUrl: '', status: 'available' },
      renderForm: (props) => <VehicleForm {...props} providers={providers} />,
      mapItemToForm: (item) => ({ providerId: item.ProviderId || '', vehicleCode: item.VehicleCode || '', plateNumber: item.PlateNumber || '', type: item.Type || '', brand: item.Brand || '', model: item.Model || '', seatCapacity: item.SeatCapacity || 0, amenities: item.Amenities || '', imageUrl: item.ImageUrl || '', status: item.Status || 'available' }),
      columns: (openEdit, setDeleteTarget) => [
        ['Bien so', (item) => <><div className="admin-cell-title">{item.PlateNumber}</div><div className="admin-cell-subtitle">{item.ProviderName || '-'}</div></>],
        ['Loai', (item) => item.Type || '-'],
        ['So ghe', (item) => item.SeatCapacity || 0],
        ['Trang thai', (item) => <AdminStatusBadge status={item.Status} />],
        ['Thao tac', (item) => <div className="admin-inline-actions"><button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Sua</button><button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(item)}>Luu tru</button></div>],
      ],
      getId: (item) => item.VehicleId,
      getName: (item) => item.PlateNumber,
    },
    drivers: {
      title: 'Tai xe',
      subtitle: 'Quan ly nhan su van hanh',
      endpoint: '/admin/transport/drivers',
      filters: ['status', 'provider'],
      createLabel: 'Them tai xe',
      emptyTitle: 'Chua co tai xe',
      initialForm: { providerId: '', fullName: '', phone: '', email: '', licenseNumber: '', licenseClass: '', experienceYears: 0, status: 'available' },
      renderForm: (props) => <DriverForm {...props} providers={providers} />,
      mapItemToForm: (item) => ({ providerId: item.ProviderId || '', fullName: item.FullName || '', phone: item.Phone || '', email: item.Email || '', licenseNumber: item.LicenseNumber || '', licenseClass: item.LicenseClass || '', experienceYears: item.ExperienceYears || 0, status: item.Status || 'available' }),
      columns: (openEdit, setDeleteTarget) => [
        ['Ten', (item) => <><div className="admin-cell-title">{item.FullName}</div><div className="admin-cell-subtitle">{item.ProviderName || '-'}</div></>],
        ['Dien thoai', (item) => item.Phone || '-'],
        ['GPLX', (item) => item.LicenseNumber || '-'],
        ['Trang thai', (item) => <AdminStatusBadge status={item.Status} />],
        ['Thao tac', (item) => <div className="admin-inline-actions"><button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Sua</button><button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(item)}>Luu tru</button></div>],
      ],
      getId: (item) => item.DriverId,
      getName: (item) => item.FullName,
    },
    routes: {
      title: 'Tuyen duong',
      subtitle: 'Quan ly route va diem don',
      endpoint: '/admin/transport/routes',
      filters: ['status'],
      createLabel: 'Them tuyen duong',
      emptyTitle: 'Chua co tuyen duong',
      initialForm: { routeCode: '', name: '', fromName: '', fromType: '', fromAddress: '', toName: '', toType: '', toAddress: '', distanceKm: 0, estimatedDurationMinutes: 0, status: 'active' },
      renderForm: RouteForm,
      mapItemToForm: (item) => ({ routeCode: item.RouteCode || '', name: item.Name || '', fromName: item.FromName || '', fromType: item.FromType || '', fromAddress: item.FromAddress || '', toName: item.ToName || '', toType: item.ToType || '', toAddress: item.ToAddress || '', distanceKm: item.DistanceKm || 0, estimatedDurationMinutes: item.EstimatedDurationMinutes || 0, status: item.Status || 'active' }),
      columns: (openEdit, setDeleteTarget, openExtra) => [
        ['Tuyen', (item) => <><div className="admin-cell-title">{item.Name}</div><div className="admin-cell-subtitle">{item.RouteCode}</div></>],
        ['Diem di', (item) => item.FromName || '-'],
        ['Diem den', (item) => item.ToName || '-'],
        ['Diem don', (item) => item.PickupCount || 0],
        ['Trang thai', (item) => <AdminStatusBadge status={item.Status} />],
        ['Thao tac', (item) => <div className="admin-inline-actions"><button type="button" className="btn btn-success btn-sm" onClick={() => openExtra(item)}>Quan ly diem don</button><button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Sua</button><button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(item)}>Luu tru</button></div>],
      ],
      getId: (item) => item.RouteId,
      getName: (item) => item.Name,
    },
  };

  return configs[pageKey];
}

export function TransportManagementPage({ pageKey }) {
  const { showToast, ToastContainer } = useToast();
  const [lookups, setLookups] = useState({ providers: [] });
  const [filters, setFilters] = useState({ search: '', status: '', providerId: '', page: 1, limit: 10 });
  const [draftSearch, setDraftSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraItem, setExtraItem] = useState(null);

  const config = useMemo(() => getModuleConfig(pageKey, lookups.providers || []), [pageKey, lookups.providers]);

  const loadLookups = async () => {
    const { ok, data } = await adminAPI('/admin/transport/lookups');
    if (ok) setLookups(data.data || { providers: [] });
    else showToast(data.message || 'Khong the tai lookup van tai.', 'error');
  };

  const { rows, pagination, loading, reload } = useAdminList(async () => {
    const params = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit) });
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.providerId && pageKey !== 'providers' && pageKey !== 'routes') params.set('providerId', filters.providerId);
    const { ok, data } = await adminAPI(`${config.endpoint}?${params.toString()}`);
    if (!ok) {
      showToast(data.message || 'Khong the tai du lieu van tai.', 'error');
      return { rows: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
    }
    return { rows: data.data || [], pagination: data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 } };
  }, [config.endpoint, filters.page, filters.limit, filters.search, filters.status, filters.providerId]);

  useEffect(() => { loadLookups(); }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm(config.initialForm);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm(config.mapItemToForm(item));
    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const endpoint = editingItem ? `${config.endpoint}/${config.getId(editingItem)}` : config.endpoint;
    const method = editingItem ? 'PUT' : 'POST';
    const { ok, data } = await adminAPI(endpoint, { method, body: JSON.stringify(form) });
    setSubmitting(false);
    if (!ok) return showToast(data.message || 'Khong the luu du lieu.', 'error');
    showToast(editingItem ? 'Cap nhat thanh cong.' : 'Tao moi thanh cong.', 'success');
    setFormOpen(false);
    reload();
    loadLookups();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { ok, data } = await adminAPI(`${config.endpoint}/${config.getId(deleteTarget)}`, { method: 'DELETE' });
    setDeleteLoading(false);
    if (!ok) return showToast(data.message || 'Khong the xoa.', 'error');
    showToast('Cap nhat trang thai thanh cong.', 'success');
    setDeleteTarget(null);
    reload();
    loadLookups();
  };

  const columns = config.columns(openEdit, setDeleteTarget, (item) => { setExtraItem(item); setExtraOpen(true); });
  const FormComponent = config.renderForm;

  return (
    <AdminLayout title={config.title} subtitle={config.subtitle}>
      <ToastContainer />
      <div className="page-header-bar">
        <h2>{config.title}</h2>
        <button type="button" className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus" /> {config.createLabel}</button>
      </div>
      <div className="admin-card">
        <div className="card-body">
          <div className="data-controls">
            <form className="admin-filter-form" onSubmit={(event) => { event.preventDefault(); setFilters((current) => ({ ...current, search: draftSearch.trim(), page: 1 })); }}>
              <div className="search-input"><i className="fas fa-search" /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Tim kiem..." /></div>
              <select className="filter-select" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
                <option value="">Tat ca trang thai</option>
                <option value="active">Hoat dong</option>
                <option value="available">San sang</option>
                <option value="inactive">Khong hoat dong</option>
              </select>
              {config.filters.includes('provider') ? (
                <select className="filter-select" value={filters.providerId} onChange={(event) => setFilters((current) => ({ ...current, providerId: event.target.value, page: 1 }))}>
                  <option value="">Tat ca nha cung cap</option>
                  {(lookups.providers || []).map((item) => <option key={item.ProviderId} value={item.ProviderId}>{item.Name}</option>)}
                </select>
              ) : null}
              <button type="submit" className="btn btn-outline">Loc</button>
            </form>
          </div>
          {loading ? <div className="loading-spinner"><div className="spinner" /></div> : rows.length ? (
            <>
              <div className="table-wrap">
                <table>
                  <thead><tr>{columns.map(([label]) => <th key={label}>{label}</th>)}</tr></thead>
                  <tbody>
                    {rows.map((item) => (
                      <tr key={config.getId(item)}>
                        {columns.map(([label, render]) => <td key={label}>{render(item)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminPagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
            </>
          ) : <AdminEmptyState icon="fa-bus" title={config.emptyTitle} description="Chua co du lieu phu hop voi bo loc hien tai." />}
        </div>
      </div>

      <AdminModal
        open={formOpen}
        title={editingItem ? `Cap nhat ${config.title.toLowerCase()}` : config.createLabel}
        onClose={() => setFormOpen(false)}
        footer={<><button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)} disabled={submitting}>Dong</button><button type="submit" form={`transport-form-${pageKey}`} className="btn btn-primary" disabled={submitting}>{submitting ? 'Dang luu...' : 'Luu'}</button></>}
      >
        <form id={`transport-form-${pageKey}`} onSubmit={handleSubmit}>
          <FormComponent form={form} setForm={setForm} />
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xac nhan luu tru"
        message={`Ban sap luu tru "${deleteTarget ? config.getName(deleteTarget) : ''}". Ban co muon tiep tuc?`}
        loading={deleteLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {pageKey === 'routes' ? <PickupManagementModal open={extraOpen} routeItem={extraItem} onClose={() => setExtraOpen(false)} /> : null}
    </AdminLayout>
  );
}
