import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  titleBn?: string;
}

export function MainLayout({ children, title, titleBn }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header title={title} titleBn={titleBn} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
