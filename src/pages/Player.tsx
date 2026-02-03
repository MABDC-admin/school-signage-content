import React from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import DisplayPlayer from '@/components/player/DisplayPlayer';

const PlayerPage: React.FC = () => {
  const { displayId } = useParams<{ displayId: string }>();
  const [searchParams] = useSearchParams();
  const secretKey = searchParams.get('key') || '';

  if (!displayId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Missing Display ID</h1>
          <p className="text-slate-400">Please provide a valid display ID in the URL.</p>
        </div>
      </div>
    );
  }

  return <DisplayPlayer displayId={displayId} secretKey={secretKey} />;
};

export default PlayerPage;
