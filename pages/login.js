import Head from 'next/head';
import { AuthRouteLauncher } from '../components/auth/AuthModalProvider';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Dang Nhap - VietTravel</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="description" content="Đăng nhập tài khoản VietTravel để quản lý booking và hành trình của bạn." />
      </Head>
      <AuthRouteLauncher mode="login" fallbackPath="/" />
    </>
  );
}
