import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { apiError } from '../../api/client';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function RfqDetail() {
  const { rfqId } = useParams();
  const { user } = useAuth();
  const [rfq, setRfq] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    const [{ data: r }, { data: m }] = await Promise.all([
      api.get(`/rfqs/${rfqId}`),
      api.get(`/messages/${rfqId}`),
    ]);
    setRfq(r.rfq);
    setMessages(m.messages);
  }, [rfqId]);

  useEffect(() => {
    load().catch((err) => setError(apiError(err, 'Could not load RFQ')));
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (error) return <p className="py-16 text-center text-gray-500">{error}</p>;
  if (!rfq) return <Spinner />;

  // Work out who receives our reply
  const recipientId = (() => {
    if (user.role === 'buyer' || user.role === 'admin') {
      // reply to the supplier's user account - find from messages, since
      // the supplier relation stores profile id, not user id
      const other = messages.find((m) => m.sender.id !== user.id)?.sender.id;
      return other || rfq.supplier?.userId || null;
    }
    return rfq.buyer.id;
  })();

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim() || !recipientId) return;
    setSending(true);
    setError('');
    try {
      await api.post('/messages', { rfqId, recipientId, messageBody: body.trim() });
      setBody('');
      await load();
    } catch (err) {
      setError(apiError(err, 'Could not send message'));
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status) => {
    const { data } = await api.put(`/rfqs/${rfqId}`, { status });
    setRfq((r) => ({ ...r, status: data.updatedRfq.status }));
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{rfq.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              From {rfq.buyer.fullName}
              {rfq.supplier ? ` to ${rfq.supplier.companyName}` : ' (broadcast to category)'} ·{' '}
              {new Date(rfq.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{rfq.status}</Badge>
            {rfq.status !== 'Closed' && (
              <button className="btn-secondary text-xs" onClick={() => updateStatus('Closed')}>
                Mark as closed
              </button>
            )}
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ['Category', rfq.productCategory],
            ['Quantity', `${rfq.quantity} ${rfq.unit}`],
            ['Delivery by', rfq.requiredDeliveryDate ? new Date(rfq.requiredDeliveryDate).toLocaleDateString() : '—'],
            ['Budget', rfq.budget ? `$${rfq.budget.toLocaleString()}` : '—'],
            ['Terms', rfq.terms || '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase text-gray-400">{k}</dt>
              <dd className="font-medium text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
        {rfq.description && (
          <p className="mt-4 whitespace-pre-line rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
            {rfq.description}
          </p>
        )}
      </div>

      <div className="card flex h-[28rem] flex-col p-0">
        <p className="border-b border-gray-200 px-6 py-3 font-semibold text-gray-900">Conversation</p>
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {messages.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              No messages yet. {user.role === 'supplier' ? 'Respond to this inquiry below.' : 'Waiting for a response…'}
            </p>
          )}
          {messages.map((m) => {
            const mine = m.sender.id === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    mine ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.messageBody}</p>
                  <p className={`mt-1 text-[11px] ${mine ? 'text-brand-200' : 'text-gray-400'}`}>
                    {m.sender.fullName} · {new Date(m.createdAt).toLocaleString()}
                    {mine && m.status === 'Read' && ' · Read'}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        {error && <p className="px-6 pb-2 text-sm text-red-600">{error}</p>}
        <form onSubmit={send} className="flex gap-3 border-t border-gray-200 p-4">
          <input
            className="input"
            placeholder={
              recipientId ? 'Type your message…' : 'Waiting for the other party to join this thread…'
            }
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={!recipientId || rfq.status === 'Closed'}
          />
          <button className="btn-primary shrink-0" disabled={sending || !recipientId || rfq.status === 'Closed'}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
