import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { palette, radii, spacing, typography } from '../theme/tokens';
import {
  SegmentControl,
  Input,
  Label,
  PillButton,
  Card,
} from '../components/Primitives';
import { UserRole } from '../types/app';

export function AuthScreen() {
  const { login, signup, loading, error } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('Rocky Staff');
  const [phone, setPhone] = useState('+15550000002');
  const [email, setEmail] = useState('staff.one@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('staff');

  const submit = async () => {
    if (mode === 'login') {
      await login(phone.trim(), password);
      return;
    }

    await signup({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      password,
      role,
    });
  };

  return (
    <View style={styles.backdrop}>
      <View style={styles.frame}>
        <Text style={styles.brand}>CrisisSync</Text>
        <Text style={styles.subtitle}>
          Realtime emergency coordination for hospitality operations
        </Text>

        <Card>
          <SegmentControl
            value={mode}
            onChange={next => setMode(next as 'login' | 'signup')}
            options={[
              { label: 'Login', value: 'login' },
              { label: 'Sign Up', value: 'signup' },
            ]}
          />

          {mode === 'signup' ? (
            <>
              <Label text="Full name" />
              <Input value={name} onChangeText={setName} placeholder="Name" />
            </>
          ) : null}

          <Label text="Phone" />
          <Input value={phone} onChangeText={setPhone} placeholder="Phone" />

          {mode === 'signup' ? (
            <>
              <Label text="Email" />
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
              />

              <Label text="Role" />
              <Input
                value={role}
                onChangeText={next => setRole(next as UserRole)}
                placeholder="guest | staff | responder | admin"
              />
            </>
          ) : null}

          <Label text="Password" />
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
          />

          <PillButton
            title={
              loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Enter Control Room'
                : 'Create Account'
            }
            onPress={submit}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: palette.backdrop,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  frame: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: palette.ink,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: palette.inkMuted,
    fontSize: typography.body,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  error: {
    color: palette.danger,
    fontWeight: '700',
  },
});
