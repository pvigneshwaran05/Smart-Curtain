import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

const ThingSpeakDashboard = () => {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ textAlign: 'center', fontSize: 20, marginTop: 20 }}>📊 ThingSpeak Dashboard</Text>
      <WebView source={{ uri: "https://thingspeak.com/channels/YOUR_CHANNEL_ID" }} style={{ flex: 1 }} />
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
};

export default ThingSpeakDashboard;
