import React from 'react';

interface Topic {
  id: number;
  keywords: string[];
}

interface TopicListProps {
  topics: Topic[];
}

const TopicList: React.FC<TopicListProps> = ({ topics }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Topics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-2">Topic {topic.id}</h3>
            <ul className="list-disc list-inside">
              {topic.keywords.map((keyword, index) => (
                <li key={index}>{keyword}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicList;