import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../lib/api';
import { formatCurrency } from '../../lib/format';

const DashboardCharts = dynamic(() => import('../../components/admin/DashboardCharts'), {
  ssr: false,
});

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const { ok, data: res } = await adminAPI('/admin/dashboard');
      if (ok) setData(res.data);
    })();
  }, []);

  const stats = data?.stats;

  return (
    <AdminLayout title="Dashboard" subtitle="Tong quan he thong ban tour du lich">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orange"><i className="fas fa-map-marked-alt" /></div>
          <div>
            <div className="stat-value">{stats?.TotalTours ?? '...'}</div>
            <div className="stat-label">Tour hoat dong</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-suitcase" /></div>
          <div>
            <div className="stat-value">{stats?.TotalBookings ?? '...'}</div>
            <div className="stat-label">Tong booking</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><i className="fas fa-clock" /></div>
          <div>
            <div className="stat-value">{stats?.PendingBookings ?? '...'}</div>
            <div className="stat-label">Cho xu ly</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><i className="fas fa-money-bill-wave" /></div>
          <div>
            <div className="stat-value">{stats ? formatCurrency(stats.TotalRevenue) : '...'}</div>
            <div className="stat-label">Doanh thu</div>
          </div>
        </div>
      </div>

      <DashboardCharts
        revenueByMonth={data?.revenueByMonth || []}
        topTours={data?.topTours || []}
      />

      {data?.recentBookings?.length > 0 && (
        <div className="card" style={{ marginTop: 24, background: '#fff', borderRadius: 16, padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Booking gan day</h3>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Ma</th>
                <th>Khach</th>
                <th>Tour</th>
                <th>Tong tien</th>
                <th>Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {data.recentBookings.map((booking) => (
                <tr key={booking.BookingId}>
                  <td>{booking.BookingCode}</td>
                  <td>{booking.CustomerFullName}</td>
                  <td>{booking.TourTitleSnapshot}</td>
                  <td>{formatCurrency(booking.TotalAmount)}</td>
                  <td>{booking.Status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.recentContactLeads?.length > 0 && (
        <div className="card" style={{ marginTop: 24, background: '#fff', borderRadius: 16, padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Đăng ký nhận ưu đãi đặc biệt</h3>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Mã khuyến mãi</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {data.recentContactLeads.map((lead) => (
                <tr key={lead.LeadId}>
                  <td><strong>{lead.FullName}</strong></td>
                  <td>{lead.Email}</td>
                  <td>{lead.Phone}</td>
                  <td>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                      {lead.PromoCode}
                    </span>
                  </td>
                  <td>{new Date(lead.CreatedAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
