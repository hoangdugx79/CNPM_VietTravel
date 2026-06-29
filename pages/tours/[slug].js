import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import CustomerLayout from '../../components/customer/Layout';
import { apiRequest } from '../../lib/api';
import { getToken, getUser } from '../../lib/auth';
import { formatCurrency, formatDate } from '../../lib/format';
import { useToast } from '../../components/Toast';

export default function TourDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { showToast, ToastContainer } = useToast();
  const [tour, setTour] = useState(null);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [adultQty, setAdultQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { ok, data } = await apiRequest(`/tours/${slug}`);
      if (ok) setTour(data.data);
      setLoading(false);
    })();
  }, [slug]);

  const book = async () => {
    if (!getToken()) { router.push(`/login?redirect=/tours/${slug}`); return; }
    if (!selectedDeparture) { showToast('Vui lòng chọn ngày khởi hành', 'warning'); return; }
    const user = getUser();
    const { ok, data } = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        departureId: selectedDeparture.DepartureId,
        adultQuantity: adultQty,
        childQuantity: 0,
        infantQuantity: 0,
        customerName: user?.FullName,
        customerPhone: user?.Phone,
      }),
    });
    if (ok) {
      showToast('Đặt tour thành công!', 'success');
      router.push('/my-bookings');
    } else {
      showToast(data.message || 'Đặt tour thất bại', 'error');
    }
  };

  if (loading) return <CustomerLayout title="Đang tải..."><div style={{ paddingTop: 120, textAlign: 'center' }}>⏳ Đang tải...</div></CustomerLayout>;
  if (!tour) return <CustomerLayout title="Không tìm thấy"><div style={{ paddingTop: 120, textAlign: 'center' }}><h3>Tour không tồn tại</h3><Link href="/tours" className="btn btn-primary">Xem tours khác</Link></div></CustomerLayout>;

  const departs = tour.departures?.filter((d) => d.AvailableSeats > 0) || [];

  return (
    <CustomerLayout title={`${tour.Title} - VietTravel`} navbarScrolled>
      <ToastContainer />
      <div className="container" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div className="breadcrumb"><Link href="/">Trang chủ</Link><span className="sep">/</span><Link href="/tours">Tours</Link><span className="sep">/</span><span>{tour.Title}</span></div>
        <div className="tour-detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, marginTop: 24 }}>
          <div>
            <img src={tour.MainImageUrl || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=80'} alt={tour.Title} style={{ width: '100%', borderRadius: 16, marginBottom: 24 }} />
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{tour.Title}</h1>
            <p style={{ color: '#64748b', marginBottom: 24 }}>{tour.ShortDescription}</p>
            <div dangerouslySetInnerHTML={{ __html: tour.Description?.replace(/\n/g, '<br>') || '' }} />
            {tour.itineraries?.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ marginBottom: 16 }}>Lịch trình</h3>
                {tour.itineraries.map((it) => (
                  <div key={it.ItineraryId} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FF6B35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>Ngày {it.DayNumber}</div>
                    <div><strong>{it.Title}</strong><p style={{ color: '#64748b', marginTop: 4 }}>{it.Activities}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="booking-card" style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0', position: 'sticky', top: 90 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#FF6B35', marginBottom: 20 }}>{formatCurrency(selectedDeparture?.AdultPrice || tour.BasePrice)} <span style={{ fontSize: 14, color: '#94a3b8' }}>/người</span></div>
            <h4 style={{ marginBottom: 12 }}>Chọn ngày khởi hành</h4>
            {departs.length ? departs.map((d) => (
              <div key={d.DepartureId} className={`departure-option ${selectedDeparture?.DepartureId === d.DepartureId ? 'selected' : ''}`} onClick={() => setSelectedDeparture(d)} style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 8, cursor: 'pointer' }}>
                <div><div style={{ fontWeight: 700 }}>{formatDate(d.StartDate)}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{d.AvailableSeats} chỗ trống</div></div>
                <div style={{ fontWeight: 800, color: '#FF6B35' }}>{formatCurrency(d.AdultPrice)}</div>
              </div>
            )) : <p style={{ color: '#94a3b8' }}>Chưa có lịch khởi hành</p>}
            <div style={{ marginTop: 16 }}>
              <label>Số người lớn</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setAdultQty(Math.max(1, adultQty - 1))}>-</button>
                <span>{adultQty}</span>
                <button type="button" onClick={() => setAdultQty(adultQty + 1)}>+</button>
              </div>
            </div>
            <button type="button" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 24 }} onClick={book}><i className="fas fa-check-circle" /> Đặt tour ngay</button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
