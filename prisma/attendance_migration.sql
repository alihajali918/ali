-- ══════════════════════════════════════════
--  Attendance SaaS — Migration
--  Run this in Supabase SQL Editor
-- ══════════════════════════════════════════

-- Enums
CREATE TYPE "AttPlan"   AS ENUM ('TRIAL', 'BASIC', 'PRO');
CREATE TYPE "AttRole"   AS ENUM ('ADMIN', 'EMPLOYEE');
CREATE TYPE "AttStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'HALF_DAY');

-- Organizations (tenants)
CREATE TABLE "att_organizations" (
    "id"          SERIAL PRIMARY KEY,
    "name"        TEXT NOT NULL,
    "slug"        TEXT NOT NULL UNIQUE,
    "plan"        "AttPlan" NOT NULL DEFAULT 'TRIAL',
    "planExpires" TIMESTAMP(3),
    "adminSecret" TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Shifts
CREATE TABLE "att_shifts" (
    "id"             SERIAL PRIMARY KEY,
    "organizationId" INTEGER NOT NULL REFERENCES "att_organizations"("id") ON DELETE CASCADE,
    "name"           TEXT NOT NULL,
    "startTime"      TEXT NOT NULL,
    "endTime"        TEXT NOT NULL,
    "workDays"       TEXT[] NOT NULL DEFAULT ARRAY['MON','TUE','WED','THU','FRI'],
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Employees
CREATE TABLE "att_employees" (
    "id"                  SERIAL PRIMARY KEY,
    "organizationId"      INTEGER NOT NULL REFERENCES "att_organizations"("id") ON DELETE CASCADE,
    "name"                TEXT NOT NULL,
    "email"               TEXT NOT NULL,
    "password"            TEXT NOT NULL,
    "role"                "AttRole" NOT NULL DEFAULT 'EMPLOYEE',
    "shiftId"             INTEGER REFERENCES "att_shifts"("id") ON DELETE SET NULL,
    "active"              BOOLEAN NOT NULL DEFAULT true,
    -- WebAuthn device binding
    "credentialId"        TEXT,
    "credentialPublicKey" BYTEA,
    "credentialCounter"   INTEGER NOT NULL DEFAULT 0,
    "deviceBound"         BOOLEAN NOT NULL DEFAULT false,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("email", "organizationId")
);

-- Attendance records
CREATE TABLE "att_records" (
    "id"              SERIAL PRIMARY KEY,
    "organizationId"  INTEGER NOT NULL REFERENCES "att_organizations"("id") ON DELETE CASCADE,
    "employeeId"      INTEGER NOT NULL REFERENCES "att_employees"("id") ON DELETE CASCADE,
    "date"            DATE NOT NULL,
    "checkIn"         TIMESTAMP(3),
    "checkOut"        TIMESTAMP(3),
    "status"          "AttStatus" NOT NULL DEFAULT 'PRESENT',
    "lateMinutes"     INTEGER NOT NULL DEFAULT 0,
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "notes"           TEXT,
    "editedBy"        TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("employeeId", "date")
);

-- QR Sessions (one per org)
CREATE TABLE "att_qr_sessions" (
    "id"             SERIAL PRIMARY KEY,
    "organizationId" INTEGER NOT NULL UNIQUE REFERENCES "att_organizations"("id") ON DELETE CASCADE,
    "secret"         TEXT NOT NULL,
    "active"         BOOLEAN NOT NULL DEFAULT true,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ══ Incremental additions ══
ALTER TABLE "att_organizations" ADD COLUMN IF NOT EXISTS "email"   TEXT;
ALTER TABLE "att_organizations" ADD COLUMN IF NOT EXISTS "phone"   TEXT;
ALTER TABLE "att_organizations" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "att_organizations" ADD COLUMN IF NOT EXISTS "attendanceWindowMins" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "att_organizations" ADD COLUMN IF NOT EXISTS "lateToleranceMins"    INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "att_employees" ADD COLUMN IF NOT EXISTS "challenge"    TEXT;
ALTER TABLE "att_employees" ADD COLUMN IF NOT EXISTS "salary"       DECIMAL(12,2);
ALTER TABLE "att_employees" ADD COLUMN IF NOT EXISTS "overtimeRate" DECIMAL(12,2);

ALTER TABLE "att_records" ADD COLUMN IF NOT EXISTS "excuseType"     TEXT;
ALTER TABLE "att_records" ADD COLUMN IF NOT EXISTS "excuseFile"     TEXT;
ALTER TABLE "att_records" ADD COLUMN IF NOT EXISTS "excuseNote"     TEXT;
ALTER TABLE "att_records" ADD COLUMN IF NOT EXISTS "excuseApproved" BOOLEAN;

-- RLS (block direct PostgREST access)
ALTER TABLE "att_organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "att_employees"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "att_shifts"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "att_records"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "att_qr_sessions"   ENABLE ROW LEVEL SECURITY;
