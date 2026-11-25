import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardStats, adminQuery } from '../../services/adminService';
import { FaUsers, FaBed, FaCalendarAlt, FaMoneyBillWave, FaDatabase } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    confirmedBookings: 0
  });
  
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM bookings WHERE status = "pending" ORDER BY createdAt DESC LIMIT 5');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Get dashboard statistics
        const dashboardStats = await getAdminDashboardStats();
        setStats(dashboardStats);
        
        // Using the SQL-like interface for getting recent bookings
        const bookingsResult = await adminQuery('bookings', 'SELECT', {
          orderBy: [{ field: 'createdAt', direction: 'desc' }],
          limit: 5
        });
        
        if (bookingsResult.success) {
          setRecentBookings(bookingsResult.data || []);
        }
        
        // Using the SQL-like interface for getting recent users
        const usersResult = await adminQuery('users', 'SELECT', {
          orderBy: [{ field: 'createdAt', direction: 'desc' }],
          limit: 5
        });
        
        if (usersResult.success) {
          setRecentUsers(usersResult.data || []);
        }
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const parseQuery = (query: string) => {
    try {
      // Basic SQL query parser for demonstration
      query = query.trim();
      
      // Extract operation (SELECT, UPDATE, DELETE, INSERT)
      const operation = query.split(' ')[0].toUpperCase();
      
      // Extract table/collection name
      const fromMatch = query.match(/FROM\s+(\w+)/i);
      const intoMatch = query.match(/INTO\s+(\w+)/i);
      const updateMatch = query.match(/UPDATE\s+(\w+)/i);
      const collectionName = fromMatch?.[1] || intoMatch?.[1] || updateMatch?.[1] || '';
      
      // Extract where conditions
      const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER BY|\s+LIMIT|$)/i);
      const whereConditions = whereMatch ? whereMatch[1] : null;
      
      // Extract order by
      const orderByMatch = query.match(/ORDER BY\s+(.+?)(?:\s+LIMIT|$)/i);
      const orderByConditions = orderByMatch ? orderByMatch[1] : null;
      
      // Extract limit
      const limitMatch = query.match(/LIMIT\s+(\d+)/i);
      const limit = limitMatch ? parseInt(limitMatch[1]) : undefined;
      
      // Build options object
      const options: any = {};
      
      if (whereConditions) {
        // Very simple where parser (only handles equality with AND)
        const conditions = whereConditions.split(/\s+AND\s+/i);
        options.where = conditions.map(condition => {
          const [field, operator, value] = condition.match(/(\w+)\s*([=><]+)\s*"([^"]+)"/)?.slice(1) || [];
          const op = operator === '=' ? '==' : operator;
          return { field, operator: op, value };
        });
      }
      
      if (orderByConditions) {
        const orders = orderByConditions.split(/\s*,\s*/);
        options.orderBy = orders.map(order => {
          const [field, direction] = order.split(/\s+/);
          return { field, direction: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' };
        });
      }
      
      if (limit) {
        options.limit = limit;
      }
      
      return {
        operation,
        collectionName,
        options
      };
    } catch (error) {
      console.error('Error parsing SQL query:', error);
      throw new Error('Invalid SQL query format');
    }
  };

  const executeQuery = async () => {
    try {
      setIsExecuting(true);
      setError(null);
      
      const parsed = parseQuery(sqlQuery);
      console.log('Parsed query:', parsed);
      
      if (!parsed.operation || !parsed.collectionName) {
        throw new Error('Invalid query: missing operation or collection name');
      }
      
      const result = await adminQuery(
        parsed.collectionName,
        parsed.operation as any,
        parsed.options
      );
      
      setQueryResult(result);
    } catch (err) {
      console.error('Error executing query:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setQueryResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            to="/admin/rooms"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
          >
            Manage Rooms
          </Link>
          <Link
            to="/admin/bookings"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
          >
            Manage Bookings
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary">
              <FaUsers className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaBed className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Rooms</p>
              <p className="text-2xl font-semibold">{stats.totalRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaCalendarAlt className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <p className="text-2xl font-semibold">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaMoneyBillWave className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-semibold">${stats.totalRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Query Interface */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center mb-4">
          <FaDatabase className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-bold">SQL-like Query Interface</h2>
        </div>
        <div className="mb-4">
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full h-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter SQL-like query..."
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={executeQuery}
            disabled={isExecuting}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition disabled:opacity-50"
          >
            {isExecuting ? 'Executing...' : 'Execute Query'}
          </button>
        </div>

        {queryResult && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Query Result:</h3>
            {queryResult.success ? (
              <div>
                <p className="text-green-600 mb-2">Query executed successfully</p>
                {queryResult.count !== undefined && (
                  <p className="text-sm text-gray-600 mb-2">{queryResult.count} records found</p>
                )}
                {queryResult.data && queryResult.data.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr>
                          {Object.keys(queryResult.data[0]).map((key) => (
                            <th key={key} className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.data.map((item: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {Object.keys(item).map((key) => (
                              <td key={key} className="px-4 py-2 text-sm text-gray-900 border-b">
                                {typeof item[key] === 'object' 
                                  ? JSON.stringify(item[key]) 
                                  : String(item[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-600">{queryResult.error || 'Error executing query'}</p>
            )}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Bookings</h2>
          <Link
            to="/admin/bookings"
            className="text-primary hover:text-primary-dark"
          >
            View All
          </Link>
        </div>
        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.id.substring(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.roomName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.userId.substring(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">${booking.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent bookings found</p>
        )}
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Users</h2>
        </div>
        {recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{user.id.substring(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.displayName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent users found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 