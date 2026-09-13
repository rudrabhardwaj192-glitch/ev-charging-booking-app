import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEdit,
  FaSave,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

import toast from "react-hot-toast";

import api from "../../services/api";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [passwordData, setPasswordData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const token =
    localStorage.getItem("token");

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(
        "/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user =
        response.data.data;

      setProfile(user);

      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // PASSWORD CHANGE
  // ==========================================

  const handlePasswordChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSaveProfile = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return;
      }

      if (!formData.email.trim()) {
        toast.error("Email is required");
        return;
      }

      setSaving(true);

      const response =
        await api.put(
          "/profile",
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const updated =
        response.data.data;

      setProfile(updated);

      setFormData({
        name: updated.name,
        email: updated.email,
      });

      setEditing(false);

      toast.success(
        "Profile updated successfully"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handleChangePassword =
    async () => {
      try {
        if (
          !passwordData.currentPassword ||
          !passwordData.newPassword ||
          !passwordData.confirmPassword
        ) {
          toast.error(
            "Please fill all password fields"
          );

          return;
        }

        if (
          passwordData.newPassword !==
          passwordData.confirmPassword
        ) {
          toast.error(
            "Passwords do not match"
          );

          return;
        }

        if (
          passwordData.newPassword.length < 6
        ) {
          toast.error(
            "Password must be at least 6 characters"
          );

          return;
        }

        setSaving(true);

        const response =
          await api.put(
            "/profile/password",
            {
              currentPassword:
                passwordData.currentPassword,

              newPassword:
                passwordData.newPassword,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        toast.success(
          response.data.message ||
            "Password changed successfully"
        );

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setShowPassword(false);
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Failed to change password"
        );
      } finally {
        setSaving(false);
      }
    };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    toast.success(
      "Logged out successfully"
    );

    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Profile not found
          </h1>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">

      <div className="max-w-4xl mx-auto">

        {/* ================================= */}
        {/* PROFILE HEADER */}
        {/* ================================= */}

        <div className="bg-white rounded-3xl shadow p-8 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="flex items-center gap-5">

              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">

                <FaUser className="text-green-600 text-4xl" />

              </div>

              <div>

                <h1 className="text-3xl font-bold">
                  {profile.name}
                </h1>

                <p className="text-gray-500">
                  {profile.email}
                </p>

                <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                  {profile.role}
                </span>

              </div>

            </div>

            {!editing ? (
              <button
                onClick={() =>
                  setEditing(true)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <FaEdit />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditing(false);

                  setFormData({
                    name:
                      profile.name,
                    email:
                      profile.email,
                  });
                }}
                className="bg-gray-500 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <FaTimes />
                Cancel
              </button>
            )}

          </div>

        </div>

        {/* ================================= */}
        {/* PERSONAL INFORMATION */}
        {/* ================================= */}

        <div className="bg-white rounded-3xl shadow p-8 mb-6">

          <h2 className="text-2xl font-bold mb-8">
            Personal Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            {/* NAME */}

            <div>

              <label className="block font-semibold mb-2">
                Full Name
              </label>

              <div className="relative">

                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  disabled={!editing}
                  className="w-full border rounded-xl py-3 pl-11 pr-4 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div>

              <label className="block font-semibold mb-2">
                Email
              </label>

              <div className="relative">

                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  disabled={!editing}
                  className="w-full border rounded-xl py-3 pl-11 pr-4 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

              </div>

            </div>

          </div>

          {editing && (
            <div className="flex justify-end mt-8">

              <button
                onClick={
                  handleSaveProfile
                }
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-xl flex items-center gap-2"
              >
                <FaSave />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>
          )}

        </div>

        {/* ================================= */}
        {/* ACCOUNT INFORMATION */}
        {/* ================================= */}

        <div className="bg-white rounded-3xl shadow p-8 mb-6">

          <h2 className="text-2xl font-bold mb-6">
            Account Information
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div className="bg-gray-50 p-5 rounded-2xl">

              <p className="text-gray-500 text-sm">
                Account ID
              </p>

              <p className="font-bold text-lg">
                #{profile.id}
              </p>

            </div>

            <div className="bg-gray-50 p-5 rounded-2xl">

              <p className="text-gray-500 text-sm">
                Account Type
              </p>

              <p className="font-bold text-lg capitalize">
                {profile.role}
              </p>

            </div>

            <div className="bg-gray-50 p-5 rounded-2xl md:col-span-2">

              <p className="text-gray-500 text-sm">
                Account Created
              </p>

              <p className="font-bold text-lg">
                {new Date(
                  profile.created_at
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>

            </div>

          </div>

        </div>

        {/* ================================= */}
        {/* PASSWORD */}
        {/* ================================= */}

        <div className="bg-white rounded-3xl shadow p-8 mb-6">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">

                <FaLock className="text-blue-600" />

              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Password & Security
                </h2>

                <p className="text-gray-500">
                  Change your account password.
                </p>

              </div>

            </div>

            <button
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
            >
              {showPassword
                ? "Close"
                : "Change Password"}
            </button>

          </div>

          {showPassword && (
            <div className="border-t mt-8 pt-8">

              <div className="space-y-5">

                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current password"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  value={
                    passwordData.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div className="flex justify-end mt-6">

                <button
                  onClick={
                    handleChangePassword
                  }
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-xl"
                >
                  {saving
                    ? "Updating..."
                    : "Update Password"}
                </button>

              </div>

            </div>
          )}

        </div>

        {/* ================================= */}
        {/* LOGOUT */}
        {/* ================================= */}

        <div className="bg-white rounded-3xl shadow p-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <h2 className="text-xl font-bold">
                Logout
              </h2>

              <p className="text-gray-500">
                Sign out from your account.
              </p>

            </div>

            <button
              onClick={
                handleLogout
              }
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <FaSignOutAlt />
              Logout
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;