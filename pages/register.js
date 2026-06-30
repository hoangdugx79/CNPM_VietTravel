import Head from 'next/head';
import { AuthRouteLauncher } from '../components/auth/AuthModalProvider';

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Dang Ky - VietTravel</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="description" content="Tạo tài khoản VietTravel để đặt tour nhanh hơn và theo dõi lịch sử đặt chỗ." />
      </Head>
      <AuthRouteLauncher mode="register" fallbackPath="/" />
    </>
  );
}
