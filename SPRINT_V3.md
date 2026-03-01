# SPRINT V3 — 6 valandų sprintas
## Projekto baigtumas: ~20%. Tikslas: 60%+

## MISIJA: Padėti 1,000,000 mamų ir vaikučių!

## NAUJAS FUNKCIONALUMAS: FORUMAS (Reddit-style)

### DB Schema (Prisma):
- ForumCategory (id, name, slug, description, icon, order)
- ForumPost (id, title, slug, content, authorName, authorId?, categoryId, city?, upvotes, downvotes, viewCount, isPinned, isLocked, createdAt, updatedAt)  
- ForumComment (id, postId, parentId?, content, authorName, authorId?, upvotes, downvotes, createdAt)
- ForumVote (id, postId?, commentId?, sessionId, value: 1/-1)

### Puslapiai:
- /forumas — kategorijų sąrašas + populiariausi posts
- /forumas/[category] — postai kategorijoje, sort by: new/top/hot
- /forumas/[category]/[post-slug] — postas su komentarais (threaded)
- /forumas/naujas — naujo posto kūrimas

### Kategorijos (seed):
- Darželiai — klausimai apie darželius
- Auklės — auklių paieška, patarimai
- Būreliai — būrelių rekomendacijos
- Specialistai — gydytojai, logopedai, psichologai
- Tėvystė — bendri klausimai apie auginimą
- Mokyklos — pasiruošimas mokyklai
- Sveikata — vaikų sveikata, mityba
- Laisvalaikis — renginiai, žaidimai, kelionės

### Funkcionalumas:
- Upvote/downvote (Reddit-style, localStorage based)
- Komentarų medis (threaded, max 3 levels)
- Sortavimas: Naujausi / Populiariausi / Aktyviausi
- Paieška forume
- Rich text (bold, italic, lists — sanitized)
- Moderacija per admin panelę

## ADMIN DALIS — PILNAS FUNKCIONALUMAS

### Dashboard:
- Statistikos kortelės: viso items, reviews, forum posts, users
- Grafikai: nauji items per savaitę, reviews per dieną
- Paskutiniai veiksmai (activity log)

### CRUD visoms entitetams:
- Darželiai: create/edit/delete su visais laukais
- Auklės: create/edit/delete
- Būreliai: create/edit/delete  
- Specialistai: create/edit/delete
- Kiekviename: search, filter, sort, pagination

### Atsiliepimų moderacija:
- Queue: laukiantys patvirtinimo
- Bulk approve/reject
- Peržiūra su kontekstu (koks item, kas rašė)
- Flag/report management

### Forumo moderacija:
- Postų sąrašas su flag count
- Pin/unpin, lock/unlock posts
- Delete posts/comments
- Ban users (by sessionId/IP)

### Vartotojų valdymas (jei auth):
- User list
- Role management (user/moderator/admin)
- Activity history

### Eksportas:
- CSV/JSON export visų duomenų
- Filtruotas eksportas

### Nustatymai:
- Site settings (pavadinimas, aprašymas)
- SEO settings
- Notification settings
