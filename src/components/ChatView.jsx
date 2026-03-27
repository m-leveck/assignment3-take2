import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Keyboard, Platform } from 'react-native';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import { handleInput } from '../Order';

export default function ChatView(){
  const [messages, setMessages] = useState([]);
  const [inputBarText, setInputBarText] = useState('');
  const scrollViewRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = (animated = true) => {
    // Small timeout ensures the layout has calculated before scrolling
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 100);
  };

  useEffect(() => {
    // Setup keyboard listeners
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => scrollToBottom());
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => scrollToBottom());

    // Initial scroll
    scrollToBottom(false);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Scroll whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (inputBarText.trim().length === 0) return;

    // Correct way to update state: create a NEW array
    let newMessages = [{ direction: 'right', text: inputBarText }];
    const aResponse = handleInput(inputBarText);
    for(const message of aResponse){
      newMessages.push({direction: "left", text: message});
    }
    setMessages([...messages, ...newMessages]);
    setInputBarText('');
  };

  return (
    <View style={styles.outer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollViewRef} 
          style={styles.messages}
          onContentSizeChange={() => scrollToBottom()} // Auto-scrolls when new content arrives
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
    </View>
  );
};

//TODO: separate these out. This is what happens when you're in a hurry!
const styles = StyleSheet.create({

  //ChatView

  outer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'white'
  },

  messages: {
    flex: 1
  },

})