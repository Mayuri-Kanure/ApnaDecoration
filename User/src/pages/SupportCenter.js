import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supportTicketService } from '../services/supportTicketService';
import { 
  MessageCircle,
  Phone, 
  Mail, 
  Package, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Send,
  Paperclip,
  FileText,
  User
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { supportDashboardService } from '../services/supportTicketService';

const SupportCenter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'order',
    priority: 'medium',
    orderId: '',
    description: '',
    attachments: []
  });

  const [replyForm, setReplyForm] = useState({
    message: '',
    attachments: []
  });

  const normalizeReply = (reply) => ({
    ...reply,
    id: reply?.id || reply?._id || `${reply?.createdAt || Date.now()}`,
    sender: reply?.sender || (reply?.isStaff ? 'staff' : 'customer'),
    senderName: reply?.senderName || reply?.userName || (reply?.isStaff ? 'Support Team' : 'You'),
    timestamp: reply?.timestamp || reply?.createdAt || new Date().toISOString(),
    message: reply?.message || ''
  });

  const normalizeTicket = (ticket) => {
    const messages = Array.isArray(ticket?.messages)
      ? ticket.messages.map(normalizeReply)
      : Array.isArray(ticket?.replies)
        ? ticket.replies.map(normalizeReply)
        : [];

    return {
      ...ticket,
      id: ticket?.id || ticket?._id || ticket?.ticketId,
      messages
    };
  };

  useEffect(() => {
    fetchSupportTickets();
  }, [1000]); // Add 1 second delay and re-fetch

  const fetchSupportTickets = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting fetchSupportTickets...');
      console.log('🔑 Token available:', !!localStorage.getItem('token'));
      console.log('🌐 API URL:', `${process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api'}/support-tickets/user?page=1&limit=20&status=&_t=${Date.now()}`);
      
      const response = await supportTicketService.getUserTickets();
      console.log('📡 API Response Status:', response.status);
      console.log('📡 API Response Headers:', response.headers);
      console.log('📊 API Response Data:', response.data);
      console.log('🎫 Tickets received:', response.data?.data || response.data);
      
      const rawTickets = response?.data || response || [];
      const ticketList = Array.isArray(rawTickets) ? rawTickets : [];
      const normalizedTickets = ticketList.map(normalizeTicket);

      setTickets(normalizedTickets);
      console.log('✅ Tickets set in state:', normalizedTickets);
    } catch (error) {
      console.error('❌ Error fetching support tickets:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setTickets([]);
    } finally {
      setLoading(false);
      console.log('🏁 FetchSupportTickets completed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'order':
        return <Package className="w-4 h-4" />;
      case 'billing':
        return <FileText className="w-4 h-4" />;
      case 'technical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    try {
      // Generate unique ticket ID
      const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const ticketData = {
        ticketId: ticketId,
        subject: newTicket.subject,
        category: newTicket.category,
        priority: newTicket.priority,
        description: newTicket.description,
        orderId: newTicket.orderId
      };
      
      console.log('🎫 Creating ticket with data:', ticketData);
      console.log('🎫 Current activeTab:', activeTab);
      console.log('🎫 Show create button for tab:', activeTab === 'tickets');
      
      const response = await supportTicketService.createTicket(ticketData);
      console.log('✅ Ticket created:', response.data);
      
      const createdRawTicket = response?.data?.data || response?.data || response;
      const createdTicket = normalizeTicket(createdRawTicket);
      setTickets(prev => [createdTicket, ...prev]);
      setNewTicket({
        subject: '',
        category: 'order',
        priority: 'medium',
        orderId: '',
        description: '',
        attachments: []
      });
      setActiveTab('tickets');
      
      // Show success message
      alert('Support ticket created successfully! Ticket ID: ' + ticketId);
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      alert('Failed to create support ticket: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReplyToTicket = async (ticketId) => {
    try {
      const replyData = {
        message: replyForm.message,
        timestamp: new Date().toISOString(),
        senderName: 'Current User'
      };
      
      console.log('🎫 Sending reply to ticket:', ticketId, replyData);
      const response = await supportTicketService.addReply(ticketId, replyData);
      console.log('✅ Reply sent:', response.data);
      
      // Update the ticket in local state
      setTickets(prev => prev.map(ticket => 
        (ticket.id || ticket._id || ticket.ticketId) === ticketId
          ? {
              ...ticket,
              messages: [...(Array.isArray(ticket.messages) ? ticket.messages : []), normalizeReply(replyData)],
              updatedAt: new Date().toISOString()
            }
          : ticket
      ));
      
      setReplyForm({ message: '', attachments: [] });
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <LoadingSpinner text="Loading support center..." fullScreen={false} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-gray-700 mb-2">Get help with your decoration orders and services</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-black">Call Support</h3>
            </div>
            <p className="text-gray-700 mb-4">Mon-Sat: 9AM-8PM, Sun: 10AM-6PM</p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
              Call +91 98765 12345
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-black ">Email Support</h3>
            </div>
            <p className="text-gray-700 mb-4">Get response within 24 hours</p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
              support@apnadecoration.com
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['tickets', 'new', 'faq'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'tickets' && 'My Tickets'}
                  {tab === 'new' && 'Create Ticket'}
                  {tab === 'faq' && 'FAQ'}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-black font-semibold">Your Support Tickets</h3>
                  <button
                    onClick={() => {
                      console.log('🎫 Create Ticket button clicked!');
                      console.log('🎫 Current activeTab:', activeTab);
                      console.log('🎫 Show create button for tab:', activeTab === 'tickets');
                      setActiveTab('new');
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Create New Ticket
                  </button>
                </div>

                {tickets.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
                    <p className="text-gray-700 mb-6">
                      You haven't created any support tickets yet.
                    </p>
                    <button
                      onClick={() => setActiveTab('new')}
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Create Your First Ticket
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id || ticket._id || ticket.ticketId}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-700 mb-2">
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(ticket.category)}
                                <span className="capitalize">{ticket.category}</span>
                              </div>
                              {ticket.orderId && (
                                <Link
                                  to={`/order-details/${ticket.orderId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="hover:text-indigo-600"
                                >
                                  Order #{ticket.orderId}
                                </Link>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(ticket.createdAt)}</span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {ticket.description}
                            </p>
                            
                            {Array.isArray(ticket.messages) && ticket.messages.length > 0 && (
                              <div className="mt-2 text-sm text-gray-500">
                                {ticket.messages.length} message{ticket.messages.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'new' && (
              <div>
                <h3 className="text-black font-semibold mb-6">Create Support Ticket</h3>
                
                <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                      >
                        <option value="order">Order Related</option>
                        <option value="billing">Billing & Payment</option>
                        <option value="technical">Technical Issue</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority *
                      </label>
                      <select
                        required
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order ID (if applicable)
                      </label>
                      <input
                        type="text"
                        value={newTicket.orderId}
                        onChange={(e) => setNewTicket({...newTicket, orderId: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                        placeholder="ORD001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                      placeholder="Please provide detailed information about your issue..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Create Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tickets')}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'faq' && (
              <div>
                <h3 className="text-black font-semibold mb-6">Frequently Asked Questions</h3>
                
                <div className="space-y-4">
                  {[
                    {
                      question: "How do I change my event decoration setup time?",
                      answer: "You can change your setup time by creating a support ticket or calling us at least 24 hours before your event. Setup time changes are subject to availability."
                    },
                    {
                      question: "What is your cancellation policy?",
                      answer: "You can cancel your order up to 48 hours before the event date for a full refund. Cancellations within 48 hours may incur a cancellation fee."
                    },
                    {
                      question: "Do you provide setup services?",
                      answer: "Yes, we offer professional setup services for an additional fee. Our team will arrive 2 hours before your event to set up all decorations."
                    },
                    {
                      question: "How long does the decoration setup take?",
                      answer: "Setup time varies depending on the package size. Typically, it takes 2-4 hours for standard decoration packages."
                    },
                    {
                      question: "What if I need to reschedule my event?",
                      answer: "You can reschedule your event by contacting our support team. We'll do our best to accommodate your new date based on availability."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className="text-sm text-gray-700">
                      Ticket #{selectedTicket.id}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {(Array.isArray(selectedTicket.messages) ? selectedTicket.messages : []).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md p-4 rounded-lg ${
                        message.sender === 'customer'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium text-sm">{message.senderName}</span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-2 ${
                        message.sender === 'customer' ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        {formatDate(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'closed' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={replyForm.message}
                      onChange={(e) => setReplyForm({...replyForm, message: e.target.value})}
                      placeholder="Type your reply..."
                      className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      onClick={() => handleReplyToTicket(selectedTicket.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default SupportCenter;
