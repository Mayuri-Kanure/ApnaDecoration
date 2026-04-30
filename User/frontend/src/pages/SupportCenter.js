import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { supportTicketService } from "../services/supportTicketService";
import {
  MessageCircle,
  Phone,
  Mail,
  Package,
  AlertTriangle,
  Clock,
  XCircle,
  Send,
  FileText,
  User,
  MessageSquare,
  Headphones,
} from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";

const SupportCenter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "support",
      message: "Hello! How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "order",
    priority: "medium",
    orderId: "",
    description: "",
  });

  const [replyForm, setReplyForm] = useState({
    message: "",
  });

  useEffect(() => {
    fetchSupportTickets();

    // Handle passed state from navigation
    if (location.state) {
      const { formData, orderId, category, subject } = location.state;

      if (formData) {
        // Pre-fill new ticket form from HelpSupport
        setNewTicket((prev) => ({
          ...prev,
          subject: formData.subject || prev.subject,
          category: formData.category || prev.category,
          description: formData.description || prev.description,
          orderId: formData.orderId || prev.orderId,
        }));
        setActiveTab("new"); // Switch to new ticket tab
        // Reset scroll to top when switching to new ticket tab
        setTimeout(() => window.scrollTo(0, 0), 100);
      } else if (orderId || category || subject) {
        // Pre-fill from Orders page
        setNewTicket((prev) => ({
          ...prev,
          orderId: orderId || prev.orderId,
          category: category || prev.category,
          subject: subject || prev.subject,
        }));
        setActiveTab("new"); // Switch to new ticket tab
        // Reset scroll to top when switching to new ticket tab
        setTimeout(() => window.scrollTo(0, 0), 100);
      }
    }
  }, [location.state]);

  const normalizeReply = (reply) => ({
    id: reply?.id || reply?._id || Date.now(),
    sender: reply?.isStaff ? "staff" : "customer",
    senderName: reply?.isStaff ? "Support Team" : "You",
    timestamp: reply?.createdAt || new Date().toISOString(),
    message: reply?.message || "",
  });

  const normalizeTicket = (ticket) => ({
    ...ticket,
    id: ticket?.id || ticket?._id,
    messages: (ticket?.messages || []).map(normalizeReply),
  });

  const fetchSupportTickets = async () => {
    try {
      setLoading(true);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 5000),
      );

      const response = await Promise.race([
        supportTicketService.getUserTickets(),
        timeoutPromise,
      ]);

      const ticketList = Array.isArray(response?.data) ? response.data : [];

      setTickets(ticketList.map(normalizeTicket));
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    try {
      const ticketData = { ...newTicket };

      const res = await supportTicketService.createTicket(ticketData);

      const created = normalizeTicket(res?.data);
      setTickets((prev) => [created, ...prev]);

      setActiveTab("tickets");
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (ticketId) => {
    try {
      await supportTicketService.addReply(ticketId, {
        message: replyForm.message,
      });

      setReplyForm({ message: "" });
      fetchSupportTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "text-blue-600";
      case "pending":
        return "text-yellow-600";
      case "resolved":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const handleChatSend = () => {
    if (chatInput.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: "user",
        message: chatInput,
        timestamp: new Date(),
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput("");

      // Simulate support response
      setTimeout(() => {
        const supportResponse = {
          id: Date.now() + 1,
          sender: "support",
          message:
            "Thank you for your message. Our support team will assist you shortly.",
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, supportResponse]);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner text="Loading support tickets..." />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`pb-2 px-1 ${activeTab === "tickets" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`pb-2 px-1 ${activeTab === "new" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Create Ticket
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`pb-2 px-1 ${activeTab === "chat" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Live Chat
          </button>
        </div>

        {/* TICKETS */}
        {activeTab === "tickets" && (
          <div>
            {!selectedTicket ? (
              <>
                {tickets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <MessageCircle
                        size={48}
                        className="mx-auto text-gray-400"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No tickets found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You haven't created any support tickets yet. We're here to
                      help!
                    </p>
                    <button
                      onClick={() => setActiveTab("new")}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Create Your First Ticket
                    </button>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border p-4 mb-3 cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <h3>{ticket.subject}</h3>
                      <p className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </p>
                    </div>
                  ))
                )}
              </>
            ) : (
              <div>
                <button onClick={() => setSelectedTicket(null)}>Back</button>

                <h2>{selectedTicket.subject}</h2>

                {selectedTicket.messages.map((msg) => (
                  <div key={msg.id} className="mb-2">
                    <b>{msg.senderName}</b>
                    <p>{msg.message}</p>
                  </div>
                ))}

                <div className="flex gap-2 mt-4">
                  <input
                    value={replyForm.message}
                    onChange={(e) => setReplyForm({ message: e.target.value })}
                    className="border p-2 flex-1"
                  />
                  <button onClick={() => handleReply(selectedTicket.id)}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHAT */}
        {activeTab === "chat" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Headphones size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Live Chat Support
                    </h3>
                    <p className="text-sm text-green-600">
                      Online - Available now
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-4">
                <div className="flex gap-2 ">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <button
                    onClick={handleChatSend}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CREATE */}
        {activeTab === "new" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Support Ticket
              </h2>
              <p className="text-gray-600">
                We're here to help! Tell us more about your issue.
              </p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  placeholder="Brief description of your issue"
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="order">Order Related</option>
                  <option value="product">Product Issue</option>
                  <option value="service">Service Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Please provide detailed information about your issue..."
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      description: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, priority: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tickets")}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium bg-blue-600 text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SupportCenter;
