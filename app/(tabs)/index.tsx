import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios';

const THINGSPEAK_WRITE_API = "FMVM6FVPKADC1649"; // Replace with your Write API key

const ThingSpeakTest = () => {
  const [message, setMessage] = useState('');

  const sendDataToThingSpeak = async () => {
    try {
      const response = await axios.get(
        `https://api.thingspeak.com/update?api_key=${THINGSPEAK_WRITE_API}&field1=100`
      );
      console.log("✅ ThingSpeak Response:", response.data);
      if (response.data > 0) {
        setMessage("✅ Data sent successfully!");
      } else {
        setMessage("⚠️ ThingSpeak did not update.");
      }
    } catch (error) {
      console.error("❌ Error sending data:", error);
      setMessage("❌ Failed to send data.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Test ThingSpeak Data Sending</Text>
      <Button title="Send Test Data" onPress={sendDataToThingSpeak} />
      <Text>{message}</Text>

      
    </View>
  );
};

export default ThingSpeakTest;
