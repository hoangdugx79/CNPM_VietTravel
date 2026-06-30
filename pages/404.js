export default function Custom404() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '6rem', margin: 0, color: '#e74c3c' }}>404</h1>
      <h2>Trang không tìm thấy</h2>
      <p>Trang bạn đang tìm kiếm không tồn tại.</p>
      <a href="/" style={{ color: '#3498db', textDecoration: 'none', fontSize: '1.1rem' }}>
        ← Về trang chủ
      </a>
    </div>
  );
}
