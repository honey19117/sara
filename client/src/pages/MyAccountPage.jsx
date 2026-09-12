import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Lock,
  Package,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const MyAccountPage = () => {
  const { user, updateProfile, changePassword, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses' | 'security'
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Security password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.getAddresses();
      if (res.success) setAddresses(res.addresses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile({ name, phone });
    } catch {
      // toast inside context
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsChangingPass(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      // toast inside context
    } finally {
      setIsChangingPass(false);
    }
  };

  const openNewAddressModal = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: addresses.length === 0
    });
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.full_name,
      phone: addr.phone,
      addressLine1: addr.address_line1,
      addressLine2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.is_default === 1
    });
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api.updateAddress(editingAddress.id, addressForm);
        showSuccess('Address updated successfully.');
      } else {
        await api.addAddress(addressForm);
        showSuccess('New address added to book.');
      }
      setIsAddressModalOpen(false);
      fetchAddresses();
    } catch (err) {
      showError(err.message || 'Could not save address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Remove this address from your book?')) {
      try {
        await api.deleteAddress(id);
        showSuccess('Address deleted.');
        fetchAddresses();
      } catch (err) {
        showError(err.message || 'Could not delete address.');
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif text-slate-100">Please Sign In</h2>
        <Link to="/login" className="btn-gold text-xs px-6 py-3 inline-block">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-1">
            Private Atelier Membership
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-100">
            Client Dossier: {user.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="btn-outline-gold text-xs px-4 py-2 flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>My Orders</span>
          </Link>
        </div>
      </div>

      {/* Account Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Sidebar Tabs */}
        <aside className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
              activeTab === 'profile'
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4 text-amber-400" />
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
              activeTab === 'addresses'
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Saved Address Book ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
              activeTab === 'security'
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Security & Passwords</span>
          </button>
        </aside>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-base font-bold font-serif text-slate-100">Personal Information</h3>
                <p className="text-xs text-slate-400">Update your primary account identifiers and concierge contacts.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-aura-950 border border-slate-800 rounded-lg p-2.5 text-slate-400 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Primary email cannot be modified directly. Contact concierge.</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="btn-gold text-xs px-6 py-2.5 font-bold"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-base font-bold font-serif text-slate-100">Saved Delivery Addresses</h3>
                  <p className="text-xs text-slate-400">Manage multiple delivery destinations for white-glove transit.</p>
                </div>
                <button
                  onClick={openNewAddressModal}
                  className="btn-outline-gold text-xs px-4 py-2 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {loadingAddresses ? (
                <LoadingSpinner size="md" className="py-8" />
              ) : addresses.length === 0 ? (
                <div className="text-center py-10 space-y-3 text-xs text-slate-400">
                  <p>No saved addresses in your book yet.</p>
                  <button onClick={openNewAddressModal} className="btn-outline-gold text-xs px-5 py-2">
                    Add Primary Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-5 rounded-2xl bg-aura-900 border border-slate-800 space-y-3 relative hover:border-slate-700 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <span>{addr.full_name}</span>
                            {addr.is_default === 1 && (
                              <span className="badge-tag bg-amber-500/20 text-amber-300 font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">Phone: {addr.phone}</div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditAddressModal(addr)}
                            className="p-1.5 text-slate-400 hover:text-amber-300 transition-colors"
                            aria-label="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed">
                        <div>{addr.address_line1}</div>
                        {addr.address_line2 && <div>{addr.address_line2}</div>}
                        <div>{addr.city}, {addr.state} - <strong className="font-mono">{addr.pincode}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === 'security' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-base font-bold font-serif text-slate-100">Security & Credentials</h3>
                <p className="text-xs text-slate-400">Update your account authentication password.</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">New Password (Min 6 Characters)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="btn-gold text-xs px-6 py-2.5 font-bold"
                  >
                    {isChangingPass ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* --- ADD / EDIT ADDRESS MODAL --- */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleAddressSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
              <input
                type="text"
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                required
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone *</label>
              <input
                type="tel"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                required
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Street Address / Landmark *</label>
            <input
              type="text"
              value={addressForm.addressLine1}
              onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
              required
              className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Apartment / Suite</label>
            <input
              type="text"
              value={addressForm.addressLine2}
              onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
              className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">PIN Code *</label>
              <input
                type="text"
                maxLength={6}
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                required
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">City *</label>
              <input
                type="text"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                required
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">State *</label>
              <input
                type="text"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                required
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 bg-aura-900 border-slate-700"
              />
              <span className="text-slate-300 font-medium">Set as default delivery address</span>
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="btn-ghost text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold text-xs px-6 py-2 font-bold"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
