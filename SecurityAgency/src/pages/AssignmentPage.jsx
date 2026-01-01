import { API_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Search, Plus, Edit, Trash2, X, Save, AlertCircle, 
  CheckCircle, Loader, Calendar, User, FileText, Clock
} from 'lucide-react';

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [lookupData, setLookupData] = useState({ 
    personnel: [], 
    clients: [],
    contracts: [],
    statuses: [],
    paymentTypes: []
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedClient, setSelectedClient] = useState(null);
  const [availablePersonnel, setAvailablePersonnel] = useState([]);
  const [selectedPersonnelList, setSelectedPersonnelList] = useState([]);

  const [formData, setFormData] = useState({
    client_id: '',
    start_date: '',
    end_date: '',
    status_id: '',
    paymenttype_id: '',
    deployment_count: '',
    personnel_assignments: [] // Array of {personnel_id, base_pay}
  });

  useEffect(() => {
    fetchAssignments();
    fetchLookupData();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [searchTerm, assignments]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch('${API_URL}/api/assignments');
      const data = await response.json();
      if (data.success) {
        setAssignments(data.data);
        setFilteredAssignments(data.data);
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch assignments');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookupData = async () => {
    try {
      const [personnelRes, clientsRes, contractsRes, statusesRes, paymentTypesRes] = await Promise.all([
        fetch('${API_URL}/api/personnel'),
        fetch('${API_URL}/api/clients'),
        fetch('${API_URL}/api/contracts'),
        fetch('${API_URL}/api/assignment-statuses'),
        fetch('${API_URL}/api/payment-types')
      ]);

      const personnelData = await personnelRes.json();
      const clientsData = await clientsRes.json();
      const contractsData = await contractsRes.json();
      const statusesData = await statusesRes.json();
      const paymentTypesData = await paymentTypesRes.json();

      setLookupData({
        personnel: personnelData.success ? personnelData.data : [],
        clients: clientsData.success ? clientsData.data : [],
        contracts: contractsData.success ? contractsData.data : [],
        statuses: statusesData.success ? statusesData.data : [],
        paymentTypes: paymentTypesData.success ? paymentTypesData.data : []
      });
    } catch (error) {
      console.error('Fetch lookup data error:', error);
    }
  };

  const filterAssignments = () => {
    if (!searchTerm.trim()) {
      setFilteredAssignments(assignments);
    } else {
      const filtered = assignments.filter(a => 
        a.assignment_id?.toString().includes(searchTerm) ||
        a.personnel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssignments(filtered);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleClientSelect = (clientId) => {
    setFormData(prev => ({ ...prev, client_id: clientId }));
    setSelectedClient(lookupData.clients.find(c => c.client_id === parseInt(clientId)));
    setAvailablePersonnel(lookupData.personnel);
    setSelectedPersonnelList([]);
  };

  const togglePersonnelSelection = (personnel) => {
    setSelectedPersonnelList(prev => {
      const exists = prev.find(p => p.personnel_id === personnel.personnel_id);
      if (exists) {
        return prev.filter(p => p.personnel_id !== personnel.personnel_id);
      } else {
        return [...prev, personnel];
      }
    });
  };

  const openModal = (assignment = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        client_id: assignment.client_id || '',
        start_date: assignment.start_date ? assignment.start_date.split('T')[0] : '',
        end_date: assignment.end_date ? assignment.end_date.split('T')[0] : '',
        status_id: assignment.status_id || '',
        paymenttype_id: assignment.paymenttype_id || '',
        deployment_count: '',
        personnel_assignments: []
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        client_id: '',
        start_date: '',
        end_date: '',
        status_id: '',
        paymenttype_id: '',
        deployment_count: '',
        personnel_assignments: []
      });
    }
    setSelectedClient(null);
    setAvailablePersonnel([]);
    setSelectedPersonnelList([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAssignment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.client_id) {
      showMessage('error', 'Please select a client');
      return;
    }
    
    if (selectedPersonnelList.length === 0) {
      showMessage('error', 'Please select at least one personnel');
      return;
    }
    
    if (!formData.status_id) {
      showMessage('error', 'Please select a status');
      return;
    }

    if (!formData.paymenttype_id) {
      showMessage('error', 'Please select a payment type');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      showMessage('error', 'Please set start and end dates');
      return;
    }

    setLoading(true);

    try {
      // Create an assignment for each selected personnel
      const assignmentPromises = selectedPersonnelList.map(personnel =>
        fetch('${API_URL}/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personnel_id: personnel.personnel_id,
            client_id: selectedClient?.client_id,
            status_id: formData.status_id,
            paymenttype_id: formData.paymenttype_id,
            start_date: formData.start_date,
            end_date: formData.end_date
          })
        })
      );

      const responses = await Promise.all(assignmentPromises);
      const results = await Promise.all(responses.map(r => r.json()));

      const allSuccess = results.every(r => r.success);
      if (allSuccess) {
        showMessage('success', `${selectedPersonnelList.length} assignment(s) added successfully`);
        fetchAssignments();
        closeModal();
      } else {
        showMessage('error', 'Some assignments failed to be added');
      }
    } catch (error) {
      showMessage('error', 'Operation failed');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/assignments/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Assignment deleted successfully');
        fetchAssignments();
      } else {
        showMessage('error', 'Failed to delete assignment');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete assignment');
      console.error('Delete error:', error);
    }
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Same day';
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Assignment Management</h1>
        <p className="text-slate-600">Manage personnel assignments and contracts</p>
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
              placeholder="Search by assignment ID, personnel name, client, or status..."
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
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* Assignment Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No assignments found</p>
            <p className="text-slate-400 text-sm">Create your first assignment to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto animate-in fade-in duration-300">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Assignment ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Personnel</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">End Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAssignments.map((assignment, index) => (
                  <tr 
                    key={assignment.assignment_id} 
                    className="hover:bg-slate-50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{assignment.assignment_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{assignment.personnel_name}</p>
                          <p className="text-xs text-slate-500">ID: {assignment.personnel_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-800">{assignment.client_name || 'N/A'}</p>
                          <p className="text-xs text-slate-500">ID: {assignment.client_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {assignment.start_date ? new Date(assignment.start_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{calculateDuration(assignment.start_date, assignment.end_date)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(assignment.status)}`}>
                        {assignment.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openModal(assignment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.assignment_id)}
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-top-4 zoom-in-95 duration-500">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Selection */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Select Client</span>
                  </h3>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Client *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => handleClientSelect(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a Client</option>
                    {lookupData.clients.map(c => (
                      <option key={c.client_id} value={c.client_id}>
                        {c.business_name || c.client_name} (ID: {c.client_id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personnel Selection */}
                {selectedClient && (
                  <>
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <span>Select Personnel to Deploy</span>
                      </h3>
                    </div>

                    <div className="md:col-span-2">
                      <div className="border border-slate-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                        {availablePersonnel.length === 0 ? (
                          <p className="text-slate-500 text-center py-4">No personnel available</p>
                        ) : (
                          <div className="space-y-3">
                            {availablePersonnel.map(personnel => (
                              <div
                                key={personnel.personnel_id}
                                className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPersonnelList.some(p => p.personnel_id === personnel.personnel_id)}
                                  onChange={() => togglePersonnelSelection(personnel)}
                                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                                />
                                <div className="flex-1 ml-3">
                                  <p className="font-medium text-slate-800">{personnel.personnel_name}</p>
                                  <p className="text-xs text-slate-500">ID: {personnel.personnel_id}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Personnel with Base Pay */}
                    {selectedPersonnelList.length > 0 && (
                      <>
                        <div className="md:col-span-2">
                          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span>Selected Personnel ({selectedPersonnelList.length})</span>
                          </h3>
                        </div>

                        <div className="md:col-span-2">
                          <div className="space-y-3">
                            {selectedPersonnelList.map(personnel => (
                              <div key={personnel.personnel_id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {personnel.personnel_name}
                                  </p>
                                  <p className="text-xs text-slate-500">ID: {personnel.personnel_id}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => togglePersonnelSelection(personnel)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Assignment Details */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span>Assignment Dates & Status</span>
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">End Date *</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status *</label>
                      <select
                        value={formData.status_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, status_id: e.target.value }))}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Status</option>
                        {lookupData.statuses.map(s => (
                          <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Type */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Type *</label>
                      <select
                        value={formData.paymenttype_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymenttype_id: e.target.value }))}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Payment Type</option>
                        {lookupData.paymentTypes.map(pt => (
                          <option key={pt.paymenttype_id} value={pt.paymenttype_id}>{pt.type}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
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
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !selectedClient || selectedPersonnelList.length === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Deploying...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Deploy Personnel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}