import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { backend } from '../../api/backend';
import {
  Card,
  CodeBlock,
  Input,
  Label,
  PillButton,
  SectionTitle,
  SmallChip,
} from '../../components/Primitives';
import { nonEmpty, prettyJson } from '../../utils/format';

export function ResponderPanel() {
  const [incidentId, setIncidentId] = useState('');
  const [toStatus, setToStatus] = useState('responding');
  const [reason, setReason] = useState(
    'Responder team acknowledged and moving to site.',
  );
  const [notificationId, setNotificationId] = useState('');
  const [result, setResult] = useState('');

  const loadResponderIncidents = async () => {
    try {
      const response = await backend.getResponderIncidents();
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const updateResponderIncident = async () => {
    const id = nonEmpty(incidentId);

    if (!id) {
      return;
    }

    try {
      const response = await backend.updateResponderIncidentStatus(id, {
        to_status: toStatus,
        reason: nonEmpty(reason),
      });
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await backend.getResponderNotifications();
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const markSeen = async () => {
    const id = nonEmpty(notificationId);

    if (!id) {
      return;
    }

    try {
      const response = await backend.markResponderNotificationSeen(id);
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <SectionTitle
          title="Responder Operations"
          subtitle="Receive escalations and drive incident status updates"
        />
        <SmallChip text="/api/responders" accent />

        <PillButton
          title="Load Responder Incidents"
          onPress={loadResponderIncidents}
        />

        <Label text="Incident id" />
        <Input
          value={incidentId}
          onChangeText={setIncidentId}
          placeholder="UUID"
        />

        <Label text="To status" />
        <Input
          value={toStatus}
          onChangeText={setToStatus}
          placeholder="acknowledged | responding | resolved | cancelled"
        />

        <Label text="Reason" />
        <Input
          value={reason}
          onChangeText={setReason}
          placeholder="Reason"
          multiline
        />

        <PillButton title="Update Incident" onPress={updateResponderIncident} />
      </Card>

      <Card>
        <SectionTitle
          title="Responder Notifications"
          subtitle="Mark events as seen once actioned"
        />

        <PillButton
          title="Load Notifications"
          onPress={loadNotifications}
          variant="ghost"
        />

        <Label text="Notification id" />
        <Input
          value={notificationId}
          onChangeText={setNotificationId}
          placeholder="UUID"
        />

        <PillButton title="Mark Seen" onPress={markSeen} variant="ghost" />
      </Card>

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
