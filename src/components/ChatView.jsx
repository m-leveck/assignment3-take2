import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Keyboard, Platform } from 'react-native';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import { handleInput } from '../Order';

export default function ChatView() {
  const [messages, setMessages] = useState([]);
  const [inputBarText, setInputBarText] = useState('');
  const scrollViewRef = useRef(null);

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 100);
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => scrollToBottom());
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => scrollToBottom());
    scrollToBottom(false);
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Removed onContentSizeChange from ScrollView — this alone handles scrolling
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (inputBarText.trim().length === 0) return;
    const newMessages = [{ direction: 'right', text: inputBarText }];
    const aResponse = handleInput(inputBarText);
    for (const message of aResponse) {
      newMessages.push({ direction: 'left', text: message });
    }
    setMessages(prev => [...prev, ...newMessages]); // Use functional update to avoid stale state
    setInputBarText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent} // Needed for padding + scroll behaviour
        keyboardShouldPersistTaps="handled"            // Tapping bubbles won't dismiss keyboard unexpectedly
      >
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            direction={msg.direction}
            text={msg.text}
          />
        ))}
      </ScrollView>

      <InputBar
        onSendPressed={sendMessage}
        onSizeChange={() => scrollToBottom(false)}
        onChangeText={setInputBarText}
        text={inputBarText}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: 'white',
  },

  messages: {
    flex: 1,
  },

  messagesContent: {
    padding: 16,        // Moved padding here so it applies inside the scroll area
    flexGrow: 1,        // Ensures content stretches to fill even when few messages
  },
});