import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  TextInput
} from 'react-native';

// Enum for Curtain Status
enum CurtainStatus {
  FULLY_OPENED = 'Fully Opened',
  PARTIALLY_OPEN = 'Partially Open',
  CLOSED = 'Closed'
}

const { width, height } = Dimensions.get('window');

const CurtainConfigurationPage: React.FC = () => {
  // State for configuration
  const [startTime, setStartTime] = useState<string>('09:00 AM');
  const [endTime, setEndTime] = useState<string>('06:00 PM');
  const [selectedStatus, setSelectedStatus] = useState<CurtainStatus>(CurtainStatus.FULLY_OPENED);
  const [lightIntensityThreshold, setLightIntensityThreshold] = useState<string>('50');
  const [isAutomaticMode, setIsAutomaticMode] = useState<boolean>(false);

  // Modal states
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
  const [isLightIntensityModalVisible, setIsLightIntensityModalVisible] = useState(false);
  const [currentTimeType, setCurrentTimeType] = useState<'start' | 'end'>('start');
  const [tempLightIntensity, setTempLightIntensity] = useState<string>(lightIntensityThreshold);

  // Time selection helpers
  const hours = Array.from({length: 12}, (_, i) => i + 1);
  const minutes = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));
  const periods = ['AM', 'PM'];

  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  // Handler for time selection
  const handleTimeSelection = () => {
    const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    
    if (currentTimeType === 'start') {
      setStartTime(formattedTime);
    } else {
      setEndTime(formattedTime);
    }
    
    setIsTimeModalVisible(false);
  };

  // Handler for light intensity threshold
  const handleLightIntensityConfirm = () => {
    // Validate input
    const parsedValue = parseFloat(tempLightIntensity);
    if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
      setLightIntensityThreshold(tempLightIntensity);
      setIsLightIntensityModalVisible(false);
    } else {
      // Optional: Add error handling
      alert('Please enter a valid temperature between 0 and 100');
    }
  };

  // Function to save configuration (placeholder for IoT integration)
  const saveConfiguration = () => {
    console.log('Configuration Saved:', {
      startTime,
      endTime,
      status: selectedStatus,
      lightThreshold: lightIntensityThreshold,
      automaticMode: isAutomaticMode
    });
  };

  // Time Selection Modal
  const TimeSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isTimeModalVisible}
      onRequestClose={() => setIsTimeModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Select {currentTimeType === 'start' ? 'Start' : 'End'} Time
          </Text>
          
          <View style={styles.pickerContainer}>
            {/* Hour Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hour</Text>
              <ScrollView>
                {hours.map((hour) => (
                  <TouchableOpacity 
                    key={hour} 
                    style={[
                      styles.pickerItem,
                      selectedHour === hour && styles.selectedPickerItem
                    ]}
                    onPress={() => setSelectedHour(hour)}
                  >
                    <Text style={styles.pickerItemText}>{hour}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minute Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Minute</Text>
              <ScrollView>
                {minutes.map((minute) => (
                  <TouchableOpacity 
                    key={minute} 
                    style={[
                      styles.pickerItem,
                      selectedMinute === minute && styles.selectedPickerItem
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                  >
                    <Text style={styles.pickerItemText}>{minute}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Period Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Period</Text>
              <ScrollView>
                {periods.map((period) => (
                  <TouchableOpacity 
                    key={period} 
                    style={[
                      styles.pickerItem,
                      selectedPeriod === period && styles.selectedPickerItem
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={styles.pickerItemText}>{period}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.modalButtonGroup}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setIsTimeModalVisible(false)}
            >
              <Text style={styles.modalButtonTextCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonConfirm}
              onPress={handleTimeSelection}
            >
              <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Light Intensity Modal
  const LightIntensityModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isLightIntensityModalVisible}
      onRequestClose={() => setIsLightIntensityModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Light Intensity Threshold</Text>
          
          <View style={styles.lightIntensityInputContainer}>
            <TextInput
              style={styles.lightIntensityInput}
              placeholder="Enter threshold (°C)"
              keyboardType="numeric"
              value={tempLightIntensity}
              onChangeText={setTempLightIntensity}
            />
            <Text style={styles.degreeSymbol}>°C</Text>
          </View>

          <View style={styles.modalButtonGroup}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setIsLightIntensityModalVisible(false)}
            >
              <Text style={styles.modalButtonTextCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonConfirm}
              onPress={handleLightIntensityConfirm}
            >
              <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Curtain Configuration</Text>

        {/* Time Configuration */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Schedule</Text>
          <View style={styles.timeConfigContainer}>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => {
                setCurrentTimeType('start');
                setIsTimeModalVisible(true);
              }}
            >
              <Text style={styles.timeButtonLabel}>Start Time</Text>
              <Text style={styles.timeButtonValue}>{startTime}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => {
                setCurrentTimeType('end');
                setIsTimeModalVisible(true);
              }}
            >
              <Text style={styles.timeButtonLabel}>End Time</Text>
              <Text style={styles.timeButtonValue}>{endTime}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Curtain Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Curtain Status</Text>
          <View style={styles.statusButtonContainer}>
            {Object.values(CurtainStatus).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  selectedStatus === status && styles.selectedStatusButton
                ]}
                onPress={() => setSelectedStatus(status as CurtainStatus)}
              >
                <Text style={styles.statusButtonText}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Light Intensity Configuration */}
        <View style={styles.card}>
          <View style={styles.lightIntensityHeader}>
            <Text style={styles.cardTitle}>Light Intensity</Text>
            <TouchableOpacity onPress={() => setIsLightIntensityModalVisible(true)}>
              <Text style={styles.lightIntensityValue}>{lightIntensityThreshold}°C</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.automaticModeContainer}>
            <Text style={styles.automaticModeText}>Automatic Mode</Text>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
              thumbColor={isAutomaticMode ? "#FFFFFF" : "#FFFFFF"}
              onValueChange={() => setIsAutomaticMode(!isAutomaticMode)}
              value={isAutomaticMode}
            />
          </View>
        </View>

        {/* Automatic Closure Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            When automatic mode is ON, the curtain will automatically close 
            if light intensity exceeds the set threshold, regardless of scheduled time.
          </Text>
        </View>

        {/* Save Configuration Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveConfiguration}
        >
          <Text style={styles.saveButtonText}>Save Configuration</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <TimeSelectionModal />
      <LightIntensityModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    marginTop:30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  timeConfigContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    width: '48%',
  },
  timeButtonLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  timeButtonValue: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  statusButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    width: '32%',
  },
  selectedStatusButton: {
    backgroundColor: '#4CAF50',
  },
  statusButtonText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
  lightIntensityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  lightIntensityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  automaticModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  automaticModeText: {
    color: '#333',
    fontSize: 16,
  },
  noteContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 200,
  },
  pickerColumn: {
    width: '30%',
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  pickerItem: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  selectedPickerItem: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  pickerItemText: {
    color: '#333',
    fontSize: 16,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButtonCancel: {
    width: '45%',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonConfirm: {
    width: '45%',
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonTextCancel: {
    color: '#333',
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: 'white',
    fontWeight: '600',
  },
  lightIntensityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  lightIntensityInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  degreeSymbol: {
    fontSize: 18,
    color: '#666',
    marginLeft: 10,
  },
});


export default CurtainConfigurationPage;