from decimal import Decimal

from app.orders.models import OrderStatus


def test_create_order(client, sample_customer):
    """Test order creation."""
    response = client.post(
        "/api/orders",
        json={
            "customer_id": sample_customer.id,
            "amount": 2500.00,
            "description": "Annual software subscription",
            "status": "pending",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["customer_id"] == sample_customer.id
    assert float(data["amount"]) == 2500.00
    assert data["description"] == "Annual software subscription"
    assert data["status"] == "pending"


def test_create_order_invalid_customer(client):
    """Test order creation with invalid customer."""
    response = client.post(
        "/api/orders",
        json={
            "customer_id": 9999,
            "amount": 2500.00,
            "status": "pending",
        },
    )
    assert response.status_code == 404


def test_create_order_invalid_amount(client, sample_customer):
    """Test order creation with invalid amount."""
    response = client.post(
        "/api/orders",
        json={
            "customer_id": sample_customer.id,
            "amount": -100.00,
            "status": "pending",
        },
    )
    assert response.status_code == 422  # Pydantic validation


def test_get_order(client, sample_order):
    """Test getting an order."""
    response = client.get(f"/api/orders/{sample_order.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_order.id
    assert data["customer_id"] == sample_order.customer_id


def test_get_order_not_found(client):
    """Test getting non-existent order."""
    response = client.get("/api/orders/9999")
    assert response.status_code == 404


def test_list_orders(client, sample_order):
    """Test listing orders."""
    response = client.get("/api/orders")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "page" in data
    assert "total" in data


def test_update_order_status(client, sample_order):
    """Test updating order status."""
    response = client.patch(
        f"/api/orders/{sample_order.id}/status",
        json={"status": "completed"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"


def test_cancel_order(client, sample_order):
    """Test cancelling an order."""
    response = client.post(f"/api/orders/{sample_order.id}/cancel")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "cancelled"
