const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5001; // Changed from 5000 to 5001

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} request to ${req.url}`);
  next();
});

// Create payments.txt if it doesn't exist
const paymentsFile = path.join(__dirname, 'payments.txt');
if (!fs.existsSync(paymentsFile)) {
  fs.writeFileSync(paymentsFile, '');
  console.log('Created payments.txt file');
}

// API Endpoints
app.get('/api/fines', (req, res) => {
  console.log('Received request for fines');
  const fines = [
    { id: 1, description: 'Parking Violation', amount: 50 },
    { id: 2, description: 'Speeding Ticket', amount: 100 },
    { id: 3, description: 'Red Light Violation', amount: 75 }
  ];
  console.log('Sending fines:', fines);
  res.json(fines);
});

app.get('/api/delivery-options', (req, res) => {
  console.log('Received request for delivery options');
  const deliveryOptions = [
    { id: 1, type: 'Fast Delivery', fee: 15, description: 'Immediate processing' },
    { id: 2, type: 'Normal Delivery', fee: 5, description: 'Post office delivery' }
  ];
  console.log('Sending delivery options:', deliveryOptions);
  res.json(deliveryOptions);
});

app.post('/api/process-payment', (req, res) => {
  console.log('Received payment processing request');
  try {
    const { fine, deliveryOption, cardDetails } = req.body;
    console.log('Payment data received:', { fine, deliveryOption, cardDetails: { ...cardDetails, cvv: '***' } });
    
    // Validate required fields
    if (!fine || !deliveryOption || !cardDetails) {
      console.log('Missing required fields');
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Create a payment record
    const timestamp = new Date().toISOString();
    const totalAmount = fine.amount + deliveryOption.fee;
    
    // Mask card number for storage (keep only last 4 digits)
    const maskedCardNumber = '****' + cardDetails.cardNumber.slice(-4);
    
    const paymentRecord = {
      timestamp,
      fineId: fine.id,
      fineDescription: fine.description,
      fineAmount: fine.amount,
      deliveryType: deliveryOption.type,
      deliveryFee: deliveryOption.fee,
      totalAmount,
      cardDetails: {
        cardNumber: maskedCardNumber,
        cardholderName: cardDetails.cardholderName,
        expiryDate: cardDetails.expiryDate,
        // Don't store CVV for security
      },
      status: 'Paid'
    };
    
    // Save to payments.txt
    const paymentString = JSON.stringify(paymentRecord) + '\n';
    fs.appendFileSync(paymentsFile, paymentString);
    console.log('Payment saved to file');
    
    // Return success response
    console.log('Sending success response');
    res.json({
      success: true,
      message: 'Payment processed successfully',
      paymentRecord
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, message: 'Server error processing payment' });
  }
});

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Server is working' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the server with: curl http://localhost:${PORT}/api/test`);
});
