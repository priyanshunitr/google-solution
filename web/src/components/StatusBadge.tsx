import { useTranslation } from 'react-i18next';
import type { GuestStatus } from '../data/mockEmergencies';
import { GUEST_STATUS_OPTIONS } from '../data/mockEmergencies';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: GuestStatus | null;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useTranslation();
  if (!status) return null;

  const option = GUEST_STATUS_OPTIONS.find(o => o.key === status);
  if (!option) return null;

  return (
    <div 
      className={`status-badge status-badge--${size}`} 
      id={`status-badge-${status}`}
      style={{ '--badge-color': option.color } as React.CSSProperties}
    >
      <span className="status-badge__icon">{option.icon}</span>
      <span className="status-badge__label">{t(`status.${status}`)}</span>
    </div>
  );
}
