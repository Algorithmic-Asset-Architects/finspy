import React, { useState, useEffect } from "react";
import axios from "axios";
import { User } from "lucide-react";
import SettingSection from "./SettingSection";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    axios.get("/api/current_user/")
      .then(response => {
        setUser(response.data);
      })
      .catch(err => {
        console.error("Error fetching user details:", err);
        setError("Failed to load user data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <SettingSection icon={User} title={"User Profile"}>
      {/* Loading State */}
      {loading && <p className="text-gray-400">🔄 Loading profile...</p>}

      {/* Error State */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Display Profile Info */}
      {!loading && !error && user && (
        <div className="flex flex-col sm:flex-row items-center mb-6">
          <img
            src="https://e7.pngegg.com/pngimages/940/301/png-clipart-state-bank-of-india-patiala-mobile-banking-bank-blue-freedom-thumbnail.png"  // Placeholder image
            alt="Profile"
            className="rounded-full w-20 h-20 object-cover mr-4"
          />

          <div>
            <h3 className="text-lg font-semibold text-gray-100">{user.first_name} {user.last_name}</h3>
            <p className="text-gray-400">{user.email}</p>
            <p className="text-gray-500 mt-1">{user.role === "framework_admin" ? "Admin" : "Client"}</p>
          </div>
        </div>
      )}

      {/* Edit Profile Button */}
      <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto">
        Edit Profile
      </button>
    </SettingSection>
  );
};

export default Profile;
