import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Home,
  Building,
  Briefcase,
  Check,
} from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";

const AddressManagement = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    addressType: "home",
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockAddresses = [
        {
          id: 1,
          name: "Rahul Sharma",
          phone: "+91 98765 43210",
          addressLine1: "123 Garden Street",
          addressLine2: "Near Central Park",
          landmark: "Opposite Mall",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
          addressType: "home",
          isDefault: true,
        },
        {
          id: 2,
          name: "Rahul Sharma",
          phone: "+91 98765 43210",
          addressLine1: "456 Business Avenue",
          addressLine2: "Wing A, 7th Floor",
          landmark: "Near Metro Station",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400051",
          country: "India",
          addressType: "work",
          isDefault: false,
        },
      ];

      setAddresses(mockAddresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4" />;
      case "work":
        return <Briefcase className="w-4 h-4" />;
      case "other":
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAddress) {
        // Update existing address
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === editingAddress.id
              ? { ...formData, id: editingAddress.id }
              : formData.isDefault
                ? { ...addr, isDefault: false }
                : addr,
          ),
        );
      } else {
        // Add new address
        const newAddress = {
          ...formData,
          id: Date.now(),
        };

        if (formData.isDefault) {
          setAddresses((prev) =>
            prev.map((addr) => ({ ...addr, isDefault: false })),
          );
        }

        setAddresses((prev) => [...prev, newAddress]);
      }

      // Reset form
      setFormData({
        name: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        addressType: "home",
        isDefault: false,
      });

      setShowForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      } catch (error) {
        console.error("Error deleting address:", error);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr.id === addressId,
        })),
      );
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    setFormData({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      addressType: "home",
      isDefault: false,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <LoadingSpinner text="Loading addresses..." fullScreen={false} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Address Management
              </h1>
              <p className="text-gray-600">
                Manage your delivery addresses for decoration services
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20} />
              Add Address
            </button>
          </div>
        </div>

        {/* Address Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                  placeholder="House/Flat number, Street name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                  placeholder="Apartment, Building, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                    placeholder="Nearby landmark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    pattern="[0-9]{6}"
                    maxLength="6"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                    placeholder="400001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                    placeholder="Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                    placeholder="India"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type *
                </label>
                <div className="flex flex-wrap gap-3">
                  {["home", "work", "other"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="addressType"
                        value={type}
                        checked={formData.addressType === type}
                        onChange={handleInputChange}
                        className="text-indigo-600"
                      />
                      <span className="flex items-center gap-1">
                        {getAddressIcon(type)}
                        <span className="capitalize">{type}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="isDefault"
                  className="ml-2 text-sm text-gray-700"
                >
                  Set as default address
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {editingAddress ? "Update Address" : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No addresses saved
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first address to make checkout faster
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </button>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-lg shadow-sm border p-6 ${
                  address.isDefault ? "border-indigo-500" : "border-gray-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {getAddressIcon(address.addressType)}
                        <span className="capitalize font-medium">
                          {address.addressType}
                        </span>
                      </div>

                      {address.isDefault && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                          <Check className="w-3 h-3" />
                          Default
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-gray-700">
                      <p className="font-medium text-gray-900">
                        {address.name}
                      </p>
                      <p className="text-sm">{address.phone}</p>
                      <p className="text-sm break-words">
                        {address.addressLine1},{" "}
                        {address.addressLine2 && `${address.addressLine2}, `}
                        {address.landmark && `Near ${address.landmark}, `}
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-sm">{address.country}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 ml-0 sm:ml-4">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                      title="Edit address"
                    >
                      <Edit2 size={16} />
                    </button>

                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                        title="Set as default"
                      >
                        <Check size={16} />
                      </button>
                    )}

                    {addresses.length > 1 && (
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddressManagement;
