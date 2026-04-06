import { useTranslation } from 'react-i18next';
import { useGuestContext } from '../context/GuestContext';
import './NavBar.css';

interface NavBarProps {
  activeTab: 'home' | 'report' | 'settings';
  onNavigate: (tab: 'home' | 'report' | 'settings') => void;
}

export default function NavBar({ activeTab, onNavigate }: NavBarProps) {
  const { state } = useGuestContext();
  const { t } = useTranslation();

  if (state.mode === 'emergency') return null;

  return (
    <nav className="navbar" id="navbar">
      <button
        className={`navbar__item ${activeTab === 'home' ? 'navbar__item--active' : ''}`}
        onClick={() => onNavigate('home')}
        id="nav-home"
        aria-label={t('nav.home')}
      >
        <span className="navbar__icon">🏠</span>
        <span className="navbar__label">{t('nav.home')}</span>
      </button>
      <button
        className={`navbar__item ${activeTab === 'report' ? 'navbar__item--active' : ''}`}
        onClick={() => onNavigate('report')}
        id="nav-report"
        aria-label={t('nav.report')}
      >
        <span className="navbar__icon">📋</span>
        <span className="navbar__label">{t('nav.report')}</span>
      </button>
      <button
        className={`navbar__item ${activeTab === 'settings' ? 'navbar__item--active' : ''}`}
        onClick={() => onNavigate('settings')}
        id="nav-settings"
        aria-label={t('nav.settings')}
      >
        <span className="navbar__icon">⚙️</span>
        <span className="navbar__label">{t('nav.settings')}</span>
      </button>
    </nav>
  );
}
