import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetail from './pages/ItemDetail';
import ItemForm from './pages/ItemForm';
import Search from './pages/Search';
import TradeManagement from './pages/TradeManagement';
import TradeForm from './pages/TradeForm';
import Profile from './pages/Profile';
import InstantNeeds from './pages/InstantNeeds';
import Recommendations from './pages/Recommendations';
import ItemAnalysis from './pages/ItemAnalysis';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/items/:id" element={<ItemDetail />} />
              <Route path="/items/new" element={
                <PrivateRoute>
                  <ItemForm />
                </PrivateRoute>
              } />
              <Route path="/items/:id/edit" element={
                <PrivateRoute>
                  <ItemForm />
                </PrivateRoute>
              } />
              <Route path="/items/:id/analysis" element={
                <PrivateRoute>
                  <ItemAnalysis />
                </PrivateRoute>
              } />
              <Route path="/trades" element={
                <PrivateRoute>
                  <TradeManagement />
                </PrivateRoute>
              } />
              <Route path="/trades/new" element={
                <PrivateRoute>
                  <TradeForm />
                </PrivateRoute>
              } />
              <Route path="/trades/:id" element={
                <PrivateRoute>
                  <TradeForm />
                </PrivateRoute>
              } />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/profile/edit" element={
                <PrivateRoute>
                  <Profile isEditing={true} />
                </PrivateRoute>
              } />
              <Route path="/instant-needs" element={
                <PrivateRoute>
                  <InstantNeeds />
                </PrivateRoute>
              } />
              <Route path="/recommendations" element={
                <PrivateRoute>
                  <Recommendations />
                </PrivateRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
