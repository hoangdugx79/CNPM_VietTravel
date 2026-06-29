module.exports = {
  ROLES: {
    CUSTOMER: 'customer',
    STAFF: 'staff',
    ADMIN: 'admin',
    OPERATOR: 'operator',
    GUIDE: 'guide',
    DRIVER: 'driver',
  },

  ADMIN_ROLES: ['admin', 'staff'],

  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BLOCKED: 'blocked',
  },

  TOUR_STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived',
  },

  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },

  PAYMENT_STATUS: {
    UNPAID: 'unpaid',
    PARTIAL: 'partial',
    PAID: 'paid',
    REFUNDED: 'refunded',
  },

  MESSAGES: {
    SERVER_ERROR: 'Lỗi server.',
    UNAUTHORIZED: 'Không có token xác thực.',
    FORBIDDEN: 'Không có quyền truy cập.',
    NOT_FOUND: 'Không tìm thấy.',
  },
};
