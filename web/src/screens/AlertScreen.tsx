import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { EMERGENCY_TYPE_INFO } from '../data/mockEmergencies';
import './AlertScreen.css';

export default function AlertScreen() {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const emergency = state.activeEmergency;

  if (!emergency) return null;

  const typeInfo = EMERGENCY_TYPE_INFO[emergency.type];

  return (
    <div 
      className={`alert-screen alert-screen--${emergency.severity}`} 
      id="alert-screen"
      style={{ '--alert-color': typeInfo.color } as React.CSSProperties}
    >
      <div className="alert-screen__bg-pulse" />
      
      <div className="alert-screen__severity alert-screen__severity--critical">
        {t(`emergency.${emergency.severity}`)}
      </div>

      <div className="alert-screen__icon-wrap">
        <div className="alert-screen__ring alert-screen__ring--1" />
        <div className="alert-screen__ring alert-screen__ring--2" />
        <span className="alert-screen__icon">{typeInfo.icon}</span>
      </div>
      
      <h1 className="alert-screen__title">{t(`emergency.${emergency.type}`)}</h1>
      <p className="alert-screen__message">{emergency.message}</p>
      <p className="alert-screen__time">{t('alert.issuedAt')} {new Date(emergency.issuedAt).toLocaleTimeString()}</p>
      
      <div className="alert-screen__actions">
        <button 
          className="alert-screen__btn alert-screen__btn--sos" 
          onClick={() => dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'sos' })}
          id="alert-sos-btn"
        >
          <span className="alert-screen__btn-icon">🆘</span>
          {t('alert.sendSOS')}
        </button>
        
        <button 
          className="alert-screen__btn alert-screen__btn--guidance"
          onClick={() => dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'guidance' })}
          id="alert-guide-btn"
        >
          <span className="alert-screen__btn-icon">📋</span>
          {t('alert.seeInstructions')}
        </button>

        <button 
          className="alert-screen__safe-btn"
          onClick={() => dispatch({ type: 'RESOLVE_EMERGENCY' })}
          id="alert-safe-btn"
        >
          {t('alert.iAmSafe')}
        </button>
      </div>
    </div>
  );
}
