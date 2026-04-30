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

export function EmergencySessionsPanel() {
  const [severity, setSeverity] = useState('high');
  const [title, setTitle] = useState('Operational emergency');
  const [message, setMessage] = useState(
    'Emergency declared, response teams mobilizing.',
  );
  const [instructions, setInstructions] = useState(
    'Follow safety instructions and wait for staff guidance.',
  );
  const [sessionId, setSessionId] = useState('');
  const [result, setResult] = useState('');

  const listSessions = async () => {
    try {
      const response = await backend.getEmergencies();
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const createSession = async () => {
    try {
      const response = await backend.createEmergency({
        severity: severity as 'low' | 'medium' | 'high' | 'critical',
        title,
        message,
        instructions: nonEmpty(instructions),
      });
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const activate = async () => {
    if (!sessionId.trim()) {
      return;
    }

    try {
      const response = await backend.activateEmergency(sessionId.trim());
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const resolve = async () => {
    if (!sessionId.trim()) {
      return;
    }

    try {
      const response = await backend.resolveEmergency(sessionId.trim());
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <SectionTitle
          title="Emergency Session Management"
          subtitle="Create, activate, and resolve global emergency states"
        />
        <SmallChip text="/api/emergencies" accent />

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
          placeholder="Session title"
        />

        <Label text="Message" />
        <Input
          value={message}
          onChangeText={setMessage}
          placeholder="Public message"
          multiline
        />

        <Label text="Instructions" />
        <Input
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Response instructions"
          multiline
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <PillButton title="Create" onPress={createSession} />
          </View>
          <View style={{ flex: 1 }}>
            <PillButton title="List" onPress={listSessions} variant="ghost" />
          </View>
        </View>

        <Label text="Session Id" />
        <Input
          value={sessionId}
          onChangeText={setSessionId}
          placeholder="UUID"
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <PillButton title="Activate" onPress={activate} />
          </View>
          <View style={{ flex: 1 }}>
            <PillButton title="Resolve" onPress={resolve} variant="danger" />
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
