import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import BookSwapLogo from "../assets/images/BookSwap.png";

const Login = () => {
  const [correctCredential, setCorrectCredential] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  let navigate = useNavigate();
  const clientID = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;

  const userLogin = async (credentials) => {
    // fetch call to validate user
    const data = await fetch("http://localhost:3000/action/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return data.ok;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    userLogin({ username: username, password: password })
      .then((res) => {
        if (res) {
          props.setLoggedIn(true);
          props.setUser(username);
        }
      })
      .catch((err) => console.log("Login fails."));

    fetch("/action/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((bool) => {
        setCorrectCredential(bool);
        if (bool) {
          navigate("/home");
        }
      })
      .catch((err) => console.log("App: log in error:", err));
  };

  const onSuccess = async (res) =>  {
    // console.log("Login Success! Response: ", res);
    await fetch("/action/oAuth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(res),
    })
      // .then((res) => res.json())
      // .then((bool) => {
      //   setCorrectCredential(bool);
      //   if (bool) {
      //     navigate("/home");
      //   }
      // })
      .catch((err) => console.log("App: log in error:", err));
    
  }

  const onFailure = (res) => {
    console.log("Login Fails. res: ", res);
  }



  return (
    <div className="form-container">
      <img src={BookSwapLogo} className="bookswap-logo" />
      <h3>Sign in to your account</h3>
      <form onSubmit={handleSubmit}>
        <div>Username</div>
        <input
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div>Password</div>
        <input
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in
          </button>
        </div>
      </form>
      {!correctCredential && (
        <div className="warning">Incorrect username or password.</div>
      )}
      <div>
        Not a user yet? <a href="signup">Sign up</a>
      </div>
      <br />
      <div id="goolgeSignin">
        <GoogleLogin
          clientID={clientID}
          buttonText="Login"
          onSuccess={onSuccess}
          onFailure={onFailure}
          isSigned={true}
        />
      </div>
    </div>
  );
};

export default Login;
