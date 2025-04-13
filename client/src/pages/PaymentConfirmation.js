import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';

function PaymentConfirmation() {
  const [confirmation, setConfirmation] = useState(null);
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Get the payment confirmation from session storage
    const confirmationData = sessionStorage.getItem('paymentConfirmation');
    
    if (!confirmationData) {
      // If no confirmation data, create a mock one for testing
      const mockData = {
        success: true,
        message: 'Payment processed successfully',
        paymentRecord: {
          timestamp: new Date().toISOString(),
          fineId: 1,
          fineDescription: 'Parking Violation',
          fineAmount: 50,
          deliveryType: 'Fast Delivery',
          deliveryFee: 15,
          totalAmount: 65,
          cardDetails: {
            cardNumber: '****1234',
            cardholderName: 'John Doe',
            expiryDate: '12/25',
          },
          status: 'Paid'
        }
      };
      setConfirmation(mockData);
    } else {
      setConfirmation(JSON.parse(confirmationData));
    }
  }, [navigate]);

  const handleNewPayment = () => {
    // Clear session storage
    sessionStorage.clear();
    navigate('/');
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `payment-receipt-${new Date().getTime()}.png`;
      link.click();
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!confirmation) {
    return <div>Loading...</div>;
  }

  const { paymentRecord } = confirmation;
  const paymentDate = new Date(paymentRecord.timestamp).toLocaleString();

  return (
    <div className="payment-confirmation">
      <div ref={receiptRef} className="receipt-container">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h2>Payment Successful!</h2>
        <p className="confirmation-message">Your payment has been processed successfully.</p>
        
        <div className="confirmation-details">
          <h3>Payment Receipt</h3>
          <div className="detail-row">
            <span>Receipt Number:</span>
            <span>#{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</span>
          </div>
          <div className="detail-row">
            <span>Date:</span>
            <span>{paymentDate}</span>
          </div>
          <div className="detail-row">
            <span>Fine:</span>
            <span>{paymentRecord.fineDescription}</span>
          </div>
          <div className="detail-row">
            <span>Fine Amount:</span>
            <span>${paymentRecord.fineAmount.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span>Delivery Method:</span>
            <span>{paymentRecord.deliveryType}</span>
          </div>
          <div className="detail-row">
            <span>Delivery Fee:</span>
            <span>${paymentRecord.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="detail-row total">
            <span>Total Paid:</span>
            <span>${paymentRecord.totalAmount.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <span>Credit Card {paymentRecord.cardDetails.cardNumber}</span>
          </div>
          <div className="detail-row">
            <span>Status:</span>
            <span className="status-paid">{paymentRecord.status}</span>
          </div>
        </div>
      </div>
      
      <div className="actions">
        <button 
          className="btn-secondary" 
          onClick={handleDownloadReceipt}
          disabled={isDownloading}
        >
          {isDownloading ? 'Generating...' : 'Download Receipt'}
        </button>
        <button className="btn-primary" onClick={handleNewPayment}>
          Make Another Payment
        </button>
      </div>
    </div>
  );
}

export default PaymentConfirmation;