import os
import sys
from pathlib import Path

# Add project root to path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))
sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from backend.main import app

def run_tests():
    print("Testing LabMitra FastAPI endpoints...")
    client = TestClient(app)

    # 1. Test /health
    print("\n1. Testing GET /health ...")
    health_res = client.get("/health")
    print(f"Status Code: {health_res.status_code}")
    print(f"Response: {health_res.json()}")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"

    # 2. Test /api/analyze-direct with sample metabolic panel
    print("\n2. Testing POST /api/analyze-direct ...")
    sample_payload = {
        "patient_name": "Rajesh Sharma",
        "age": "54",
        "gender": "Male",
        "target_language": "hi-IN",
        "tests": [
            {
                "test_name": "HbA1c",
                "observed_value": "6.3",
                "unit": "%",
                "reference_range": "< 5.7 %",
                "is_abnormal": True
            },
            {
                "test_name": "Total Cholesterol",
                "observed_value": "225",
                "unit": "mg/dL",
                "reference_range": "< 200 mg/dL",
                "is_abnormal": True
            }
        ]
    }
    analyze_res = client.post("/api/analyze-direct", json=sample_payload)
    print(f"Status Code: {analyze_res.status_code}")
    data = analyze_res.json()
    print("Greeting:", data.get("patient_greeting"))
    print("Overall Reassurance:", data.get("overall_reassurance"))
    print("Cards Count:", len(data.get("biomarker_cards", [])))
    print("Doctor Questions:", data.get("doctor_questions"))
    print("Voice Script:", data.get("voice_script")[:120], "...")
    assert analyze_res.status_code == 200
    assert len(data.get("biomarker_cards", [])) == 2

    # 3. Test /api/chat-followup
    print("\n3. Testing POST /api/chat-followup ...")
    chat_res = client.post("/api/chat-followup", json={
        "question": "Kya main subah chai aur 2 Marie biscuit le sakta hoon?",
        "report_summary": sample_payload,
        "target_language": "hi-IN"
    })
    print(f"Status Code: {chat_res.status_code}")
    chat_data = chat_res.json()
    print("Follow-up Answer:", chat_data.get("answer"))
    assert chat_res.status_code == 200

    print("\nALL LABMITRA TESTS PASSED SUCCESSFULLY! Ready for production deployment.")

if __name__ == "__main__":
    run_tests()
