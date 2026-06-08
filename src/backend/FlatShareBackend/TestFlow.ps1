$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

$baseUrl = "http://localhost:8080/api/v1"

# Generate random emails so we can re-run the script
$rand = Get-Random
$landlordEmail = "landlord$rand@test.com"
$tenantEmail = "tenant$rand@test.com"
$password = "SecretPassword123!"

Write-Host "1. Registering Landlord..."
$landlordReg = @{
    FirstName = "Adam"
    LastName = "Kowalski"
    Email = $landlordEmail
    Password = $password
    Role = "LANDLORD"
}
Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body ($landlordReg | ConvertTo-Json) -ContentType "application/json" | Out-Null

Write-Host "2. Registering Tenant..."
$tenantReg = @{
    FirstName = "Jan"
    LastName = "Nowak"
    Email = $tenantEmail
    Password = $password
    Role = "TENANT"
}
Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body ($tenantReg | ConvertTo-Json) -ContentType "application/json" | Out-Null

Write-Host "3. Logging in Landlord..."
$landlordLogin = Invoke-RestMethod -Uri "$baseUrl/sessions" -Method Post -Body (@{ Email = $landlordEmail; Password = $password } | ConvertTo-Json) -ContentType "application/json"
$landlordToken = $landlordLogin.token
$landlordHeaders = @{ Authorization = "Bearer $landlordToken" }

Write-Host "4. Logging in Tenant..."
$tenantLogin = Invoke-RestMethod -Uri "$baseUrl/sessions" -Method Post -Body (@{ Email = $tenantEmail; Password = $password } | ConvertTo-Json) -ContentType "application/json"
$tenantToken = $tenantLogin.token
$tenantHeaders = @{ Authorization = "Bearer $tenantToken" }

Write-Host "5. Creating Listing (Landlord)..."
$listingReq = @{
    Title = "Apartment for rent $rand"
    Description = "Beautiful apartment"
    Price = 1500.0
    Currency = "PLN"
    AvailableSince = "2026-06-01"
    OwnerContact = "123456789"
    Area = 50.0
    AvailableUntil = "2026-06-01"
    Location = @{
        City = "Warsaw"
        District = "Centrum"
        Street = "Zlota"
        AptNumber = "44"
    }
    Attributes = @{
        PetsAllowed = $true
        NonSmokingOnly = $false
        CloseToShops = $true
        Profile = "student"
    }
}
Invoke-RestMethod -Uri "$baseUrl/listings" -Method Post -Headers $landlordHeaders -Body ($listingReq | ConvertTo-Json) -ContentType "application/json" | Out-Null
$allListings = Invoke-RestMethod -Uri "$baseUrl/listings" -Method Get -Headers $landlordHeaders -ContentType "application/json"
$listingId = ($allListings | Where-Object { $_.title -eq "Apartment for rent $rand" }).id
Write-Host "   -> Created Listing: $listingId"

Write-Host "6. Creating Booking (Tenant)..."
$bookingReq = @{
    ListingId = $listingId
    StartDate = "2026-07-01"
    EndDate = "2026-07-31"
}
try {
    $bookingResponse = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Headers $tenantHeaders -Body ($bookingReq | ConvertTo-Json) -ContentType "application/json"
} catch {
    Write-Host "Error creating booking:"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host $reader.ReadToEnd()
    exit
}
# Response is BookingCreatedResponse with BookingId
$bookingId = $bookingResponse.bookingId
Write-Host "   -> Created Booking: $bookingId"

Write-Host "7. Accepting Booking (Landlord)..."
Invoke-RestMethod -Uri "$baseUrl/bookings/$bookingId/accept" -Method Post -Headers $landlordHeaders | Out-Null
Write-Host "   -> Booking accepted!"

Write-Host "8. Requesting Payment (Tenant)..."
$paymentResponse = Invoke-RestMethod -Uri "$baseUrl/bookings/$bookingId/pay" -Method Post -Headers $tenantHeaders
Write-Host "   -> Payment Status: $($paymentResponse.status)"
Write-Host "   -> Payment ID: $($paymentResponse.paymentId)"
Write-Host "   -> Checkout URL: $($paymentResponse.checkoutUrl)"
Write-Host ""
Write-Host "Test completed successfully! Open the Checkout URL in your browser to test the Stripe page." -ForegroundColor Green
