export default function Custom500() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '6rem', margin: 0, color: '#e74c3c' }}>500</h1>
      <h2>Lỗi máy chủ</h2>
      <p>Đã xảy ra lỗi phía máy chủ. Vui lòng thử lại sau.</p>
      <a href="/" style={{ color: '#3498db', textDecoration: 'none', fontSize: '1.1rem' }}>
        ← Về trang chủ
      </a>
    </div>
  );
}
