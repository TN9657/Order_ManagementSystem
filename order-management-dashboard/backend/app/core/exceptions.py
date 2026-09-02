class OrderManagementException(Exception):
    """Base exception for order management application."""
    pass


class CustomerNotFound(OrderManagementException):
    """Raised when a customer is not found."""
    pass


class OrderNotFound(OrderManagementException):
    """Raised when an order is not found."""
    pass


class InvalidOrderStatus(OrderManagementException):
    """Raised when an invalid order status is provided."""
    pass


class InvalidOrderStatusTransition(OrderManagementException):
    """Raised when an invalid order status transition is attempted."""
    pass


class InvalidOrderAmount(OrderManagementException):
    """Raised when an invalid order amount is provided."""
    pass


class InvalidInput(OrderManagementException):
    """Raised when invalid input is provided."""
    pass
