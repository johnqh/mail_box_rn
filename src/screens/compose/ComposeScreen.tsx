import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ComposeScreenProps } from '../../navigation/types';

export const ComposeScreen: React.FC<ComposeScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation('common');
  const { action = 'compose', to = '', subject = '' } = route.params || {};

  const [toField, setToField] = useState(to);
  const [subjectField, setSubjectField] = useState(subject);
  const [bodyField, setBodyField] = useState('');

  const handleSend = () => {
    // TODO: Implement send via @sudobility/lib
    console.log('Send email:', { to: toField, subject: subjectField, body: bodyField });
    navigation.goBack();
  };

  const getTitle = () => {
    switch (action) {
      case 'reply':
        return t('mail.reply');
      case 'replyAll':
        return t('mail.replyAll');
      case 'forward':
        return t('mail.forward');
      default:
        return t('mail.compose');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButton}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{getTitle()}</Text>
          <TouchableOpacity onPress={handleSend}>
            <Text style={styles.sendButton}>Send</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={styles.label}>To:</Text>
            <TextInput
              style={styles.input}
              value={toField}
              onChangeText={setToField}
              placeholder="recipient@0xmail.box"
              placeholderTextColor="#999999"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.label}>Subject:</Text>
            <TextInput
              style={styles.input}
              value={subjectField}
              onChangeText={setSubjectField}
              placeholder="Email subject"
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.divider} />

          <TextInput
            style={styles.bodyInput}
            value={bodyField}
            onChangeText={setBodyField}
            placeholder="Write your message..."
            placeholderTextColor="#999999"
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelButton: {
    color: '#666666',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sendButton: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    color: '#666666',
    width: 70,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginHorizontal: 16,
  },
  bodyInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    padding: 16,
    minHeight: 200,
  },
});

export default ComposeScreen;
