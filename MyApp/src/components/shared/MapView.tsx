import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radii, FontSizes } from '../../theme/colors';
import type { Alert, SOSRequest } from '../../types/communication';

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  label: string;
  color: string;
}

interface MapViewProps {
  alerts?: Alert[];
  sosRequests?: SOSRequest[];
  title?: string;
}

const TYPE_COLORS: Record<string, string> = {
  fire: '#E74C3C',
  medical: '#3498DB',
  safety: '#F39C12',
  assistance: '#6C5CE7',
  sos: '#E74C3C',
};

const TYPE_ICONS: Record<string, string> = {
  fire: '🔥',
  medical: '🏥',
  safety: '⚠️',
  assistance: '🙋',
  sos: '🆘',
};

export default function MapView({ alerts = [], sosRequests = [], title = 'Alert Map' }: MapViewProps) {
  // Collect markers from alerts and SOS requests
  const markers: MapMarker[] = [];

  alerts.forEach(alert => {
    if (alert.location?.latitude && alert.location?.longitude) {
      markers.push({
        id: alert.id,
        latitude: alert.location.latitude,
        longitude: alert.location.longitude,
        type: alert.type,
        label: `${TYPE_ICONS[alert.type] || '📍'} ${alert.type.toUpperCase()}`,
        color: TYPE_COLORS[alert.type] || '#F39C12',
      });
    }
  });

  sosRequests.forEach(sos => {
    if (sos.location?.latitude && sos.location?.longitude) {
      markers.push({
        id: sos.id,
        latitude: sos.location.latitude,
        longitude: sos.location.longitude,
        type: 'sos',
        label: `🆘 SOS - ${sos.category}`,
        color: '#E74C3C',
      });
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🗺️</Text>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.markerCount}>
          <Text style={styles.markerCountText}>{markers.length} pins</Text>
        </View>
      </View>

      <View style={styles.mapArea}>
        {/* Grid background */}
        <View style={styles.grid}>
          {Array.from({ length: 5 }).map((_, row) => (
            <View key={`row-${row}`} style={styles.gridRow}>
              {Array.from({ length: 5 }).map((_, col) => (
                <View key={`cell-${row}-${col}`} style={styles.gridCell} />
              ))}
            </View>
          ))}
        </View>

        {/* Property outline */}
        <View style={styles.propertyOutline}>
          <Text style={styles.propertyLabel}>The Grand Azure Resort</Text>
        </View>

        {markers.length === 0 ? (
          <View style={styles.noMarkers}>
            <Text style={styles.noMarkersIcon}>📍</Text>
            <Text style={styles.noMarkersText}>No geolocated alerts</Text>
          </View>
        ) : (
          /* Show markers as positioned indicators */
          markers.map((marker, index) => {
            // Distribute markers across the map area for visibility
            const angle = (index / markers.length) * 2 * Math.PI;
            const radius = 30 + (index % 3) * 15;
            const left = 50 + radius * Math.cos(angle);
            const top = 50 + radius * Math.sin(angle);

            return (
              <View
                key={marker.id}
                style={[
                  styles.marker,
                  {
                    left: `${Math.min(85, Math.max(5, left))}%` as any,
                    top: `${Math.min(85, Math.max(15, top))}%` as any,
                  },
                ]}
              >
                <View style={[styles.markerDot, { backgroundColor: marker.color }]}>
                  <View style={[styles.markerPulse, { borderColor: marker.color }]} />
                </View>
                <View style={[styles.markerTooltip, { borderColor: marker.color }]}>
                  <Text style={styles.markerLabel}>{marker.label}</Text>
                  <Text style={styles.markerCoords}>
                    {marker.latitude.toFixed(3)}, {marker.longitude.toFixed(3)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Legend */}
      {markers.length > 0 && (
        <View style={styles.legend}>
          {Object.entries(TYPE_COLORS).map(([type, color]) => {
            const count = markers.filter(m => m.type === type).length;
            if (count === 0) return null;
            return (
              <View key={type} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendText}>{TYPE_ICONS[type]} {type} ({count})</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.surface2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    flex: 1,
  },
  markerCount: {
    backgroundColor: Colors.surface,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  markerCountText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  mapArea: {
    height: 200,
    position: 'relative',
    backgroundColor: '#0D1019',
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: Colors.textMuted,
  },
  propertyOutline: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: '10%',
    bottom: '15%',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    borderRadius: Radii.sm,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyLabel: {
    fontSize: 10,
    color: Colors.primary + '60',
    fontWeight: '600',
  },
  noMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMarkersIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.4,
  },
  noMarkersText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  markerPulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    opacity: 0.3,
  },
  markerTooltip: {
    marginTop: 2,
    backgroundColor: Colors.surface,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  markerLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.text,
  },
  markerCoords: {
    fontSize: 7,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
