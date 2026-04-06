import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../i18n';
import './SettingsScreen.css';

export default function SettingsScreen() {
  const { state, dispatch } = useAppContext();
  const { t, i18n } = useTranslation();

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    dispatch({ type: 'SET_LANGUAGE', payload: code });
  };

  return (
    <div className="settings-screen" id="settings-screen">
      <header className="settings-screen__header">
        <h1>{t('settings.title')}</h1>
        <p className="settings-screen__subtitle">{t('settings.subtitle')}</p>
      </header>

      <section className="settings-screen__section">
        <h3 className="settings-screen__section-title">{t('settings.sessionInfo')}</h3>
        <div className="settings-screen__card">
          <div className="settings-screen__row">
            <span className="settings-screen__row-label">{t('settings.sessionId')}</span>
            <span className="settings-screen__row-value settings-screen__row-value--mono">{state.guestSession.sessionId}</span>
          </div>
          <div className="settings-screen__row">
            <span className="settings-screen__row-label">{t('settings.property')}</span>
            <span className="settings-screen__row-value">{state.guestSession.propertyName}</span>
          </div>
          <div className="settings-screen__row">
            <span className="settings-screen__row-label">{t('settings.propertyId')}</span>
            <span className="settings-screen__row-value settings-screen__row-value--mono">{state.guestSession.propertyId}</span>
          </div>
        </div>
      </section>

      <section className="settings-screen__section">
        <h3 className="settings-screen__section-title">{t('settings.roomNumber')}</h3>
        <div className="settings-screen__card">
          <input
            type="text"
            className="settings-screen__input"
            placeholder={t('settings.roomPlaceholder')}
            value={state.guestSession.roomNumber || ''}
            onChange={(e) => dispatch({ type: 'SET_ROOM_NUMBER', payload: e.target.value })}
            id="room-number-input"
          />
          <p className="settings-screen__hint">{t('settings.roomHint')}</p>
        </div>
      </section>

      <section className="settings-screen__section">
        <h3 className="settings-screen__section-title">{t('settings.language')}</h3>
        <div className="settings-screen__card settings-screen__lang-grid">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`settings-screen__lang-btn ${i18n.language === lang.code ? 'settings-screen__lang-btn--active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
              id={`lang-${lang.code}`}
            >
              <span className="settings-screen__lang-native">{lang.nativeLabel}</span>
              <span className="settings-screen__lang-eng">{lang.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-screen__section">
        <h3 className="settings-screen__section-title">{t('settings.location')}</h3>
        <div className="settings-screen__card">
          <div className="settings-screen__row">
            <span className="settings-screen__row-label">{t('settings.gpsStatus')}</span>
            <span className={`settings-screen__row-value ${state.location.latitude !== null ? 'text-safe' : 'text-warning'}`}>
              {state.location.latitude !== null ? `✅ ${t('settings.gpsAvailable')}` : `⚠️ ${t('settings.gpsUnavailable')}`}
            </span>
          </div>
          <div className="settings-screen__row">
            <span className="settings-screen__row-label">{t('settings.locationSharing')}</span>
            <span className={`settings-screen__row-value ${state.isLocationSharing ? 'text-safe' : 'text-muted'}`}>
              {state.isLocationSharing ? `🟢 ${t('settings.sharingActive')}` : `⚪ ${t('settings.sharingInactive')}`}
            </span>
          </div>
          <p className="settings-screen__hint">{t('settings.locationHint')}</p>
        </div>
      </section>

      <section className="settings-screen__section">
        <div className="settings-screen__privacy">
          <span className="settings-screen__privacy-icon">🔒</span>
          <div>
            <strong>{t('settings.privacyTitle')}</strong>
            <p>{t('settings.privacyDesc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
