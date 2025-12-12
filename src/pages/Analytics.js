import React from 'react';

function Analytics() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Task Completion Rate</h3>
          <div className="text-center py-8 text-gray-500">
            Chart coming soon
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Goal Progress</h3>
          <div className="text-center py-8 text-gray-500">
            Chart coming soon
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
