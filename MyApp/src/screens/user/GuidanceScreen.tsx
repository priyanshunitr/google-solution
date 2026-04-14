import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { EMERGENCY_TYPE_INFO } from '../../data/mockEmergencies';
import { Colors, Radii, Spacing } from '../../theme/colors';

export default function GuidanceScreen() {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const emergency = state.activeEmergency;

  // Fallback: if no active emergency, show recovery UI instead of blank screen
  if (!emergency) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackIcon}>🛡️</Text>
        <Text style={styles.fallbackTitle}>No Active Emergency</Text>
        <Text style={styles.fallbackDesc}>
          There are no active emergency instructions to display.
        </Text>
        <Pressable
          style={styles.fallbackBtn}
          onPress={() => dispatch({ type: 'RETURN_TO_NORMAL' })}
        >
          <Text style={styles.fallbackBtnText}>🏠 Return Home</Text>
        </Pressable>
      </View>
    );
  }

  const typeInfo = EMERGENCY_TYPE_INFO[emergency.type];
  const doneCount = state.guidanceStepsCompleted.length;
  const totalCount = emergency.instructions.length;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const toggleStep = (index: number) => {
    dispatch({ type: 'TOGGLE_GUIDANCE_STEP', payload: index });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Top Bar */}
      <View style={styles.topbar}>
        <Pressable
          style={styles.back}
          onPress={() => dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'alert' })}
        >
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>
        <Pressable
          style={styles.safeBtn}
          onPress={() => dispatch({ type: 'RESOLVE_EMERGENCY' })}
        >
          <Text style={styles.safeBtnText}>{t('alert.iAmSafe')}</Text>
        </Pressable>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
        <View>
          <Text style={styles.subtitle}>{t('guidance.followSteps')}</Text>
          <Text style={styles.title}>{t(`emergency.${emergency.type}`)}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {t('guidance.stepsCompleted', { done: doneCount, total: totalCount })}
        </Text>
      </View>

      {/* Steps */}
      <View style={styles.steps}>
        {emergency.instructions.map((step, idx) => {
          const isDone = state.guidanceStepsCompleted.includes(idx);
          return (
            <Pressable
              key={idx}
              style={[styles.step, isDone && styles.stepDone]}
              onPress={() => toggleStep(idx)}
            >
              <View style={[styles.stepNumber, isDone && styles.stepNumberDone]}>
                <Text style={[styles.stepNumberText, isDone && styles.stepNumberTextDone]}>
                  {isDone ? '✓' : idx + 1}
                </Text>
              </View>
              <Text style={[styles.stepText, isDone && styles.stepTextDone]}>
                {step}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={styles.sosLink}
          onPress={() => dispatch({ type: 'SET_EMERGENCY_SUB_SCREEN', payload: 'sos' })}
        >
          <Text style={styles.sosLinkText}>🆘 {t('guidance.needHelp')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: Spacing.lg, paddingBottom: 40 },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  back: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  safeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(0, 184, 148, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.3)',
  },
  safeBtnText: { fontSize: 13, fontWeight: '700', color: Colors.safe },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  typeIcon: { fontSize: 36 },
  subtitle: { fontSize: 13, fontWeight: '600', color: Colors.danger },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  progress: { marginBottom: 24 },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surface2,
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.safe,
    borderRadius: Radii.full,
  },
  progressText: { fontSize: 12, color: Colors.textMuted },
  steps: { gap: 10 },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
  },
  stepDone: {
    backgroundColor: 'rgba(0, 184, 148, 0.06)',
    borderColor: 'rgba(0, 184, 148, 0.2)',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberDone: {
    backgroundColor: Colors.safe,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  stepNumberTextDone: {
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.text,
    paddingTop: 4,
  },
  stepTextDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  footer: { marginTop: 28, alignItems: 'center' },
  sosLink: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.2)',
    alignItems: 'center',
  },
  sosLinkText: { fontSize: 14, color: Colors.danger, fontWeight: '700' },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: Colors.bg,
  },
  fallbackIcon: { fontSize: 64, marginBottom: 20 },
  fallbackTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  fallbackDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 300,
  },
  fallbackBtn: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: Radii.lg,
    backgroundColor: Colors.safe,
  },
  fallbackBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
