import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard/ProfilePage.css';
import NavBarComponent from "../component/Dashboard/NavBarComponent";

export default function ProfilePage() {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState({
    user_id: null,
    username: '',
    email: '',
    phone_number: '',
    role: '',
    profilePhoto: null,
    // Customer fields
    shipping_address: '',
    billing_address: '',
    // Seller fields
    store_name: '',
    store_description: '',
    business_license: ''
  });

  const [editedProfile, setEditedProfile] = useState(profile);
  const [roleSwitching, setRoleSwitching] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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

      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ userId: String(userId) })
      });

      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();

      // merge server data with local defaults to ensure all fields exist
      setProfile(prev => ({ ...prev, ...data }));
      setEditedProfile(prev => ({ ...prev, ...data }));
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate, API_BASE]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleEdit = () => { setIsEditing(true); setEditedProfile(profile); };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
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
      // refresh from server to ensure we display persisted values
      try {
        await fetchProfile();
      } catch (e) {
        // fallback to returned data if fetchProfile fails
        setProfile(data);
      }

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.username = data.username;
        user.email = data.email;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('username', data.username);
        try { window.dispatchEvent(new CustomEvent('lazzappe:username-changed', { detail: data.username })); } catch (e) {}
      }

      setIsEditing(false);
      setError(null);
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
      alert(err.message || 'Failed to update profile. Please try again.');
    } finally { setLoading(false); }
  };

  const handleCancel = () => { setEditedProfile(profile); setIsEditing(false); };
  const handleChange = (field, value) => setEditedProfile({ ...editedProfile, [field]: value });

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', String(profile.user_id));

      const response = await fetch(`${API_BASE}/api/auth/upload-photo`, {
        method: 'POST',
        mode: 'cors',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload photo');
      }

      const data = await response.json();
      
      // Update profile with new photo URL
      setProfile(prev => ({ ...prev, profilePhoto: data.photoUrl }));
      setEditedProfile(prev => ({ ...prev, profilePhoto: data.photoUrl }));
      
      alert('Photo updated successfully!');
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({
          userId: String(profile.user_id),
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      alert('Password changed successfully!');
      setPasswordModalOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordError('');
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRoleSwitch = async (newRole) => {
    // Ask for confirmation before switching roles
    const ok = window.confirm(`Switch role to ${newRole}? This may change available features.`);
    if (!ok) return;

    try {
      setRoleSwitching(true);
      console.log(`[RoleSwitch] Starting role switch to ${newRole} for user ${profile.user_id}`);
      
      const response = await fetch(`${API_BASE}/api/auth/switch-role`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ userId: String(profile.user_id), role: newRole })
      });

      if (!response.ok) { 
        const errorData = await response.json(); 
        console.error('[RoleSwitch] Server error:', errorData);
        throw new Error(errorData.error || 'Failed to switch role'); 
      }
      
      const data = await response.json();
      console.log('[RoleSwitch] Response received:', data);
      
      // Update profile immediately with response data
      const updatedProfile = { ...profile, ...data, role: data.role };
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      
      console.log('[RoleSwitch] Profile updated to role:', data.role);
      
      // Update localStorage with new role
      const userStr = localStorage.getItem('user'); 
      if (userStr) { 
        const user = JSON.parse(userStr); 
        user.role = data.role;
        user.seller_id = data.seller_id || null;
        localStorage.setItem('user', JSON.stringify(user)); 
        console.log('[RoleSwitch] LocalStorage updated:', user);
      }
      
      // Notify other parts of the app that products may have changed
      try { window.dispatchEvent(new CustomEvent('lazzappe:products-changed', { detail: { userId: profile.user_id } })); } catch (e) {}
      // Also re-load the cart by signaling username change
      try { window.dispatchEvent(new CustomEvent('lazzappe:username-changed', { detail: data.username })); } catch (e) {}
      
      console.log('[RoleSwitch] Role switch completed successfully');
      alert(`Role switched to ${data.role} successfully!`);
    } catch (err) { 
      console.error('[RoleSwitch] Error switching role:', err); 
      alert(err.message || 'Failed to switch role. Please try again.'); 
    } finally { 
      setRoleSwitching(false); 
    }
  };

  if (loading && !profile.user_id) return (<><NavBarComponent /><div className="profile-container"><div className="profile-wrapper"><div className="loading-message">Loading profile...</div></div></div></>);
  if (error && !profile.user_id) return (<><NavBarComponent /><div className="profile-container"><div className="profile-wrapper"><div className="error-message">{error}</div></div></div></>);

  const getInitials = (username) => { if (!username) return 'U'; return username.substring(0, 2).toUpperCase(); };

  const isCustomer = profile.role === 'CUSTOMER';
  const isSeller = profile.role === 'SELLER';

  return (
    <>
      <NavBarComponent />
      <div className="profile-container">
        <div className="profile-wrapper">
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Profile" className="avatar-image" />
                ) : (
                  <div className="avatar-placeholder">{getInitials(profile.username)}</div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="photo-input-hidden"
                disabled={uploadingPhoto}
              />
              <button 
                className="avatar-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
              </button>
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{profile.username || 'User'}</h1>
              <p className="profile-member">{profile.role || 'CUSTOMER'}</p>
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-card">
              <div className="card-header">
                <h2 className="card-title">Personal Information</h2>
                {!isEditing && (<button onClick={handleEdit} className="edit-btn" disabled={loading}>Edit</button>)}
              </div>

              <div className="info-grid">
                <div className="info-item"><label className="info-label">Username</label>{isEditing ? (<input type="text" value={editedProfile.username} onChange={(e)=>handleChange('username', e.target.value)} className="info-input"/>) : (<p className="info-value">{profile.username}</p>)}</div>
                <div className="info-item"><label className="info-label">Email Address</label>{isEditing ? (<input type="email" value={editedProfile.email} onChange={(e)=>handleChange('email', e.target.value)} className="info-input"/>) : (<p className="info-value">{profile.email}</p>)}</div>
                <div className="info-item"><label className="info-label">Phone Number</label>{isEditing ? (<input type="tel" value={editedProfile.phone_number||''} onChange={(e)=>handleChange('phone_number', e.target.value)} className="info-input" placeholder="Enter phone number"/>) : (<p className="info-value">{profile.phone_number||'Not provided'}</p>)}</div>
                <div className="info-item"><label className="info-label">Role</label><p className="info-value">{profile.role}</p></div>
                <div className="info-item"><label className="info-label">User ID</label><p className="info-value">#{profile.user_id}</p></div>
              </div>

              {isEditing && (<div className="edit-actions"><button onClick={handleCancel} className="cancel-btn" disabled={loading}>Cancel</button><button onClick={handleSave} className="save-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button></div>)}
            </div>

            <div className="profile-card">
              <h2 className="card-title">Account Settings</h2>
              <div className="settings-list">
                <div className="setting-item"><div className="setting-info"><h3 className="setting-title">Role</h3></div>
                  <div className="role-switch-buttons">
                    <button
                      onClick={()=>handleRoleSwitch('CUSTOMER')}
                      className={`role-btn ${profile.role==='CUSTOMER' ? 'active':''}`}
                      disabled={roleSwitching || profile.role === 'CUSTOMER'}
                      style={profile.role === 'CUSTOMER' ? { background: '#2b8aef', color: '#fff' } : {}}
                    >
                      {roleSwitching && profile.role !== 'CUSTOMER' ? 'Switching...' : 'Customer'}
                    </button>
                    <button
                      onClick={()=>handleRoleSwitch('SELLER')}
                      className={`role-btn ${profile.role==='SELLER' ? 'active':''}`}
                      disabled={roleSwitching || profile.role === 'SELLER'}
                      style={profile.role === 'SELLER' ? { background: '#2b8aef', color: '#fff' } : {}}
                    >
                      {roleSwitching && profile.role !== 'SELLER' ? 'Switching...' : 'Seller'}
                    </button>
                  </div>
                </div>

                <div className="setting-item"><div className="setting-info"><h3 className="setting-title">Password</h3><p className="setting-desc">Update your password</p></div><button onClick={() => setPasswordModalOpen(true)} className="setting-btn">Change</button></div>

                <div className="setting-item"><div className="setting-info"><h3 className="setting-title">Two-Factor Authentication</h3><p className="setting-desc">Add an extra layer of security</p></div><button className="setting-btn">Enable</button></div>

                <div className="setting-item"><div className="setting-info"><h3 className="setting-title">Email Notifications</h3><p className="setting-desc">Receive updates about your orders</p></div><label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label></div>

                <div className="setting-item"><div className="setting-info"><h3 className="setting-title">Newsletter</h3><p className="setting-desc">Get exclusive deals and updates</p></div><label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label></div>
              </div>
            </div>

            {/* Customer view */}
            {isCustomer && (
              <div className="profile-card">
                <div className="card-header">
                  <h2 className="card-title">Customer Details</h2>
                  {!isEditing && (<button onClick={handleEdit} className="edit-btn" disabled={loading}>Edit</button>)}
                </div>
                <div className="info-grid">
                  <div className="info-item"><label className="info-label">Shipping Address</label>{isEditing ? (<input type="text" value={editedProfile.shipping_address||''} onChange={(e)=>handleChange('shipping_address', e.target.value)} className="info-input" placeholder="Enter shipping address"/>) : (<p className="info-value">{profile.shipping_address||'Not provided'}</p>)}</div>
                  <div className="info-item"><label className="info-label">Billing Address</label>{isEditing ? (<input type="text" value={editedProfile.billing_address||''} onChange={(e)=>handleChange('billing_address', e.target.value)} className="info-input" placeholder="Enter billing address"/>) : (<p className="info-value">{profile.billing_address||'Not provided'}</p>)}</div>
                </div>
                {isEditing && (<div className="edit-actions"><button onClick={handleCancel} className="cancel-btn" disabled={loading}>Cancel</button><button onClick={handleSave} className="save-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button></div>)}
              </div>
            )}

            {/* Seller view */}
            {isSeller && (
              <div className="profile-card">
                <div className="card-header">
                  <h2 className="card-title">Seller Details</h2>
                  {!isEditing && (<button onClick={handleEdit} className="edit-btn" disabled={loading}>Edit</button>)}
                </div>
                <div className="info-grid">
                  <div className="info-item"><label className="info-label">Store Name</label>{isEditing ? (<input type="text" value={editedProfile.store_name||''} onChange={(e)=>handleChange('store_name', e.target.value)} className="info-input"/>) : (<p className="info-value">{profile.store_name||'Not provided'}</p>)}</div>
                  <div className="info-item full-width"><label className="info-label">Store Description</label>{isEditing ? (<textarea value={editedProfile.store_description||''} onChange={(e)=>handleChange('store_description', e.target.value)} className="info-textarea" rows="3"/>) : (<p className="info-value">{profile.store_description||'Not provided'}</p>)}</div>
                  <div className="info-item"><label className="info-label">Business License</label>{isEditing ? (<input type="text" value={editedProfile.business_license||''} onChange={(e)=>handleChange('business_license', e.target.value)} className="info-input"/>) : (<p className="info-value">{profile.business_license||'Not provided'}</p>)}</div>
                </div>
                {isEditing && (<div className="edit-actions"><button onClick={handleCancel} className="cancel-btn" disabled={loading}>Cancel</button><button onClick={handleSave} className="save-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button></div>)}
              </div>
            )}

            <div className="profile-card">
              <h2 className="card-title">Account Information</h2>
              <div className="settings-list">
                <div className="setting-item"><div className="setting-info"><h3 className="setting-title">Current Role</h3><p className="setting-desc">{profile.role}</p></div></div>
                <div className="setting-item"><div className="setting-info"><h3 className="setting-title">User ID</h3><p className="setting-desc">#{profile.user_id}</p></div></div>
                <div className="setting-item"><div className="setting-info"><h3 className="setting-title">Security Status</h3><p className="setting-desc">Your account is secure</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password Change Modal */}
      {passwordModalOpen && (
        <div className="modal-overlay" onClick={() => setPasswordModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Change Password</h2>
              <button className="modal-close" onClick={() => setPasswordModalOpen(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              {passwordError && (
                <div className="modal-error">{passwordError}</div>
              )}
              
              <div className="modal-form-group">
                <label className="modal-label">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  placeholder="Enter your current password"
                  className="modal-input"
                  disabled={passwordLoading}
                />
              </div>
              
              <div className="modal-form-group">
                <label className="modal-label">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  placeholder="Enter new password (min 6 characters)"
                  className="modal-input"
                  disabled={passwordLoading}
                />
              </div>
              
              <div className="modal-form-group">
                <label className="modal-label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                  className="modal-input"
                  disabled={passwordLoading}
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="modal-btn modal-btn-cancel" 
                onClick={() => setPasswordModalOpen(false)}
                disabled={passwordLoading}
              >
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-submit" 
                onClick={handlePasswordChange}
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}