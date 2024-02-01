import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { googleMap, useLoadScript, Marker } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import useOnClickOutside from "react-cool-onclickoutside";
import BookSwapLogo from "../assets/images/BookSwap.png";
import HomeNavBar from "./HomeNavBar";

const Profile = () => {
  const [userData, setUserData] = useState({
    name: "",
    latName: "",
    password: "",
    address: "",
    instructions: "",
  });
  const [success, setSuccess] = useState(undefined);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    callbackName: "GooglePlacesSetUp",
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
        border: "1px solid #ddd",
        margin: "5px",
        transition: "background-color 0.3s ease",
        // position: "absolute",
        top: "100%",
        left: 0,
        maxHeight: "200px"
    }

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li key={place_id} style={suggestion_items} onClick={handleAddressSelect(suggestion)}>
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

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
      password: userData.password,
      address: userData.address,
      instructions: userData.instructions,
    };

    fetch("/action/updateUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (res.status === 200) {
          setSuccess(true);
          return res.json();
        } else {
          setSuccess(false);
        }
      })
      .then((data) => {
        setUserData(data);
      })
      .catch((err) => console.log("App: update user error ", err));
  };

  useEffect(() => {
    fetch("/action/getUser")
      .then((data) => data.json())
      .then((data) => {
        setUserData(data);
      })
      .catch((err) => console.log("App error getting user: ", err));
  }, [])


  const warning = () => {
    if (success) {
      return (
        <div
          className="warning"
          style={{ color: "#85BAA1", fontSize: "0.8em" }}
        >
          Profile successfully updated{" "}
        </div>
      );
    } else if (success === false) {
      return (
        <div
          className="warning"
          style={{ color: "#A41409", fontSize: "0.8em" }}
        >
          Error in updating profile{" "}
        </div>
      );
    }
  };

  return (
    <div>
      <HomeNavBar />
      <div className="form-container">
        <h3>Update your profile</h3>
        <form onSubmit={handleSubmit}>
          <div>First Name</div>
          <div>
            <input
              name="name"
              type="text"
              placeholder={userData.name}
              onChange={handleUserDataChange}
            />
          </div>

          <div>Last Name</div>
          <div>
            <input
              name="lastName"
              type="text"
              placeholder={userData.lastName}
              onChange={handleUserDataChange}
            />
          </div>

          <div>Password</div>
          <div>
            <input
              name="password"
              type="password"
              placeholder={userData.password}
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
            {status === "OK" && <ul>{renderSuggestions()}</ul>}
          </div>

          <div>Pick up instructions (Optional)</div>
          <div>
            <input
              name="instructions"
              type="text"
              placeholder={userData.instructions}
              onChange={handleUserDataChange}
            />
          </div>

          <button type="submit" disabled={!userData.name || !userData.address}>
            Update profile
          </button>
        </form>
        {warning()}
      </div>
    </div>
  );
};

export default Profile;
