import requests

url = "https://snkrs.services.nike.com/snkrs/content/v2/user/app/IT/it/upcoming"

# Definisci gli headers personalizzati
headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'max-age=0',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Fai la richiesta con gli headers personalizzati
response = requests.get(url, headers=headers)

# Check if the request was successful (status code 200)
if response.status_code == 200:
    # Parse the JSON response
    data = response.json()

    # Extract information from each item and store it in an array
    items_array = []

    for item in data.get("items", []):
        # Verifica la presenza di "cover_card" e "products" prima di accedere ai dati
        cover_card = item.get("cover_card", {})
        products = cover_card.get("products", [])

        # Aggiungi altri campi se necessario
        item_info = {
            "titolo": cover_card.get("subtitle", "") + " " + cover_card.get("title", ""),
            "img": cover_card.get("square_image", {}).get("url", ""),
            "restricted": item.get("restricted"),
            "subtitle": item.get("subtitle"),
            "publication_date": item.get("publication_date"),
            "is_multi_product": item.get("is_multi_product"),
            "self_link": item.get("links", {}).get("self"),
            "type": item.get("type"),
            "status": item.get("status"),
            "full_price": None,  # Inizializza il valore di "full_price" a None

            "sizes": []  # Aggiungi un array vuoto per le taglie disponibili
        }

        # Aggiungi le taglie disponibili all'array "sizes" solo se "products" è presente
        if products:
            for product in products:
                # Verifica la presenza di "full_price" prima di accedere ai dati
                full_price = product.get("full_price")
                if full_price is not None:
                    item_info["full_price"] = full_price
                    break  # Esci dal ciclo una volta trovato il "full_price"

                # Puoi aggiungere altri campi del prodotto se necessario

        # Aggiungi le informazioni dell'oggetto all'array
        items_array.append(item_info)

    # Stampa l'array di informazioni sugli oggetti
    print(items_array)

else:
    print(f"Error: {response.status_code}")
