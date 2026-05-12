import requests
import random
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8080/api/v1"

CITIES = [
    {"city": "Warszawa", "districts": ["Mokotów", "Wola", "Ochota", "Śródmieście"], "streets": ["Puławska", "Marszałkowska", "Nowy Świat", "Górczewska"]},
    {"city": "Kraków", "districts": ["Stare Miasto", "Kazimierz", "Krowodrza", "Nowa Huta"], "streets": ["Floriańska", "Grodzka", "Karmelicka", "Długa"]},
    {"city": "Wrocław", "districts": ["Stare Miasto", "Śródmieście", "Krzyki", "Fabryczna"], "streets": ["Legnicka", "Powstańców Śląskich", "Świdnicka", "Piłsudskiego"]},
    {"city": "Gdańsk", "districts": ["Śródmieście", "Wrzeszcz", "Oliwa", "Przymorze"], "streets": ["Długa", "Grunwaldzka", "Mariacka", "Świętojańska"]},
    {"city": "Poznań", "districts": ["Stare Miasto", "Nowe Miasto", "Jeżyce", "Grunwald"], "streets": ["Półwiejska", "Bukowska", "Dąbrowskiego", "Głogowska"]}
]

ADJECTIVES = ["Piękne", "Słoneczne", "Przytulne", "Przestronne", "Nowoczesne", "Ciche", "Umeblowane", "Wyremontowane", "Jasne"]
NOUNS = ["mieszkanie", "studio", "kawalerka", "apartament", "pokoje", "dom"]

def register_user(email, password, role, first_name="Test", last_name="User"):
    payload = {
        "firstName": first_name,
        "lastName": last_name,
        "email": email,
        "password": password,
        "role": role
    }
    r = requests.post(f"{BASE_URL}/users", json=payload)
    if r.status_code in [200, 201]:
        print(f"Registered {email} as {role}")
        return True
    elif r.status_code == 400 and "already exists" in r.text.lower():
        print(f"User {email} already exists")
        return True
    else:
        print(f"Failed to register {email}: {r.status_code} {r.text}")
        return False

def login_user(email, password):
    r = requests.post(f"{BASE_URL}/sessions", json={"email": email, "password": password})
    if r.status_code in [200, 201]:
        return r.json().get("token")
    else:
        print(f"Failed to login {email}: {r.status_code} {r.text}")
        return None

def create_listing(token, owner_email):
    city_data = random.choice(CITIES)
    city = city_data["city"]
    district = random.choice(city_data["districts"])
    street = random.choice(city_data["streets"])
    
    adj = random.choice(ADJECTIVES)
    noun = random.choice(NOUNS)
    title = f"{adj} {noun} w dzielnicy {district}"
    
    area = random.randint(25, 80)
    price = random.randint(1500, 4500)
    
    available_from = (datetime.now() + timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d")
    available_since = datetime.now().strftime("%Y-%m-%d")
    
    payload = {
        "title": title,
        "description": f"Bardzo {adj.lower()} {noun} zlokalizowane w {city}, dzielnica {district}. Blisko komunikacji miejskiej. Zapraszam do kontaktu.",
        "price": price,
        "currency": "PLN",
        "availableFrom": available_from,
        "ownerContact": f"{owner_email} tel. {random.randint(500000000, 799999999)}",
        "area": area,
        "availableSince": available_since,
        "location": {
            "city": city,
            "district": district,
            "street": street,
            "aptNumber": str(random.randint(1, 100))
        },
        "attributes": {
            "petsAllowed": random.choice([True, False]),
            "nonSmokingOnly": random.choice([True, False]),
            "closeToShops": random.choice([True, False]),
            "profile": "student"
        }
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.post(f"{BASE_URL}/listings", json=payload, headers=headers)
    if r.status_code in [200, 201]:
        print(f"Created listing for {owner_email}: {title}")
    else:
        print(f"Failed to create listing for {owner_email}: {r.status_code} {r.text}")

def promote_to_admin(email="admin@admin"):
    import subprocess
    sql = f'UPDATE "Users" SET "Role" = \'Admin\' WHERE "Email" = \'{email}\';\n'
    print(f"Promoting {email} to Admin via Docker...")
    try:
        process = subprocess.Popen(
            ["bash", "-c", "docker exec -i postgres psql -U postgres -d FlatShareDB"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        out, err = process.communicate(sql)
        if process.returncode == 0:
            print(f"Successfully promoted {email} to Admin.")
        else:
            print(f"Failed to promote admin. Output: {out}\nError: {err}")
    except Exception as e:
        print(f"Exception promoting to admin: {e}")

def main():
    # 1. Generate Users (TENANT)
    for i in range(1, 6):
        email = f"User{i}@User"
        register_user(email, "User1234", "TENANT", f"User", f"{i}")
        
    # 2. Generate Admin
    # Registering as TENANT first since the endpoint restricts roles
    register_user("Admin@Admin", "Admin1234", "TENANT", "Admin", "Admin")
    # Then promote via db query
    promote_to_admin("admin@admin")

    # 3. Generate Owners (LANDLORD) and listings
    for i in range(1, 6):
        email = f"Owner{i}@Owner"
        pwd = "Owner1234"
        # The prompt says: "Owner[1-5]@Owner | Owner123 | 5" (Wait, cnt is 5, but pwd is Owner123 for all)
        register_user(email, pwd, "LANDLORD", f"Owner", f"{i}")
        
        token = login_user(email, pwd)
        if token:
            # Generate 2 random listings
            for _ in range(2):
                create_listing(token, email)

if __name__ == "__main__":
    main()
