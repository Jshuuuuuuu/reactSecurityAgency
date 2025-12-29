import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonnelManagement from './PersonnelManagement';
import SalaryManagement from './SalaryManagement';
import ContractManagement from './ContractManagement';
import ClientManagement from './ClientManagement';
import AssignmentManagement from './AssignmentPage';


import { 
  Shield, Users, Briefcase, UserCheck, DollarSign, FileText, 
  Menu, X, Home, LogOut, Settings, Bell, Search, TrendingUp,
  Activity, Clock, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPersonnel: 0,
    totalClients: 0,
    activeAssignments: 0,
    totalContracts: 0,
    availablePersonnel: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [upcomingPayrolls, setUpcomingPayrolls] = useState([]);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(userInfo));
    }
    fetchDashboardData();
  }, []);

  const getNextPayrollDates = () => {
    const today = new Date();
    const baseYear = today.getFullYear();
    const baseMonth = today.getMonth();

    const withMonthClamp = (year, month, day) => {
      const lastDay = new Date(year, month + 1, 0).getDate();
      const date = new Date(year, month, Math.min(day, lastDay));
      return date;
    };

    const pay15 = withMonthClamp(baseYear, baseMonth, 15);
    const pay30 = withMonthClamp(baseYear, baseMonth, 30);

    let first;
    let second;
    if (today <= pay15) {
      first = pay15;
      second = pay30;
    } else if (today <= pay30) {
      first = pay30;
      second = withMonthClamp(baseYear, baseMonth + 1, 15);
    } else {
      first = withMonthClamp(baseYear, baseMonth + 1, 15);
      second = withMonthClamp(baseYear, baseMonth + 1, 30);
    }

    const dayMs = 1000 * 60 * 60 * 24;
    return [first, second].map((date, idx) => {
      const daysRemaining = Math.max(0, Math.ceil((date - today) / dayMs));
      return {
        id: idx,
        dateLabel: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        daysRemaining
      };
    });
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const [personnelRes, clientsRes, assignmentsRes, contractsRes] = await Promise.all([
        fetch('http://localhost:5000/api/personnel'),
        fetch('http://localhost:5000/api/clients'),
        fetch('http://localhost:5000/api/assignments'),
        fetch('http://localhost:5000/api/contracts')
      ]);

      const [personnelData, clientsData, assignmentsData, contractsData] = await Promise.all([
        personnelRes.json(),
        clientsRes.json(),
        assignmentsRes.json(),
        contractsRes.json()
      ]);

      const personnel = personnelData?.data || [];
      const clients = clientsData?.data || [];
      const assignments = assignmentsData?.data || [];
      const contracts = contractsData?.data || [];

      const now = new Date();
      const dayMs = 1000 * 60 * 60 * 24;

      const upcoming = assignments
        .filter(a => a.start_date)
        .map(a => ({ ...a, startDateObj: new Date(a.start_date) }))
        .filter(a => {
          const diff = (a.startDateObj - now) / dayMs;
          return diff >= 0 && diff <= 7;
        })
        .sort((a, b) => a.startDateObj - b.startDateObj)
        .slice(0, 5);

      const recent = assignments
        .slice()
        .sort((a, b) => (b.assignment_id || 0) - (a.assignment_id || 0))
        .slice(0, 5)
        .map(a => ({
          id: `assignment-${a.assignment_id}`,
          message: `Assignment for ${a.client_name || 'Client'} (${a.status || 'Status'})`,
          time: a.start_date ? new Date(a.start_date).toLocaleDateString() : 'Recently'
        }));

      const activeAssignments = assignments.filter(a => (a.status || '').toLowerCase() === 'active').length;
      const availablePersonnel = Math.max(personnel.length - activeAssignments, 0);

      setStats({
        totalPersonnel: personnel.length,
        totalClients: clients.length,
        activeAssignments,
        totalContracts: contracts.length,
        availablePersonnel
      });
      setUpcomingAssignments(upcoming);
      setRecentActivities(recent);
      setUpcomingPayrolls(getNextPayrollDates());
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'personnel', label: 'Personnel Management', icon: Users },
    { id: 'clients', label: 'Client Management', icon: Briefcase },
    { id: 'assignments', label: 'Assignments', icon: UserCheck },
    { id: 'salary', label: 'Salary Management', icon: DollarSign },
    { id: 'contracts', label: 'Contracts', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold">RQA Security Agency</span>
            </div>
          )}
          {!isSidebarOpen && <Shield className="w-8 h-8 text-blue-500 mx-auto" />}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-800 transition-colors ${
                  activeMenu === item.id ? 'bg-slate-800 border-l-4 border-blue-500' : ''
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-800">
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-800 transition-colors">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="text-sm">Settings</span>}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-800 transition-colors text-red-400"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
              
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 bg-slate-100 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AU'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {activeMenu === 'dashboard' && (
            <div>
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full" aria-label="Loading dashboard" />
                </div>
              ) : (
                <>
                  {/* Welcome Section */}
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                      Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
                    </h1>
                    <p className="text-slate-600">Here's what's happening with your security agency today.</p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Personnel */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">Live</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.totalPersonnel}</h3>
                      <p className="text-slate-600 text-sm">Total Personnel</p>
                    </div>

                    {/* Total Clients */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Briefcase className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold">Live</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.totalClients}</h3>
                      <p className="text-slate-600 text-sm">Total Clients</p>
                    </div>

                    {/* Active Assignments */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-semibold">Active</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.activeAssignments}</h3>
                      <p className="text-slate-600 text-sm">Active Assignments</p>
                    </div>

                    {/* Available Personnel */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Activity className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 font-semibold">Ready</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.availablePersonnel}</h3>
                      <p className="text-slate-600 text-sm">Available Personnel</p>
                    </div>
                  </div>

                  {/* Charts and Activity Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
                        <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
                      </div>
                      <div className="space-y-4">
                        {recentActivities.length > 0 ? (
                          recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-slate-50 rounded-lg transition-colors">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-slate-800 font-medium">{activity.message}</p>
                                <p className="text-slate-500 text-sm mt-1">{activity.time}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No recent activity yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Upcoming Assignments */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Upcoming Assignments (7 days)</h2>
                      </div>
                      <div className="space-y-4">
                        {upcomingAssignments.length > 0 ? (
                          upcomingAssignments.map((assignment) => (
                            <div key={assignment.assignment_id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                              <div>
                                <p className="text-slate-800 font-medium text-sm">{assignment.personnel_name || 'Personnel'}</p>
                                <p className="text-slate-500 text-xs">{assignment.client_name || 'Client'}</p>
                              </div>
                              <p className="text-blue-600 text-xs font-semibold">
                                {assignment.start_date ? new Date(assignment.start_date).toLocaleDateString() : 'Soon'}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No upcoming assignments.</p>
                        )}
                      </div>
                    </div>
                    {/* Upcoming Payroll */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Upcoming Salaries</h2>
                        <span className="text-xs font-semibold text-slate-500">15th & 30th</span>
                      </div>
                      <div className="space-y-4">
                        {upcomingPayrolls.length > 0 ? (
                          upcomingPayrolls.map((run) => (
                            <div key={run.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                              <div>
                                <p className="text-slate-800 font-medium text-sm">Payroll run</p>
                                <p className="text-slate-500 text-xs">Due {run.dateLabel}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-blue-600 text-xs font-semibold">In {run.daysRemaining} day{run.daysRemaining === 1 ? '' : 's'}</p>
                                <p className="text-slate-500 text-xs">Covers all personnel</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No payroll runs scheduled.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center">
                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <span className="text-sm font-medium text-slate-800">Add Personnel</span>
                      </button>
                      <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center">
                        <Briefcase className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <span className="text-sm font-medium text-slate-800">Add Client</span>
                      </button>
                      <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center">
                        <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <span className="text-sm font-medium text-slate-800">New Assignment</span>
                      </button>
                      <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center">
                        <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <span className="text-sm font-medium text-slate-800">Generate Report</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Personnel Management */}
          {activeMenu === 'personnel' && (
            <div className="animate-in fade-in duration-500">
              <PersonnelManagement />
            </div>
          )}

          {/* Salary Management */}
          {activeMenu === 'salary' && (
            <div className="animate-in fade-in duration-500">
              <SalaryManagement />
            </div>
          )}

          {/* Contract Management */}
          {activeMenu === 'contracts' && (
            <div className="animate-in fade-in duration-500">
              <ContractManagement />
            </div>
          )}

          {/*CLient Management */}
          {activeMenu === 'clients' && (
            <div className="animate-in fade-in duration-500">
              <ClientManagement />
            </div>
          )} 

          {/* Assignment Management */}
          {activeMenu === 'assignments' && (
            <div className="animate-in fade-in duration-500">
              <AssignmentManagement />
            </div>
          )}
          
          {/* Placeholder for other menu items */}
          {activeMenu !== 'dashboard' && activeMenu !== 'personnel' && activeMenu !== 'salary' && (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                {menuItems.find(item => item.id === activeMenu)?.label}
              </h2>
              <p className="text-slate-600">This section is under development. Connect to your database to manage this section.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}