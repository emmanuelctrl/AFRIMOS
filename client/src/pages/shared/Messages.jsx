import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';

export default function Messages({ base }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(null);

  useEffect(() => {
    api
      .get('/messages/conversations')
      .then(({ data }) => setConversations(data.conversations))
      .catch(() => setConversations([]));
  }, []);

  if (!conversations) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      {conversations.length === 0 ? (
        <div className="card py-16 text-center text-gray-500">
          No conversations yet.{' '}
          {user.role === 'buyer'
            ? 'Send an RFQ to a supplier to start one.'
            : 'Conversations start when you respond to buyer inquiries.'}
        </div>
      ) : (
        <div className="card divide-y divide-white/40 p-0">
          {conversations.map((c) => (
            <Link
              key={c.rfq.id}
              to={`${base}/${c.rfq.id}`}
              className="flex items-center gap-4 px-6 py-4 row-hover"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                {c.counterpart?.fullName?.[0] || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium text-gray-900">
                    {c.counterpart?.fullName || 'Conversation'} · {c.rfq.title}
                  </p>
                  <span className="shrink-0 text-xs text-gray-400">
                    {new Date(c.lastMessage.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="truncate text-sm text-gray-500">{c.lastMessage.messageBody}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {c.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                    {c.unreadCount}
                  </span>
                )}
                <Badge>{c.rfq.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
