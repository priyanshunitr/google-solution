import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { backend, NotificationItem } from '../../api/backend';
import {
  Card,
  CodeBlock,
  Input,
  Label,
  PillButton,
  SectionTitle,
  SmallChip,
} from '../../components/Primitives';
import { prettyJson } from '../../utils/format';

export function StaffNotificationsPanel() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [targetId, setTargetId] = useState('');
  const [issueText, setIssueText] = useState(
    'Verified incident and escalating to emergency services.',
  );
  const [result, setResult] = useState('');

  const loadNotifications = async () => {
    try {
      const response = await backend.getStaffNotifications();
      setNotifications(response.notifications || []);
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const markSeen = async () => {
    if (!targetId.trim()) {
      return;
    }

    try {
      const response = await backend.markStaffNotificationSeen(targetId.trim());
      setResult(prettyJson(response));
      await loadNotifications();
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const markFalse = async () => {
    if (!targetId.trim()) {
      return;
    }

    try {
      const response = await backend.markStaffNotificationFalse(
        targetId.trim(),
      );
      setResult(prettyJson(response));
      await loadNotifications();
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const sendEmergency = async () => {
    if (!targetId.trim()) {
      return;
    }

    try {
      const response = await backend.escalateStaffNotification(
        targetId.trim(),
        issueText,
      );
      setResult(prettyJson(response));
      await loadNotifications();
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <SectionTitle
          title="Staff Notification Console"
          subtitle="Review, verify, and escalate incoming distress events"
        />
        <SmallChip text="/api/staffs/notifications" accent />

        <PillButton title="Load Notifications" onPress={loadNotifications} />

        <Label text="Notification Id" />
        <Input value={targetId} onChangeText={setTargetId} placeholder="UUID" />

        <Label text="Escalation reason" />
        <Input
          value={issueText}
          onChangeText={setIssueText}
          placeholder="Issue description for emergency services"
          multiline
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <PillButton title="Mark Seen" onPress={markSeen} variant="ghost" />
          </View>
          <View style={{ flex: 1 }}>
            <PillButton
              title="False Alarm"
              onPress={markFalse}
              variant="ghost"
            />
          </View>
        </View>

        <PillButton title="Send To Emergency" onPress={sendEmergency} />
      </Card>

      {notifications.slice(0, 5).map(item => (
        <Card key={item.id} dark>
          <Text style={{ color: '#f4f5f6', fontWeight: '700' }}>
            {item.title || 'Notification'}
          </Text>
          <Text style={{ color: '#d0d3da' }}>{item.body}</Text>
          <Text style={{ color: '#9ca2b0', fontSize: 12 }}>
            {item.id} • {item.status}
          </Text>
        </Card>
      ))}

      {!!result && (
        <Card dark>
          <Text style={{ color: '#f4f5f6', fontWeight: '700' }}>
            Backend Response
          </Text>
          <CodeBlock text={result} />
        </Card>
      )}
    </View>
  );
}
