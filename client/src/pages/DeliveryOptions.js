import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DeliveryOptions() {
  // Use useState without the setter since we're using static data for now
  const [deliveryOptions] = useState([
    { id: 1, type: 'Fast Delivery', fee: 15, description: 'Immediate processing' },
    { id: 2, type: 'Normal Delivery', fee: 5, description: 'Post office delivery' }
  ]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedFine, setSelectedFine] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the selected fine from session storage
    const fineData = sessionStorage.getItem('selectedFine');
    if (!fineData) {
      navigate('/');
      return;
    }
    setSelectedFine(JSON.parse(fineData));
  }, [navigate]);

  const handleDeliverySelect = (option) => {
    setSelectedDelivery(option);
  };

  const handleContinue = () => {
    if (selectedDelivery) {
      // Store selected delivery option in session storage
      sessionStorage.setItem('selectedDelivery', JSON.stringify(selectedDelivery));
      navigate('/payment');
    } else {
      alert('Please select a delivery option to continue.');
    }
  };

  const calculateTotal = () => {
    if (selectedFine && selectedDelivery) {
      return (selectedFine.amount + selectedDelivery.fee).toFixed(2);
    }
    return selectedFine ? selectedFine.amount.toFixed(2) : '0.00';
  };

  return (
    <div className="delivery-options">
      <h2>Choose Delivery Option</h2>
      
      <div className="selected-fine-summary">
        <h3>Selected Fine:</h3>
        {selectedFine && (
          <div className="fine-details">
            <p><strong>{selectedFine.description}</strong></p>
            <p>Amount: ${selectedFine.amount.toFixed(2)}</p>
          </div>
        )}
      </div>
      
      <div className="delivery-list">
        {deliveryOptions.map(option => (
          <div 
            key={option.id} 
            className={`delivery-item ${selectedDelivery && selectedDelivery.id === option.id ? 'selected' : ''}`}
            onClick={() => handleDeliverySelect(option)}
          >
            <h3>{option.type}</h3>
            <p>{option.description}</p>
            <p>Fee: ${option.fee.toFixed(2)}</p>
          </div>
        ))}
      </div>
      
      <div className="total-summary">
        <h3>Total Payment:</h3>
        <p className="total-amount">${calculateTotal()}</p>
        <p className="total-breakdown">
          Fine: ${selectedFine ? selectedFine.amount.toFixed(2) : '0.00'} + 
          Delivery: ${selectedDelivery ? selectedDelivery.fee.toFixed(2) : '0.00'}
        </p>
      </div>
      
      <div className="actions">
        <button className="btn-secondary" onClick={() => navigate('/')}>Back</button>
        <button 
          className="btn-primary" 
          onClick={handleContinue}
          disabled={!selectedDelivery}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}

export default DeliveryOptions;
