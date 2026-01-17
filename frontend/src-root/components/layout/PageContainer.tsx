import { ReactNode } from 'react';
import { Header } from './Header';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export function PageContainer({ children, title, showBack = true }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title={title} showBack={showBack} />
      <main className="container mx-auto px-4 py-6 animate-fade-in flex-1">
        {children}
      </main>
      <footer className="w-full footer-container">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground font-medium">Hostel Expense Management</span>
          <span className="text-sm text-muted-foreground">
            Powered by{' '}
            <a
              href="https://m-873.github.io/M873/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link group"
            >
              M873
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
