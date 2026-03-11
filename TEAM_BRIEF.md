# Vaikai.lt Data Quality Team Brief

## Project
Next.js app with Prisma + PostgreSQL. Path: /home/openclaw/Projects/vaikai-lt

## Current Data Counts
- Kindergartens: 771
- Aukles: 68
- Bureliai: 70
- Specialists: 48
- Reviews: unknown count

## DB Schema (key models)
- Kindergarten: name, city, region, area, address, type, phone, website, language, ageFrom, groups, hours, features, description, note, baseRating, baseReviewCount
- Aukle: name, city, region, area, phone, email, experience, ageRange, hourlyRate, languages, description, availability, baseRating, baseReviewCount
- Burelis: (check schema for fields)
- Specialist: (check schema for fields)
- Review: itemId, itemType, authorName, rating, text, isApproved

## Database Access
Use Prisma client: `const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient();`
Or run scripts with: `node -e "..." ` from /home/openclaw/Projects/vaikai-lt

## Rules
1. DO NOT delete existing data - only UPDATE or ADD
2. All data should be realistic Lithuanian data (real cities, real addresses, real phone formats +370...)
3. Kindergarten types: valstybinis, privatus
4. Cities must be real Lithuanian cities
5. Write all scripts to /home/openclaw/Projects/vaikai-lt/scripts/
6. After DB changes, verify with count queries

## 15-Minute Meeting Protocol
Every 15 minutes, append your status to /home/openclaw/Projects/vaikai-lt/TEAM_MEETING.md:
```
## [HH:MM] Agent: [Your Role]
- Done: [what you completed]
- Issues: [problems found]
- Next: [what you'll do next]
```

## Completion Signal
When done, run: openclaw system event --text "Done: [brief summary]" --mode now
