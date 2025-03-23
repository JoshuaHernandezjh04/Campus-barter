import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Campus Barter</h2>
            <p className="text-gray-400">Trade goods and services with your campus community</p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <ul className="space-y-1">
                <li><a href="/" className="text-gray-400 hover:text-white">Home</a></li>
                <li><a href="/search" className="text-gray-400 hover:text-white">Browse Items</a></li>
                <li><a href="/login" className="text-gray-400 hover:text-white">Login</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-white">Register</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <ul className="space-y-1">
                <li className="text-gray-400">Email: support@campusbarter.com</li>
                <li className="text-gray-400">Phone: (123) 456-7890</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Campus Barter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
