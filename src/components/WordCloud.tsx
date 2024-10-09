import React, { useState } from 'react';

interface WordCloudProps {
  totalTopics: number;
}

const WordCloud: React.FC<WordCloudProps> = ({ totalTopics }) => {
  const [selectedTopic, setSelectedTopic] = useState(0);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Word Clouds</h2>
      <div className="mb-4">
        <label htmlFor="topicSelect" className="mr-2">Select Topic:</label>
        <select
          id="topicSelect"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(Number(e.target.value))}
          className="border rounded p-1"
        >
          {Array.from({ length: totalTopics }, (_, i) => (
            <option key={i} value={i}>Topic {i}</option>
          ))}
        </select>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <img
          src={`http://localhost:5000/static/nube_tema_${selectedTopic}.png`}
          alt={`Word Cloud for Topic ${selectedTopic}`}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};

export default WordCloud;