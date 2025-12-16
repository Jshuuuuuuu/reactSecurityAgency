import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Search, Trash2, AlertCircle, 
  CheckCircle, Loader, Building,
  Clock, AlertTriangle, CheckSquare
} from 'lucide-react';

export default function ContractManagement() {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [searchTerm, contracts, filterStatus]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/contracts');
      if (response.data.success) {
        const contractsWithCalculations = response.data.data.map(contract => ({
          ...contract,
          ...calculateContractDuration(contract.start_date, contract.end_date)
        }));
        setContracts(contractsWithCalculations);
        setFilteredContracts(contractsWithCalculations);
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch contracts');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateContractDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalMonths = Math.ceil(totalDays / 30);
    
    const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    const monthsRemaining = Math.ceil(daysRemaining / 30);
    
    const daysElapsed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
    
    let contractStatus = 'active';
    if (daysRemaining < 0) {
      contractStatus = 'expired';
    } else if (daysRemaining <= 30) {
      contractStatus = 'expiring';
    }
    
    return {
      totalDays,
      totalMonths,
      daysRemaining,
      monthsRemaining,
      progressPercentage,
      contractStatus
    };
  };

  const filterContracts = () => {
    let filtered = contracts;

    if (filterStatus === 'active') {
      filtered = filtered.filter(c => c.contractStatus === 'active');
    } else if (filterStatus === 'expiring') {
      filtered = filtered.filter(c => c.contractStatus === 'expiring');
    } else if (filterStatus === 'expired') {
      filtered = filtered.filter(c => c.contractStatus === 'expired');
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(c => 
        c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contract_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contract_id?.toString().includes(searchTerm)
      );
    }

    setFilteredContracts(filtered);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleDeleteContract = async (contractId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete the contract with ${companyName}?`)) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/contracts/${contractId}`);
      if (response.data.success) {
        showMessage('success', 'Contract deleted successfully');
        fetchContracts();
      }
    } catch (error) {
      showMessage('error', 'Failed to delete contract');
      console.error('Delete error:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.contractStatus === 'active').length,
    expiringContracts: contracts.filter(c => c.contractStatus === 'expiring').length,
    expiredContracts: contracts.filter(c => c.contractStatus === 'expired').length
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Contract Management</h1>
        <p className="text-slate-600">Manage and track company contracts</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.totalContracts}</h3>
          <p className="text-slate-600 text-sm">Total Contracts</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.activeContracts}</h3>
          <p className="text-slate-600 text-sm">Active Contracts</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.expiringContracts}</h3>
          <p className="text-slate-600 text-sm">Expiring Soon</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.expiredContracts}</h3>
          <p className="text-slate-600 text-sm">Expired</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company name, contract type, or ID..."
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
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                filterStatus === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Active</span>
            </button>
            <button
              onClick={() => setFilterStatus('expiring')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                filterStatus === 'expiring' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Expiring</span>
            </button>
            <button
              onClick={() => setFilterStatus('expired')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                filterStatus === 'expired' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Expired</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No contracts found</p>
            <p className="text-slate-400 text-sm">Adjust your filters or add a new contract</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Company Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contract Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">End Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Time Remaining</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contract Value</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredContracts.map((contract) => (
                  <tr 
                    key={contract.contract_id} 
                    className="hover:bg-slate-50 transition-all duration-200"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600">{contract.contract_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-800">{contract.company_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{contract.contract_type}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(contract.start_date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(contract.end_date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>
                        <div className="font-medium">{contract.totalMonths} months</div>
                        <div className="text-xs text-slate-500">({contract.totalDays} days)</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className={`text-sm font-medium ${
                          contract.daysRemaining < 0 ? 'text-red-600' :
                          contract.daysRemaining <= 30 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {contract.daysRemaining < 0 
                            ? `Expired ${Math.abs(contract.daysRemaining)} days ago`
                            : contract.daysRemaining === 0
                            ? 'Expires today'
                            : `${contract.monthsRemaining} months (${contract.daysRemaining} days)`
                          }
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              contract.progressPercentage >= 90 ? 'bg-red-500' :
                              contract.progressPercentage >= 75 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${contract.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {formatCurrency(contract.contract_value)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${
                        contract.contractStatus === 'active'
                          ? 'bg-green-100 text-green-700' 
                          : contract.contractStatus === 'expiring'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {contract.contractStatus === 'active' ? (
                          <>
                            <CheckSquare className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : contract.contractStatus === 'expiring' ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>Expiring</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Expired</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteContract(contract.contract_id, contract.company_name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Contract"
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
    </div>
  );
}