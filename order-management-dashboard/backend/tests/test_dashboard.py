def test_dashboard_summary(client, sample_order):
    """Test dashboard summary endpoint."""
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_orders" in data
    assert "total_customers" in data
    assert "total_completed_value" in data
    assert "pending_orders" in data
    assert "completed_orders" in data
    assert "cancelled_orders" in data
    assert "average_order_value" in data
