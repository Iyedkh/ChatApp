import { BrowserRouter as Router, Routes, Route , Navigate} from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SettingPage from './pages/SettingsPage';
import UsersDashboard from './pages/UsersDashboard';

import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from "./store/useThemeStore";

import { useEffect } from 'react';

import { Loader } from "lucide-react";

function App() {
  const {authUser,checkAuth,isCheckingAuth,onlineUsers} = useAuthStore();
  const { theme } = useThemeStore();

  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <Router>
      <div data-theme={theme} >
        <Navbar/>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/setting" element={<SettingPage/>} />
          <Route path="/admin/users" element={<UsersDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;