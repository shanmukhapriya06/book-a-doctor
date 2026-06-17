import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { App as AntdApp } from 'antd';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import UserHome from './pages/UserHome';
import AdminHome from './pages/AdminHome';
import DoctorHome from './pages/DoctorHome';
import Home from './pages/Home';


function App() {
  return (
    <AntdApp>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctorhome" element={
            <PrivateRoute><DoctorHome /></PrivateRoute>
          } />
          <Route path="/userhome" element={
            <PrivateRoute><UserHome /></PrivateRoute>
          } />
          <Route path="/adminhome" element={
            <PrivateRoute><AdminHome /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AntdApp>
  );
}

export default App;