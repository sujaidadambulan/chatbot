import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import api from '../services/api';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const [formData, setFormData] = useState({
        clientId: '',
        companyName: '',
        website: '',
        primaryColor: '#2563eb',
        logoUrl: '',
        quickReplies: '',
        leadCaptureEnabled: false,
        leadCaptureWhatsapp: ''
    });
    const [status, setStatus] = useState(null);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const res = await api.get('/clients');
            if (res.data.success) {
                setClients(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', msg: 'Creating client...' });

        try {
            const payload = { ...formData };
            if (payload.quickReplies) {
                payload.quickReplies = payload.quickReplies.split(',').map(r => r.trim()).filter(Boolean);
            } else {
                payload.quickReplies = [];
            }

            const res = await api.post('/clients', payload);
            if (res.data.success) {
                setStatus({ type: 'success', msg: `Client ${formData.companyName} created successfully!` });
                setFormData({ clientId: '', companyName: '', website: '', primaryColor: '#2563eb', logoUrl: '', quickReplies: '', leadCaptureEnabled: false, leadCaptureWhatsapp: '' });
                fetchClients(); // Refresh list
            }
        } catch (error) {
            setStatus({
                type: 'error',
                msg: error.response?.data?.message || 'Failed to create client.'
            });
        }
    };

    const handleDelete = async (clientId) => {
        if (!window.confirm(`Are you sure you want to delete client ${clientId}? This will also delete all their knowledge base data.`)) return;

        try {
            const res = await api.delete(`/clients/${clientId}`);
            if (res.data.success) {
                fetchClients(); // Refresh list
            }
        } catch (error) {
            alert('Failed to delete client: ' + (error.response?.data?.message || error.message));
        }
    };

    const startEdit = (client) => {
        setEditingId(client.clientId);
        setEditForm({
            companyName: client.companyName,
            website: client.website || '',
            isActive: client.isActive,
            primaryColor: client.primaryColor || '#2563eb',
            logoUrl: client.logoUrl || '',
            quickReplies: client.quickReplies ? client.quickReplies.join(', ') : '',
            leadCaptureEnabled: client.leadCaptureEnabled || false,
            leadCaptureWhatsapp: client.leadCaptureWhatsapp || ''
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async (clientId) => {
        try {
            const payload = { ...editForm };
            if (payload.quickReplies !== undefined) {
                payload.quickReplies = payload.quickReplies.split(',').map(r => r.trim()).filter(Boolean);
            }
            const res = await api.put(`/clients/${clientId}`, payload);
            if (res.data.success) {
                setEditingId(null);
                fetchClients(); // Refresh list
            }
        } catch (error) {
            alert('Failed to update client: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Client Management</h2>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-xl font-semibold mb-6 flex items-center before:w-1 before:h-6 before:bg-primary before:mr-3 before:rounded-full">
                    Register New Tenant
                </h3>

                {status && (
                    <div className={`p-4 mb-6 rounded-lg ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                        status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="Acme Corp"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unique Client ID (Alphanumeric)</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="client_acme_001"
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website URL (Optional)</label>
                        <input
                            type="url"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="https://acme.com"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        />
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Widget Customization</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color (Hex)</label>
                            <div className="flex relative">
                                <input
                                    type="color"
                                    className="w-12 h-12 p-1 absolute left-1 top-1 rounded cursor-pointer border-0 bg-transparent"
                                    value={formData.primaryColor || '#2563eb'}
                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="w-full pl-14 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono"
                                    value={formData.primaryColor}
                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                            <input
                                type="url"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="https://acme.com/logo.png"
                                value={formData.logoUrl}
                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quick Replies (Comma separated)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="Pricing, Contact Support, Book Demo"
                            value={formData.quickReplies}
                            onChange={(e) => setFormData({ ...formData, quickReplies: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    checked={formData.leadCaptureEnabled}
                                    onChange={(e) => setFormData({ ...formData, leadCaptureEnabled: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-gray-700">Enable Lead Capture Form</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1 ml-8">Asks for Name & Phone before chat</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number (For Leads)</label>
                            <input
                                type="tel"
                                disabled={!formData.leadCaptureEnabled}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                                placeholder="+1234567890"
                                value={formData.leadCaptureWhatsapp}
                                onChange={(e) => setFormData({ ...formData, leadCaptureWhatsapp: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status?.type === 'loading'}
                        className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Create Client Provision
                    </button>
                </form>
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-xl font-semibold mb-6 flex items-center before:w-1 before:h-6 before:bg-primary before:mr-3 before:rounded-full">
                    Active Clients
                </h3>

                {loading ? (
                    <div className="text-center py-4 text-gray-500">Loading clients...</div>
                ) : clients.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">No clients provisioned yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                                    <th className="py-3 px-4 font-medium rounded-tl-lg">Client ID</th>
                                    <th className="py-3 px-4 font-medium">Company Name</th>
                                    <th className="py-3 px-4 font-medium">Website</th>
                                    <th className="py-3 px-4 font-medium">Status</th>
                                    <th className="py-3 px-4 font-medium text-right rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {clients.map(client => (
                                    <tr key={client._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-3 px-4 font-mono text-sm text-gray-600">
                                            {client.clientId}
                                        </td>

                                        <td className="py-3 px-4">
                                            {editingId === client.clientId ? (
                                                <input
                                                    type="text"
                                                    className="w-full px-2 py-1 border border-primary rounded"
                                                    value={editForm.companyName}
                                                    onChange={e => setEditForm({ ...editForm, companyName: e.target.value })}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {client.logoUrl && <img src={client.logoUrl} alt="logo" className="w-6 h-6 object-contain rounded" />}
                                                    <span className="font-medium text-gray-800">{client.companyName}</span>
                                                    {client.primaryColor && <span className="w-3 h-3 rounded-full inline-block ml-2" style={{ backgroundColor: client.primaryColor }}></span>}
                                                </div>
                                            )}
                                        </td>

                                        <td className="py-3 px-4 text-sm">
                                            {editingId === client.clientId ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="url"
                                                        placeholder="Website URL"
                                                        className="w-full px-2 py-1 border border-primary rounded text-xs"
                                                        value={editForm.website}
                                                        onChange={e => setEditForm({ ...editForm, website: e.target.value })}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Color Hex"
                                                        className="w-full px-2 py-1 border border-primary rounded text-xs font-mono"
                                                        value={editForm.primaryColor}
                                                        onChange={e => setEditForm({ ...editForm, primaryColor: e.target.value })}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Logo URL"
                                                        className="w-full px-2 py-1 border border-primary rounded text-xs"
                                                        value={editForm.logoUrl}
                                                        onChange={e => setEditForm({ ...editForm, logoUrl: e.target.value })}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Quick Replies (csv)"
                                                        className="w-full px-2 py-1 border border-primary rounded text-xs"
                                                        value={editForm.quickReplies}
                                                        onChange={e => setEditForm({ ...editForm, quickReplies: e.target.value })}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={editForm.leadCaptureEnabled} onChange={e => setEditForm({ ...editForm, leadCaptureEnabled: e.target.checked })} />
                                                        <input type="text" placeholder="WA Number" disabled={!editForm.leadCaptureEnabled} className="w-full px-2 py-1 border border-primary rounded text-xs disabled:opacity-50" value={editForm.leadCaptureWhatsapp} onChange={e => setEditForm({ ...editForm, leadCaptureWhatsapp: e.target.value })} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[150px] inline-block">
                                                        {client.website || 'No Website'}
                                                    </a>
                                                    {client.leadCaptureEnabled && <span className="text-xs text-green-600 flex items-center gap-1">WA: {client.leadCaptureWhatsapp}</span>}
                                                    {client.quickReplies && client.quickReplies.length > 0 && <span className="text-xs text-gray-500 truncate max-w-[150px]">QR: {client.quickReplies.join(', ')}</span>}
                                                </div>
                                            )}
                                        </td>

                                        <td className="py-3 px-4 flex items-center h-full pt-6">
                                            {editingId === client.clientId ? (
                                                <select
                                                    className="px-2 py-1 border border-primary rounded text-sm"
                                                    value={editForm.isActive}
                                                    onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                                                >
                                                    <option value={true}>Active</option>
                                                    <option value={false}>Inactive</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {client.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3 px-4 text-right align-top pt-6">
                                            {editingId === client.clientId ? (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button onClick={() => saveEdit(client.clientId)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Save">
                                                        <Check size={18} />
                                                    </button>
                                                    <button onClick={cancelEdit} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Cancel">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEdit(client)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(client.clientId)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Integration Code</h3>
                <p className="text-gray-600 mb-4 text-sm">Once a client is created, provide them with this script to embed on their site. Replace <code>YOUR_CLIENT_ID</code> with their assigned ID.</p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {`<script>
  window.chatbotConfig = { clientId: "YOUR_CLIENT_ID" };
</script>
<script src="https://yourdomain.com/widget/chatbot.js"></script>`}
                </pre>
            </div>
        </div>
    );
};

export default Clients;
