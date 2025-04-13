import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Remove axios import since we're not using it yet
// import axios from 'axios';

function FineSelection() {
  // Use useState without the setter since we're using static data for now
  const [fines] = useState([
    { id: 1, description: 'Parking Violation', amount: 50 },
    { id: 2, description: 'Speeding Ticket', amount: 100 },
    { id: 3, description: 'Red Light Violation', amount: 75 }
  ]);
  const [selectedFine, setSelectedFine] = useState(null);
  const navigate = useNavigate();

  // Remove the useEffect that was fetching fines

  const handleFineSelect = (fine) => {
    setSelectedFine(fine);
  };

  const handleContinue = () => {
    if (selectedFine) {
      // Store selected fine in session storage
      sessionStorage.setItem('selectedFine', JSON.stringify(selectedFine));
      navigate('/delivery-options');
    } else {
      alert('Please select a fine to continue.');
    }
  };

  return (
    <div className="fine-selection">
      <h2>Select a Fine to Pay</h2>
      <div className="fines-list">
        {fines.map(fine => (
          <div 
            key={fine.id} 
            className={`fine-item ${selectedFine && selectedFine.id === fine.id ? 'selected' : ''}`}
            onClick={() => handleFineSelect(fine)}
          >
            <h3>{fine.description}</h3>
            <p>Amount: ${fine.amount.toFixed(2)}</p>
          </div>
        ))}
      </div>
      <button 
        className="btn-primary" 
        onClick={handleContinue}
        disabled={!selectedFine}
      >
        Continue to Delivery Options
      </button>
    </div>
  );
}

export default FineSelection;
