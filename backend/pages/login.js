import Head from 'next/head';
import { AuthRouteLauncher } from '../components/auth/AuthModalProvider';

export default function LoginPage() {
  return (
    <>
      <Head><title>Dang Nhap - VietTravel</title></Head>
      <AuthRouteLauncher mode="login" fallbackPath="/" />
    </>
  );
}
