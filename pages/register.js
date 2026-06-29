import Head from 'next/head';
import { AuthRouteLauncher } from '../components/auth/AuthModalProvider';

export default function RegisterPage() {
  return (
    <>
      <Head><title>Dang Ky - VietTravel</title></Head>
      <AuthRouteLauncher mode="register" fallbackPath="/" />
    </>
  );
}
