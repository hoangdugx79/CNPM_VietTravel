import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';
import { useToast } from '../Toast';

export default function CustomerLayout({ children, title = 'VietTravel', description, navbarScrolled = false }) {
  const { ToastContainer } = useToast();

  return (
    <>
      <Head>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <Navbar scrolled={navbarScrolled} />
      {children}
      <Footer />
      <ChatWidget />
      <ToastContainer />
    </>
  );
}
