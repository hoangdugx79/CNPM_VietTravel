import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import CustomerLayout from '../components/customer/Layout';
import { apiRequest } from '../lib/api';
import { getToken } from '../lib/auth';
import { formatCurrency, formatDate } from '../lib/format';

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.push('/login?redirect=/my-bookings'); return; }
    (async () => {
      const { ok, data } = await apiRequest('/bookings/my');
      if (ok) setBookings(data.data || []);
      setLoading(false);
    })();
  }, [router]);

  return (
    <CustomerLayout title="Booking Của Tôi - VietTravel" navbarScrolled>
      <div className="page-header" style={{ paddingTop: 80 }}><div className="container"><h1>Booking Của Tôi</h1></div></div>
      <div className="container" style={{ padding: '40px 0 80px' }}>
        {loading ? <div className="loader" /> : !bookings.length ? (
          <div style={{ textAlign: 'center', padding: 60 }}><p>Chưa có booking nào</p><Link href="/tours" className="btn btn-primary">Khám phá tours</Link></div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {bookings.map((b) => (
              <div key={b.BookingId} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', display: 'flex', gap: 20, alignItems: 'center' }}>
                {b.MainImageUrl && <img src={b.MainImageUrl} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 12 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{b.TourTitleSnapshot}</div>
                  <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Mã: {b.BookingCode} • {formatDate(b.StartDateSnapshot)}</div>
                  <div style={{ marginTop: 8 }}><span className={`badge badge-${b.Status === 'confirmed' ? 'success' : 'warning'}`}>{b.Status}</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#FF6B35' }}>{formatCurrency(b.TotalAmount)}</div>
                  <Link href={`/bookings/${b.BookingCode}`} className="btn btn-outline btn-sm" style={{ marginTop: 8 }}>Chi tiết</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
