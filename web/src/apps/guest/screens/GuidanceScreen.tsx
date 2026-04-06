import { useTranslation } from 'react-i18next';
import { useGuestContext } from '../context/GuestContext';
import { EMERGENCY_TYPE_INFO } from '../../../shared/data/mockEmergencies';
import './GuidanceScreen.css';

export default function GuidanceScreen() {
  const { state, dispatch } = useGuestContext();
  const { t } = useTranslation();
  const emergency = state.activeEmergency;

  if (!emergency) return null;

  const typeInfo = EMERGENCY_TYPE_INFO[emergency.type];
  const doneCount = state.guidanceStepsCompleted.length;
  const totalCount = emergency.instructions.length;

  const toggleStep = (index: number) => {
    dispatch({ type: 'TOGGLE_GUIDANCE_STEP', payload: index });
  };

  return (
    <div className="guidance-screen" id="guidance-screen">
      <div className="guidance-screen__topbar">
        <button 
          className="guidance-screen__back" 
          onClick={() => dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'alert' })}
          id="guide-back-btn"
        >
          ← {t('back')}
        </button>
        <button 
          className="guidance-screen__safe-btn"
          onClick={() => dispatch({ type: 'RESOLVE_EMERGENCY' })}
          id="guide-safe-btn"
        >
          {t('alert.iAmSafe')}
        </button>
      </div>

      <header className="guidance-screen__header">
        <span className="guidance-screen__type-icon">{typeInfo.icon}</span>
        <div>
          <p className="guidance-screen__subtitle text-danger">{t('guidance.followSteps')}</p>
          <h1 className="guidance-screen__title">{t(`emergency.${emergency.type}`)}</h1>
        </div>
      </header>

      <div className="guidance-screen__progress">
        <div className="guidance-screen__progress-bar">
          <div 
            className="guidance-screen__progress-fill" 
            style={{ width: `${(doneCount / totalCount) * 100}%` }}
          />
        </div>
        <span className="guidance-screen__progress-text">
          {t('guidance.stepsCompleted', { done: doneCount, total: totalCount })}
        </span>
      </div>

      <div className="guidance-screen__steps">
        {emergency.instructions.map((step, idx) => {
          const isDone = state.guidanceStepsCompleted.includes(idx);
          return (
            <button 
              key={idx} 
              className={`guidance-screen__step ${isDone ? 'guidance-screen__step--done' : ''}`}
              onClick={() => toggleStep(idx)}
              id={`guide-step-${idx}`}
            >
              <div className={`guidance-screen__step-number ${isDone ? 'guidance-screen__step-number--done' : ''}`}>
                {isDone ? '✓' : idx + 1}
              </div>
              <p className={`guidance-screen__step-text ${isDone ? 'guidance-screen__step-text--done' : ''}`}>
                {step}
              </p>
            </button>
          );
        })}
      </div>

      <footer className="guidance-screen__footer">
        <button 
          className="guidance-screen__sos-link"
          onClick={() => dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'sos' })}
          id="guide-sos-btn"
        >
          🆘 {t('guidance.needHelp')}
        </button>
      </footer>
    </div>
  );
}
