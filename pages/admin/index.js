import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../lib/api';
import { formatCurrency } from '../../lib/format';

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
    <AdminLayout title="Dashboard" subtitle="Tổng quan hệ thống bán tour du lịch">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon orange"><i className="fas fa-map-marked-alt" /></div><div><div className="stat-value">{stats?.TotalTours ?? '...'}</div><div className="stat-label">Tours hoạt động</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><i className="fas fa-suitcase" /></div><div><div className="stat-value">{stats?.TotalBookings ?? '...'}</div><div className="stat-label">Tổng booking</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow"><i className="fas fa-clock" /></div><div><div className="stat-value">{stats?.PendingBookings ?? '...'}</div><div className="stat-label">Chờ xử lý</div></div></div>
        <div className="stat-card"><div className="stat-icon purple"><i className="fas fa-money-bill-wave" /></div><div><div className="stat-value">{stats ? formatCurrency(stats.TotalRevenue) : '...'}</div><div className="stat-label">Doanh thu</div></div></div>
      </div>
      {data?.recentBookings?.length > 0 && (
        <div className="card" style={{ marginTop: 24, background: '#fff', borderRadius: 16, padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Booking gần đây</h3>
          <table className="data-table" style={{ width: '100%' }}>
            <thead><tr><th>Mã</th><th>Khách</th><th>Tour</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {data.recentBookings.map((b) => (
                <tr key={b.BookingId}>
                  <td>{b.BookingCode}</td>
                  <td>{b.CustomerFullName}</td>
                  <td>{b.TourTitleSnapshot}</td>
                  <td>{formatCurrency(b.TotalAmount)}</td>
                  <td>{b.Status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
