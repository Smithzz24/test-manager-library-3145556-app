import { useCallback, useState } from 'react';
import { useAuth } from './auth/context.js';
import { HealthBadge } from './components/HealthBadge.jsx';
import { roleLabel } from './lib/format.js';
import { NavContext } from './lib/nav.js';
import { BookFormPage } from './pages/BookFormPage.jsx';
import { BooksPage } from './pages/BooksPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LoanDetailPage } from './pages/LoanDetailPage.jsx';
import { LoansPage } from './pages/LoansPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { MemberDetailPage } from './pages/MemberDetailPage.jsx';
import { MembersPage } from './pages/MembersPage.jsx';
import { NewLoanPage } from './pages/NewLoanPage.jsx';
import { ReportPage } from './pages/ReportPage.jsx';
import { UsersPage } from './pages/UsersPage.jsx';

const ROUTES = {
  home: { component: HomePage },
  books: { component: BooksPage, label: 'Libros' },
  bookForm: { component: BookFormPage, adminOnly: true },
  members: { component: MembersPage, label: 'Socios' },
  memberDetail: { component: MemberDetailPage },
  loans: { component: LoansPage, label: 'Préstamos' },
  loanDetail: { component: LoanDetailPage },
  newLoan: { component: NewLoanPage, label: 'Nuevo préstamo' },
  report: { component: ReportPage, label: 'Reporte', adminOnly: true },
  users: { component: UsersPage, label: 'Bibliotecarios', adminOnly: true },
};

const MENU = ['books', 'members', 'loans', 'newLoan', 'report', 'users'];

export function App() {
  const { session, isAdmin, logout } = useAuth();
  const [view, setView] = useState({ name: 'home', params: {}, key: 0 });

  const navigate = useCallback((name, params = {}) => {
    setView((prev) => ({ name, params, key: prev.key + 1 }));
  }, []);

  if (!session) return <LoginPage />;

  const route = ROUTES[view.name] || ROUTES.home;
  const allowed = !route.adminOnly || isAdmin;
  const Page = allowed ? route.component : HomePage;

  return (
    <NavContext.Provider value={navigate}>
      <header className="topbar">
        <button type="button" className="brand" onClick={() => navigate('home')}>
          Manager Library
        </button>
        <nav>
          {MENU.filter((name) => !ROUTES[name].adminOnly || isAdmin).map((name) => (
            <button
              key={name}
              type="button"
              className={view.name === name ? 'active' : ''}
              onClick={() => navigate(name)}
            >
              {ROUTES[name].label}
            </button>
          ))}
        </nav>
        <div className="session">
          <HealthBadge />
          <span>
            {session.username} · {roleLabel(session.role)}
          </span>
          <button type="button" onClick={() => logout('Sesión cerrada.')}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="content">
        <Page key={view.key} {...view.params} />
      </main>
    </NavContext.Provider>
  );
}