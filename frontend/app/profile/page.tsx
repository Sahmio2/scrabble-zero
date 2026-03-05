"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    bio: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-linear-to-br from-stone-100 via-stone-200 to-stone-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </main>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Mock API call - replace with actual profile update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: session?.user?.name || "",
      bio: "",
    });
    setIsEditing(false);
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-stone-100 via-stone-200 to-stone-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-stone-900">Profile</h1>
            <button
              onClick={() => router.back()}
              className="text-stone-600 hover:text-stone-900 transition-colors"
            >
              ← Back
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-stone-300 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-stone-600">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-stone-900 mb-2">
                  {session.user?.name || "User"}
                </h2>
                <p className="text-stone-600 text-sm mb-4">{session.user?.email}</p>
                
                <div className="flex justify-center gap-2 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Level 1
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    0 Games
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="font-semibold text-stone-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-600">Games Played</span>
                  <span className="font-semibold text-stone-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Games Won</span>
                  <span className="font-semibold text-stone-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Win Rate</span>
                  <span className="font-semibold text-stone-900">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">High Score</span>
                  <span className="font-semibold text-stone-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Friends</span>
                  <span className="font-semibold text-stone-900">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-stone-900">Profile Details</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {message && (
                <div className={`mb-4 px-4 py-3 rounded-lg ${
                  message.includes("success") 
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  {message}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                      Display Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your display name"
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-stone-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-stone-200 text-stone-700 py-2 px-6 rounded-lg font-semibold hover:bg-stone-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-stone-700 mb-1">Display Name</h4>
                    <p className="text-stone-900">{session.user?.name || "Not set"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-stone-700 mb-1">Email Address</h4>
                    <p className="text-stone-900">{session.user?.email}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-stone-700 mb-1">Bio</h4>
                    <p className="text-stone-900">No bio set yet</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-stone-700 mb-1">Account Type</h4>
                    <p className="text-stone-900">Standard Account</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-stone-700 mb-1">Member Since</h4>
                    <p className="text-stone-900">Today</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-xl font-bold text-stone-900 mb-4">Recent Activity</h3>
              <div className="text-center py-8 text-stone-500">
                <div className="text-lg">No recent activity</div>
                <div className="text-sm mt-2">Start playing games to see your activity here</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
