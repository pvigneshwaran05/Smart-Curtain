import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  StatusBar, Dimensions, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Enum for Curtain Status
enum CurtainStatus {
  FULLY_OPENED = 'Fully\nOpened',
  PARTIALLY_OPEN = 'Partially\nOpen',
  CLOSED = 'Closed'
}

// Commands to send to Arduino
const COMMANDS = {
  [CurtainStatus.FULLY_OPENED]: 'OPEN',
  [CurtainStatus.PARTIALLY_OPEN]: 'PARTIAL',
  [CurtainStatus.CLOSED]: 'CLOSE'
};

// Color mapping for status
const STATUS_COLORS = {
  [CurtainStatus.FULLY_OPENED]: {
    start: '#4CAF50',
    end: '#81C784'
  },
  [CurtainStatus.PARTIALLY_OPEN]: {
    start: '#FFC107',
    end: '#FFD54F'
  },
  [CurtainStatus.CLOSED]: {
    start: '#F44336',
    end: '#EF5350'
  }
};

const { width } = Dimensions.get('window');

// Replace with your proxy server address
const PROXY_SERVER_URL = 'ws://192.168.159.170:8080';

const CurtainControlDashboard: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<CurtainStatus>(CurtainStatus.CLOSED);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [availablePorts, setAvailablePorts] = useState<string[]>([]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);

  // Initialize WebSocket connection
  const connectToServer = () => {
    try {
      setConnecting(true);
      
      const ws = new WebSocket(PROXY_SERVER_URL);
      
      ws.onopen = () => {
        console.log('Connected to proxy server');
        // Request available serial ports
        ws.send(JSON.stringify({ action: 'listPorts' }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received:', data);
        
        if (data.action === 'portList') {
          setAvailablePorts(data.ports);
        } else if (data.action === 'connected') {
          setIsConnected(true);
          setSelectedPort(data.port);
          setConnecting(false);
          // Request current status
          ws.send(JSON.stringify({ action: 'send', data: 'GET_STATUS' }));
        } else if (data.action === 'disconnected') {
          setIsConnected(false);
          setSelectedPort(null);
        } else if (data.action === 'data') {
          handleIncomingData(data.data);
        } else if (data.action === 'error') {
          Alert.alert('Error', data.message);
          setConnecting(false);
        }
      };
      
      ws.onclose = () => {
        console.log('Disconnected from proxy server');
        setIsConnected(false);
        setSelectedPort(null);
        setWebsocket(null);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        Alert.alert('Connection Error', 'Failed to connect to proxy server');
        setConnecting(false);
      };
      
      setWebsocket(ws);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      Alert.alert('Connection Error', 'Failed to connect to proxy server');
      setConnecting(false);
    }
  };

  // Handle incoming data from Arduino
  const handleIncomingData = (data: string) => {
    console.log('Received data:', data);
    
    if (data.includes('STATUS:OPEN')) {
      setCurrentStatus(CurtainStatus.FULLY_OPENED);
    } else if (data.includes('STATUS:PARTIAL')) {
      setCurrentStatus(CurtainStatus.PARTIALLY_OPEN);
    } else if (data.includes('STATUS:CLOSE')) {
      setCurrentStatus(CurtainStatus.CLOSED);
    }
  };

  // Connect to a specific serial port
  const connectToPort = (port: string) => {
    if (websocket) {
      setConnecting(true);
      websocket.send(JSON.stringify({ 
        action: 'connect', 
        port: port,
        baudRate: 9600 // Adjust according to your Arduino settings
      }));
    }
  };

  // Disconnect from serial port
  const disconnectPort = () => {
    if (websocket) {
      websocket.send(JSON.stringify({ action: 'disconnect' }));
    }
  };

  // Send command to Arduino
  const sendCommand = (command: string) => {
    if (websocket && isConnected) {
      websocket.send(JSON.stringify({ 
        action: 'send', 
        data: command + '\n'
      }));
      console.log('Command sent:', command);
    }
  };

  // Update curtain status
  const updateCurtainStatus = (status: CurtainStatus) => {
    setCurrentStatus(status);
    
    if (isConnected) {
      sendCommand(COMMANDS[status]);
    } else {
      Alert.alert('Not Connected', 'Please connect to Arduino first');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [websocket]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#808080','black']}
        style={styles.backgroundGradient}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.contentContainer}>
            {/* Connection Status */}
            <View style={styles.connectionContainer}>
              <Text style={styles.connectionTitle}>
                {isConnected 
                  ? `Connected to: ${selectedPort || 'Arduino'}` 
                  : 'Not Connected'}
              </Text>
              
              {isConnected ? (
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={disconnectPort}
                >
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={connectToServer}
                  disabled={connecting || websocket !== null}
                >
                  {connecting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.scanButtonText}>
                      {websocket ? 'Refresh Ports' : 'Connect to Server'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Serial Ports List */}
            {!isConnected && websocket && (
              <View style={styles.deviceListContainer}>
                <Text style={styles.deviceListTitle}>Available Serial Ports</Text>
                {availablePorts.length > 0 ? (
                  availablePorts.map((port) => (
                    <TouchableOpacity
                      key={port}
                      style={styles.deviceItem}
                      onPress={() => connectToPort(port)}
                      disabled={connecting}
                    >
                      <Text style={styles.deviceName}>{port}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noDevicesText}>No serial ports found</Text>
                )}
              </View>
            )}

            {/* Current Status Dashboard */}
            <View style={styles.dashboardContainer}>
              <Text style={styles.dashboardTitle}>Curtain Status</Text>
              <LinearGradient
                colors={[
                  STATUS_COLORS[currentStatus].start, 
                  STATUS_COLORS[currentStatus].end
                ]}
                style={styles.statusDisplay}
              >
                <Text style={styles.statusText}>{currentStatus.replace('\n', ' ')}</Text>
              </LinearGradient>
            </View>

            {/* Status Control Section */}
            <View style={styles.controlContainer}>
              <Text style={styles.controlTitle}>Set Curtain Status</Text>
              <View style={styles.buttonContainer}>
                {Object.values(CurtainStatus).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      currentStatus === status && styles.activeButton
                    ]}
                    onPress={() => updateCurtainStatus(status as CurtainStatus)}
                    disabled={!isConnected}
                  >
                    <LinearGradient
                      colors={[
                        STATUS_COLORS[status as CurtainStatus].start, 
                        STATUS_COLORS[status as CurtainStatus].end
                      ]}
                      style={[
                        styles.buttonGradient,
                        !isConnected && styles.disabledButton
                      ]}
                    >
                      <Text style={styles.buttonText} numberOfLines={2} adjustsFontSizeToFit>
                        {status}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  contentContainer: {
    width: width * 0.9,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  connectionContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  disconnectButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: 'white',
    fontSize: 14,
  },
  deviceListContainer: {
    width: '100%',
    marginBottom: 20,
  },
  deviceListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  deviceItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceAddress: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  noDevicesText: {
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dashboardContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusDisplay: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  controlContainer: {
    width: '100%',
    alignItems: 'center',
  },
  controlTitle: {
    fontSize: 22,
    color: 'white',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statusButton: {
    width: '30%',
    borderRadius: 10,
    overflow: 'hidden',
    height: 100,
  },
  activeButton: {
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonGradient: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

export default CurtainControlDashboard;