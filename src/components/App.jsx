import {
  View,
} from 'react-native';

import Loyalty from "./Loyalty"
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'; // Import this
import { PaperProvider } from 'react-native-paper';
export default function () {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Loyalty />
        </SafeAreaView>
      </PaperProvider></SafeAreaProvider>
  );
}