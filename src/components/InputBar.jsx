import React, { useRef } from 'react'; // 1. Add useRef
import { StyleSheet, View, Text, TextInput, TouchableHighlight } from 'react-native';

export default function InputBar({ text, onChangeText, onSizeChange, onSendPressed }) {
    const inputRef = useRef(null); // 2. Create the ref

    return (
        <View style={styles.inputBar}>
            <TextInput 
                style={styles.textBox}
                ref={inputRef} // 3. Assign the ref correctly
                multiline={true}
                onChangeText={(text) => onChangeText(text)}
                onContentSizeChange={onSizeChange}
                value={text} 
            />
            <TouchableHighlight 
                style={styles.sendButton} 
                onPress={() => onSendPressed()}
            >
                <Text style={{ color: 'white' }}>Send</Text>
            </TouchableHighlight>
        </View>
    );
}

const styles = StyleSheet.create({
    inputBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        paddingVertical: 3,
        backgroundColor: '#f9f9f9' // Optional: adds visibility
    },
    textBox: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'gray',
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 10,
        backgroundColor: 'white'
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 15,
        marginLeft: 5,
        paddingRight: 15,
        borderRadius: 5,
        backgroundColor: '#66db30'
    },
});
