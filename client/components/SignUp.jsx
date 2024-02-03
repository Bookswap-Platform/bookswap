import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import useOnClickOutside from "react-cool-onclickoutside";
import BookSwapLogo from "../assets/images/BookSwap.png";

const SignUp = () => {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState(true);
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    name: "",
    lastName: "",
    email: "",
    address: "",
    instructions: "",
  });

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "US" },
    },
    debounce: 300,
  });

  const ref = useOnClickOutside(() => {
    clearSuggestions();
  });

  const handleAddressInput = (e) => {
    setValue(e.target.value);
  };

  const handleAddressSelect =
    ({ description }) =>
    () => {
      setValue(description, false);
      setUserData({
        ...userData,
        address: description,
      });
      clearSuggestions();

      // get latitude and longitude via utility functions
      getGeocode({ address: description }).then((results) => {
        const { lat, lng } = getLatLng(results[0]);
        console.log(">>> Current Coordinates: ", { lat, lng });
      });
    };

  const suggestion_items = {
    cursor: "pointer",
    padding: "10px",
    margin: "5px",
    transition: "background-color 0.3s ease",
    top: "100%",
    left: 0,
    maxHeight: "200px",
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li
          key={place_id}
          style={suggestion_items}
          onClick={handleAddressSelect(suggestion)}
          className="addressSuggestion"
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  useEffect(() => {
    if (userData.username) {
      fetch(`/action/check/${userData.username}`)
        .then((res) => res.json())
        .then((bool) => {
          setAvailability(bool);
        })
        .catch((err) =>
          console.log("App: check username availability error:", err)
        );
    } else {
      // if input is empty
      setAvailability(true);
    }
  }, [userData]);

  const handleUserDataChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: userData.name,
      lastName: userData.lastName,
      address: userData.address,
      email: userData.email,
      username: userData.username,
      password: userData.password,
      instructions: userData.instructions,
    };
    fetch("/action/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((bool) => {
        if (bool) {
          navigate("/home");
        }
      })
      .catch((err) => console.log("App: create user error ", err));
  };

  return (
    <div className="form-container">
      <img src={BookSwapLogo} className="bookswap-logo" />

      <h3>Sign up</h3>
      <form onSubmit={handleSubmit}>
        <div>First Name</div>
        <div>
          <input
            name="name"
            type="text"
            value={userData.name}
            onChange={handleUserDataChange}
          />
        </div>

        <div>Last Name</div>
        <div>
          <input
            name="lastName"
            type="text"
            value={userData.lastName}
            onChange={handleUserDataChange}
          />
        </div>

        <div>Email</div>
        <div>
          <input
            name="email"
            type="email"
            value={userData.email}
            onChange={handleUserDataChange}
          />
        </div>

        <div>Address</div>
        <div ref={ref}>
          <input
            id="address-input"
            name="address"
            value={value}
            placeholder={userData.address}
            onChange={handleAddressInput}
            disabled={!ready}
          />
          {status === "OK" && <ul className="addressList">{renderSuggestions()}</ul>}
        </div>

        <div>Pick up instructions (Optional)</div>
        <div>
          <input
            name="instructions"
            type="text"
            placeholder="e.g. pick up from doorman, or contact me at email / phone"
            value={userData.instructions}
            onChange={handleUserDataChange}
          />
        </div>

        <div>Username</div>
        <div>
          <input
            name="username"
            type="text"
            value={userData.username}
            onChange={handleUserDataChange}
          />
        </div>

        <div>Password</div>
        <div>
          <input
            name="password"
            type="password"
            value={userData.password}
            onChange={handleUserDataChange}
          />
        </div>

        <button
          type="submit"
          disabled={
            !availability ||
            !userData.name ||
            !userData.lastName ||
            !userData.email ||
            !userData.address ||
            !userData.username ||
            !userData.password
          }
        >
          Create user
        </button>
      </form>

      {availability ? (
        <div
          className="warning"
          style={{ color: "#85BAA1", fontSize: "0.8em" }}
        >
          Username is available{" "}
        </div>
      ) : (
        <div
          className="warning"
          style={{ color: "#A41409", fontSize: "0.8em" }}
        >
          Username is not available
        </div>
      )}
      <div>
        Already a user? <a href="/">Sign in</a>
      </div>
    </div>
  );
};

export default SignUp;
