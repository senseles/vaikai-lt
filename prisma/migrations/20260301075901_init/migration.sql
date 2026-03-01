-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Kindergarten" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "area" TEXT,
    "address" TEXT,
    "type" TEXT NOT NULL DEFAULT 'valstybinis',
    "phone" TEXT,
    "website" TEXT,
    "language" TEXT,
    "ageFrom" INTEGER,
    "groups" INTEGER,
    "hours" TEXT,
    "features" TEXT NOT NULL DEFAULT '[]',
    "description" TEXT,
    "note" TEXT,
    "baseRating" REAL NOT NULL DEFAULT 0,
    "baseReviewCount" INTEGER NOT NULL DEFAULT 0,
    "isUserAdded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Aukle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "area" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "experience" TEXT,
    "ageRange" TEXT,
    "hourlyRate" TEXT,
    "languages" TEXT,
    "description" TEXT,
    "availability" TEXT,
    "baseRating" REAL NOT NULL DEFAULT 0,
    "baseReviewCount" INTEGER NOT NULL DEFAULT 0,
    "isServicePortal" BOOLEAN NOT NULL DEFAULT false,
    "isUserAdded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Burelis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "area" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "ageRange" TEXT,
    "price" TEXT,
    "schedule" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "description" TEXT,
    "baseRating" REAL NOT NULL DEFAULT 0,
    "baseReviewCount" INTEGER NOT NULL DEFAULT 0,
    "isUserAdded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Specialist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "area" TEXT,
    "specialty" TEXT,
    "clinic" TEXT,
    "price" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "languages" TEXT,
    "description" TEXT,
    "baseRating" REAL NOT NULL DEFAULT 0,
    "baseReviewCount" INTEGER NOT NULL DEFAULT 0,
    "isUserAdded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Kindergarten_slug_key" ON "Kindergarten"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Aukle_slug_key" ON "Aukle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Burelis_slug_key" ON "Burelis"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Specialist_slug_key" ON "Specialist"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_itemId_itemType_sessionId_key" ON "Favorite"("itemId", "itemType", "sessionId");
