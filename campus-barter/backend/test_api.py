import requests
import json

def test_api_endpoints():
    """
    Test script for Campus Barter API endpoints
    """
    base_url = "http://localhost:5000/api"
    
    # Test results storage
    results = {
        "success": [],
        "failure": []
    }
    
    def log_result(endpoint, method, status, response=None, error=None):
        result = {
            "endpoint": endpoint,
            "method": method,
            "status": status
        }
        
        if response:
            result["response"] = response
        
        if error:
            result["error"] = str(error)
            results["failure"].append(result)
        else:
            results["success"].append(result)
    
    # Test authentication endpoints
    print("\n=== Testing Authentication Endpoints ===")
    
    # Test registration
    try:
        endpoint = "/auth/register"
        print(f"Testing POST {endpoint}")
        response = requests.post(
            f"{base_url}{endpoint}",
            json={
                "name": "Test User",
                "email": "testuser@university.edu",
                "password": "password123"
            }
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        log_result(endpoint, "POST", response.status_code, response.json())
        
        # Save token for future requests
        if response.status_code == 201:
            token = response.json().get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
    except Exception as e:
        print(f"Error: {str(e)}")
        log_result(endpoint, "POST", "ERROR", error=e)
    
    # Test login
    try:
        endpoint = "/auth/login"
        print(f"\nTesting POST {endpoint}")
        response = requests.post(
            f"{base_url}{endpoint}",
            json={
                "email": "john@university.edu",
                "password": "password123"
            }
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        log_result(endpoint, "POST", response.status_code, response.json())
        
        # Save token for future requests
        if response.status_code == 200:
            token = response.json().get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
    except Exception as e:
        print(f"Error: {str(e)}")
        log_result(endpoint, "POST", "ERROR", error=e)
    
    # Test items endpoints
    print("\n=== Testing Items Endpoints ===")
    
    # Test get all items
    try:
        endpoint = "/items"
        print(f"Testing GET {endpoint}")
        response = requests.get(f"{base_url}{endpoint}")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json()[:2], indent=2)}")  # Show only first 2 items
        print(f"Total items: {len(response.json())}")
        log_result(endpoint, "GET", response.status_code)
    except Exception as e:
        print(f"Error: {str(e)}")
        log_result(endpoint, "GET", "ERROR", error=e)
    
    # Test get item by ID
    try:
        endpoint = "/items/1"
        print(f"\nTesting GET {endpoint}")
        response = requests.get(f"{base_url}{endpoint}")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        log_result(endpoint, "GET", response.status_code)
    except Exception as e:
        print(f"Error: {str(e)}")
        log_result(endpoint, "GET", "ERROR", error=e)
    
    # Test get categories
    try:
        endpoint = "/items/categories"
        print(f"\nTesting GET {endpoint}")
        response = requests.get(f"{base_url}{endpoint}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        log_result(endpoint, "GET", response.status_code)
    except Exception as e:
        print(f"Error: {str(e)}")
        log_result(endpoint, "GET", "ERROR", error=e)
    
    # Test users endpoints
    print("\n=== Testing Users Endpoints ===")
    
    # Test get user by ID
    try:
        endpoint = "/users/1"
        print(f"Testing GET {endpoint}")
        response = requests.get(f"{base_url}{endpoint}")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        log_result(endpoint, "GET", response.status_code)
    except Exception as e:
        print(f"Error: {str(e)}")
        log_result(endpoint, "GET", "ERROR", error=e)
    
    # Test get user items
    try:
        endpoint = "/users/1/items"
        print(f"\nTesting GET {endpoint}")
        response = requests.get(f"{base_url}{endpoint}")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        log_result(endpoint, "GET", response.status_code)
    except Exception as e:
        print(f"Error: {str(e)}")
        log_result(endpoint, "GET", "ERROR", error=e)
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"Total tests: {len(results['success']) + len(results['failure'])}")
    print(f"Successful tests: {len(results['success'])}")
    print(f"Failed tests: {len(results['failure'])}")
    
    if results['failure']:
        print("\nFailed tests:")
        for failure in results['failure']:
            print(f"- {failure['method']} {failure['endpoint']}: {failure.get('error', 'Unknown error')}")
    
    return results

if __name__ == "__main__":
    test_api_endpoints()
