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

export function CommunicationsPanel({
  role,
}: {
  role: 'guest' | 'staff' | 'responder' | 'admin';
}) {
  const [broadcastBody, setBroadcastBody] = useState(
    'Please remain calm. Response teams are active.',
  );
  const [broadcastId, setBroadcastId] = useState('');
  const [privateBody, setPrivateBody] = useState(
    'Proceed to checkpoint alpha.',
  );
  const [recipientId, setRecipientId] = useState('');
  const [channel, setChannel] = useState('direct');
  const [result, setResult] = useState('');

  const loadBroadcasts = async () => {
    try {
      const response = await backend.getBroadcasts();
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const sendBroadcast = async () => {
    try {
      const response = await backend.sendBroadcast({
        body: broadcastBody,
        sender_kind: role === 'responder' ? 'responder' : 'staff',
      });
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const markRead = async () => {
    const id = nonEmpty(broadcastId);

    if (!id) {
      return;
    }

    try {
      const response = await backend.markBroadcastRead(id);
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const loadPrivate = async () => {
    try {
      const response = await backend.getPrivateMessages();
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const sendPrivate = async () => {
    try {
      const response = await backend.sendPrivateMessage({
        body: privateBody,
        recipient_user_id:
          channel === 'direct' ? nonEmpty(recipientId) : undefined,
        channel: channel as 'direct' | 'staff_responder',
      });
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const canBroadcast = role !== 'guest';

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <SectionTitle
          title="Broadcast Channel"
          subtitle="Public announcements with read receipts"
        />
        <SmallChip text="/api/comms/broadcast" accent />

        <Label text="Broadcast body" />
        <Input
          value={broadcastBody}
          onChangeText={setBroadcastBody}
          placeholder="Message"
          multiline
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <PillButton title="Load" onPress={loadBroadcasts} variant="ghost" />
          </View>
          <View style={{ flex: 1 }}>
            <PillButton
              title={canBroadcast ? 'Send Broadcast' : 'Guest View Only'}
              onPress={canBroadcast ? sendBroadcast : loadBroadcasts}
              variant={canBroadcast ? 'primary' : 'ghost'}
            />
          </View>
        </View>

        <Label text="Broadcast Id to mark read" />
        <Input
          value={broadcastId}
          onChangeText={setBroadcastId}
          placeholder="UUID"
        />
        <PillButton title="Mark Read" onPress={markRead} variant="ghost" />
      </Card>

      <Card>
        <SectionTitle
          title="Private Channel"
          subtitle="Direct chat or staff_responder channel"
        />
        <SmallChip text="/api/comms/private" accent />

        <Label text="Channel" />
        <Input
          value={channel}
          onChangeText={setChannel}
          placeholder="direct | staff_responder"
        />

        <Label text="Recipient user id (only for direct)" />
        <Input
          value={recipientId}
          onChangeText={setRecipientId}
          placeholder="UUID"
        />

        <Label text="Message" />
        <Input
          value={privateBody}
          onChangeText={setPrivateBody}
          placeholder="Message"
          multiline
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <PillButton title="Load" onPress={loadPrivate} variant="ghost" />
          </View>
          <View style={{ flex: 1 }}>
            <PillButton title="Send" onPress={sendPrivate} />
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
