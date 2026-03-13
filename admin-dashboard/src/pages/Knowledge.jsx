import React, { useState } from 'react';
import { Type, Globe, FileText, HelpCircle } from 'lucide-react';
import api from '../services/api';

const Knowledge = () => {
    const [activeTab, setActiveTab] = useState('text');
    const [clientId, setClientId] = useState('');
    const [status, setStatus] = useState(null);

    // Form States
    const [textData, setTextData] = useState({ text: '', source: 'manual text' });
    const [webData, setWebData] = useState({ url: '' });
    const [pdfData, setPdfData] = useState({ file: null });
    const [faqData, setFaqData] = useState({ question: '', answer: '' });

    // Manage State
    const [knowledgeList, setKnowledgeList] = useState([]);
    const [loadingKnowledge, setLoadingKnowledge] = useState(false);
    const [editingChunkId, setEditingChunkId] = useState(null);
    const [editingText, setEditingText] = useState('');

    const fetchKnowledge = async () => {
        if (!clientId) return;
        setLoadingKnowledge(true);
        try {
            const res = await api.get(`/knowledge/${clientId}`);
            if (res.data.success) {
                setKnowledgeList(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch knowledge', err);
        } finally {
            setLoadingKnowledge(false);
        }
    };

    const handleDeleteChunk = async (chunkId) => {
        if (!window.confirm('Delete this knowledge chunk? This will remove its AI context.')) return;
        try {
            const res = await api.delete(`/knowledge/${chunkId}`);
            if (res.data.success) {
                fetchKnowledge();
            }
        } catch (err) {
            alert('Error deleting chunk: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdateChunk = async (chunkId) => {
        try {
            setStatus({ type: 'loading', msg: 'Updating chunk and regenerating vector embedding...' });
            const res = await api.put(`/knowledge/${chunkId}`, { text: editingText });
            if (res.data.success) {
                setStatus({ type: 'success', msg: 'Chunk updated successfully!' });
                setEditingChunkId(null);
                fetchKnowledge();
            }
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Error updating chunk.' });
        }
    };

    // Refetch when entering manage tab if client id exists
    React.useEffect(() => {
        if (activeTab === 'manage' && clientId) {
            fetchKnowledge();
        }
    }, [activeTab, clientId]);

    const handleAction = async (endpoint, payload, isMultipart = false) => {
        if (!clientId) {
            setStatus({ type: 'error', msg: 'Please provide a Target Client ID first.' });
            return;
        }
        setStatus({ type: 'loading', msg: 'Processing knowledge...' });

        try {
            const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
            const res = await api.post(`/knowledge/${endpoint}`, payload, config);

            if (res.data.success) {
                setStatus({ type: 'success', msg: res.data.message || 'Knowledge successfully ingested!' });
                // Reset forms
                setTextData({ text: '', source: 'manual text' });
                setWebData({ url: '' });
                setPdfData({ file: null });
                setFaqData({ question: '', answer: '' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to ingest knowledge.' });
        }
    };

    const submitText = (e) => {
        e.preventDefault();
        handleAction('text', { clientId, ...textData });
    };

    const submitWeb = (e) => {
        e.preventDefault();
        handleAction('web', { clientId, ...webData });
    };

    const submitPdf = (e) => {
        e.preventDefault();
        if (!pdfData.file) return setStatus({ type: 'error', msg: 'Please select a PDF file.' });

        const formData = new FormData();
        formData.append('clientId', clientId);
        formData.append('file', pdfData.file);
        handleAction('pdf', formData, true);
    };

    const submitFaq = (e) => {
        e.preventDefault();
        handleAction('faq', { clientId, ...faqData });
    };

    const tabs = [
        { id: 'text', label: 'Raw Text', icon: <Type size={18} /> },
        { id: 'web', label: 'Website Scraper', icon: <Globe size={18} /> },
        { id: 'pdf', label: 'PDF Upload', icon: <FileText size={18} /> },
        { id: 'faq', label: 'FAQ Input', icon: <HelpCircle size={18} /> },
        { id: 'manage', label: 'Manage Knowledge', icon: <Type size={18} /> } // Reusing Type icon for simplicity, could import Database
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Knowledge Ingestion Pipeline</h2>

            {/* Target Client Input */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 flex items-center space-x-4">
                <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Client ID</label>
                    <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="e.g. client_001"
                        className="w-full md:w-1/2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="text-sm text-gray-500 max-w-xs pt-6">
                    All knowledge added below will be vectorized and isolated to this specific client's RAG boundary.
                </div>
            </div>

            {status && (
                <div className={`p-4 mb-6 rounded-lg ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                    status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                    {status.msg}
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 bg-gray-50 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-white text-primary border-t-2 border-t-primary border-r border-l border-b-transparent'
                                : 'text-gray-500 hover:text-gray-700 border-t-2 border-t-transparent border-b border-gray-100 border-r border-l border-transparent'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {/* 1. Raw Text UI */}
                    {activeTab === 'text' && (
                        <form onSubmit={submitText} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <label className="block text-sm font-medium text-gray-700">Paste Information</label>
                            <textarea
                                rows="8"
                                required
                                value={textData.text}
                                onChange={e => setTextData({ ...textData, text: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                                placeholder="Our company provides SEO and Google Ads services..."
                            ></textarea>
                            <button type="submit" disabled={status?.type === 'loading'} className="bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                                Process & Embed Text
                            </button>
                        </form>
                    )}

                    {/* 2. Web Scraper UI */}
                    {activeTab === 'web' && (
                        <form onSubmit={submitWeb} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <label className="block text-sm font-medium text-gray-700">Website URL</label>
                            <div className="flex space-x-4">
                                <input
                                    type="url"
                                    required
                                    value={webData.url}
                                    onChange={e => setWebData({ url: e.target.value })}
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    placeholder="https://example.com/about"
                                />
                                <button type="submit" disabled={status?.type === 'loading'} className="bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-50">
                                    Scrape URL
                                </button>
                            </div>
                            <p className="text-sm text-gray-500">The server will extract text from headings, paragraphs, and lists.</p>
                        </form>
                    )}

                    {/* 3. PDF Upload UI */}
                    {activeTab === 'pdf' && (
                        <form onSubmit={submitPdf} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors">
                                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                                <label className="block text-lg font-medium text-gray-700 mb-2 cursor-pointer">
                                    {pdfData.file ? pdfData.file.name : "Select a PDF Document"}
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        required
                                        className="hidden"
                                        onChange={e => setPdfData({ file: e.target.files[0] })}
                                    />
                                </label>
                                <p className="text-sm text-gray-500">Max size 10MB.</p>
                            </div>
                            <button type="submit" disabled={status?.type === 'loading' || !pdfData.file} className="bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                                Upload & Parse PDF
                            </button>
                        </form>
                    )}

                    {/* 4. FAQ UI */}
                    {activeTab === 'faq' && (
                        <form onSubmit={submitFaq} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                                <input
                                    type="text"
                                    required
                                    value={faqData.question}
                                    onChange={e => setFaqData({ ...faqData, question: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold text-gray-800"
                                    placeholder="What services do you offer?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={faqData.answer}
                                    onChange={e => setFaqData({ ...faqData, answer: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                                    placeholder="We offer SEO, Google Ads, and social media marketing."
                                ></textarea>
                            </div>
                            <button type="submit" disabled={status?.type === 'loading'} className="bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                                Add FAQ Pair
                            </button>
                        </form>
                    )}

                    {/* 5. Manage Knowledge UI */}
                    {activeTab === 'manage' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {!clientId ? (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    Please enter a Target Client ID above to view their knowledge base.
                                </div>
                            ) : loadingKnowledge ? (
                                <div className="text-center py-8 text-gray-500">Loading chunks...</div>
                            ) : knowledgeList.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    No knowledge chunks found for this client.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-gray-700">Indexed Chunks ({knowledgeList.length})</h4>
                                        <button onClick={fetchKnowledge} className="text-sm text-primary hover:underline">Refresh List</button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {knowledgeList.map(chunk => (
                                            <div key={chunk._id} className="bg-white border text-sm border-gray-200 rounded-lg shadow-sm p-5 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white via-white to-transparent pl-8 rounded-bl-lg flex space-x-2">
                                                    {editingChunkId === chunk._id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateChunk(chunk._id)}
                                                                className="text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-md font-medium text-xs transition-colors shadow-sm"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingChunkId(null)}
                                                                className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md font-medium text-xs transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingChunkId(chunk._id);
                                                                    setEditingText(chunk.text);
                                                                }}
                                                                className="text-primary hover:bg-blue-50 px-3 py-1.5 rounded-md font-medium transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteChunk(chunk._id)}
                                                                className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md font-medium transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-2 mb-3">
                                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md border border-gray-200">
                                                        Source: {chunk.source}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        ID: {chunk._id.slice(-6)}
                                                    </span>
                                                </div>

                                                {editingChunkId === chunk._id ? (
                                                    <textarea
                                                        className="w-full h-40 p-3 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                                                        value={editingText}
                                                        onChange={(e) => setEditingText(e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                        {chunk.text}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Knowledge;
