import { Outlet } from 'react-router-dom';
import { Header } from '@/widgets/header';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
