import { useState, useEffect } from 'react';

interface TerminalProps {
  sessionId?: number;
  resourceName?: string;
}

export default function Terminal({ sessionId, resourceName = 'server' }: TerminalProps) {
  const [logs, setLogs] = useState([
    { type: 'prompt', content: 'david@web-prod-01:~$' },
    { type: 'command', content: 'ls -la' },
    { type: 'output', content: 'total 24\ndrwxr-xr-x 6 david staff  192 Nov 15 14:23 .\ndrwxr-xr-x 5 david staff  160 Nov 15 13:45 ..\n-rw-r--r-- 1 david staff 1024 Nov 15 14:20 app.log\ndrwxr-xr-x 4 david staff  128 Nov 15 14:15 config' },
    { type: 'prompt', content: 'david@web-prod-01:~$' },
    { type: 'command', content: 'tail -f app.log' },
    { type: 'output', content: '2024-11-15 14:23:12 INFO  Starting application server\n2024-11-15 14:23:13 INFO  Database connection established\n2024-11-15 14:23:15 WARN  High memory usage detected' },
  ]);

  useEffect(() => {
    // Simulate real-time log updates
    const interval = setInterval(() => {
      const newLog = {
        type: 'output',
        content: `${new Date().toISOString().slice(11, 19)} INFO  ${['Request processed', 'Database query executed', 'Cache updated', 'Heartbeat sent'][Math.floor(Math.random() * 4)]}`
      };
      setLogs(prev => [...prev, newLog]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Terminal - {resourceName}</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="terminal p-4 h-96 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="mb-2">
            {log.type === 'prompt' && (
              <div>
                <span className="text-blue-400">{log.content.split(':')[0]}:</span>
                <span className="text-white">{log.content.split(':')[1]}</span>
              </div>
            )}
            {log.type === 'command' && (
              <span className="text-green-400">{log.content}</span>
            )}
            {log.type === 'output' && (
              <div className="text-white whitespace-pre-line">{log.content}</div>
            )}
          </div>
        ))}
        <div className="text-green-400 animate-pulse">_</div>
      </div>
    </div>
  );
}
