import Movie_detail from './pages/movie-detail/movie-detail'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/movie_detail"
          element={<Movie_detail />}
        />
        <Route path="/" element={<Navigate to="/movie_detail" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App