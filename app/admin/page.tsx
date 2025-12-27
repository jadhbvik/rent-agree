"use client";

import { useState, useEffect } from "react";

type SaleSubmission = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  startDate: string;
  endDate: string;
  fileName: string | null;
  filePath: string | null;
  createdAt: string;
  updatedAt: string;
};

type RentAgreement = {
  id: number;
  name: string;
  mobile: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  fileName: string | null;
  filePath: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"sale" | "rent" | null>(null);
  const [saleData, setSaleData] = useState<SaleSubmission[]>([]);
  const [rentData, setRentData] = useState<RentAgreement[]>([]);
  const [selectedItem, setSelectedItem] = useState<SaleSubmission | RentAgreement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [expiringAlerts, setExpiringAlerts] = useState<(SaleSubmission & { type: 'sale' } | RentAgreement & { type: 'rent' })[]>([]);

  const ADMIN_PASSWORD = "admin123"; // Simple password for demo

  const fetchSaleData = async () => {
    try {
      const res = await fetch("/api/submit");
      const data = await res.json();
      setSaleData(data);
      // Update expiring alerts
      setTimeout(() => {
        const expiring = getExpiringAgreements();
        setExpiringAlerts(expiring);
      }, 100);
    } catch (error) {
      console.error("Failed to fetch sale data:", error);
    }
  };

  const fetchRentData = async () => {
    try {
      const res = await fetch("/api/rent");
      const data = await res.json();
      setRentData(data);
      // Update expiring alerts
      setTimeout(() => {
        const expiring = getExpiringAgreements();
        setExpiringAlerts(expiring);
      }, 100);
    } catch (error) {
      console.error("Failed to fetch rent data:", error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuth", "true");
    } else {
      alert("Invalid password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab(null);
    setSelectedItem(null);
    localStorage.removeItem("adminAuth");
  };

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
      // Fetch both datasets and update alerts
      fetchSaleData();
      fetchRentData();
    }
  }, []);

  const handleTabClick = (tab: "sale" | "rent") => {
    setActiveTab(tab);
    setSelectedItem(null);
    if (tab === "sale") {
      fetchSaleData();
    } else {
      fetchRentData();
    }
  };

  const handleRowClick = (item: SaleSubmission | RentAgreement) => {
    setSelectedItem(item);
  };

  // Check if end date is within 7 days
  const isExpiringSoon = (endDate: string): boolean => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  // Get days until expiration
  const getDaysUntilExpiration = (endDate: string): number => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get all expiring agreements
  const getExpiringAgreements = (): (SaleSubmission & { type: 'sale' } | RentAgreement & { type: 'rent' })[] => {
    const expiring: (SaleSubmission & { type: 'sale' } | RentAgreement & { type: 'rent' })[] = [];

    saleData.forEach(item => {
      if (isExpiringSoon(item.endDate)) {
        expiring.push({ ...item, type: 'sale' });
      }
    });

    rentData.forEach(item => {
      if (isExpiringSoon(item.endDate)) {
        expiring.push({ ...item, type: 'rent' });
      }
    });

    return expiring;
  };

  // Send SMS alert for expiring agreement
  const sendSMSAlert = async (mobile: string, name: string, daysLeft: number, agreementType: string) => {
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile,
          message: `Alert: Your ${agreementType} agreement for ${name} expires in ${daysLeft} days. Please renew soon.`
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`SMS sent successfully to ${mobile} (${result.mode} mode)`);
        alert(`SMS sent successfully to ${mobile} (${result.mode} mode)`);
      } else {
        console.error(`Failed to send SMS to ${mobile}:`, result.error);
        alert(`Failed to send SMS to ${mobile}: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert(`Error sending SMS to ${mobile}: ${error}`);
    }
  };

  // Check and send alerts for expiring agreements
  const checkAndSendAlerts = () => {
    const expiring = getExpiringAgreements();

    expiring.forEach(alert => {
      const daysLeft = getDaysUntilExpiration(alert.endDate);

      // Send SMS if expiring within 7 days
      if (daysLeft <= 7 && daysLeft > 0) {
        sendSMSAlert(
          alert.mobile,
          alert.name,
          daysLeft,
          alert.type === 'sale' ? 'Sale' : 'Rent'
        );
      }
    });
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getFilteredAndSortedSaleData = () => {
    let filteredData = saleData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile.includes(searchTerm) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  };

  const getFilteredAndSortedRentData = () => {
    let filteredData = rentData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile.includes(searchTerm) ||
      item.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
              <p className="text-gray-600">Enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Access Dashboard
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                <strong>Demo Password:</strong> admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage rent and sale agreements efficiently</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Expiring Agreements Alerts */}
        {expiringAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center">
                  <span className="text-2xl mr-2">⚠️</span>
                  Agreements Expiring Soon ({expiringAlerts.length})
                </h3>
                <div className="text-sm text-yellow-700">
                  <p className="mb-1">
                    <strong>SMS Mode:</strong> {process.env.NODE_ENV === 'production' && process.env.TWILIO_ACCOUNT_SID ? 'Production (Twilio)' : 'Demo Mode'}
                  </p>
                  <p>Auto SMS: Daily at 9 AM | Manual trigger available</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/cron/sms-alerts', { method: 'POST' });
                      const result = await response.json();
                      alert(`Manual SMS check completed: ${result.alertsSent || 0} alerts sent`);
                    } catch (error) {
                      alert('Failed to trigger SMS alerts');
                    }
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md flex items-center justify-center"
                >
                  <span className="mr-2">🔄</span>
                  Manual Check
                </button>
                <button
                  onClick={checkAndSendAlerts}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md flex items-center justify-center"
                >
                  <span className="mr-2">📱</span>
                  Send SMS Alerts
                </button>
              </div>
            </div>
            <div className="grid gap-3 mt-4">
              {expiringAlerts.map((alert, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-gray-900">{alert.type === 'sale' ? 'Sale' : 'Rent'} Agreement:</strong> {alert.name}
                      <br />
                      <span className="text-sm text-gray-600">
                        Mobile: {alert.mobile} | Expires: {alert.endDate}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      getDaysUntilExpiration(alert.endDate) <= 3
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getDaysUntilExpiration(alert.endDate)} days left
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={() => handleTabClick("sale")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                activeTab === "sale"
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="mr-2">🏠</span>
              Sale Agreements ({saleData.length})
            </button>
            <button
              onClick={() => handleTabClick("rent")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                activeTab === "rent"
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="mr-2">🏢</span>
              Rent Agreements ({rentData.length})
            </button>
          </div>

          {activeTab && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, mobile, or tenant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Data Tables */}
        {activeTab === "sale" && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🏠</span>
              Sale Agreements
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th
                          className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort("name")}
                        >
                          Name {sortConfig?.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort("email")}
                        >
                          Email {sortConfig?.key === "email" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort("mobile")}
                        >
                          Mobile {sortConfig?.key === "mobile" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort("startDate")}
                        >
                          Start Date {sortConfig?.key === "startDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort("endDate")}
                        >
                          End Date {sortConfig?.key === "endDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredAndSortedSaleData().map((item, index) => (
                        <tr
                          key={index}
                          onClick={() => handleRowClick(item)}
                          className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                            selectedItem === item ? "bg-blue-100" : ""
                          }`}
                        >
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.name}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.email}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.mobile}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.startDate}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.endDate}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                            {item.fileName ? (
                              <span className="text-green-600 font-semibold">✓</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedItem && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">👤</span>
                    Agreement Details
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Name:</span>{" "}
                        <span className="text-gray-900">{selectedItem.name}</span>
                      </p>
                    </div>
                    {"email" in selectedItem && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Email:</span>{" "}
                          <span className="text-gray-900">{selectedItem.email}</span>
                        </p>
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Mobile:</span>{" "}
                        <span className="text-gray-900">{selectedItem.mobile}</span>
                      </p>
                    </div>
                    {"tenantName" in selectedItem && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Tenant Name:</span>{" "}
                          <span className="text-gray-900">{selectedItem.tenantName}</span>
                        </p>
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Start Date:</span>{" "}
                        <span className="text-gray-900">{selectedItem.startDate}</span>
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">End Date:</span>{" "}
                        <span className="text-gray-900">{selectedItem.endDate}</span>
                      </p>
                    </div>
                    {selectedItem.filePath && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">File:</span>{" "}
                          <a
                            href={selectedItem.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {selectedItem.fileName}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "rent" && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🏢</span>
              Rent Agreements
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner Name
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tenant Name
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Date
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredAndSortedRentData().map((item, index) => (
                        <tr
                          key={index}
                          onClick={() => handleRowClick(item)}
                          className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                            selectedItem === item ? "bg-blue-100" : ""
                          }`}
                        >
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.name}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.mobile}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.tenantName}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.startDate}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.endDate}</td>
                          <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                            {item.fileName ? (
                              <span className="text-green-600 font-semibold">✓</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedItem && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">👤</span>
                    Agreement Details
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Owner Name:</span>{" "}
                        <span className="text-gray-900">{selectedItem.name}</span>
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Mobile:</span>{" "}
                        <span className="text-gray-900">{selectedItem.mobile}</span>
                      </p>
                    </div>
                    {"tenantName" in selectedItem && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Tenant Name:</span>{" "}
                          <span className="text-gray-900">{selectedItem.tenantName}</span>
                        </p>
                      </div>
                    )}
                    {"email" in selectedItem && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Email:</span>{" "}
                          <span className="text-gray-900">{selectedItem.email}</span>
                        </p>
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Start Date:</span>{" "}
                        <span className="text-gray-900">{selectedItem.startDate}</span>
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">End Date:</span>{" "}
                        <span className="text-gray-900">{selectedItem.endDate}</span>
                      </p>
                    </div>
                    {selectedItem.filePath && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">File:</span>{" "}
                          <a
                            href={selectedItem.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {selectedItem.fileName}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}