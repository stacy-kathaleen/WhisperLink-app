
'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface TimeAgoProps {
  date: string;
}

export function TimeAgo({ date }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const update = () => {
      setTimeAgo(formatDistanceToNow(new Date(date), { addSuffix: true }));
    };
    
    update(); // Set initial value on client

    // Update every minute to keep it fresh
    const interval = setInterval(update, 60000); 

    return () => clearInterval(interval);
  }, [date]);

  // Render a placeholder or nothing on the server
  if (!timeAgo) {
    return null; 
  }

  return <span>{timeAgo}</span>;
}
