import Link from 'next/link';
import { useAuthModal } from '../auth/AuthModalProvider';

export default function Footer() {
  const { openAuthModal } = useAuthModal();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo"><i className="fas fa-globe-asia" /> VietTravel</div>
            <p>Công ty du lịch VietTravel - mang đến những hành trình đáng nhớ trên khắp Việt Nam.</p>
          </div>

          <div className="footer-links">
            <h4>Tour Du Lịch</h4>
            <ul>
              <li><Link href="/tours">Tour trong nước</Link></li>
              <li><Link href="/tours">Tour nghỉ dưỡng</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Tài Khoản</h4>
            <ul>
              <li><button type="button" className="footer-link-button" onClick={() => openAuthModal({ mode: 'login' })}>Đăng nhập</button></li>
              <li><button type="button" className="footer-link-button" onClick={() => openAuthModal({ mode: 'register' })}>Đăng ký</button></li>
              <li><Link href="/my-bookings">Booking của tôi</Link></li>
              <li><Link href="/admin/login">Quản trị viên</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>(c) 2026 VietTravel. All rights reserved. | Được phát triển bởi BTL CNPM</p>
        </div>
      </div>
    </footer>
  );
}
