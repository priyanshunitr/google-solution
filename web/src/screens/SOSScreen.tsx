import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { type IssueCategory } from '../data/mockEmergencies';
import './SOSScreen.css';

export default function SOSScreen() {
  const { state, dispatch, sendSOS } = useAppContext();
  const { t } = useTranslation();

  return (
    <div className="sos-screen" id="sos-screen">
      <button 
        className="sos-screen__back" 
        onClick={() => dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'alert' })}
        id="sos-back-btn"
      >
        ← {t('back')}
      </button>

      {state.activeEmergency && (
        <span className="sos-screen__tag text-danger" style={{ '--color-primary': 'var(--color-danger)' } as React.CSSProperties}>
           🔥 {t(`emergency.${state.activeEmergency.type}`)}
        </span>
      )}

      <h1 className="sos-screen__title">{t('sos.title')}</h1>


      {!state.sosActive ? (
        <div className="sos-screen__btn-wrap">
          <div className="sos-screen__ring sos-screen__ring--1" />
          <div className="sos-screen__ring sos-screen__ring--2" />
          <button 
            className="sos-screen__sos-btn" 
            onClick={() => sendSOS((state.activeEmergency?.type || 'safety') as IssueCategory, state.guestStatus || 'need_help')}
            id="sos-trigger-btn"
          >
            <span className="sos-screen__sos-text">SOS</span>
            <span className="sos-screen__sos-sub">{t('sos.tapToSend')}</span>
          </button>
        </div>
      ) : (
        <div className="sos-screen__sent" id="sos-success-msg">
          <div className="sos-screen__sent-icon">✅</div>
          <h2>{t('sos.helpRequested')}</h2>
          <p>{t('sos.helpDesc')}</p>
          
          <div className="sos-screen__sent-actions">
            <button 
              className="sos-screen__btn sos-screen__btn--safe"
              onClick={() => dispatch({ type: 'RESOLVE_EMERGENCY' })}
              id="sos-safe-now-btn"
            >
              ✅ {t('sos.imSafeNow')}
            </button>
          </div>
        </div>
      )}

      {!state.sosActive && (
        <button 
          className="sos-screen__btn sos-screen__btn--cancel"
          onClick={() => dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'alert' })}
          id="sos-cancel-btn"
        >
          {t('sos.cancelSOS')}
        </button>
      )}

      <div className="sos-screen__location-info">
        {state.location.latitude === null && (
          <p className="sos-screen__location-warn">⚠️ {t('sos.locationWarn')}</p>
        )}
      </div>
    </div>
  );
}
