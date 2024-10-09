import React from 'react';

const DistributionChart: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Topic Distribution</h2>
      <div className="bg-white p-4 rounded shadow">
        <img
          src="http://localhost:5000/static/distribucion_temas.png"
          alt="Topic Distribution Chart"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};

export default DistributionChart;