import Movie_detail from './pages/movie-detail/movie-detail'
import Movie_list from './pages/movie-list/movie-list'
import Movie_panel from './pages/admin-movie-panel/movie-panel'
import Zaal_panel from './pages/admin-zaal-panel/zaal-panel'
import Show_panel from './pages/admin-show-panel/show-panel'
import NavBalk from './pages/nav-balk/nav-balk'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css'
import ScreeningRoom from './pages/ScreeningRoom/ScreeningRoom';
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Profile from './pages/profile/Profile'
import LogedInUser from './pages/Loged-In/Loged-in-user'
import type { User, Movie } from './types'
import EditProfile from './pages/profile/EditProfile';
import History from './pages/profile/History';
import UserContext from './context/UserContext'
import Bookings from './pages/bookings/Bookings';
import { getCurrentUserId, getUserProfile, getAuthToken, clearAuthToken, clearCurrentUserId } from './api/users';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User>({ id: '', name: '', email: '', points: 0 })
  const [movies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      const userId = getCurrentUserId();
      const token = getAuthToken();
      
      if (userId && token) {
        try {
          const profile = await getUserProfile(userId);
          const fullName = `${profile.firstName} ${profile.lastName}`.trim();
          setUser({
            id: profile.id,
            name: fullName,
            email: profile.email,
            points: 0
          });
          setIsAuthenticated(true);
          console.log('✅ Session restored for user:', fullName);
        } catch (error) {
          console.error('❌ Failed to restore session:', error);
          // Clear invalid session - both userId AND token
          clearCurrentUserId();
          clearAuthToken();
          console.log('🔓 Invalid session cleared');
        }
      } else {
        // Als userId of token ontbreekt, clear alles
        if (userId || token) {
          console.log('⚠️ Incomplete session data, clearing...');
          clearCurrentUserId();
          clearAuthToken();
        }
      }
      setLoading(false);
    };

    checkExistingSession();
  }, []);

  const handleLogin = (userId: string, email: string, firstName: string, lastName: string) => {
    const fullName = `${firstName} ${lastName}`.trim();
    setUser({
      id: userId,
      name: fullName,
      email: email,
      points: 0
    });
    setIsAuthenticated(true);
    console.log('✅ User logged in:', fullName, 'ID:', userId);
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser({ id: '', name: '', email: '', points: 0 });
    clearCurrentUserId();
    clearAuthToken();  // ✅ TOEGEVOEGD
    localStorage.removeItem('username');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('registeredUser');
    console.log('✅ User logged out - all auth data cleared');
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#9ab0c9'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <UserContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated }}>
        <NavBalk isAuthenticated={isAuthenticated} />
        <Routes>
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/home" element={<LogedInUser username={user.name} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="movie_detail/:movieId" element={<Movie_detail />} />
          <Route path="/movie_list" element={<Movie_list />} />
          <Route path="/movie_panel" element={<Movie_panel />} />
          <Route path="/zaal_panel" element={<Zaal_panel />} />
          <Route path="/show_panel" element={<Show_panel />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/ScreeningRoom" element={<ScreeningRoom />} />
          <Route path="ScreeningRoom/:roomId" element={<ScreeningRoom />} />
          <Route path="/profile" element={<Profile user={user} movies={movies} onLogout={handleLogout} />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </UserContext.Provider>
    </BrowserRouter>
  )
}

export default App