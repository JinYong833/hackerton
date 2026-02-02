import { QueryProvider, RouterProvider } from './providers';
import { Header } from '@/widgets/header';
import { AppRouter } from './router';
import './styles/global.css';

function App() {
  return (
    <QueryProvider>
      <RouterProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="px-4 py-8">
            <AppRouter />
          </main>
        </div>
      </RouterProvider>
    </QueryProvider>
  );
}

export default App;
