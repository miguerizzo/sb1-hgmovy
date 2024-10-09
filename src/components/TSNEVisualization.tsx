import React from 'react';

const TSNEVisualization: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">t-SNE Visualization</h2>
      <div className="bg-white p-4 rounded shadow">
        <img
          src="http://localhost:5000/static/tsne_visualization.png"
          alt="t-SNE Visualization"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};

export default TSNEVisualization;