from backend.src.services.auth import AuthService

def test_create_token():
    token = AuthService().create_token({"user_id": 1})
    assert isinstance(token, str)