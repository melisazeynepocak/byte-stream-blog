# Deployment Guide - SPA Routing

Bu proje bir Single Page Application (SPA) olduğu için, tüm route'ları `index.html`'e yönlendirmemiz gerekiyor.

## Development

Development server'da `historyApiFallback: true` ayarı yapıldı. Artık direkt URL'ler çalışacak.

## Production Deployment

### 1. Netlify
`public/_redirects` dosyası otomatik olarak kullanılacak:
```
/*    /index.html   200
```

### 2. Vercel
`vercel.json` dosyası otomatik olarak kullanılacak:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. Apache
`public/.htaccess` dosyası otomatik olarak kullanılacak:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### 4. Nginx
`nginx.conf.example` dosyasındaki konfigürasyonu kullanın:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 5. Diğer Hosting Sağlayıcıları

Herhangi bir hosting sağlayıcısı kullanıyorsanız, aşağıdaki kuralı ekleyin:

**Kural**: Tüm 404 hatalarını `index.html`'e yönlendir

**Örnekler**:
- **cPanel**: Error Pages > 404 > Custom Error Page > `/index.html`
- **Cloudflare**: Page Rules > `yoursite.com/*` > Forwarding URL > `yoursite.com/index.html`
- **AWS S3**: Static Website Hosting > Error Document > `index.html`

## Test

Deployment sonrası şu URL'leri test edin:
- `https://yoursite.com/yazilim/test`
- `https://yoursite.com/telefon/2025te-en-iyi-kameraya-sahip-telefonlar`
- `https://yoursite.com/admin`

Tüm URL'ler çalışmalı ve 404 hatası vermemeli.
