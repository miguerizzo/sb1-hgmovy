import React from 'react';

interface Document {
  id: number;
  text: string;
  topic: number;
}

interface DocumentListProps {
  documents: Document[];
}

const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Documents</h2>
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-2">Document {doc.id}</h3>
            <p className="mb-2">{doc.text}</p>
            <span className="text-sm text-gray-600">Topic: {doc.topic}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;