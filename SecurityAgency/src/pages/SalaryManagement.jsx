import { API_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, Search, Plus, Edit, Trash2, X, Save, AlertCircle, 
  CheckCircle, Loader, User, Calculator, TrendingUp, TrendingDown,
  Clock, Check, XCircle
} from 'lucide-react';

export default function SalaryManagement() {
  const [personnel, setPersonnel] = useState([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [deductions, setDeductions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterStatus, setFilterStatus] = useState('all'); // all, paid, unpaid

  const [salaryForm, setSalaryForm] = useState({
    base_salary: '',
    base_bonus: '5000.00',
    base_allowance: '3000.00',
    selectedDeductions: [],
    payment_status: 'unpaid'
  });

  const [calculatedSalary, setCalculatedSalary] = useState({
    gross: 0,
    totalDeductions: 0,
    netSalary: 0
  });

  useEffect(() => {
    fetchPersonnelWithSalary();
    fetchDeductions();
  }, []);

  useEffect(() => {
    filterPersonnel();
  }, [searchTerm, personnel, filterStatus]);

  useEffect(() => {
    calculateSalary();
  }, [salaryForm]);

  const fetchPersonnelWithSalary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/salary/personnel`);
      if (response.data.success) {
        // Load payment status from localStorage
        const salaryData = JSON.parse(localStorage.getItem('salaryData') || '{}');
        
        const personnelWithStatus = response.data.data.map(person => ({
          ...person,
          payment_status: salaryData[person.personnel_id]?.payment_status || person.payment_status || 'unpaid'
        }));
        
        setPersonnel(personnelWithStatus);
        setFilteredPersonnel(personnelWithStatus);
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch personnel');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeductions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/salary/deductions`);
      if (response.data.success) {
        setDeductions(response.data.data);
      }
    } catch (error) {
      console.error('Fetch deductions error:', error);
    }
  };

  const filterPersonnel = () => {
    let filtered = personnel;

    // Filter by payment status
    if (filterStatus === 'paid') {
      filtered = filtered.filter(p => p.payment_status === 'paid');
    } else if (filterStatus === 'unpaid') {
      filtered = filtered.filter(p => p.payment_status !== 'paid');
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(p => 
        p.personnel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.personnel_id?.toString().includes(searchTerm)
      );
    }

    setFilteredPersonnel(filtered);
  };

  const calculateSalary = () => {
    const baseSalary = parseFloat(salaryForm.base_salary) || 0;
    const bonus = parseFloat(salaryForm.base_bonus) || 0;
    const allowance = parseFloat(salaryForm.base_allowance) || 0;
    
    const gross = baseSalary + bonus + allowance;
    
    const totalDeductions = salaryForm.selectedDeductions.reduce((sum, deduction) => {
      return sum + (parseFloat(deduction.amount) || 0);
    }, 0);
    
    const netSalary = gross - totalDeductions;

    setCalculatedSalary({
      gross,
      totalDeductions,
      netSalary
    });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const openModal = async (person) => {
    setSelectedPersonnel(person);
    
    if (person.has_salary) {
      // Load existing salary data
      try {
        const response = await axios.get(`http://localhost:5000/api/salary/${person.personnel_id}/deductions`);
        const personelDeductions = response.data.success ? response.data.data : [];
        
        setSalaryForm({
          base_salary: person.base_salary || '',
          base_bonus: person.base_bonus || '5000.00',
          base_allowance: person.base_allowance || '3000.00',
          selectedDeductions: personelDeductions.map(d => ({
            deduction_id: d.deduction_id,
            deduction_type: d.deduction_type,
            amount: d.amount.toString()
          })),
          payment_status: person.payment_status || 'unpaid'
        });
      } catch (error) {
        console.error('Error fetching deductions:', error);
        setSalaryForm({
          base_salary: person.base_salary || '',
          base_bonus: person.base_bonus || '5000.00',
          base_allowance: person.base_allowance || '3000.00',
          selectedDeductions: [],
          payment_status: person.payment_status || 'unpaid'
        });
      }
    } else {
      // Reset for new salary
      setSalaryForm({
        base_salary: '',
        base_bonus: '5000.00',
        base_allowance: '3000.00',
        selectedDeductions: [],
        payment_status: 'unpaid'
      });
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPersonnel(null);
    setSalaryForm({
      base_salary: '',
      base_bonus: '5000.00',
      base_allowance: '3000.00',
      selectedDeductions: [],
      payment_status: 'unpaid'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        personnel_id: selectedPersonnel.personnel_id,
        base_salary: parseFloat(salaryForm.base_salary),
        base_bonus: parseFloat(salaryForm.base_bonus),
        base_allowance: parseFloat(salaryForm.base_allowance),
        payment_status: salaryForm.payment_status,
        deductions: salaryForm.selectedDeductions.map(d => ({
          deduction_id: d.deduction_id,
          amount: parseFloat(d.amount)
        }))
      };

      const response = await axios.post(`${API_URL}/api/salary/calculate`, payload);
      
      if (response.data.success) {
        // Store payment status in localStorage as backup
        const salaryData = JSON.parse(localStorage.getItem('salaryData') || '{}');
        salaryData[selectedPersonnel.personnel_id] = {
          payment_status: salaryForm.payment_status,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('salaryData', JSON.stringify(salaryData));
        
        showMessage('success', 'Salary calculated and saved successfully');
        fetchPersonnelWithSalary();
        closeModal();
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Operation failed');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSalary = async (personnelId, name) => {
    if (!window.confirm(`Are you sure you want to delete salary record for ${name}?`)) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/salary/${personnelId}`);
      if (response.data.success) {
        showMessage('success', 'Salary record deleted successfully');
        fetchPersonnelWithSalary();
      }
    } catch (error) {
      showMessage('error', 'Failed to delete salary record');
      console.error('Delete error:', error);
    }
  };

  const addDeduction = () => {
    if (deductions.length > 0) {
      setSalaryForm(prev => ({
        ...prev,
        selectedDeductions: [...prev.selectedDeductions, {
          deduction_id: deductions[0].deduction_id,
          deduction_type: deductions[0].deduction_type,
          amount: '0.00'
        }]
      }));
    }
  };

  const removeDeduction = (index) => {
    setSalaryForm(prev => ({
      ...prev,
      selectedDeductions: prev.selectedDeductions.filter((_, i) => i !== index)
    }));
  };

  const updateDeduction = (index, field, value) => {
    setSalaryForm(prev => {
      const updated = [...prev.selectedDeductions];
      if (field === 'deduction_id') {
        const deduction = deductions.find(d => d.deduction_id === parseInt(value));
        updated[index] = {
          ...updated[index],
          deduction_id: parseInt(value),
          deduction_type: deduction?.deduction_type
        };
      } else {
        updated[index][field] = value;
      }
      return { ...prev, selectedDeductions: updated };
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  const stats = {
    totalPersonnel: personnel.length,
    paidPersonnel: personnel.filter(p => p.payment_status === 'paid').length,
    unpaidPersonnel: personnel.filter(p => p.payment_status !== 'paid').length,
    totalPayroll: personnel.reduce((sum, p) => sum + (parseFloat(p.net_salary) || 0), 0)
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Salary Management</h1>
        <p className="text-slate-600">Calculate and manage personnel salaries</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.totalPersonnel}</h3>
          <p className="text-slate-600 text-sm">Total Personnel</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.paidPersonnel}</h3>
          <p className="text-slate-600 text-sm">Paid Personnel</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.unpaidPersonnel}</h3>
          <p className="text-slate-600 text-sm">Unpaid Personnel</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{formatCurrency(stats.totalPayroll)}</h3>
          <p className="text-slate-600 text-sm">Total Payroll</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                filterStatus === 'paid' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Paid</span>
            </button>
            <button
              onClick={() => setFilterStatus('unpaid')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                filterStatus === 'unpaid' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Unpaid</span>
            </button>
          </div>
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
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No personnel found</p>
            <p className="text-slate-400 text-sm">Adjust your filters or add salary information</p>
          </div>
        ) : (
          <div className="overflow-x-auto animate-in fade-in duration-300">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Base Salary</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Bonus</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Allowance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Deductions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Net Salary</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Payment Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Next Payment</th>
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
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {person.has_salary ? formatCurrency(person.base_salary) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {person.has_salary ? formatCurrency(person.base_bonus) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {person.has_salary ? formatCurrency(person.base_allowance) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {person.has_salary ? formatCurrency(person.total_deductions) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {person.has_salary ? formatCurrency(person.net_salary) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {person.has_salary ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${
                          person.payment_status === 'paid'
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {person.payment_status === 'paid' ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Paid</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Unpaid</span>
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center space-x-1 w-fit">
                          <Clock className="w-3 h-3" />
                          <span>No Salary</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {person.has_salary && person.next_payment_due ? (
                        <div>
                          <div className="font-medium">
                            {new Date(person.next_payment_due).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className={`text-xs ${
                            person.days_until_next_payment < 0 ? 'text-red-600' :
                            person.days_until_next_payment <= 3 ? 'text-yellow-600' :
                            'text-slate-500'
                          }`}>
                            {person.days_until_next_payment < 0 
                              ? `${Math.abs(Math.floor(person.days_until_next_payment))} days overdue`
                              : person.days_until_next_payment === 0
                              ? 'Due today'
                              : `${Math.floor(person.days_until_next_payment)} days remaining`
                            }
                          </div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openModal(person)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={person.has_salary ? "Edit Salary" : "Calculate Salary"}
                        >
                          {person.has_salary ? <Edit className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
                        </button>
                        {person.has_salary && (
                          <button
                            onClick={() => handleDeleteSalary(person.personnel_id, person.personnel_name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Salary"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Calculation Modal */}
      {isModalOpen && selectedPersonnel && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-top-4 zoom-in-95 duration-500">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                {selectedPersonnel.has_salary ? 'Edit' : 'Calculate'} Salary - {selectedPersonnel.personnel_name}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Input Form */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span>Salary Components</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Base Salary *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={salaryForm.base_salary}
                        onChange={(e) => setSalaryForm(prev => ({ ...prev, base_salary: e.target.value }))}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Bonus</label>
                      <input
                        type="number"
                        step="0.01"
                        value={salaryForm.base_bonus}
                        onChange={(e) => setSalaryForm(prev => ({ ...prev, base_bonus: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Allowance</label>
                      <input
                        type="number"
                        step="0.01"
                        value={salaryForm.base_allowance}
                        onChange={(e) => setSalaryForm(prev => ({ ...prev, base_allowance: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
                      <select
                        value={salaryForm.payment_status}
                        onChange={(e) => setSalaryForm(prev => ({ ...prev, payment_status: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </div>

                  {/* Deductions Section */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        <span>Deductions</span>
                      </h3>
                      <button
                        type="button"
                        onClick={addDeduction}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {salaryForm.selectedDeductions.map((deduction, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <select
                            value={deduction.deduction_id}
                            onChange={(e) => updateDeduction(index, 'deduction_id', e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {deductions.map(d => (
                              <option key={d.deduction_id} value={d.deduction_id}>
                                {d.deduction_type}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            value={deduction.amount}
                            onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                            className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0.00"
                          />
                          <button
                            type="button"
                            onClick={() => removeDeduction(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {salaryForm.selectedDeductions.length === 0 && (
                        <p className="text-slate-400 text-sm text-center py-4">No deductions added</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Calculation Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <span>Salary Summary</span>
                  </h3>

                  <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-600">Base Salary</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(parseFloat(salaryForm.base_salary) || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-600 flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span>Bonus</span>
                      </span>
                      <span className="font-semibold text-green-600">
                        + {formatCurrency(parseFloat(salaryForm.base_bonus) || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-600 flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span>Allowance</span>
                      </span>
                      <span className="font-semibold text-green-600">
                        + {formatCurrency(parseFloat(salaryForm.base_allowance) || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-200 bg-blue-50 -mx-6 px-6">
                      <span className="text-slate-700 font-semibold">Gross Salary</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {formatCurrency(calculatedSalary.gross)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-600 flex items-center space-x-1">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span>Total Deductions</span>
                      </span>
                      <span className="font-semibold text-red-600">
                        - {formatCurrency(calculatedSalary.totalDeductions)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 bg-green-50 -mx-6 px-6 rounded-lg">
                      <span className="text-slate-800 font-bold text-lg">Net Salary</span>
                      <span className="font-bold text-green-600 text-2xl">
                        {formatCurrency(calculatedSalary.netSalary)}
                      </span>
                    </div>
                  </div>

                  {/* Deductions Breakdown */}
                  {salaryForm.selectedDeductions.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Deductions Breakdown</h4>
                      <div className="space-y-2">
                        {salaryForm.selectedDeductions.map((deduction, index) => (
                          <div key={index} className="flex items-center justify-between text-sm py-2 px-3 bg-slate-50 rounded">
                            <span className="text-slate-600">{deduction.deduction_type}</span>
                            <span className="text-red-600 font-medium">
                              {formatCurrency(parseFloat(deduction.amount) || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                      <span>Save Salary</span>
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
