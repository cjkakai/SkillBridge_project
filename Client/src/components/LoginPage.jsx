import React from "react";
import "./LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page">
      <nav className="navbar">
        <div className="logo">
          <span className="logo-main">Skill</span>
          <span className="logo-accent">Bridge</span>
        </div>
        <ul className="nav-links">
          <li>Home</li>
          <li>About</li>
          <li>Contact Us</li>
        </ul>
      </nav>

      <div className="login-container">
        <h2>Login here</h2>
        <form>
          <label>Username</label>
          <input type="text" placeholder="Value" />
          <label>Password</label>
          <input type="password" placeholder="Value" />
          <label>Choose a role</label>
          <select>
            <option>Admin, freelancer, client</option>
          </select>
          <button type="submit">Login</button>
        </form>
        <div className="extra-links">
          <a href="#">Forgot password?</a>
          <a href="#">No account? Sign up here</a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
