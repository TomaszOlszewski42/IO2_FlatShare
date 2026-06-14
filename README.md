Aby uruchomić projekt należy w folderzy głównym użyć komendy:
```
docker compose up
```
Ponadto, aby zapewnić pełną funkcjonalność potrzebne jest dodanie do appsettings.json w folderze FlatShareBackend sekcji
```
"Stripe": {
    "SecretKey": "secret",
    "WebhookSecret": "secret"
},
```
z poprawnym wartościami sekretów.