import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MailStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MailStackParamList, 'Compose'>;

export function ComposeScreen({ route, navigation }: Props): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  // Pre-fill from route params (for reply/forward)
  const initialTo = route.params?.to ?? '';
  const initialSubject = route.params?.subject ?? '';
  const initialBody = route.params?.body ?? '';

  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [isSending, setIsSending] = useState(false);

  const colors = {
    background: isDarkMode ? '#000000' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#8e8e93' : '#6e6e73',
    card: isDarkMode ? '#1c1c1e' : '#f2f2f7',
    border: isDarkMode ? '#38383a' : '#e5e5ea',
    primary: '#007AFF',
    placeholder: isDarkMode ? '#636366' : '#c7c7cc',
  };

  const handleClose = useCallback(() => {
    if (to || subject || body) {
      Alert.alert(
        'Discard Draft?',
        'Are you sure you want to discard this email?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [navigation, to, subject, body]);

  const handleSend = useCallback(async () => {
    if (!to.trim()) {
      Alert.alert('Missing Recipient', 'Please enter a recipient address.');
      return;
    }

    if (!subject.trim() && !body.trim()) {
      Alert.alert('Empty Email', 'Please enter a subject or message.');
      return;
    }

    setIsSending(true);

    try {
      // TODO: Implement actual send via API
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));

      // Success - go back
      navigation.goBack();
    } catch {
      Alert.alert('Send Failed', 'Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [to, subject, body, navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: colors.primary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            New Message
          </Text>
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              (!to.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            disabled={!to.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text
                style={[
                  styles.sendText,
                  { color: colors.primary },
                  !to.trim() && styles.sendTextDisabled,
                ]}
              >
                Send
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          {/* To Field */}
          <View style={[styles.fieldContainer, { borderBottomColor: colors.border }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              To:
            </Text>
            <TextInput
              style={[styles.fieldInput, { color: colors.text }]}
              value={to}
              onChangeText={setTo}
              placeholder="recipient.eth or address"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Subject Field */}
          <View style={[styles.fieldContainer, { borderBottomColor: colors.border }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Subject:
            </Text>
            <TextInput
              style={[styles.fieldInput, { color: colors.text }]}
              value={subject}
              onChangeText={setSubject}
              placeholder="Subject"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          {/* Body */}
          <TextInput
            style={[styles.bodyInput, { color: colors.text }]}
            value={body}
            onChangeText={setBody}
            placeholder="Write your message..."
            placeholderTextColor={colors.placeholder}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 17,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  sendButton: {
    padding: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    fontSize: 17,
    fontWeight: '600',
  },
  sendTextDisabled: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  fieldLabel: {
    fontSize: 16,
    width: 70,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  bodyInput: {
    flex: 1,
    fontSize: 16,
    padding: 16,
    minHeight: 300,
  },
});
