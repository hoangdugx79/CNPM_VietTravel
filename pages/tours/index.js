import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CustomerLayout from '../../components/customer/Layout';
import TourCard from '../../components/customer/TourCard';
import CustomSelect from '../../components/common/CustomSelect';
import { apiRequest } from '../../lib/api';

export default function ToursPage() {
  const router = useRouter();
  const [tours, setTours] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const sort = typeof router.query.sort === 'string' ? router.query.sort : 'newest';
  const sortOptions = [
    { value: 'newest', label: 'Mới nhất', description: 'Ưu tiên tour vừa được cập nhật' },
    { value: 'price_asc', label: 'Giá thấp → cao', description: 'Phù hợp khi tối ưu ngân sách' },
    { value: 'price_desc', label: 'Giá cao → thấp', description: 'Ưu tiên tour cao cấp trước' },
    { value: 'rating', label: 'Đánh giá cao', description: 'Ưu tiên tour được yêu thích' },
  ];

  const loadTours = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12, sort });
    ['search', 'category', 'destination', 'duration', 'maxPrice'].forEach((k) => {
      if (router.query[k]) params.set(k, router.query[k]);
    });
    const { ok, data } = await apiRequest(`/tours?${params}`);
    if (ok) {
      setTours(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!router.isReady) return;
    loadTours(Number(router.query.page) || 1);
  }, [router.isReady, router.query, sort]);

  return (
    <CustomerLayout title="Danh Sách Tour - VietTravel" navbarScrolled>
      <div className="page-header" style={{ paddingTop: 80 }}>
        <div className="container">
          <h1>Khám Phá Tours Du Lịch</h1>
          <p>Tìm thấy {pagination.total} tour</p>
        </div>
      </div>
      <div className="tours-page" style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <span className="tours-count">Tìm thấy {pagination.total} tour</span>
            <CustomSelect
              className="sort-select"
              value={sort}
              options={sortOptions}
              placeholder="Chọn cách sắp xếp"
              onChange={(event) => router.push({
                pathname: '/tours',
                query: {
                  ...router.query,
                  sort: event.target.value,
                  page: 1,
                },
              })}
            />
          </div>
          <div className="tours-grid">
            {loading ? <div className="loader" style={{ gridColumn: '1/-1', margin: '40px auto' }} /> : tours.length ? tours.map((t) => <TourCard key={t.TourId} tour={t} />) : <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>Không có tour nào</p>}
          </div>
          {pagination.totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
                <button key={p} type="button" className={`page-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => router.push({ query: { ...router.query, page: p } })}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
