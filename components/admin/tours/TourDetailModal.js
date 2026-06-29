import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/format';
import { useToast } from '../../Toast';
import AdminModal from '../common/AdminModal';
import AdminStatusBadge from '../common/AdminStatusBadge';

function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

const EMPTY_ITINERARY = {
  dayNumber: 1,
  title: '',
  activities: '',
  accommodation: '',
  breakfast: false,
  lunch: false,
  dinner: false,
};

const EMPTY_DEPARTURE = {
  departureCode: '',
  startDate: '',
  endDate: '',
  capacity: 1,
  adultPrice: 0,
  childPrice: 0,
  infantPrice: 0,
  status: 'open',
};

export default function TourDetailModal({ open, tourId, onClose, onUpdated }) {
  const { showToast, ToastContainer } = useToast();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingItinerary, setSavingItinerary] = useState(false);
  const [savingDeparture, setSavingDeparture] = useState(false);
  const [editingItineraryId, setEditingItineraryId] = useState(null);
  const [editingDepartureId, setEditingDepartureId] = useState(null);
  const [itineraryForm, setItineraryForm] = useState(EMPTY_ITINERARY);
  const [departureForm, setDepartureForm] = useState(EMPTY_DEPARTURE);

  const title = useMemo(() => (
    detail ? `Quản lý tour: ${detail.Title}` : 'Chi tiết tour'
  ), [detail]);

  const loadDetail = async () => {
    if (!tourId) return;
    setLoading(true);
    const { ok, data } = await adminAPI(`/admin/tours/${tourId}`);
    if (ok) setDetail(data.data);
    else showToast(data.message || 'Không thể tải chi tiết tour.', 'error');
    setLoading(false);
  };

  useEffect(() => {
    if (!open || !tourId) return;
    loadDetail();
  }, [open, tourId]);

  const resetItineraryForm = () => {
    setEditingItineraryId(null);
    setItineraryForm(EMPTY_ITINERARY);
  };

  const resetDepartureForm = () => {
    setEditingDepartureId(null);
    setDepartureForm(EMPTY_DEPARTURE);
  };

  const submitItinerary = async (event) => {
    event.preventDefault();
    setSavingItinerary(true);

    const endpoint = editingItineraryId
      ? `/admin/tours/itineraries/${editingItineraryId}`
      : `/admin/tours/${tourId}/itineraries`;

    const method = editingItineraryId ? 'PUT' : 'POST';
    const { ok, data } = await adminAPI(endpoint, {
      method,
      body: JSON.stringify(itineraryForm),
    });

    setSavingItinerary(false);

    if (!ok) {
      showToast(data.message || 'Không thể lưu lịch trình.', 'error');
      return;
    }

    showToast(editingItineraryId ? 'Cập nhật lịch trình thành công.' : 'Thêm lịch trình thành công.', 'success');
    resetItineraryForm();
    await loadDetail();
    onUpdated();
  };

  const submitDeparture = async (event) => {
    event.preventDefault();
    setSavingDeparture(true);

    const endpoint = editingDepartureId
      ? `/admin/tours/departures/${editingDepartureId}`
      : `/admin/tours/${tourId}/departures`;

    const method = editingDepartureId ? 'PUT' : 'POST';
    const { ok, data } = await adminAPI(endpoint, {
      method,
      body: JSON.stringify(departureForm),
    });

    setSavingDeparture(false);

    if (!ok) {
      showToast(data.message || 'Không thể lưu lịch khởi hành.', 'error');
      return;
    }

    showToast(editingDepartureId ? 'Cập nhật lịch khởi hành thành công.' : 'Thêm lịch khởi hành thành công.', 'success');
    resetDepartureForm();
    await loadDetail();
    onUpdated();
  };

  const deleteItinerary = async (itineraryId) => {
    if (!window.confirm('Xóa lịch trình này?')) return;

    const { ok, data } = await adminAPI(`/admin/tours/itineraries/${itineraryId}`, {
      method: 'DELETE',
    });

    if (!ok) {
      showToast(data.message || 'Không thể xóa lịch trình.', 'error');
      return;
    }

    showToast('Xóa lịch trình thành công.', 'success');
    await loadDetail();
    onUpdated();
  };

  const deleteDeparture = async (departureId) => {
    if (!window.confirm('Xóa lịch khởi hành này?')) return;

    const { ok, data } = await adminAPI(`/admin/tours/departures/${departureId}`, {
      method: 'DELETE',
    });

    if (!ok) {
      showToast(data.message || 'Không thể xóa lịch khởi hành.', 'error');
      return;
    }

    showToast('Xóa lịch khởi hành thành công.', 'success');
    await loadDetail();
    onUpdated();
  };

  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onClose}
      maxWidth={1100}
      footer={(
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Đóng
        </button>
      )}
    >
      <ToastContainer />
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : !detail ? (
        <p>Không tải được chi tiết tour.</p>
      ) : (
        <div className="admin-stack">
          <div className="admin-summary-grid">
            <div className="admin-summary-card">
              <div className="summary-label">Mã tour</div>
              <div className="summary-value">{detail.Code}</div>
            </div>
            <div className="admin-summary-card">
              <div className="summary-label">Giá cơ bản</div>
              <div className="summary-value">{formatCurrency(detail.BasePrice)}</div>
            </div>
            <div className="admin-summary-card">
              <div className="summary-label">Trạng thái</div>
              <div className="summary-value"><AdminStatusBadge status={detail.Status} /></div>
            </div>
          </div>

          <section className="admin-section-card">
            <div className="admin-section-header">
              <div>
                <h3>Lịch trình</h3>
                <p>Quản lý ngày đi và nội dung từng ngày.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Tiêu đề</th>
                    <th>Hoạt động</th>
                    <th>Bữa ăn</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.itineraries?.length ? detail.itineraries.map((item) => (
                    <tr key={item.ItineraryId}>
                      <td>Ngày {item.DayNumber}</td>
                      <td>{item.Title}</td>
                      <td>{item.Activities || '-'}</td>
                      <td>
                        {[item.Breakfast && 'Sáng', item.Lunch && 'Trưa', item.Dinner && 'Tối'].filter(Boolean).join(', ') || '-'}
                      </td>
                      <td>
                        <div className="admin-inline-actions">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              setEditingItineraryId(item.ItineraryId);
                              setItineraryForm({
                                dayNumber: item.DayNumber,
                                title: item.Title,
                                activities: item.Activities || '',
                                accommodation: item.Accommodation || '',
                                breakfast: item.Breakfast,
                                lunch: item.Lunch,
                                dinner: item.Dinner,
                              });
                            }}
                          >
                            Sửa
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteItinerary(item.ItineraryId)}>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5">Chưa có lịch trình.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <form className="admin-inline-form" onSubmit={submitItinerary}>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Ngày</label>
                  <input className="form-control" type="number" min="1" value={itineraryForm.dayNumber} onChange={(event) => setItineraryForm((current) => ({ ...current, dayNumber: Number(event.target.value) }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tiêu đề</label>
                  <input className="form-control" value={itineraryForm.title} onChange={(event) => setItineraryForm((current) => ({ ...current, title: event.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Lưu trú</label>
                  <input className="form-control" value={itineraryForm.accommodation} onChange={(event) => setItineraryForm((current) => ({ ...current, accommodation: event.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Hoạt động</label>
                <textarea className="form-control" rows="3" value={itineraryForm.activities} onChange={(event) => setItineraryForm((current) => ({ ...current, activities: event.target.value }))} />
              </div>
              <div className="admin-checkbox-row">
                {[
                  ['breakfast', 'Ăn sáng'],
                  ['lunch', 'Ăn trưa'],
                  ['dinner', 'Ăn tối'],
                ].map(([field, label]) => (
                  <label key={field} className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={itineraryForm[field]}
                      onChange={(event) => setItineraryForm((current) => ({ ...current, [field]: event.target.checked }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="admin-inline-actions">
                {editingItineraryId ? (
                  <button type="button" className="btn btn-outline" onClick={resetItineraryForm}>
                    Hủy sửa
                  </button>
                ) : null}
                <button type="submit" className="btn btn-primary" disabled={savingItinerary}>
                  {savingItinerary ? 'Đang lưu...' : editingItineraryId ? 'Lưu lịch trình' : 'Thêm lịch trình'}
                </button>
              </div>
            </form>
          </section>

          <section className="admin-section-card">
            <div className="admin-section-header">
              <div>
                <h3>Lịch khởi hành</h3>
                <p>Quản lý giá và sức chứa theo từng đợt.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Ngày đi</th>
                    <th>Ngày về</th>
                    <th>Sức chứa</th>
                    <th>Giá người lớn</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.departures?.length ? detail.departures.map((item) => (
                    <tr key={item.DepartureId}>
                      <td>{item.DepartureCode}</td>
                      <td>{formatDate(item.StartDate)}</td>
                      <td>{formatDate(item.EndDate)}</td>
                      <td>{item.Capacity}</td>
                      <td>{formatCurrency(item.AdultPrice)}</td>
                      <td><AdminStatusBadge status={item.Status} /></td>
                      <td>
                        <div className="admin-inline-actions">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              setEditingDepartureId(item.DepartureId);
                              setDepartureForm({
                                departureCode: item.DepartureCode,
                                startDate: toDateInputValue(item.StartDate),
                                endDate: toDateInputValue(item.EndDate),
                                capacity: item.Capacity,
                                adultPrice: item.AdultPrice,
                                childPrice: item.ChildPrice,
                                infantPrice: item.InfantPrice,
                                status: item.Status,
                              });
                            }}
                          >
                            Sửa
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteDeparture(item.DepartureId)}>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7">Chưa có lịch khởi hành.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <form className="admin-inline-form" onSubmit={submitDeparture}>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Mã lịch</label>
                  <input className="form-control" value={departureForm.departureCode} onChange={(event) => setDepartureForm((current) => ({ ...current, departureCode: event.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày đi</label>
                  <input className="form-control" type="date" value={departureForm.startDate} onChange={(event) => setDepartureForm((current) => ({ ...current, startDate: event.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày về</label>
                  <input className="form-control" type="date" value={departureForm.endDate} onChange={(event) => setDepartureForm((current) => ({ ...current, endDate: event.target.value }))} required />
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Sức chứa</label>
                  <input className="form-control" type="number" min="1" value={departureForm.capacity} onChange={(event) => setDepartureForm((current) => ({ ...current, capacity: Number(event.target.value) }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá người lớn</label>
                  <input className="form-control" type="number" min="0" value={departureForm.adultPrice} onChange={(event) => setDepartureForm((current) => ({ ...current, adultPrice: Number(event.target.value) }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá trẻ em</label>
                  <input className="form-control" type="number" min="0" value={departureForm.childPrice} onChange={(event) => setDepartureForm((current) => ({ ...current, childPrice: Number(event.target.value) }))} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Giá em bé</label>
                  <input className="form-control" type="number" min="0" value={departureForm.infantPrice} onChange={(event) => setDepartureForm((current) => ({ ...current, infantPrice: Number(event.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-select" value={departureForm.status} onChange={(event) => setDepartureForm((current) => ({ ...current, status: event.target.value }))}>
                    <option value="open">Mở bán</option>
                    <option value="closed">Đóng bán</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
              <div className="admin-inline-actions">
                {editingDepartureId ? (
                  <button type="button" className="btn btn-outline" onClick={resetDepartureForm}>
                    Hủy sửa
                  </button>
                ) : null}
                <button type="submit" className="btn btn-primary" disabled={savingDeparture}>
                  {savingDeparture ? 'Đang lưu...' : editingDepartureId ? 'Lưu lịch khởi hành' : 'Thêm lịch khởi hành'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AdminModal>
  );
}
