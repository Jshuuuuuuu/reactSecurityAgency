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
    contracts: [],
    statuses: []
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    personnel_id: '',
    contract_id: '',
    start_date: '',
    end_date: '',
    status_id: ''
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
      const response = await fetch('http://localhost:5000/api/assignments');
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
      const [personnelRes, contractsRes, statusesRes] = await Promise.all([
        fetch('http://localhost:5000/api/personnel'),
        fetch('http://localhost:5000/api/contracts'),
        fetch('http://localhost:5000/api/assignment-statuses')
      ]);

      const personnelData = await personnelRes.json();
      const contractsData = await contractsRes.json();
      const statusesData = await statusesRes.json();

      setLookupData({
        personnel: personnelData.success ? personnelData.data : [],
        contracts: contractsData.success ? contractsData.data : [],
        statuses: statusesData.success ? statusesData.data : []
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
        a.contract_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssignments(filtered);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const openModal = (assignment = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        personnel_id: assignment.personnel_id || '',
        contract_id: assignment.contract_id || '',
        start_date: assignment.start_date ? assignment.start_date.split('T')[0] : '',
        end_date: assignment.end_date ? assignment.end_date.split('T')[0] : '',
        status_id: assignment.status_id || ''
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        personnel_id: '',
        contract_id: '',
        start_date: '',
        end_date: '',
        status_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAssignment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingAssignment 
        ? `http://localhost:5000/api/assignments/${editingAssignment.assignment_id}`
        : 'http://localhost:5000/api/assignments';
      
      const method = editingAssignment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', `Assignment ${editingAssignment ? 'updated' : 'added'} successfully`);
        fetchAssignments();
        closeModal();
      } else {
        showMessage('error', data.message || 'Operation failed');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
              placeholder="Search by assignment ID, personnel name, contract, or status..."
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contract</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">End Date</th>
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
                          <p className="text-sm text-slate-800">{assignment.contract_title || 'N/A'}</p>
                          <p className="text-xs text-slate-500">ID: {assignment.contract_id}</p>
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
                {/* Assignment Details */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    <span>Assignment Details</span>
                  </h3>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Personnel *</label>
                  <select
                    name="personnel_id"
                    value={formData.personnel_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Personnel</option>
                    {lookupData.personnel.map(p => (
                      <option key={p.personnel_id} value={p.personnel_id}>
                        {p.personnel_name} (ID: {p.personnel_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contract *</label>
                  <select
                    name="contract_id"
                    value={formData.contract_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Contract</option>
                    {lookupData.contracts.map(c => (
                      <option key={c.contract_id} value={c.contract_id}>
                        {c.contract_title || c.client_name} (ID: {c.contract_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status *</label>
                  <select
                    name="status_id"
                    value={formData.status_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Status</option>
                    {lookupData.statuses.map(s => (
                      <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
                    ))}
                  </select>
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
                  type="button"
                  onClick={handleSubmit}
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
                      <span>{editingAssignment ? 'Update' : 'Save'}</span>
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