import Movie_detail from './pages/movie-detail/movie-detail'
import NavBalk from './pages/nav-balk/nav-balk'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import ScreeningRoom from './pages/ScreeningRoom/ScreeningRoom';

function App() {
  return (
    <BrowserRouter>
    <NavBalk/>
      <Routes>
        <Route path="/movie-detail" element={<Movie_detail />} />
        <Route path="/ScreeningRoom" element={<ScreeningRoom />} />
        <Route path="/" element={<Navigate to="/ScreeningRoom" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App