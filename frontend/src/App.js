import React, { useState, useEffect } from 'react';
import { Building2, FileText, AlertCircle, Search, Upload, Wrench, DollarSign, Users, TrendingUp } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

function App() {
  const [properties, setProperties] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [propsRes, maintenanceRes, docsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/api/properties`),
        fetch(`${API_BASE}/api/maintenance`),
        fetch(`${API_BASE}/api/documents`),
        fetch(`${API_BASE}/api/analytics`)
      ]);

      setProperties(await propsRes.json());
      setMaintenance(await maintenanceRes.json());
      setDocuments(await docsRes.json());
      setAnalytics(await analyticsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const result = await response.json();
      setQueryResult(result);
    } catch (error) {
      console.error('Query error:', error);
      setQueryResult({ 
        answer: 'Error processing query. Make sure the backend is running.',
        data: [],
        query_type: 'error'
      });
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('property_id', '12_elm_street');

    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      alert(result.message);
      fetchAllData();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Make sure the backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Real Estate Asset Brain
            </h1>
          </div>
          <p className="text-slate-300 text-sm">Full-Stack AI-Powered Property Management System</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                placeholder="Ask: 'When was the last roof repair at 12 Elm?' or 'Show expiring leases'"
                className="w-full bg-slate-900/50 text-white pl-12 pr-4 py-4 rounded-xl border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleQuery}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Search'}
            </button>
          </div>

          {queryResult && (
            <div className="mt-4 p-4 bg-slate-900/70 rounded-xl border border-slate-600">
              <p className="text-lg mb-3">{queryResult.answer}</p>
              {queryResult.data && queryResult.data.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {queryResult.data.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-800 rounded-lg text-sm">
                      {item.address && <div className="font-semibold text-blue-400">{item.address}</div>}
                      {item.description && <div className="text-slate-300">{item.description}</div>}
                      {item.date && <div className="text-slate-400 text-xs">Date: {item.date}</div>}
                      {item.cost > 0 && <div className="text-green-400">${item.cost.toLocaleString()}</div>}
                      {item.total_cost > 0 && <div className="text-green-400">Total: ${item.total_cost.toLocaleString()}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
          {['dashboard', 'properties', 'maintenance', 'documents', 'upload'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && analytics && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl border border-blue-500/30">
                <Building2 className="w-8 h-8 mb-3 text-blue-200" />
                <div className="text-3xl font-bold mb-1">{analytics.total_properties}</div>
                <div className="text-blue-200 text-sm">Total Properties</div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-2xl border border-green-500/30">
                <DollarSign className="w-8 h-8 mb-3 text-green-200" />
                <div className="text-3xl font-bold mb-1">${analytics.total_monthly_rent?.toLocaleString()}</div>
                <div className="text-green-200 text-sm">Monthly Rent</div>
              </div>
              <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-6 rounded-2xl border border-orange-500/30">
                <Wrench className="w-8 h-8 mb-3 text-orange-200" />
                <div className="text-3xl font-bold mb-1">{analytics.active_issues}</div>
                <div className="text-orange-200 text-sm">Active Issues</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl border border-purple-500/30">
                <TrendingUp className="w-8 h-8 mb-3 text-purple-200" />
                <div className="text-3xl font-bold mb-1">${analytics.total_maintenance_cost?.toLocaleString()}</div>
                <div className="text-purple-200 text-sm">Total Maintenance</div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Maintenance by Category</h3>
              <div className="space-y-3">
                {analytics.issues_by_category.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <div>
                      <div className="font-semibold capitalize">{cat.category}</div>
                      <div className="text-sm text-slate-400">{cat.count} issues</div>
                    </div>
                    <div className="text-green-400 font-bold">${cat.total_cost?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {properties.map(prop => (
              <div key={prop.id} className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-400">{prop.address}</h3>
                    <p className="text-slate-400">{prop.type} • {prop.lease_type}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">${prop.rent_amount?.toLocaleString()}/mo</div>
                    <div className="text-slate-400 text-sm">Expires: {prop.lease_end_date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-4 h-4" />
                  <span>Tenant: {prop.tenant_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-3">
            {maintenance.map(issue => (
              <div key={issue.id} className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-blue-400">{issue.address}</div>
                    <div className="text-slate-300">{issue.description}</div>
                    <div className="text-sm text-slate-400 mt-1">
                      {issue.date} • {issue.vendor} • {issue.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">${issue.cost?.toLocaleString()}</div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      issue.status === 'Resolved' ? 'bg-green-600/30 text-green-300' : 'bg-orange-600/30 text-orange-300'
                    }`}>
                      {issue.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="font-semibold">{doc.filename}</div>
                    <div className="text-sm text-slate-400">
                      {doc.property_id} • {doc.upload_date}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-xs">
                  {doc.type}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-blue-500 transition-colors">
              <Upload className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <label className="cursor-pointer">
                <span className="text-blue-400 font-semibold hover:text-blue-300">Click to upload</span>
                <span className="text-slate-400"> or drag and drop</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </label>
              <p className="text-slate-500 text-sm mt-2">PDF, JPG, PNG, DOC (max 10MB)</p>
            </div>

            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-xl">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <strong className="text-blue-400">Connected to Backend:</strong> Documents are stored in SQLite and metadata is extracted automatically.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;