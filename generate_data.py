import requests
import random
import sys
import io
from datetime import datetime, timedelta

# Force UTF-8 encoding for stdout to handle Polish characters on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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
    try:
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
    except Exception as e:
        print(f"Exception registering {email}: {e}")
        return False

def login_user(email, password):
    try:
        r = requests.post(f"{BASE_URL}/sessions", json={"email": email, "password": password})
        if r.status_code in [200, 201]:
            return r.json().get("token")
        else:
            print(f"Failed to login {email}: {r.status_code} {r.text}")
            return None
    except Exception as e:
        print(f"Exception logging in {email}: {e}")
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
    try:
        r = requests.post(f"{BASE_URL}/listings", json=payload, headers=headers)
        if r.status_code in [200, 201]:
            print(f"Created listing for {owner_email}: {title}")
            return True
        else:
            print(f"Failed to create listing for {owner_email}: {r.status_code} {r.text}")
            return False
    except Exception as e:
        print(f"Exception creating listing for {owner_email}: {e}")
        return False

def promote_to_admin(email="admin@admin"):
    import subprocess
    # Lowercase email as backend normalizes it
    normalized_email = email.lower()
    sql = f'UPDATE "Users" SET "Role" = \'Admin\' WHERE "Email" = \'{normalized_email}\';\n'
    print(f"Promoting {normalized_email} to Admin via Docker...")
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
            return True
        else:
            print(f"Failed to promote admin. Output: {out}\nError: {err}")
            return False
    except Exception as e:
        print(f"Exception promoting to admin: {e}")
        return False

def publish_listing(token, listing_id):
    headers = {"Authorization": f"Bearer {token}"}
    try:
        r = requests.patch(f"{BASE_URL}/listings/{listing_id}/publish", headers=headers)
        if r.status_code == 200:
            print(f"Published listing {listing_id}")
            return True
        else:
            print(f"Failed to publish listing {listing_id}: {r.status_code} {r.text}")
            return False
    except Exception as e:
        print(f"Exception publishing listing {listing_id}: {e}")
        return False

def add_opinion(token, listing_id, rating, comment):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "listingId": listing_id,
        "rating": rating,
        "comment": comment
    }
    try:
        r = requests.post(f"{BASE_URL}/listings/{listing_id}/opinions", json=payload, headers=headers)
        if r.status_code in [200, 201]:
            print(f"Added opinion to listing {listing_id}: {rating}/5")
            return True
        else:
            print(f"Failed to add opinion to listing {listing_id}: {r.status_code} {r.text}")
            return False
    except Exception as e:
        print(f"Exception adding opinion: {e}")
        return False

def create_booking(token, listing_id, start_date, end_date):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "listingId": listing_id,
        "startDate": start_date,
        "endDate": end_date
    }
    try:
        r = requests.post(f"{BASE_URL}/bookings", json=payload, headers=headers)
        if r.status_code in [200, 201]:
            response = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
            booking_id = response.get("bookingId") or response.get("BookingId") or "unknown"
            print(f"Created booking {booking_id} for listing {listing_id} ({start_date} -> {end_date})")
            return True
        else:
            print(f"Failed to create booking for listing {listing_id}: {r.status_code} {r.text}")
            return False
    except Exception as e:
        print(f"Exception creating booking: {e}")
        return False

def get_listings(token, owner_id=None):
    headers = {"Authorization": f"Bearer {token}"}
    params = {}
    if owner_id:
        params["OwnerId"] = owner_id
    try:
        r = requests.get(f"{BASE_URL}/listings", params=params, headers=headers)
        if r.status_code == 200:
            return r.json()
        else:
            print(f"Failed to get listings: {r.status_code} {r.text}")
            return []
    except Exception as e:
        print(f"Exception getting listings: {e}")
        return []

def main():
    success = True
    
    # 1. Generate Users (TENANT)
    for i in range(1, 6):
        email = f"User{i}@User"
        if not register_user(email, "User1234", "TENANT", f"User", f"{i}"):
            success = False
        
    # 2. Generate Admin
    # Registering as TENANT first since the endpoint restricts roles
    if not register_user("Admin@Admin", "Admin1234", "TENANT", "Admin", "Admin"):
        success = False
    # Then promote via db query
    if not promote_to_admin("Admin@Admin"):
        success = False
    
    admin_token = login_user("Admin@Admin", "Admin1234")
    if not admin_token:
        print("Failed to login as admin")
        success = False

    # 3. Generate Owners (LANDLORD) and listings
    owner_ids = []
    for i in range(1, 6):
        email = f"Owner{i}@Owner"
        pwd = "Owner1234"
        if not register_user(email, pwd, "LANDLORD", f"Owner", f"{i}"):
            success = False
        
        token = login_user(email, pwd)
        if token:
            # Generate 2 random listings
            for _ in range(2):
                if not create_listing(token, email):
                    success = False
            
            # Fetch owner ID from a listing (or could fetch from profile if existed)
            listings = get_listings(token)
            if listings:
                owner_ids.append(listings[0]["ownerId"])
        else:
            success = False

    # 4. Approve first listing from each owner via Admin
    approved_listing_ids = []
    approved_listings = []
    if admin_token:
        for oid in owner_ids:
            listings = get_listings(admin_token, owner_id=oid)
            if listings:
                # Approve the first one
                first_listing_id = listings[0]["id"]
                if publish_listing(admin_token, first_listing_id):
                    approved_listing_ids.append(first_listing_id)
                    approved_listings.append(listings[0])
                else:
                    success = False
            else:
                print(f"No listings found for owner {oid}")

    # 5. Create one booking for the first tenant on the first approved listing
    if approved_listings:
        user1_token = login_user("User1@User", "User1234")
        if user1_token:
            first_listing = approved_listings[0]
            available_from = first_listing.get("availableFrom") or first_listing.get("AvailableFrom")

            if available_from:
                available_from_date = datetime.strptime(str(available_from)[:10], "%Y-%m-%d")
                booking_start = available_from_date.strftime("%Y-%m-%d")
                booking_end = (available_from_date + timedelta(days=30)).strftime("%Y-%m-%d")

                if not create_booking(user1_token, first_listing["id"], booking_start, booking_end):
                    success = False
            else:
                print(f"Skipping booking seed because listing {first_listing['id']} has no availableFrom value")
                success = False
        else:
            print("Failed to login as User1 for booking seed")
            success = False

    # 6. Users 3-5 vote on the tasks (approved listings)
    for i in range(3, 6):
        email = f"User{i}@User"
        token = login_user(email, "User1234")
        if token:
            for lid in approved_listing_ids:
                rating = random.randint(3, 5)
                comment = random.choice([
                    "Świetna lokalizacja!", 
                    "Bardzo miły właściciel.", 
                    "Mieszkanie zgodne z opisem.", 
                    "Czysto i przytulnie.",
                    "Polecam to miejsce!"
                ])
                if not add_opinion(token, lid, rating, comment):
                    success = False
        else:
            print(f"Failed to login as {email}")
            success = False

    if not success:
        print("\nSome operations failed!")
        sys.exit(1)
    else:
        print("\nAll data generated successfully.")

if __name__ == "__main__":
    main()
