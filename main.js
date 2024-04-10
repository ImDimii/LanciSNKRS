const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });


app.get('/scarpe', async (req, res) => {
  try {
    console.log('Inizio richiesta API Nike');
    const response = await axios.get('https://snkrs.services.nike.com/snkrs/content/v2/user/app/IT/it/upcoming', {
      headers: {
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
    });

    const { products } = parseNikeData(response.data);

    console.log('Fine richiesta API Nike');

    if (products.length > 0) {
      res.json({ products });
    } else {
      res.status(404).json({ error: 'Nessun prodotto disponibile' });
    }
  } catch (error) {
    console.error('Errore durante la richiesta API:', error);
    res.status(500).json({ error: 'Errore durante la richiesta API' });
  }
});

function parseNikeData(data) {
  let products = [];

  const exploreProducts = (item) => {
    if (Array.isArray(item)) {
      item.forEach(exploreProducts);
    } else if (item && typeof item === 'object') {
      if (item.type === 'product-card') {
        if (Array.isArray(item.products)) {
          products.push(
            ...item.products.map(product => ({
              name: product.title || null,
              style_color : product.style_color || null,
              exclusive_access : product.exclusive_access,
              data : product.launches[0]?.start_entry_date || null,
              price: product.current_price || null,
              image: product.assets[0]?.url || null,
              sizes: product.skus?.map(sku => ({
                size: sku.country_specifications?.[0]?.localized_size,
                available: sku.level,
              })) || [],
              launchMethod: product.launches[0]?.launch_method || null,
              status: product.status || null,
            }))
          );
        }
      } else {
        Object.values(item).forEach(exploreProducts);
      }
    }
  };

  exploreProducts(data);

  return { products };
}

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
