import React from "react";
import "./styles.css";
import SignInForm from "./pages/SignIn";
import SignUpForm from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
//import logo from "./svg/photologo.svg";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App(){
  return (

    <Router>

      <Routes>

        <Route path="/" element={<SignInForm />} />

        <Route path="/register" element={<SignUpForm />} />

        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>

    </Router>

  );

}
export default App
