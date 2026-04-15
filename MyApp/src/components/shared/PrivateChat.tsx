import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from 'react-native';
import { Colors, Radii, FontSizes } from '../../theme/colors';
import type { PrivateMessage } from '../../types/communication';

interface PrivateChatProps {
  messages: PrivateMessage[];
  onSend: (message: string) => void;
  currentRole: 'staff' | 'responder';
  otherRoleLabel?: string;
}

export default function PrivateChat({
  messages,
  onSend,
  currentRole,
  otherRoleLabel = 'Other',
}: PrivateChatProps) {
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const renderMessage = ({ item }: { item: PrivateMessage }) => {
    const isMine = item.senderRole === currentRole;
    const time = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          {!isMine && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
            {item.message}
          </Text>
          <Text style={[styles.timestamp, isMine && styles.timestampMine]}>{time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerDot} />
        <Text style={styles.headerTitle}>
          🔒 Private Channel — {otherRoleLabel}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptyHint}>
              Messages in this channel are private and not visible to users.
            </Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={`Message ${otherRoleLabel}...`}
          placeholderTextColor={Colors.textMuted}
          maxLength={500}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.surface2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B894',
  },
  headerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  messageList: {
    maxHeight: 300,
    minHeight: 120,
  },
  messageListContent: {
    padding: 12,
    paddingBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radii.md,
  },
  bubbleMine: {
    backgroundColor: Colors.primary + '30',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: Colors.surface2,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryLight,
    marginBottom: 2,
  },
  messageText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 18,
  },
  messageTextMine: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  timestampMine: {
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: Radii.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    color: Colors.text,
    fontSize: FontSizes.sm,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    fontSize: 16,
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  emptyHint: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
