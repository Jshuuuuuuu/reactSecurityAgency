import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonnelManagement from './PersonnelManagement';
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

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Sample data - replace with your actual database data
  const stats = {
    totalPersonnel: 45,
    totalClients: 28,
    activeAssignments: 32,
    availablePersonnel: 13
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'personnel', label: 'Personnel Management', icon: Users },
    { id: 'clients', label: 'Client Management', icon: Briefcase },
    { id: 'assignments', label: 'Assignments', icon: UserCheck },
    { id: 'salary', label: 'Salary Management', icon: DollarSign },
    { id: 'contracts', label: 'Contracts', icon: FileText },
  ];

  const recentActivities = [
    { id: 1, type: 'assignment', message: 'New assignment created for ABC Corp', time: '10 min ago' },
    { id: 2, type: 'personnel', message: 'John Doe added to personnel', time: '1 hour ago' },
    { id: 3, type: 'salary', message: 'Salary processed for 12 personnel', time: '2 hours ago' },
    { id: 4, type: 'contract', message: 'Contract renewed with XYZ Ltd', time: '3 hours ago' },
  ];

  const upcomingTasks = [
    { id: 1, task: 'Review pending contracts', priority: 'high', due: 'Today' },
    { id: 2, task: 'Schedule performance reviews', priority: 'medium', due: 'Tomorrow' },
    { id: 3, task: 'Update personnel certifications', priority: 'low', due: 'This week' },
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
                    <span className="text-sm text-green-600 font-semibold">+12%</span>
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
                    <span className="text-sm text-green-600 font-semibold">+8%</span>
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
                    <span className="text-sm text-blue-600 font-semibold">Active</span>
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
                    <span className="text-sm text-slate-600 font-semibold">Ready</span>
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
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-800 font-medium">{activity.message}</p>
                          <p className="text-slate-500 text-sm mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Tasks */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Upcoming Tasks</h2>
                  </div>
                  <div className="space-y-4">
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-slate-800 font-medium text-sm">{task.task}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs">{task.due}</p>
                      </div>
                    ))}
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
            </div>
          )}

          {/* Personnel Management */}
          {activeMenu === 'personnel' && <PersonnelManagement />}

          {/* Placeholder for other menu items */}
          {activeMenu !== 'dashboard' && activeMenu !== 'personnel' && (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200 text-center">
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