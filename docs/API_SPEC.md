# Vaikai.lt — API specifikacija

Visos API routes: `src/app/api/`  
Formatas: JSON  
Auth: NextAuth.js (admin endpoints)

---

## 1. Darželiai

### `GET /api/darzeliai`
Grąžina darželių sąrašą su filtrais.

**Query params:**
| Param | Tipas | Aprašymas |
|---|---|---|
| `city` | string | Filtruoti pagal miestą |
| `region` | string | Filtruoti pagal apskritį |
| `type` | `valstybinis` \| `privatus` | Tipas |
| `q` | string | Paieška (palaiko LT raides) |
| `sort` | `rating` \| `name` \| `reviews` | Rikiavimas |
| `limit` | number | Rezultatų kiekis (default: 50) |
| `offset` | number | Puslapiavimas |

**Response: 200**
```json
{
  "items": [
    {
      "id": "cuid...",
      "slug": "lopselis-darzelis-ziogelis",
      "name": "Lopšelis-darželis „Žiogelis"",
      "city": "Vilnius",
      "region": "Vilniaus",
      "area": "Pavilnys",
      "address": "Jokūbo Kolaso g. 15",
      "type": "valstybinis",
      "language": "Lietuvių",
      "ageFrom": 2,
      "groups": 13,
      "hours": "6:30–18:30",
      "features": ["Šalia Pavilnio regioninio parko", "Psichologas", "Logopedas"],
      "description": "...",
      "rating": 5.0,
      "reviewCount": 14
    }
  ],
  "total": 343,
  "limit": 50,
  "offset": 0
}
```

### `GET /api/darzeliai/[id]`
Grąžina vieną darželį su atsiliepimais.

**Response: 200**
```json
{
  "id": "...",
  "slug": "lopselis-darzelis-ziogelis",
  "name": "...",
  "reviews": [
    {
      "id": "...",
      "authorName": "Rūta M.",
      "rating": 5,
      "text": "Puikus darželis!",
      "recommend": true,
      "createdAt": "2026-01-15T00:00:00Z",
      "isApproved": true
    }
  ],
  "...": "visa kita info"
}
```

### `POST /api/darzeliai` 🔒 Admin
Sukurti naują darželį.

**Body:**
```json
{
  "name": "...",
  "city": "Vilnius",
  "region": "Vilniaus",
  "area": "Pavilnys",
  "address": "...",
  "type": "valstybinis",
  "language": "Lietuvių",
  "ageFrom": 2,
  "description": "..."
}
```

### `PUT /api/darzeliai/[id]` 🔒 Admin
Atnaujinti darželį. Body — partial update.

### `DELETE /api/darzeliai/[id]` 🔒 Admin
Ištrinti darželį.

---

## 2. Auklės

### `GET /api/aukles`
**Query params:** `city`, `q`, `ageRange`, `availability`, `sort`, `limit`, `offset`

**Item schema:**
```json
{
  "id": "...",
  "name": "Auklė Rasa M.",
  "city": "Vilnius",
  "area": "Antakalnis",
  "experience": 8,
  "ageRange": "1-6 m.",
  "hourlyRate": "8€/val.",
  "languages": "Lietuvių, Anglų",
  "description": "...",
  "availability": "Pilnas etatas",
  "phone": "+37061234567",
  "email": "rasa@aukle.lt",
  "rating": 4.8,
  "reviewCount": 12
}
```

### `GET /api/aukles/[id]`
### `POST /api/aukles` 🔒 Admin
### `PUT /api/aukles/[id]` 🔒 Admin
### `DELETE /api/aukles/[id]` 🔒 Admin

---

## 3. Būreliai

### `GET /api/bureliai`
**Query params:** `city`, `q`, `category`, `ageRange`, `sort`, `limit`, `offset`

**Kategorijos:** Sportas, Menai, Muzika, Šokiai, IT/Programavimas, Robotika, Kalbos, Gamta/Mokslas, Teatras, Kita

**Item schema:**
```json
{
  "id": "...",
  "name": "Krepšinio mokykla „Žalgiris Kids"",
  "city": "Vilnius",
  "area": "Žirmūnai",
  "category": "Sportas",
  "subcategory": "Krepšinis",
  "ageRange": "5-12 m.",
  "price": "40€/mėn.",
  "schedule": "Ant/Ket 17:00-18:30",
  "description": "...",
  "phone": "+370...",
  "website": "https://...",
  "rating": 4.8,
  "reviewCount": 14
}
```

