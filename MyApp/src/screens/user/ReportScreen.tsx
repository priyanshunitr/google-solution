import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import type { IssueCategory } from '../../data/mockEmergencies';
import { Colors, Radii, Spacing, FontSizes } from '../../theme/colors';

const CATEGORIES: { key: IssueCategory; icon: string; labelKey: string; descKey: string }[] = [
  { key: 'fire', icon: '🔥', labelKey: 'report.fire', descKey: 'report.fireDesc' },
  { key: 'medical', icon: '🏥', labelKey: 'report.medical', descKey: 'report.medicalDesc' },
  { key: 'safety', icon: '⚠️', labelKey: 'report.safety', descKey: 'report.safetyDesc' },
  { key: 'assistance', icon: '🙋', labelKey: 'report.assistance', descKey: 'report.assistanceDesc' },
];

export default function ReportScreen() {
  const { submitReport } = useAppContext();
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('report.title')}</Text>
        <Text style={styles.subtitle}>{t('report.subtitle')}</Text>
      </View>

      {!confirming && (
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <Pressable key={cat.key} style={styles.card} onPress={() => handleSelect(cat.key)}>
              <Text style={styles.cardIcon}>{cat.icon}</Text>
              <Text style={styles.cardLabel}>{t(cat.labelKey)}</Text>
              <Text style={styles.cardDesc}>{t(cat.descKey)}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {confirming && !submitted && (
        <View style={styles.confirmCard}>
          <Text style={styles.confirmIcon}>{selectedCat?.icon}</Text>
          <Text style={styles.confirmTitle}>{selectedCat ? t(selectedCat.labelKey) : ''}</Text>
          <Text style={styles.confirmText}>{t('report.confirmTitle')}</Text>
          <View style={styles.confirmActions}>
            <Pressable style={[styles.btn, styles.btnDanger]} onPress={handleConfirm}>
              <Text style={styles.btnDangerText}>{t('report.confirmSend')}</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={handleCancel}>
              <Text style={styles.btnGhostText}>{t('cancel')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {submitted && (
        <View style={styles.success}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>{t('report.successTitle')}</Text>
          <Text style={styles.successDesc}>{t('report.successDesc')}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.infoText}>🔒 {t('report.privacyNote')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: Spacing.lg, paddingBottom: 100 },
  header: { marginBottom: 28 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    width: '47%',
    alignItems: 'center',
    gap: 10,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
  },
  cardIcon: { fontSize: 40 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  cardDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 16, textAlign: 'center' },
  confirmCard: {
    alignItems: 'center',
    padding: 32,
    paddingHorizontal: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.xl,
  },
  confirmIcon: { fontSize: 56, marginBottom: 16 },
  confirmTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  confirmText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 21,
    textAlign: 'center',
  },
  confirmActions: { width: '100%', gap: 10 },
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  btnDanger: { backgroundColor: Colors.danger },
  btnDangerText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnGhostText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '700' },
  success: { alignItems: 'center', paddingVertical: 48 },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 22, color: Colors.safe, fontWeight: '800', marginBottom: 8 },
  successDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  info: {
    marginTop: 32,
    padding: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoText: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
});
