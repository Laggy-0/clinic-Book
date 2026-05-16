import { useState } from "react";
import Login from "../login/Login";
import Register from "../register/Register";

export default function WelcomePage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <>
      <nav className="h-[80px] bg-white shadow-md flex items-center px-8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="شفاء" style={{ height: 55 }} />
          <h1 className="text-3xl font-bold text-blue-600">شفاء</h1>
        </div>
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
                <h1 className="text-4xl font-bold mb-5">أهلاً بعودتك!</h1>
                <p className="text-lg leading-7">
                  سجّل دخولك لمتابعة حجز مواعيدك الطبية
                </p>

                <button className="ghost-btn" onClick={() => setIsSignUp(false)}>
                  تسجيل الدخول
                </button>
              </div>

              <div className="overlay-panel right">
                <h1 className="text-4xl font-bold mb-5">مرحباً بك!</h1>
                <p className="text-lg leading-7">
                  أدخل بياناتك الشخصية وابدأ رحلتك الصحية معنا
                </p>

                <button className="ghost-btn" onClick={() => setIsSignUp(true)}>
                  إنشاء حساب
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}