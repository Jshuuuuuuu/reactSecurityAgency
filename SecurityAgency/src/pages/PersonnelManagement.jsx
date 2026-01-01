import { API_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Search, Plus, Edit, Trash2, X, Save, AlertCircle, 
  CheckCircle, Loader, Mail, Phone, MapPin, User, Calendar
} from 'lucide-react';

export default function PersonnelManagement() {
  const [personnel, setPersonnel] = useState([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState(null);
  const [lookupData, setLookupData] = useState({ genders: [], civilStatuses: [] });
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    personnel_name: '',
    personnel_age: '',
    civilstatus_id: '',
    gender_id: '',
    contact_no: '',
    email: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    postal_code: ''
  });

  useEffect(() => {
    fetchPersonnel();
    fetchLookupData();
  }, []);

  useEffect(() => {
    filterPersonnel();
  }, [searchTerm, personnel]);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/personnel`);
      if (response.data.success) {
        setPersonnel(response.data.data);
        setFilteredPersonnel(response.data.data);
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch personnel');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookupData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/lookup-data`);
      if (response.data.success) {
        setLookupData(response.data.data);
      }
    } catch (error) {
      console.error('Fetch lookup data error:', error);
    }
  };

  const filterPersonnel = () => {
    if (!searchTerm.trim()) {
      setFilteredPersonnel(personnel);
    } else {
      const filtered = personnel.filter(p => 
        p.personnel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contact_no?.includes(searchTerm)
      );
      setFilteredPersonnel(filtered);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const openModal = async (person = null) => {
    if (person) {
      setEditingPersonnel(person);
      
      // If editing and has address data from the list
      setFormData({
        personnel_name: person.personnel_name || '',
        personnel_age: person.personnel_age || '',
        civilstatus_id: person.civilstatus_id || '',
        gender_id: person.gender_id || '',
        contact_no: person.contact_no || '',
        email: person.email || '',
        street: person.street || '',
        barangay: person.barangay || '',
        city: person.city || '',
        province: person.province || '',
        postal_code: person.postal_code || '',
        address_id: person.address_id || null
      });
    } else {
      setEditingPersonnel(null);
      setFormData({
        personnel_name: '',
        personnel_age: '',
        civilstatus_id: '',
        gender_id: '',
        contact_no: '',
        email: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        postal_code: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPersonnel(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPersonnel) {
        const response = await axios.put(
          `http://localhost:5000/api/personnel/${editingPersonnel.personnel_id}`,
          formData
        );
        if (response.data.success) {
          showMessage('success', 'Personnel updated successfully');
          fetchPersonnel();
          closeModal();
        }
      } else {
        const response = await axios.post(`${API_URL}/api/personnel`, formData);
        if (response.data.success) {
          showMessage('success', 'Personnel added successfully');
          fetchPersonnel();
          closeModal();
        }
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Operation failed');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/personnel/${id}`);
      if (response.data.success) {
        showMessage('success', 'Personnel deleted successfully');
        fetchPersonnel();
      }
    } catch (error) {
      showMessage('error', 'Failed to delete personnel');
      console.error('Delete error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Personnel Management</h1>
        <p className="text-slate-600">Manage security personnel information</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 animate-in slide-in-from-top duration-300 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search and Add Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Add Personnel</span>
          </button>
        </div>
      </div>

      {/* Personnel Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredPersonnel.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No personnel found</p>
            <p className="text-slate-400 text-sm">Add your first personnel member to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto animate-in fade-in duration-300">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Age</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Gender</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPersonnel.map((person, index) => (
                  <tr 
                    key={person.personnel_id} 
                    className="hover:bg-slate-50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  >
                    <td className="px-6 py-4 text-sm text-slate-600">{person.personnel_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-800">{person.personnel_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{person.personnel_age}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{person.gender || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{person.contact_no || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{person.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={person.address}>
                      {person.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {person.civil_status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openModal(person)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(person.personnel_id, person.personnel_name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-top-4 zoom-in-95 duration-500">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingPersonnel ? 'Edit Personnel' : 'Add New Personnel'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Personal Information</span>
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="personnel_name"
                    value={formData.personnel_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Age *</label>
                  <input
                    type="number"
                    name="personnel_age"
                    value={formData.personnel_age}
                    onChange={handleInputChange}
                    required
                    min="18"
                    max="100"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gender *</label>
                  <select
                    name="gender_id"
                    value={formData.gender_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    {lookupData.genders.map(g => (
                      <option key={g.gender_id} value={g.gender_id}>{g.gender_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Civil Status *</label>
                  <select
                    name="civilstatus_id"
                    value={formData.civilstatus_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Status</option>
                    {lookupData.civilStatuses.map(cs => (
                      <option key={cs.civilstatus_id} value={cs.civilstatus_id}>{cs.title}</option>
                    ))}
                  </select>
                </div>

                {/* Contact Information */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>Contact Information</span>
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                  <input
                    type="text"
                    name="contact_no"
                    value={formData.contact_no}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="09XX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Address Information */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>Address</span>
                  </h3>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Street</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Barangay</label>
                  <input
                    type="text"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Barangay"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Province</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Province"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="XXXX"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{editingPersonnel ? 'Update' : 'Save'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
