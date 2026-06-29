import Head from 'next/head';
import { AuthRouteLauncher } from '../../components/auth/AuthModalProvider';

export default function AdminLoginPage() {
  return (
    <>
      <Head><title>Admin Login - VietTravel</title><link rel="stylesheet" href="/css/admin.css" /></Head>
      <AuthRouteLauncher mode="login" adminOnly fallbackPath="/admin" />
    </>
  );
}
