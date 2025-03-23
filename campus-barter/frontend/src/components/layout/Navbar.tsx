import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setIsLoggedIn(true);
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Campus Barter</Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="hover:text-blue-200">Home</Link>
          <Link to="/search" className="hover:text-blue-200">Browse Items</Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
              <Link to="/items/new" className="hover:text-blue-200">List Item</Link>
              <Link to="/trades" className="hover:text-blue-200">My Trades</Link>
              <Link to={`/profile/${user?.id}`} className="hover:text-blue-200">Profile</Link>
              <button 
                onClick={handleLogout}
                className="hover:text-blue-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link to="/register" className="hover:text-blue-200">Register</Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-700 p-4">
          <Link to="/" className="block py-2 hover:text-blue-200">Home</Link>
          <Link to="/search" className="block py-2 hover:text-blue-200">Browse Items</Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="block py-2 hover:text-blue-200">Dashboard</Link>
              <Link to="/items/new" className="block py-2 hover:text-blue-200">List Item</Link>
              <Link to="/trades" className="block py-2 hover:text-blue-200">My Trades</Link>
              <Link to={`/profile/${user?.id}`} className="block py-2 hover:text-blue-200">Profile</Link>
              <button 
                onClick={handleLogout}
                className="block py-2 w-full text-left hover:text-blue-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 hover:text-blue-200">Login</Link>
              <Link to="/register" className="block py-2 hover:text-blue-200">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
