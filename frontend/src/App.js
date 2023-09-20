import React, { useState } from "react";
import "./styles.css";
import SignInForm from "./pages/SignIn";
import SignUpForm from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import logo from "./svg/photologo.svg";

import { 
  createBrowserRouter,
   RouterProvider
   } from "react-router-dom"

   const router = createBrowserRouter([

    {
      path: "/",
      element: <div><SignInForm/></div>
    },

    {
      path: "/register",
      element: <div><SignUpForm/></div>
    },

    {
      path: "/dashboard",
      element: <div><Dashboard/></div>
    }



   ])

function App(){
return (
<div >
  <RouterProvider router={router}/>
  </div>
  )

}
export default App
