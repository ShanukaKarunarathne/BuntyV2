import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import FineSelection from './pages/FineSelection';
import DeliveryOptions from './pages/DeliveryOptions';
import PaymentForm from './pages/PaymentForm';
import PaymentConfirmation from './pages/PaymentConfirmation';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="container">
          <Routes>
            <Route path="/" element={<FineSelection />} />
            <Route path="/delivery-options" element={<DeliveryOptions />} />
            <Route path="/payment" element={<PaymentForm />} />
            <Route path="/confirmation" element={<PaymentConfirmation />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
