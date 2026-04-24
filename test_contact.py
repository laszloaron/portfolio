import httpx
import asyncio

async def test_contact():
    base_url = "http://localhost:8000/api/v1"
    
    # Generate random email/username
    import time
    timestamp = int(time.time())
    email = f"test_{timestamp}@example.com"
    username = f"testuser_{timestamp}"
    password = "Password1"
    full_name = f"Test User {timestamp}"
    
    async with httpx.AsyncClient() as client:
        print("1. Registering new user...")
        resp = await client.post(f"{base_url}/auth/register", json={
            "email": email,
            "username": username,
            "password": password,
            "full_name": full_name
        })
        print(f"Register status: {resp.status_code}")
        if resp.status_code != 201:
            print(f"Error: {resp.text}")
            return
            
        print("\n2. Logging in...")
        resp = await client.post(f"{base_url}/auth/login", json={
            "username_or_email": email,
            "password": password
        })
        print(f"Login status: {resp.status_code}")
        if resp.status_code != 200:
            print(f"Error: {resp.text}")
            return
            
        token = resp.json().get("access_token")
        
        print("\n3. Sending contact message...")
        headers = {"Authorization": f"Bearer {token}"}
        contact_data = {
            "subject": "Hello from automated test",
            "message": "This is a test message to see if the contact endpoint works properly."
        }
        
        resp = await client.post(f"{base_url}/contact", json=contact_data, headers=headers)
        print(f"Contact status: {resp.status_code}")
        print(f"Contact response: {resp.text}")

if __name__ == "__main__":
    asyncio.run(test_contact())
