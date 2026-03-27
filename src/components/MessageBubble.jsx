import { StyleSheet, View, Text } from 'react-native';

//The bubbles that appear on the left or the right for the messages.
export default function MessageBubble({direction, text}) {

    //These spacers make the message bubble stay to the left or the right, depending on who is speaking, even if the message is multiple lines.
    var leftSpacer = direction === 'left' ? null : <View style={{width: 70}}/>;
    var rightSpacer = direction === 'left' ? <View style={{width: 70}}/> : null;

    var bubbleStyles = direction === 'left' ? [styles.messageBubble, styles.messageBubbleLeft] : [styles.messageBubble, styles.messageBubbleRight];

    var bubbleTextStyle = direction === 'left' ? styles.messageBubbleTextLeft : styles.messageBubbleTextRight;

    return (
        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            {leftSpacer}
            <View style={bubbleStyles}>
              <Text style={bubbleTextStyle}>
                {text}
              </Text>
            </View>
            {rightSpacer}
          </View>
      );
  }

  const styles = StyleSheet.create({
//MessageBubble

  messageBubble: {
      borderRadius: 5,
      marginTop: 8,
      marginRight: 10,
      marginLeft: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      flexDirection:'row',
      flex: 1
  },

  messageBubbleLeft: {
    backgroundColor: '#d5d8d4',
  },

  messageBubbleTextLeft: {
    color: 'black'
  },

  messageBubbleRight: {
    backgroundColor: '#66db30'
  },

  messageBubbleTextRight: {
    color: 'white'
  },    
  })