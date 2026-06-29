import Link from 'next/link';
import { formatCurrency, formatDate } from '../../lib/format';

export default function TourCard({ tour }) {
  const price = tour.MinDeparturePrice || tour.BasePrice;
  return (
    <div className="tour-card" onClick={() => { window.location.href = `/tours/${tour.Slug}`; }} role="button" tabIndex={0}>
      <div className="tour-card-img">
        <img src={tour.MainImageUrl || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80'} alt={tour.Title} loading="lazy" />
        <span className="tour-badge hot"><i className="fas fa-fire" /> Hot</span>
      </div>
      <div className="tour-card-body">
        <div className="tour-destinations"><i className="fas fa-map-marker-alt" /> {tour.DestinationNames || tour.DeparturePlaceName || 'Việt Nam'}</div>
        <h3>{tour.Title}</h3>
        <div className="tour-meta">
          <div className="tour-meta-item"><i className="fas fa-clock" /> {tour.DurationDays} ngày {tour.DurationNights} đêm</div>
          {tour.NextDeparture && <div className="tour-meta-item"><i className="fas fa-calendar" /> {formatDate(tour.NextDeparture)}</div>}
        </div>
        <div className="tour-card-footer">
          <div className="tour-price">
            <span className="from">Từ</span>
            <div><span className="price">{formatCurrency(price)}</span><span className="per">/người</span></div>
          </div>
          <div className="tour-rating">
            <span className="stars">⭐</span>
            <span className="score">{parseFloat(tour.RatingAvg || 0).toFixed(1)}</span>
            <span className="count">({tour.RatingCount || 0})</span>
          </div>
        </div>
        <Link href={`/tours/${tour.Slug}`} className="tour-book-btn" onClick={(e) => e.stopPropagation()}>Đặt ngay <i className="fas fa-arrow-right" /></Link>
      </div>
    </div>
  );
}
