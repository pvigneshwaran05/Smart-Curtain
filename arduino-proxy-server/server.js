const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server started on port 8080');

// Variables to track connections
let serialPort = null;
let parser = null;

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send data from Arduino to WebSocket client
  const forwardSerialData = (data) => {
    ws.send(JSON.stringify({
      action: 'data',
      data: data
    }));
  };

  // Handle WebSocket messages
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      console.log('Received message:', msg);

      switch (msg.action) {
        case 'listPorts':
          // List available serial ports
          SerialPort.list().then(ports => {
            const portNames = ports.map(port => port.path);
            ws.send(JSON.stringify({
              action: 'portList',
              ports: portNames
            }));
          }).catch(err => {
            console.error('Error listing ports:', err);
            ws.send(JSON.stringify({
              action: 'error',
              message: 'Failed to list serial ports'
            }));
          });
          break;

        case 'connect':
          // Connect to specified serial port
          if (serialPort && serialPort.isOpen) {
            serialPort.close();
          }

          try {
            serialPort = new SerialPort({
              path: msg.port,
              baudRate: msg.baudRate || 9600,
              autoOpen: false
            });

            serialPort.open((err) => {
              if (err) {
                console.error('Error opening port:', err);
                ws.send(JSON.stringify({
                  action: 'error',
                  message: `Failed to open port: ${err.message}`
                }));
                return;
              }

              // Create parser for incoming data
              parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));
              parser.on('data', forwardSerialData);

              console.log(`Connected to ${msg.port}`);
              ws.send(JSON.stringify({
                action: 'connected',
                port: msg.port
              }));
            });

            // Handle serial port errors
            serialPort.on('error', (err) => {
              console.error('Serial port error:', err);
              ws.send(JSON.stringify({
                action: 'error',
                message: `Serial port error: ${err.message}`
              }));
            });
          } catch (err) {
            console.error('Error creating serial port:', err);
            ws.send(JSON.stringify({
              action: 'error',
              message: `Error creating serial port: ${err.message}`
            }));
          }
          break;

        case 'disconnect':
          // Disconnect from serial port
          if (serialPort && serialPort.isOpen) {
            serialPort.close((err) => {
              if (err) {
                console.error('Error closing port:', err);
                ws.send(JSON.stringify({
                  action: 'error',
                  message: `Failed to close port: ${err.message}`
                }));
                return;
              }

              console.log('Disconnected from serial port');
              ws.send(JSON.stringify({
                action: 'disconnected'
              }));
            });
          }
          break;

        case 'send':
          // Send data to Arduino
          if (serialPort && serialPort.isOpen) {
            serialPort.write(msg.data, (err) => {
              if (err) {
                console.error('Error writing to port:', err);
                ws.send(JSON.stringify({
                  action: 'error',
                  message: `Failed to send data: ${err.message}`
                }));
              } else {
                console.log('Data sent:', msg.data);
              }
            });
          } else {
            ws.send(JSON.stringify({
              action: 'error',
              message: 'Serial port not connected'
            }));
          }
          break;

        default:
          console.warn('Unknown action:', msg.action);
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle WebSocket close
  ws.on('close', () => {
    console.log('Client disconnected');
    // Clean up serial port connection if needed
    if (parser) {
      parser.removeListener('data', forwardSerialData);
    }
    
    if (serialPort && serialPort.isOpen) {
      serialPort.close((err) => {
        if (err) {
          console.error('Error closing port on disconnect:', err);
        }
      });
    }
  });
});