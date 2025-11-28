import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${BASE_URL}${API_PATHS.AUTH.GET_USER_INFO}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("image", imageFile);
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${BASE_URL}${API_PATHS.IMAGE.UPLOAD_IMAGE}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser({ ...user, profileImageUrl: data.imageUrl });
      setImageFile(null);
      setUpdating(false);
    } catch (err) {
      console.error(err);
      setUpdating(false);
    }
  };

  if (loading) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>
        <div className="flex items-center space-x-6 mb-6">
          <img
            src={user.profileImageUrl || "/default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border"
          />
          <div>
            <label className="block mb-2 font-medium">
              Change Profile Picture
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button
              onClick={handleUpload}
              disabled={updating}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {updating ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={user.fullName}
            className="w-full border px-3 py-2 rounded outline-none"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            value={user.email}
            className="w-full border px-3 py-2 rounded outline-none"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Change Password</label>
          <input
            type="password"
            placeholder="New Password"
            className="w-full border px-3 py-2 rounded outline-none"
          />
        </div>
        <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Save Changes
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
