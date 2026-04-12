import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import './ResolvedScreen.css';

export default function ResolvedScreen() {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();

  return (
    <div className="resolved-screen" id="resolved-screen">
      <div className="resolved-screen__bg-glow" />
      
      <div className="resolved-screen__icon-wrap">
        <div className="resolved-screen__ring resolved-screen__ring--1" />
        <div className="resolved-screen__ring resolved-screen__ring--2" />
        <span className="resolved-screen__icon">✅</span>
      </div>

      <h1 className="resolved-screen__title">{t('resolved.allClear')}</h1>
      <p className="resolved-screen__subtitle">{t('resolved.emergencyResolved')}</p>

      <p className="resolved-screen__message">
        {t('resolved.message')}
      </p>

      <div className="resolved-screen__meta">
        <div className="resolved-screen__meta-row">
          <span>{t('resolved.resolvedAt')}</span>
          <strong>{new Date().toLocaleTimeString()}</strong>
        </div>
        <div className="resolved-screen__meta-row">
          <span>{t('resolved.session')}</span>
          <strong>{state.guestSession.sessionId}</strong>
        </div>
        <div className="resolved-screen__meta-row">
          <span>{t('resolved.sosSent')}</span>
          <strong>{state.sosActive ? 1 : 0}</strong>
        </div>
      </div>

      <button 
        className="resolved-screen__btn"
        onClick={() => dispatch({ type: 'RETURN_TO_NORMAL' })}
        id="resolved-home-btn"
      >
        🏠 {t('resolved.returnHome')}
      </button>

      <p className="resolved-screen__note">
        {t('resolved.locationStopped')}
      </p>
    </div>
  );
}
