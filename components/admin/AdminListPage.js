import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';

const CONFIG = {
  tours: { title: 'Quản lý tour', api: '/admin/tours', cols: ['Mã', 'Tên tour', 'Giá cơ bản', 'Trạng thái'], render: (r) => [r.Code, r.Title, formatCurrency(r.BasePrice), r.Status] },
  bookings: { title: 'Quản lý booking', api: '/admin/bookings', cols: ['Mã', 'Khách', 'Tour', 'Tổng tiền', 'Trạng thái'], render: (r) => [r.BookingCode, r.CustomerFullName, r.TourTitleSnapshot, formatCurrency(r.TotalAmount), r.Status] },
  users: { title: 'Người dùng', api: '/admin/users', cols: ['Tên', 'Email', 'Vai trò', 'Trạng thái'], render: (r) => [r.FullName, r.Email, r.Role, r.Status] },
  destinations: { title: 'Điểm đến', api: '/admin/destinations', cols: ['Tên', 'Slug', 'Số tour'], render: (r) => [r.Name, r.Slug, r.TourCount] },
  departures: { title: 'Lịch khởi hành', api: '/admin/tours/all-departures', cols: ['Tour', 'Mã', 'Ngày đi', 'Trạng thái'], render: (r) => [r.TourTitle, r.DepartureCode, formatDate(r.StartDate), r.Status] },
  vehicles: { title: 'Quản lý xe', api: '/admin/transport/vehicles', cols: ['Biển số', 'Loại', 'Nhà cung cấp', 'Trạng thái'], render: (r) => [r.PlateNumber, r.Type, r.ProviderName, r.Status] },
  drivers: { title: 'Tài xế', api: '/admin/transport/drivers', cols: ['Tên', 'Điện thoại', 'Nhà cung cấp', 'Trạng thái'], render: (r) => [r.FullName, r.Phone, r.ProviderName, r.Status] },
  providers: { title: 'Nhà cung cấp', api: '/admin/transport/providers', cols: ['Tên', 'Loại', 'Số xe', 'Trạng thái'], render: (r) => [r.Name, r.Type, r.VehicleCount, r.Status] },
  routes: { title: 'Tuyến đường', api: '/admin/transport/routes', cols: ['Mã', 'Tên', 'Điểm đi', 'Điểm đến'], render: (r) => [r.RouteCode, r.Name, r.FromName, r.ToName] },
  promotions: { title: 'Khuyến mãi', api: '/admin/promotions', cols: ['Mã', 'Tên', 'Giảm', 'Trạng thái'], render: (r) => [r.Code, r.Name, r.DiscountValue, r.Status] },
};

export default function AdminListPage({ pageKey }) {
  const cfg = CONFIG[pageKey];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { ok, data } = await adminAPI(cfg.api);
      if (ok) setRows(data.data || []);
      setLoading(false);
    })();
  }, [cfg.api]);

  return (
    <AdminLayout title={cfg.title}>
      <div className="card" style={{ background: '#fff', borderRadius: 16, padding: 24 }}>
        {loading ? <p>Đang tải...</p> : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead><tr>{cfg.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.TourId || r.BookingId || r.UserId || r.DestinationId || r.DepartureId || r.VehicleId || r.DriverId || r.ProviderId || r.RouteId || r.PromotionId || i}>
                  {cfg.render(r).map((cell, j) => <td key={j}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

export function getAdminPage(pageKey) {
  const Page = () => <AdminListPage pageKey={pageKey} />;
  return Page;
}
