import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGuestContext } from '../context/GuestContext';
import type { IssueCategory } from '../../../shared/data/mockEmergencies';
import './ReportScreen.css';

const CATEGORIES: { key: IssueCategory; icon: string; labelKey: string; descKey: string }[] = [
  { key: 'fire', icon: '🔥', labelKey: 'report.fire', descKey: 'report.fireDesc' },
  { key: 'medical', icon: '🏥', labelKey: 'report.medical', descKey: 'report.medicalDesc' },
  { key: 'safety', icon: '⚠️', labelKey: 'report.safety', descKey: 'report.safetyDesc' },
  { key: 'assistance', icon: '🙋', labelKey: 'report.assistance', descKey: 'report.assistanceDesc' },
];

export default function ReportScreen() {
  const { submitReport } = useGuestContext();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<IssueCategory | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (cat: IssueCategory) => {
    setSelected(cat);
    setConfirming(true);
  };

  const handleConfirm = () => {
    if (selected) {
      submitReport(selected);
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setConfirming(false); setSelected(null); }, 3000);
    }
  };

  const handleCancel = () => { setConfirming(false); setSelected(null); };

  const selectedCat = CATEGORIES.find((c) => c.key === selected);

  return (
    <div className="report-screen" id="report-screen">
      <header className="report-screen__header">
        <h1>{t('report.title')}</h1>
        <p className="report-screen__subtitle">{t('report.subtitle')}</p>
      </header>

      {!confirming && (
        <div className="report-screen__grid">
          {CATEGORIES.map((cat) => (
            <button key={cat.key} className="report-screen__card" onClick={() => handleSelect(cat.key)} id={`report-${cat.key}`}>
              <span className="report-screen__card-icon">{cat.icon}</span>
              <span className="report-screen__card-label">{t(cat.labelKey)}</span>
              <span className="report-screen__card-desc">{t(cat.descKey)}</span>
            </button>
          ))}
        </div>
      )}

      {confirming && !submitted && (
        <div className="report-screen__confirm" id="report-confirm">
          <div className="report-screen__confirm-card">
            <span className="report-screen__confirm-icon">{selectedCat?.icon}</span>
            <h2>{selectedCat ? t(selectedCat.labelKey) : ''}</h2>
            <p className="report-screen__confirm-text">{t('report.confirmTitle')}</p>
            <div className="report-screen__confirm-actions">
              <button className="report-screen__btn report-screen__btn--danger" onClick={handleConfirm} id="report-submit-btn">
                {t('report.confirmSend')}
              </button>
              <button className="report-screen__btn report-screen__btn--ghost" onClick={handleCancel} id="report-cancel-btn">
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {submitted && (
        <div className="report-screen__success" id="report-success">
          <span className="report-screen__success-icon">✅</span>
          <h2>{t('report.successTitle')}</h2>
          <p>{t('report.successDesc')}</p>
        </div>
      )}

      <div className="report-screen__info">
        <p>🔒 {t('report.privacyNote')}</p>
      </div>
    </div>
  );
}
