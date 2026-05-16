import { useState } from "react";
import Login from "../login/Login";
import Register from "../register/Register";

export default function WelcomePage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <>
      <nav className="h-[80px] bg-white shadow-md flex items-center px-8">
        <h1 className="text-2xl font-bold">
          <span className="text-blue-600">Clinic</span>
          <span className="text-emerald-500">Care</span>
        </h1>
      </nav>

      <main className="auth-page-bg min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className={`auth-container ${isSignUp ? "active" : ""}`}>
          <div className="form-container sign-up">
            <Register />
          </div>

          <div className="form-container sign-in">
            <Login />
          </div>

          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel left">
                <h1 className="text-4xl font-bold mb-5">Welcome Back!</h1>
                <p className="text-lg leading-7">
                  Login to continue booking your appointments
                </p>

                <button className="ghost-btn" onClick={() => setIsSignUp(false)}>
                  SIGN IN
                </button>
              </div>

              <div className="overlay-panel right">
                <h1 className="text-4xl font-bold mb-5">Hello, Friend!</h1>
                <p className="text-lg leading-7">
                  Enter your personal details and start your journey with us
                </p>

                <button className="ghost-btn" onClick={() => setIsSignUp(true)}>
                  SIGN UP
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}