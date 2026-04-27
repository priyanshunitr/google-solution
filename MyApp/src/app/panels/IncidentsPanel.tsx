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

export function IncidentsPanel() {
  const [incidentId, setIncidentId] = useState('');
  const [toStatus, setToStatus] = useState('acknowledged');
  const [reason, setReason] = useState(
    'Field team updated the incident status.',
  );
  const [result, setResult] = useState('');

  const loadIncidents = async () => {
    try {
      const response = await backend.getIncidents();
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const updateStatus = async () => {
    const target = nonEmpty(incidentId);

    if (!target) {
      return;
    }

    try {
      const response = await backend.updateIncidentStatus(target, {
        to_status: toStatus,
        reason: nonEmpty(reason),
      });
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <SectionTitle
          title="Incident Control"
          subtitle="Track live incidents and update response state"
        />
        <SmallChip text="/api/incidents" accent />

        <PillButton title="Load Incidents" onPress={loadIncidents} />

        <Label text="Incident Id" />
        <Input
          value={incidentId}
          onChangeText={setIncidentId}
          placeholder="UUID"
        />

        <Label text="To Status" />
        <Input
          value={toStatus}
          onChangeText={setToStatus}
          placeholder="acknowledged | responding | resolved | cancelled"
        />

        <Label text="Reason" />
        <Input
          value={reason}
          onChangeText={setReason}
          placeholder="Status change reason"
          multiline
        />

        <PillButton title="Update Status" onPress={updateStatus} />
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
