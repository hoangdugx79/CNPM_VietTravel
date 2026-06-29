import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import CustomerLayout from '../../components/customer/Layout';
import { apiRequest } from '../../lib/api';
import { getToken } from '../../lib/auth';
import { formatCurrency, formatDate } from '../../lib/format';

export default function BookingDetailPage() {
  const router = useRouter();
  const { code } = router.query;
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!code || !getToken()) return;
    (async () => {
      const { ok, data } = await apiRequest(`/bookings/${code}`);
      if (ok) setBooking(data.data);
    })();
  }, [code]);

  if (!booking) return <CustomerLayout title="Booking" navbarScrolled><div style={{ paddingTop: 120, textAlign: 'center' }}>Đang tải...</div></CustomerLayout>;

  return (
    <CustomerLayout title={`${booking.BookingCode} - VietTravel`} navbarScrolled>
      <div className="container" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <Link href="/my-bookings">← Quay lại</Link>
        <h1 style={{ marginTop: 16 }}>{booking.TourTitleSnapshot}</h1>
        <p>Mã booking: <strong>{booking.BookingCode}</strong></p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 24 }}>
          <div className="stat-card"><div>Ngày đi</div><strong>{formatDate(booking.StartDateSnapshot)}</strong></div>
          <div className="stat-card"><div>Tổng tiền</div><strong>{formatCurrency(booking.TotalAmount)}</strong></div>
          <div className="stat-card"><div>Thanh toán</div><strong>{booking.PaymentStatus}</strong></div>
        </div>
      </div>
    </CustomerLayout>
  );
}
