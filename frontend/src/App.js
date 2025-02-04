import React from "react";
import SignInForm from "./pages/SignIn";
import SignUpForm from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App(){
  return (

    <Router>

      <Routes>

        <Route path="/" element={<SignInForm />} />

        <Route path="/register" element={<SignUpForm />} />

        <Route path="/dashboard/:userId" element={<Dashboard />} />

      </Routes>

    </Router>

  );

}
export default App