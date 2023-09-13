import React, { useState } from "react";
import "./styles.css";
import SignInForm from "./pages/SignIn";
import SignUpForm from "./pages/SignUp";
import logo from "./svg/photologo.svg";

export default function App() {
  const [type, setType] = useState("signIn");
  const handleOnClick = text => {
    if (text !== type) {
      setType(text);
      return;
    }
  };
  const containerClass =
    "container " + (type === "signUp" ? "right-panel-active" : "");
  return (
    <div className="App">
       <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1 style={{ color: 'white'}}>MBESEPP</h1>
      </header>
      <div className={containerClass} id="container">
        <SignUpForm />
        <SignInForm />
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Bentornato!</h1>
              <p>
                Inserisci le tue credenziali per poter accedere a PhotoMan!
              </p>
              <button
                className="ghost"
                id="signIn"
                onClick={() => handleOnClick("signIn")}
              >
                Accedi
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Ciao, sei nuovo?</h1>
              <p>Entra a far parte della community di PhotoMan</p>
              <button
                className="ghost "
                id="signUp"
                onClick={() => handleOnClick("signUp")}
              >
                Registrati
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
