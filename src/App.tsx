import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CallPractice } from './pages/CallPractice';
import { TextPractice } from './pages/TextPractice';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/call-practice" element={<CallPractice />} />
        <Route path="/text-practice" element={<TextPractice />} />
      </Routes>
    </Router>
  );
}

export default App;