import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NewsList from './components/NewsList';
import NewsDetail from './components/NewsDetail';


function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<NewsList />} />
        <Route path="/news/:newsId" element={<NewsDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
