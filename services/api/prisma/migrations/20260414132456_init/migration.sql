-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'ANNUAL', 'MONTHLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BrokerType" AS ENUM ('REVOLUT', 'TRADING_212', 'DEGIRO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "countryOfResidence" TEXT NOT NULL DEFAULT 'PL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "parseTrialUsed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "Tier" NOT NULL DEFAULT 'FREE',
    "status" "SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncryptedData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "dataVersion" INTEGER NOT NULL DEFAULT 0,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncryptedData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "broker" "BrokerType" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokerConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketPrice" (
    "symbol" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "MarketPrice_pkey" PRIMARY KEY ("symbol","date")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "baseCurrency" TEXT NOT NULL,
    "quoteCurrency" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ECB',

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("baseCurrency","quoteCurrency","date")
);

-- CreateTable
CREATE TABLE "CPIDataPoint" (
    "country" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "hicp" DECIMAL(65,30) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Eurostat',

    CONSTRAINT "CPIDataPoint_pkey" PRIMARY KEY ("country","yearMonth")
);

-- CreateTable
CREATE TABLE "AIParseTemplate" (
    "id" TEXT NOT NULL,
    "headerFingerprint" TEXT NOT NULL,
    "brokerName" TEXT,
    "mappingSchema" JSONB NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIParseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EncryptedData_userId_key" ON "EncryptedData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AIParseTemplate_headerFingerprint_key" ON "AIParseTemplate"("headerFingerprint");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncryptedData" ADD CONSTRAINT "EncryptedData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerConnection" ADD CONSTRAINT "BrokerConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
