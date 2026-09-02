from app.customers.models import Customer


def test_list_customers(client, sample_customer):
    """Test listing customers."""
    response = client.get("/api/customers")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "page" in data
    assert "total" in data
    assert len(data["items"]) > 0


def test_get_customer(client, sample_customer):
    """Test getting a customer."""
    response = client.get(f"/api/customers/{sample_customer.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_customer.id
    assert data["name"] == sample_customer.name
    assert data["email"] == sample_customer.email


def test_search_customers_by_name(client, db):
    """Test searching customers by name."""
    customer = Customer(name="Alpha Customer", email="alpha@example.com")
    db.add(customer)
    db.commit()
    db.refresh(customer)

    response = client.get("/api/customers?search=alpha")
    assert response.status_code == 200
    data = response.json()
    names = [item["name"] for item in data["items"]]
    assert "Alpha Customer" in names


def test_get_customer_not_found(client):
    """Test getting non-existent customer."""
    response = client.get("/api/customers/9999")
    assert response.status_code == 404


def test_get_customer_summary(client, sample_customer, sample_order, db):
    """Test getting customer summary."""
    # Update order status to completed
    sample_order.status = "completed"
    db.commit()
    
    response = client.get(f"/api/customers/{sample_customer.id}/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_customer.id
    assert "completed_orders_count" in data
    assert "completed_orders_value" in data
