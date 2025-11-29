import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard/ProfilePage.css';
import NavBarComponent from "../component/Dashboard/NavBarComponent";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    user_id: null,
    username: '',
    email: '',
    phone_number: '',
    role: '',
    // Customer fields
    shipping_address: '',
    billing_address: '',
    // Seller fields
    store_name: '',
    store_description: '',
    business_license: ''
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        setError('User not logged in. Please login first.');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      const user = JSON.parse(userStr);
      const userId = user.id || user.user_id || user.userId;
      
      if (!userId) {
        setError('User ID not found. Please login again.');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await fetch('http://localhost:8080/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: String(userId) })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      console.log('Profile data:', data);
      
      setProfile(data);
      setEditedProfile(data);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: String(editedProfile.user_id),
          username: editedProfile.username,
          email: editedProfile.email,
          phone_number: editedProfile.phone_number,
          shipping_address: editedProfile.shipping_address,
          billing_address: editedProfile.billing_address,
          store_name: editedProfile.store_name,
          store_description: editedProfile.store_description,
          business_license: editedProfile.business_license
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.username = data.username;
        user.email = data.email;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('username', data.username);
        
        try {
          window.dispatchEvent(new CustomEvent('lazzappe:username-changed', { detail: data.username }));
        } catch (e) {}
      }
      
      setIsEditing(false);
      setError(null);
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
      alert(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  const handlePasswordChange = async () => {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;

    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;

    const confirmPassword = prompt('Confirm new password:');
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: String(profile.user_id),
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      alert('Password changed successfully!');
    } catch (err) {
      console.error('Error changing password:', err);
      alert(err.message || 'Failed to change password. Please try again.');
    }
  };

  const handleRoleSwitch = async (newRole) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/switch-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: String(profile.user_id),
          role: newRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to switch role');
      }

      const data = await response.json();
      setProfile(data);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.role = data.role;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      alert(`Role switched to ${data.role} successfully!`);
    } catch (err) {
      console.error('Error switching role:', err);
      alert(err.message || 'Failed to switch role. Please try again.');
    }
  };

  if (loading && !profile.user_id) {
    return (
      <>
        <NavBarComponent />
        <div className="profile-container">
          <div className="profile-wrapper">
            <div className="loading-message">Loading profile...</div>
          </div>
        </div>
      </>
    );
  }

  if (error && !profile.user_id) {
    return (
      <>
        <NavBarComponent />
        <div className="profile-container">
          <div className="profile-wrapper">
            <div className="error-message">{error}</div>
          </div>
        </div>
      </>
    );
  }

  const getInitials = (username) => {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  };

  const isCustomer = profile.role === 'CUSTOMER';
  const isSeller = profile.role === 'SELLER';

  return (
    <>
      <NavBarComponent />
      <div className="profile-container">
        <div className="profile-wrapper">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <div className="avatar-placeholder">{getInitials(profile.username)}</div>
              </div>
              <button className="avatar-upload-btn">Change Photo</button>
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{profile.username || 'User'}</h1>
              <p className="profile-member">{profile.role || 'CUSTOMER'}</p>
            </div>
          </div>

          {/* Profile Content Grid */}
          <div className="profile-grid">
            {/* Personal Information */}
            <div className="profile-card">
              <div className="card-header">
                <h2 className="card-title">Personal Information</h2>
                {!isEditing && (
                  <button onClick={handleEdit} className="edit-btn" disabled={loading}>
                    Edit
                  </button>
                )}
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label className="info-label">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      className="info-input"
                    />
                  ) : (
                    <p className="info-value">{profile.username}</p>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="info-input"
                    />
                  ) : (
                    <p className="info-value">{profile.email}</p>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone_number || ''}
                      onChange={(e) => handleChange('phone_number', e.target.value)}
                      className="info-input"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="info-value">{profile.phone_number || 'Not provided'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label">Role</label>
                  <p className="info-value">{profile.role}</p>
                </div>

                {/* Customer-specific fields */}
                {isCustomer && (
                  <>
                    <div className="info-item">
                      <label className="info-label">Shipping Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.shipping_address || ''}
                          onChange={(e) => handleChange('shipping_address', e.target.value)}
                          className="info-input"
                          placeholder="Enter shipping address"
                        />
                      ) : (
                        <p className="info-value">{profile.shipping_address || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="info-item">
                      <label className="info-label">Billing Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.billing_address || ''}
                          onChange={(e) => handleChange('billing_address', e.target.value)}
                          className="info-input"
                          placeholder="Enter billing address"
                        />
                      ) : (
                        <p className="info-value">{profile.billing_address || 'Not provided'}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Seller-specific fields */}
                {isSeller && (
                  <>
                    <div className="info-item">
                      <label className="info-label">Store Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.store_name || ''}
                          onChange={(e) => handleChange('store_name', e.target.value)}
                          className="info-input"
                          placeholder="Enter store name"
                        />
                      ) : (
                        <p className="info-value">{profile.store_name || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="info-item full-width">
                      <label className="info-label">Store Description</label>
                      {isEditing ? (
                        <textarea
                          value={editedProfile.store_description || ''}
                          onChange={(e) => handleChange('store_description', e.target.value)}
                          className="info-textarea"
                          placeholder="Enter store description"
                          rows="3"
                        />
                      ) : (
                        <p className="info-value">{profile.store_description || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="info-item">
                      <label className="info-label">Business License</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.business_license || ''}
                          onChange={(e) => handleChange('business_license', e.target.value)}
                          className="info-input"
                          placeholder="Enter business license"
                        />
                      ) : (
                        <p className="info-value">{profile.business_license || 'Not provided'}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {isEditing && (
                <div className="edit-actions">
                  <button onClick={handleCancel} className="cancel-btn" disabled={loading}>
                    Cancel
                  </button>
                  <button onClick={handleSave} className="save-btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Account Settings */}
            <div className="profile-card">
              <h2 className="card-title">Account Settings</h2>
              
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-title">Role</h3>
                    
                  </div>
                  <div className="role-switch-buttons">
                    <button 
                      onClick={() => handleRoleSwitch('CUSTOMER')}
                      className={`role-btn ${profile.role === 'CUSTOMER' ? 'active' : ''}`}
                    >
                      Customer
                    </button>
                    <button 
                      onClick={() => handleRoleSwitch('SELLER')}
                      className={`role-btn ${profile.role === 'SELLER' ? 'active' : ''}`}
                    >
                      Seller
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-title">Password</h3>
                    <p className="setting-desc">Update your password</p>
                  </div>
                  <button onClick={handlePasswordChange} className="setting-btn">
                    Change
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-title">Two-Factor Authentication</h3>
                    <p className="setting-desc">Add an extra layer of security</p>
                  </div>
                  <button className="setting-btn">Enable</button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-title">Email Notifications</h3>
                    <p className="setting-desc">Receive updates about your orders</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-title">Newsletter</h3>
                    <p className="setting-desc">Get exclusive deals and updates</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="profile-card">
              <h2 className="card-title">Account Information</h2>
              
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-title">Current Role</h3>
                    <p className="setting-desc">{profile.role}</p>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-title">User ID</h3>
                    <p className="setting-desc">#{profile.user_id}</p>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-title">Security Status</h3>
                    <p className="setting-desc">Your account is secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}