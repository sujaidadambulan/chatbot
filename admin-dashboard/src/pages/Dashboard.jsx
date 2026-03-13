import React from 'react';
import { Users, Server, Database } from 'lucide-react';

const Dashboard = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Platform Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Clients</p>
                        <p className="text-2xl font-bold text-gray-900">Manage Below</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4">
                    <div className="p-4 bg-green-100 text-green-600 rounded-full">
                        <Database size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Knowledge Sources</p>
                        <p className="text-2xl font-bold text-gray-900">Text, PDF, Web</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4">
                    <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
                        <Server size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">System Status</p>
                        <p className="text-2xl font-bold text-gray-900">Online</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center border overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Welcome to the Multi-Tenant AI Dashboard</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Use this panel to provision new client accounts and inject knowledge into their specific AI boundaries.
                    Data is strictly isolated per client ID.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
