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
    detail ? `Quan ly tour: ${detail.Title}` : 'Chi tiet tour'
  ), [detail]);

  const loadDetail = async () => {
    if (!tourId) return;
    setLoading(true);
    const { ok, data } = await adminAPI(`/admin/tours/${tourId}`);
    if (ok) setDetail(data.data);
    else showToast(data.message || 'Khong the tai chi tiet tour.', 'error');
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
      showToast(data.message || 'Khong the luu lich trinh.', 'error');
      return;
    }

    showToast(editingItineraryId ? 'Cap nhat lich trinh thanh cong.' : 'Them lich trinh thanh cong.', 'success');
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
      showToast(data.message || 'Khong the luu lich khoi hanh.', 'error');
      return;
    }

    showToast(editingDepartureId ? 'Cap nhat lich khoi hanh thanh cong.' : 'Them lich khoi hanh thanh cong.', 'success');
    resetDepartureForm();
    await loadDetail();
    onUpdated();
  };

  const deleteItinerary = async (itineraryId) => {
    if (!window.confirm('Xoa lich trinh nay?')) return;

    const { ok, data } = await adminAPI(`/admin/tours/itineraries/${itineraryId}`, {
      method: 'DELETE',
    });

    if (!ok) {
      showToast(data.message || 'Khong the xoa lich trinh.', 'error');
      return;
    }

    showToast('Xoa lich trinh thanh cong.', 'success');
    await loadDetail();
    onUpdated();
  };

  const deleteDeparture = async (departureId) => {
    if (!window.confirm('Xoa lich khoi hanh nay?')) return;

    const { ok, data } = await adminAPI(`/admin/tours/departures/${departureId}`, {
      method: 'DELETE',
    });

    if (!ok) {
      showToast(data.message || 'Khong the xoa lich khoi hanh.', 'error');
      return;
    }

    showToast('Xoa lich khoi hanh thanh cong.', 'success');
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
          Dong
        </button>
      )}
    >
      <ToastContainer />
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : !detail ? (
        <p>Khong tai duoc chi tiet tour.</p>
      ) : (
        <div className="admin-stack">
          <div className="admin-summary-grid">
            <div className="admin-summary-card">
              <div className="summary-label">Ma tour</div>
              <div className="summary-value">{detail.Code}</div>
            </div>
            <div className="admin-summary-card">
              <div className="summary-label">Gia co ban</div>
              <div className="summary-value">{formatCurrency(detail.BasePrice)}</div>
            </div>
            <div className="admin-summary-card">
              <div className="summary-label">Trang thai</div>
              <div className="summary-value"><AdminStatusBadge status={detail.Status} /></div>
            </div>
          </div>

          <section className="admin-section-card">
            <div className="admin-section-header">
              <div>
                <h3>Lich trinh</h3>
                <p>Quan ly ngay di va noi dung tung ngay.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ngay</th>
                    <th>Tieu de</th>
                    <th>Hoat dong</th>
                    <th>Bua an</th>
                    <th>Thao tac</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.itineraries?.length ? detail.itineraries.map((item) => (
                    <tr key={item.ItineraryId}>
                      <td>Ngay {item.DayNumber}</td>
                      <td>{item.Title}</td>
                      <td>{item.Activities || '-'}</td>
                      <td>
                        {[item.Breakfast && 'Sang', item.Lunch && 'Trua', item.Dinner && 'Toi'].filter(Boolean).join(', ') || '-'}
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
                            Sua
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteItinerary(item.ItineraryId)}>
                            Xoa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5">Chua co lich trinh.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <form className="admin-inline-form" onSubmit={submitItinerary}>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Ngay</label>
                  <input className="form-control" type="number" min="1" value={itineraryForm.dayNumber} onChange={(event) => setItineraryForm((current) => ({ ...current, dayNumber: Number(event.target.value) }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tieu de</label>
                  <input className="form-control" value={itineraryForm.title} onChange={(event) => setItineraryForm((current) => ({ ...current, title: event.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Luu tru</label>
                  <input className="form-control" value={itineraryForm.accommodation} onChange={(event) => setItineraryForm((current) => ({ ...current, accommodation: event.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Hoat dong</label>
                <textarea className="form-control" rows="3" value={itineraryForm.activities} onChange={(event) => setItineraryForm((current) => ({ ...current, activities: event.target.value }))} />
              </div>
              <div className="admin-checkbox-row">
                {[
                  ['breakfast', 'An sang'],
                  ['lunch', 'An trua'],
                  ['dinner', 'An toi'],
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
                    Huy sua
                  </button>
                ) : null}
                <button type="submit" className="btn btn-primary" disabled={savingItinerary}>
                  {savingItinerary ? 'Dang luu...' : editingItineraryId ? 'Luu lich trinh' : 'Them lich trinh'}
                </button>
              </div>
            </form>
          </section>

          <section className="admin-section-card">
            <div className="admin-section-header">
              <div>
                <h3>Lich khoi hanh</h3>
                <p>Quan ly gia va suc chua theo tung dot.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ma</th>
                    <th>Ngay di</th>
                    <th>Ngay ve</th>
                    <th>Suc chua</th>
                    <th>Gia nguoi lon</th>
                    <th>Trang thai</th>
                    <th>Thao tac</th>
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
                            Sua
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteDeparture(item.DepartureId)}>
                            Xoa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7">Chua co lich khoi hanh.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <form className="admin-inline-form" onSubmit={submitDeparture}>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Ma lich</label>
                  <input className="form-control" value={departureForm.departureCode} onChange={(event) => setDepartureForm((current) => ({ ...current, departureCode: event.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngay di</label>
                  <input className="form-control" type="date" value={departureForm.startDate} onChange={(event) => setDepartureForm((current) => ({ ...current, startDate: event.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngay ve</label>
                  <input className="form-control" type="date" value={departureForm.endDate} onChange={(event) => setDepartureForm((current) => ({ ...current, endDate: event.target.value }))} required />
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Suc chua</label>
                  <input className="form-control" type="number" min="1" value={departureForm.capacity} onChange={(event) => setDepartureForm((current) => ({ ...current, capacity: Number(event.target.value) }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gia nguoi lon</label>
                  <input className="form-control" type="number" min="0" value={departureForm.adultPrice} onChange={(event) => setDepartureForm((current) => ({ ...current, adultPrice: Number(event.target.value) }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gia tre em</label>
                  <input className="form-control" type="number" min="0" value={departureForm.childPrice} onChange={(event) => setDepartureForm((current) => ({ ...current, childPrice: Number(event.target.value) }))} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gia em be</label>
                  <input className="form-control" type="number" min="0" value={departureForm.infantPrice} onChange={(event) => setDepartureForm((current) => ({ ...current, infantPrice: Number(event.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Trang thai</label>
                  <select className="form-select" value={departureForm.status} onChange={(event) => setDepartureForm((current) => ({ ...current, status: event.target.value }))}>
                    <option value="open">Mo ban</option>
                    <option value="closed">Dong ban</option>
                    <option value="cancelled">Da huy</option>
                  </select>
                </div>
              </div>
              <div className="admin-inline-actions">
                {editingDepartureId ? (
                  <button type="button" className="btn btn-outline" onClick={resetDepartureForm}>
                    Huy sua
                  </button>
                ) : null}
                <button type="submit" className="btn btn-primary" disabled={savingDeparture}>
                  {savingDeparture ? 'Dang luu...' : editingDepartureId ? 'Luu lich khoi hanh' : 'Them lich khoi hanh'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AdminModal>
  );
}
