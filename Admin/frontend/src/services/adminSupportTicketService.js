import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const normalizeTicket = (ticket) => ({
  id: ticket?.id || ticket?._id || ticket?.ticketId || '',
  ticketId: ticket?.ticketId || '',
  subject: ticket?.subject || '',
  customerName: ticket?.userName || (ticket?.userId?.username || ''),
  email: ticket?.userEmail || (ticket?.userId?.email || ''),
  priority: ticket?.priority || 'medium',
  status: ticket?.status || 'open',
  createdAt: ticket?.createdAt || '',
  lastUpdated: ticket?.updatedAt || ticket?.createdAt || '',
  category: ticket?.category || '',
  description: ticket?.description || '',
  orderId: ticket?.orderId || ''
});

export const supportTicketService = {
  getAllTickets: async (params = {}) => {
    const query = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 50),
      ...(params.status && params.status !== 'all' ? { status: params.status } : {}),
      ...(params.priority && params.priority !== 'all' ? { priority: params.priority } : {}),
      ...(params.category && params.category !== 'all' ? { category: params.category } : {}),
      ...(params.search ? { search: params.search } : {})
    });

    const response = await axios.get(`${API_BASE_URL}/support-tickets/admin/all?${query.toString()}`, {
      headers: getAuthHeaders()
    });

    const list = Array.isArray(response?.data?.data) ? response.data.data : [];
    return {
      success: !!response?.data?.success,
      data: list.map(normalizeTicket),
      pagination: response?.data?.pagination || null
    };
  }
};

