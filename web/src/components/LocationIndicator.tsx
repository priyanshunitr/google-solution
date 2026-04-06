import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import './LocationIndicator.css';

export default function LocationIndicator() {
  const { state } = useAppContext();
  const { t } = useTranslation();

  if (!state.isLocationSharing) return null;

  return (
    <div className="location-indicator" id="location-indicator">
      <span className="location-indicator__dot" />
      <span className="location-indicator__text">
        📍 {t('locationIndicator.sharing')}
      </span>
      {state.location.latitude !== null && (
        <span className="location-indicator__coords">
          {state.location.latitude.toFixed(4)}, {state.location.longitude?.toFixed(4)}
        </span>
      )}
    </div>
  );
}
