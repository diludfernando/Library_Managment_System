import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Hero from './components/home/Hero';
import FeaturedBooks from './components/home/FeaturedBooks';
import Footer from './components/layout/Footer';
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import BooksCatalog from './components/catalog/BooksCatalog';
import MemberDashboard from './components/member/MemberDashboard';
import './App.css';
import './dark-mode.css';

const Home = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <FeaturedBooks />
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/catalog" element={<BooksCatalog />} />
          <Route path="/member" element={<MemberDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
