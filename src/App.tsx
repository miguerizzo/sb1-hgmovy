import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, FileText, Image } from 'lucide-react';
import TopicList from './components/TopicList';
import DocumentList from './components/DocumentList';
import DistributionChart from './components/DistributionChart';
import WordCloud from './components/WordCloud';
import TSNEVisualization from './components/TSNEVisualization';

interface TopicModelingData {
  topics: { id: number; keywords: string[] }[];
  documents: { id: number; text: string; topic: number }[];
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('topics');
  const [data, setData] = useState<TopicModelingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/topic_modeling');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (e) {
        console.error("Failed to fetch data:", e);
        setError("Failed to fetch data. Please make sure the backend is running.");
      }
    };

    fetchData();
  }, []);

  const tabs = [
    { id: 'topics', label: 'Topics', icon: BarChart },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'distribution', label: 'Distribution', icon: PieChart },
    { id: 'wordcloud', label: 'Word Clouds', icon: Image },
    { id: 'tsne', label: 't-SNE', icon: Image },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Topic Modeling Analysis</h1>
      </header>
      <nav className="bg-white shadow-md">
        <ul className="flex">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                className={`flex items-center px-4 py-2 ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="mr-2" size={18} />
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="container mx-auto p-4">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : data ? (
          <>
            {activeTab === 'topics' && <TopicList topics={data.topics} />}
            {activeTab === 'documents' && <DocumentList documents={data.documents} />}
            {activeTab === 'distribution' && <DistributionChart />}
            {activeTab === 'wordcloud' && <WordCloud totalTopics={data.topics.length} />}
            {activeTab === 'tsne' && <TSNEVisualization />}
          </>
        ) : (
          <p>Loading...</p>
        )}
      </main>
    </div>
  );
};

export default App;