### `GET /api/bureliai/[id]`
### `POST /api/bureliai` 🔒 Admin
### `PUT /api/bureliai/[id]` 🔒 Admin
### `DELETE /api/bureliai/[id]` 🔒 Admin

---

## 4. Specialistai

### `GET /api/specialistai`
**Query params:** `city`, `q`, `specialty`, `sort`, `limit`, `offset`

**Specialybės:** Logopedas, Psichologas, Kineziterapeutas, Ergoterapeutas, Neurologas, Pediatras, Alergologas, Ortodontas, Kita

**Item schema:**
```json
{
  "id": "...",
  "name": "Logopedė Inga V.",
  "city": "Vilnius",
  "area": "Žvėrynas",
  "specialty": "Logopedas",
  "clinic": "Kalbos centras",
  "price": "30€/vizitas",
  "languages": "Lietuvių",
  "description": "...",
  "phone": "+370...",
  "website": "https://...",
  "rating": 4.9,
  "reviewCount": 16
}
```

### `GET /api/specialistai/[id]`
### `POST /api/specialistai` 🔒 Admin
### `PUT /api/specialistai/[id]` 🔒 Admin
### `DELETE /api/specialistai/[id]` 🔒 Admin

---

## 5. Atsiliepimai (Reviews)

### `GET /api/reviews?itemId=xxx&itemType=kindergarten`
**Query params:**
| Param | Tipas | Aprašymas |
|---|---|---|
| `itemId` | string | Elemento ID |
| `itemType` | `kindergarten` \| `aukle` \| `burelis` \| `specialist` | Kategorija |
| `approved` | boolean | Tik patvirtinti (default: true) |

### `POST /api/reviews`
Sukurti naują atsiliepimą (public, be auth).

**Body:**
```json
{
  "itemId": "...",
  "itemType": "kindergarten",
  "authorName": "Rūta",
  "rating": 5,
  "text": "Puikus darželis!",
  "recommend": true
}
```

**Validation:**
- `authorName`: 2-50 simbolių
- `rating`: 1-5 integer
- `text`: 10-2000 simbolių
- `recommend`: boolean (optional)
- Rate limiting: 1 atsiliepimas per IP per 5 min

### `PUT /api/reviews/[id]` 🔒 Admin
Patvirtinti/atmesti atsiliepimą.
```json
{ "isApproved": true }
```

### `DELETE /api/reviews/[id]` 🔒 Admin

---

## 6. Mėgstamiausieji (Favorites)

### `GET /api/favorites`
Grąžina prisijungusio vartotojo mėgstamiausius.
Anoniminiams — naudoti localStorage kliento pusėje.

### `POST /api/favorites`
```json
{ "itemId": "...", "itemType": "kindergarten" }
```

### `DELETE /api/favorites`
```json
{ "itemId": "...", "itemType": "kindergarten" }
```

---

## 7. Paieška

### `GET /api/search?q=žiogelis&category=darzeliai`
Universali paieška per visas kategorijas.

**Query params:**
| Param | Tipas | Aprašymas |
|---|---|---|
| `q` | string | Paieškos tekstas (LT raidės palaikomos) |
| `category` | string | Filtruoti kategoriją (optional) |
| `city` | string | Filtruoti miestą (optional) |
| `limit` | number | Max rezultatų (default: 20) |

**Response:**
```json
{
  "results": [
    { "id": "...", "name": "...", "type": "kindergarten", "city": "...", "rating": 4.8 }
  ],
  "total": 5
}
```

---

## 8. Auth

### `POST /api/auth/[...nextauth]`
NextAuth.js handler. Credentials provider.

**Supported:**
- `POST /api/auth/signin` — prisijungimas
- `POST /api/auth/signout` — atsijungimas
- `GET /api/auth/session` — dabartinė sesija

---

## Klaidų formatas

```json
{
  "error": "Klaidos pranešimas",
  "code": "VALIDATION_ERROR"
}
```

| HTTP | Kodas | Aprašymas |
|---|---|---|
| 400 | VALIDATION_ERROR | Neteisingi duomenys |
| 401 | UNAUTHORIZED | Neprisijungęs |
| 403 | FORBIDDEN | Nėra teisių |
| 404 | NOT_FOUND | Nerastas |
| 429 | RATE_LIMITED | Per daug užklausų |
| 500 | INTERNAL_ERROR | Serverio klaida |
