import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, LogOut, LogIn, LogInIcon, LogOutIcon, SettingsIcon, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ title }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    axios.get("/api/auth/user/", {
      headers: {
        Authorization: `Token ${localStorage.getItem("authToken")}`,
      },
    })
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching current user:", error);
        setUser(null);
      });
  }, []);


  const displayName = user
    ? (user.first_name || user.last_name
        ? `${user.first_name} ${user.last_name}`.trim()
        : user.email)
    : "";


  const handleIconClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };


const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };
  

  const handleLogout = async () => {
    const csrfToken = getCookie("csrftoken");
    try {
      await axios.post(
        "/api/auth/logout/",
        null,
        {
          headers: {
            "X-CSRFToken": csrfToken,
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        }
      );
      localStorage.removeItem("authToken");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  

  return (
    <header className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-100">{title}</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-100">
            {displayName} {user && user.role ? `(${user.role})` : ""}
          </span>
          <User 
            className="text-gray-100 cursor-pointer"
            size={24}
            onClick={handleIconClick}
          />
          <SettingsIcon
              className="text-white cursor-pointer"
              size={24}
              onClick={() => navigate("/settings")}
            />
          {user ? (
            
            <LogOutIcon 
              onClick={handleLogout} 
              className="text-white cursor-pointer"
              color="red"
              size={24} 
            />
          ) : (
            <LogInIcon 
              onClick={() => navigate("/login")} 
              className="text-white cursor-pointer"
              color="green" 
              size={24}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
