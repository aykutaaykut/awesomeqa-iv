from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_get_stats():
    response = client.get("/stats")
    assert response.status_code == 200

    status_set = {"open", "resolved", "deleted"}
    for k, v in response.json().items():
        assert isinstance(k, str)
        assert k in status_set
        status_set.remove(k)

        assert isinstance(v, int)
        assert v >= 0


def test_get_tickets_invalid_skip():
    response = client.get("tickets?skip=-1")
    assert response.status_code == 422


def test_get_tickets_invalid_limit_lower_bound():
    response = client.get("tickets?limit=-1")
    assert response.status_code == 422


def test_get_tickets_invalid_limit_upper_bound():
    response = client.get("tickets?limit=101")
    assert response.status_code == 422


def test_get_tickets_invalid_status():
    response = client.get("tickets?status=not-a-status")
    assert response.status_code == 422


def test_get_tickets():
    skip = 0
    limit = 1
    status = "open"
    response = client.get(f"tickets?skip={skip}&limit={limit}&status={status}")
    assert response.status_code == 200

    assert len(response.json()) == 1

    model = response.json()[0]
    assert isinstance(model["id"], str)
    assert isinstance(model["msg_id"], str)
    assert isinstance(model["status"], str)
    assert isinstance(model["resolved_by"], str) or model["resolved_by"] is None
    assert isinstance(model["ts_last_status_change"], str) or model["ts_last_status_change"] is None
    assert isinstance(model["timestamp"], str)
    assert isinstance(model["context_messages"], list)


def test_get_ticket_context_messages():
    ticket_id = "83a1af5b-5817-44f9-acbf-d0bef22b3759"
    context_message_ids = [
        "1169572771630678056",
        "1169575684541255790",
        "1169576279306158160",
        "1169577619453386753",
        "1169577731093172325",
        "1169577993732116490",
        "1169581932481368126",
        "1169582063293321216",
        "1169582383436152883",
        "1169585546868293704",
        "1169591014516854976",
    ]
    response = client.get(f"/ticket/{ticket_id}/context-messages")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 11
    for msg in data:
        assert msg["id"] in context_message_ids


def test_resolve_ticket():
    ticket_id = "83a1af5b-5817-44f9-acbf-d0bef22b3759"
    response = client.put(f"/ticket/{ticket_id}")
    assert response.status_code == 200

    assert response.json()["status"] == "resolved"


def test_delete_ticket():
    ticket_id = "83a1af5b-5817-44f9-acbf-d0bef22b3759"
    response = client.delete(f"/ticket/{ticket_id}")
    assert response.status_code == 200

    assert response.json()["status"] == "deleted"
