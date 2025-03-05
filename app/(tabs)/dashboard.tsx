import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Enum for Curtain Status
enum CurtainStatus {
  FULLY_OPENED = 'Fully\nOpened',
  PARTIALLY_OPEN = 'Partially\nOpen',
  CLOSED = 'Closed'
}

// Color mapping for status
const STATUS_COLORS = {
  [CurtainStatus.FULLY_OPENED]: {
    start: '#4CAF50',   // Green
    end: '#81C784'
  },
  [CurtainStatus.PARTIALLY_OPEN]: {
    start: '#FFC107',   // Yellow
    end: '#FFD54F'
  },
  [CurtainStatus.CLOSED]: {
    start: '#F44336',   // Red
    end: '#EF5350'
  }
};

const { width, height } = Dimensions.get('window');

const CurtainControlDashboard: React.FC = () => {
  // State to track current curtain status
  const [currentStatus, setCurrentStatus] = useState<CurtainStatus>(CurtainStatus.CLOSED);

  // Function to handle status change
  const updateCurtainStatus = (status: CurtainStatus) => {
    setCurrentStatus(status);
    
    // Placeholder for future IoT integration
    console.log(`Updating curtain status to: ${status}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#808080','black']}
        style={styles.backgroundGradient}
      >
        <View style={styles.contentContainer}>
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
                >
                  <LinearGradient
                    colors={[
                      STATUS_COLORS[status as CurtainStatus].start, 
                      STATUS_COLORS[status as CurtainStatus].end
                    ]}
                    style={styles.buttonGradient}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: width * 0.9,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
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
    height: 100, // Fixed height for all buttons
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