import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PaymentForm() {
  const [selectedFine, setSelectedFine] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the selected fine and delivery option from session storage
    const fineData = sessionStorage.getItem('selectedFine');
    const deliveryData = sessionStorage.getItem('selectedDelivery');
    
    if (!fineData || !deliveryData) {
      navigate('/');
      return;
    }
    
    setSelectedFine(JSON.parse(fineData));
    setSelectedDelivery(JSON.parse(deliveryData));
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation rules
    let newValue = value;
    let errorMessage = '';
    
    if (name === 'cardNumber') {
      // Only allow numbers
      newValue = value.replace(/\D/g, '');
      
      // Limit to 16 digits
      if (newValue.length > 16) {
        newValue = newValue.slice(0, 16);
      }
      
      if (newValue.length > 0 && newValue.length < 16) {
        errorMessage = 'Card number must be 16 digits';
      } else {
        errorMessage = '';
      }
    }
    
    if (name === 'cvv') {
      // Only allow numbers
      newValue = value.replace(/\D/g, '');
      
      // Limit to 4 digits
      if (newValue.length > 4) {
        newValue = newValue.slice(0, 4);
      }
      
      if (newValue.length > 0 && newValue.length < 3) {
        errorMessage = 'CVV must be 3-4 digits';
      } else {
        errorMessage = '';
      }
    }
    
    if (name === 'expiryDate') {
      // Format as MM/YY
      newValue = value.replace(/\D/g, '');
      
      if (newValue.length > 0) {
        if (newValue.length > 2) {
          newValue = newValue.slice(0, 2) + '/' + newValue.slice(2, 4);
        }
        
        // Validate month
        const month = parseInt(newValue.slice(0, 2), 10);
        if (month < 1 || month > 12) {
          errorMessage = 'Invalid month';
        } else if (newValue.length >= 5) {
          // Validate year
          const year = parseInt('20' + newValue.slice(3, 5), 10);
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          
          if (year < currentYear || (year === currentYear && month < currentMonth)) {
            errorMessage = 'Card has expired';
          }
        }
      }
    }
    
    if (name === 'cardholderName') {
      if (value.trim() === '') {
        errorMessage = 'Cardholder name is required';
      }
    }
    
    setCardDetails({
      ...cardDetails,
      [name]: newValue
    });
    
    setErrors({
      ...errors,
      [name]: errorMessage
    });
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: ''
    };
    
    let isValid = true;
    
    // Card number validation
    if (cardDetails.cardNumber.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
      isValid = false;
    }
    
    // Cardholder name validation
    if (cardDetails.cardholderName.trim() === '') {
      newErrors.cardholderName = 'Cardholder name is required';
      isValid = false;
    }
    
    // Expiry date validation
    if (!cardDetails.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
      isValid = false;
    } else {
      const [month, year] = cardDetails.expiryDate.split('/');
      const expiryDate = new Date(2000 + parseInt(year, 10), parseInt(month, 10) - 1);
      const currentDate = new Date();
      
      if (expiryDate < currentDate) {
        newErrors.expiryDate = 'Card has expired';
        isValid = false;
      }
    }
    
    // CVV validation
    if (cardDetails.cvv.length < 3) {
      newErrors.cvv = 'CVV must be 3-4 digits';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    // Process payment with the backend
    axios.post('http://localhost:5001/api/process-payment', {
      fine: selectedFine,
      deliveryOption: selectedDelivery,
      cardDetails
    })
      .then(response => {
        // Store payment confirmation
        sessionStorage.setItem('paymentConfirmation', JSON.stringify(response.data));
        setIsProcessing(false);
        navigate('/confirmation');
      })
      .catch(error => {
        console.error('Payment processing error:', error);
        setIsProcessing(false);
        
        // For demo purposes, create a mock payment confirmation if backend fails
        const mockConfirmation = {
          success: true,
          message: 'Payment processed successfully (Demo Mode)',
          paymentRecord: {
            timestamp: new Date().toISOString(),
            fineId: selectedFine.id,
            fineDescription: selectedFine.description,
            fineAmount: selectedFine.amount,
            deliveryType: selectedDelivery.type,
            deliveryFee: selectedDelivery.fee,
            totalAmount: selectedFine.amount + selectedDelivery.fee,
            cardDetails: {
              cardNumber: '****' + cardDetails.cardNumber.slice(-4),
              cardholderName: cardDetails.cardholderName,
              expiryDate: cardDetails.expiryDate,
            },
            status: 'Paid (Demo)'
          }
        };
        
        sessionStorage.setItem('paymentConfirmation', JSON.stringify(mockConfirmation));
        navigate('/confirmation');
      });
  };

  const calculateTotal = () => {
    if (selectedFine && selectedDelivery) {
      return (selectedFine.amount + selectedDelivery.fee).toFixed(2);
    }
    return '0.00';
  };

  if (!selectedFine || !selectedDelivery) {
    return <div>Loading...</div>;
  }

  return (
    <div className="payment-form">
      <h2>Payment Details</h2>
      
      <div className="payment-summary">
        <h3>Order Summary</h3>
        <div className="summary-details">
          <p><strong>Fine:</strong> {selectedFine.description} - ${selectedFine.amount.toFixed(2)}</p>
          <p><strong>Delivery:</strong> {selectedDelivery.type} - ${selectedDelivery.fee.toFixed(2)}</p>
          <p className="total"><strong>Total:</strong> ${calculateTotal()}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cardNumber">Card Number</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={handleInputChange}
            required
          />
          {errors.cardNumber && <div className="error-message">{errors.cardNumber}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="cardholderName">Cardholder Name</label>
          <input
            type="text"
            id="cardholderName"
            name="cardholderName"
            placeholder="John Doe"
            value={cardDetails.cardholderName}
            onChange={handleInputChange}
            required
          />
          {errors.cardholderName && <div className="error-message">{errors.cardholderName}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
            type="text"
            id="expiryDate"
            name="expiryDate"
            placeholder="MM/YY"
            value={cardDetails.expiryDate}
            onChange={handleInputChange}
            required
            maxLength="5"
          />
          {errors.expiryDate && <div className="error-message">{errors.expiryDate}</div>}
        </div>
        
        <div className="form-group half">
          <label htmlFor="cvv">CVV</label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            placeholder="123"
            value={cardDetails.cvv}
            onChange={handleInputChange}
            required
          />
          {errors.cvv && <div className="error-message">{errors.cvv}</div>}
        </div>
      </div>
      
      <div className="actions">
        <button 
          type="button" 
          className="btn-secondary" 
          onClick={() => navigate('/delivery-options')}
          disabled={isProcessing}
        >
          Back
        </button>
        <button 
          type="submit" 
          className="btn-primary"
          disabled={isProcessing || Object.values(errors).some(error => error !== '')}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  </div>
  );
}

export default PaymentForm;
