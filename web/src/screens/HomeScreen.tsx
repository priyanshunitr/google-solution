import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { MOCK_EMERGENCIES } from '../data/mockEmergencies';
import LocationIndicator from '../components/LocationIndicator';
import './HomeScreen.css';

export default function HomeScreen() {
  const { state, triggerEmergency } = useAppContext();
  const { t } = useTranslation();

  const hasActiveAlert = state.mode === 'emergency' && state.activeEmergency;

  return (
    <div className="home-screen" id="home-screen">
      <header className="home-screen__header">
        <div className="home-screen__greeting">
          <span className="home-screen__wave">👋</span>
          <div>
            <p className="home-screen__welcome">{t('home.welcome')}</p>
            <h1 className="home-screen__property">{state.guestSession.propertyName}</h1>
          </div>
        </div>
        <div className="home-screen__session">
          <span className="home-screen__session-id">ID: {state.guestSession.sessionId}</span>
        </div>
      </header>

      <div className={`home-screen__status-card ${hasActiveAlert ? 'home-screen__status-card--alert' : ''}`}>
        <div className="home-screen__status-icon-wrap">
          <span className="home-screen__status-icon">{hasActiveAlert ? '⚠️' : '🛡️'}</span>
        </div>
        <div className="home-screen__status-info">
          <h2 className="home-screen__status-title">
            {hasActiveAlert ? t('home.alertActive') : t('home.allClear')}
          </h2>
          <p className="home-screen__status-desc">
            {hasActiveAlert ? t('home.alertActiveDesc') : t('home.allClearDesc')}
          </p>
        </div>
        <div className={`home-screen__status-dot ${hasActiveAlert ? 'home-screen__status-dot--danger' : 'home-screen__status-dot--safe'}`} />
      </div>

      <LocationIndicator />

      <section className="home-screen__section">
        <h3 className="home-screen__section-title">{t('home.quickActions')}</h3>
        <div className="home-screen__actions">
          <button className="home-screen__action-card home-screen__action-card--sos" id="quick-sos-btn"
            onClick={() => triggerEmergency(MOCK_EMERGENCIES[0])}
          >
            <span className="home-screen__action-icon">🆘</span>
            <span className="home-screen__action-label">{t('home.emergencySOS')}</span>
            <span className="home-screen__action-desc">{t('home.sosDesc')}</span>
          </button>
          <button className="home-screen__action-card" id="quick-report-btn"
            onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'report' });
              window.dispatchEvent(event);
            }}
          >
            <span className="home-screen__action-icon">📋</span>
            <span className="home-screen__action-label">{t('home.reportIssue')}</span>
            <span className="home-screen__action-desc">{t('home.reportDesc')}</span>
          </button>
        </div>
      </section>

      <section className="home-screen__section">
        <h3 className="home-screen__section-title">{t('home.safetyTips')}</h3>
        <div className="home-screen__tips">
          <div className="home-screen__tip">
            <span className="home-screen__tip-icon">🚪</span>
            <div>
              <strong>{t('home.tipExits')}</strong>
              <p>{t('home.tipExitsDesc')}</p>
            </div>
          </div>
          <div className="home-screen__tip">
            <span className="home-screen__tip-icon">🔑</span>
            <div>
              <strong>{t('home.tipKey')}</strong>
              <p>{t('home.tipKeyDesc')}</p>
            </div>
          </div>
          <div className="home-screen__tip">
            <span className="home-screen__tip-icon">📱</span>
            <div>
              <strong>{t('home.tipApp')}</strong>
              <p>{t('home.tipAppDesc')}</p>
            </div>
          </div>
          <div className="home-screen__tip">
            <span className="home-screen__tip-icon">🚫</span>
            <div>
              <strong>{t('home.tipElevator')}</strong>
              <p>{t('home.tipElevatorDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="home-screen__fab-group">
        <p className="home-screen__fab-label">⚡ {t('home.simulateAlert')}</p>
        <div className="home-screen__fab-buttons">
          {MOCK_EMERGENCIES.slice(0, 4).map((emg) => (
            <button
              key={emg.id}
              className="home-screen__fab-btn"
              onClick={() => triggerEmergency(emg)}
              id={`sim-${emg.type}`}
              title={`Simulate ${emg.type}`}
            >
              {emg.type === 'fire' && '🔥'}
              {emg.type === 'evacuation' && '🚨'}
              {emg.type === 'medical' && '🏥'}
              {emg.type === 'lockdown' && '🔒'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
