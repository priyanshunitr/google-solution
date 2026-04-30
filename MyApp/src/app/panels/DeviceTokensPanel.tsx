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

export function DeviceTokensPanel() {
  const [tokenId, setTokenId] = useState('');
  const [platform, setPlatform] = useState('android');
  const [pushToken, setPushToken] = useState('demo-token-123');
  const [deviceLabel, setDeviceLabel] = useState('Front Desk Tablet');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [result, setResult] = useState('');

  const loadTokens = async () => {
    try {
      const response = await backend.getDeviceTokens();
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const registerToken = async () => {
    try {
      const response = await backend.registerDeviceToken({
        platform: platform as 'android' | 'ios' | 'web',
        push_token: pushToken,
        device_label: nonEmpty(deviceLabel),
        app_version: nonEmpty(appVersion),
        last_seen_at: toIsoNow(),
      });
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const updateToken = async () => {
    const id = nonEmpty(tokenId);

    if (!id) {
      return;
    }

    try {
      const response = await backend.updateDeviceToken(id, {
        device_label: nonEmpty(deviceLabel),
        app_version: nonEmpty(appVersion),
        is_active: true,
        last_seen_at: toIsoNow(),
      });
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  const deactivateToken = async () => {
    const id = nonEmpty(tokenId);

    if (!id) {
      return;
    }

    try {
      const response = await backend.deactivateDeviceToken(id);
      setResult(prettyJson(response));
    } catch (error: unknown) {
      setResult(prettyJson(error));
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <SectionTitle
          title="Device Push Tokens"
          subtitle="Register/update active device channels for notification delivery"
        />
        <SmallChip text="/api/devices/tokens" accent />

        <Label text="Platform" />
        <Input
          value={platform}
          onChangeText={setPlatform}
          placeholder="android | ios | web"
        />

        <Label text="Push token" />
        <Input
          value={pushToken}
          onChangeText={setPushToken}
          placeholder="Provider token"
        />

        <Label text="Device label" />
        <Input
          value={deviceLabel}
          onChangeText={setDeviceLabel}
          placeholder="Human readable label"
        />

        <Label text="App version" />
        <Input
          value={appVersion}
          onChangeText={setAppVersion}
          placeholder="App version"
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <PillButton title="Register" onPress={registerToken} />
          </View>
          <View style={{ flex: 1 }}>
            <PillButton title="List" onPress={loadTokens} variant="ghost" />
          </View>
        </View>

        <Label text="Token Id for update/deactivate" />
        <Input value={tokenId} onChangeText={setTokenId} placeholder="UUID" />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <PillButton title="Update" onPress={updateToken} variant="ghost" />
          </View>
          <View style={{ flex: 1 }}>
            <PillButton
              title="Deactivate"
              onPress={deactivateToken}
              variant="danger"
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
