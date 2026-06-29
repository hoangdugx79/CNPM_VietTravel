import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CustomerLayout from '../components/customer/Layout';
import HeroSection from '../components/customer/HeroSection';
import TourCard from '../components/customer/TourCard';
import { apiRequest } from '../lib/api';

const FALLBACK_DEST = [
  { Name: 'Đà Nẵng', Slug: 'da-nang', Province: 'Đà Nẵng', TourCount: 15 },
  { Name: 'Hội An', Slug: 'hoi-an', Province: 'Quảng Nam', TourCount: 10 },
  { Name: 'Hà Nội', Slug: 'ha-noi', Province: 'Hà Nội', TourCount: 20 },
];

export default function HomePage() {
  const router = useRouter();
  const [featured, setFeatured] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [tRes, dRes, cRes] = await Promise.all([
        apiRequest('/tours/featured'),
        apiRequest('/destinations'),
        apiRequest('/categories'),
      ]);
      if (tRes.ok) setFeatured(tRes.data.data || []);
      if (dRes.ok && dRes.data.data?.length) setDestinations(dRes.data.data.slice(0, 8));
      else setDestinations(FALLBACK_DEST);
      if (cRes.ok) setCategories(cRes.data.data || []);
      setLoading(false);
    })();
  }, []);

  const icons = ['🏖️', '🏔️', '🏛️', '🌿', '🌊', '✈️'];

  return (
    <CustomerLayout title="VietTravel - Khám Phá Việt Nam">
      <HeroSection tours={featured} loading={loading} />

      <section className="section categories-section">
        <div className="container">
          <div className="section-header"><span className="section-badge">Danh mục</span><h2>Khám Phá Theo Chủ Đề</h2></div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <div key={cat.CategoryId} className="category-card" onClick={() => router.push(`/tours?category=${cat.Slug}`)} role="button" tabIndex={0}>
                <div className="category-icon">{icons[i % icons.length]}</div>
                <h3>{cat.Name}</h3>
                <span className="tour-count">{cat.TourCount || 0} tours</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section featured-section" id="featured">
        <div className="container">
          <div className="section-header"><span className="section-badge"><i className="fas fa-fire" /> Nổi bật</span><h2>Tour Du Lịch Hot Nhất</h2></div>
          <div className="tours-grid">
            {loading ? <div className="loader" style={{ gridColumn: '1/-1', margin: '40px auto' }} /> : featured.map((t) => <TourCard key={t.TourId} tour={t} />)}
          </div>
          <div className="section-action"><a href="/tours" className="btn btn-primary btn-lg">Xem tất cả tours <i className="fas fa-arrow-right" /></a></div>
        </div>
      </section>

      <section className="section destinations-section" id="destinations">
        <div className="container">
          <div className="section-header"><h2>Điểm Đến Nổi Tiếng</h2></div>
          <div className="destinations-grid">
            {destinations.map((d) => (
              <div key={d.Slug || d.DestinationId} className="destination-card" onClick={() => router.push(`/tours?destination=${d.Slug}`)} role="button" tabIndex={0}>
                <img src={d.ImageUrl || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80'} alt={d.Name} loading="lazy" />
                <div className="destination-overlay" />
                <div className="destination-info"><h3>{d.Name}</h3><p>{d.Province || d.Country}</p></div>
                <span className="destination-count">{d.TourCount || 0} tours</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section contact-section" id="contact">
        <div className="container">
          <div className="newsletter-box">
            <div className="newsletter-content">
              <h2>Nhận Ưu Đãi Đặc Biệt</h2>
              <p>Đăng ký nhận thông báo về các tour khuyến mãi</p>
            </div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
}
