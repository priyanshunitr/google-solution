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
import { nonEmpty, prettyJson, toIsoNow } from '../../utils/format';

export function GuestPanel() {
  const [sessionId, setSessionId] = useState('');
  const [severity, setSeverity] = useState('critical');
  const [title, setTitle] = useState('Need immediate help');
  const [description, setDescription] = useState(
    'Guest feels unsafe in corridor B',
  );
  const [locationText, setLocationText] = useState('Floor 2, Corridor B');

  const [sosMessage, setSosMessage] = useState('SOS from room area');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [result, setResult] = useState('');

  const createAlert = async () => {
    try {
      const response = await backend.createGuestAlert({
        emergency_session_id: nonEmpty(sessionId),
        severity: severity as 'low' | 'medium' | 'high' | 'critical',
        title,
        description,
        location_text: nonEmpty(locationText),
      });
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const sendSos = async () => {
    try {
      const response = await backend.createSos({
        emergency_session_id: nonEmpty(sessionId),
        message: nonEmpty(sosMessage),
        latitude: nonEmpty(latitude) ? Number(latitude) : undefined,
        longitude: nonEmpty(longitude) ? Number(longitude) : undefined,
        location_captured_at: toIsoNow(),
      });
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const loadMyAlerts = async () => {
    try {
      const response = await backend.getMyAlerts();
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <SectionTitle
          title="Guest Distress Reporting"
          subtitle="Create alert, send SOS, and track your alert timeline"
        />

        <SmallChip text="/api/guests" accent />
        <Label text="Emergency Session Id (optional)" />
        <Input
          value={sessionId}
          onChangeText={setSessionId}
          placeholder="UUID"
        />

        <Label text="Severity" />
        <Input
          value={severity}
          onChangeText={setSeverity}
          placeholder="low | medium | high | critical"
        />

        <Label text="Title" />
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="Alert title"
        />

        <Label text="Description" />
        <Input
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue"
          multiline
        />

        <Label text="Location text" />
        <Input
          value={locationText}
          onChangeText={setLocationText}
          placeholder="Floor, wing, room"
        />

        <PillButton title="Create Alert" onPress={createAlert} />
      </Card>

      <Card>
        <SectionTitle title="SOS" subtitle="One-tap critical escalation path" />

        <Label text="SOS message" />
        <Input
          value={sosMessage}
          onChangeText={setSosMessage}
          placeholder="Short message"
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Label text="Latitude" />
            <Input
              value={latitude}
              onChangeText={setLatitude}
              placeholder="e.g. 12.9716"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Label text="Longitude" />
            <Input
              value={longitude}
              onChangeText={setLongitude}
              placeholder="e.g. 77.5946"
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <PillButton title="Send SOS" onPress={sendSos} />
          </View>
          <View style={{ flex: 1 }}>
            <PillButton
              title="My Alerts"
              onPress={loadMyAlerts}
              variant="ghost"
            />
          </View>
        </View>
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
