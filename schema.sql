-- Better Auth Schema for PostgreSQL/Neon
-- Generated based on Better Auth v1.2+ core schema requirements
-- Compatible with our auth configuration and Google OAuth setup

-- User table (singular naming as per Better Auth standard)
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    emailVerified BOOLEAN NOT NULL DEFAULT FALSE,
    image TEXT,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields from our auth configuration
    firstName TEXT,
    lastName TEXT,
    isEmailVerified BOOLEAN DEFAULT FALSE
);

-- Session table (singular naming as per Better Auth standard)
CREATE TABLE IF NOT EXISTS "session" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Account table (singular naming, for OAuth and credential authentication)
CREATE TABLE IF NOT EXISTS "account" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    accessTokenExpiresAt TIMESTAMP WITH TIME ZONE,
    refreshTokenExpiresAt TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    idToken TEXT,
    password TEXT,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(providerId, accountId)
);

-- Verification table (for email verification, password reset, magic links)
CREATE TABLE IF NOT EXISTS "verification" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes (optimized for Neon PostgreSQL)
CREATE INDEX IF NOT EXISTS idx_session_userId ON "session"(userId);
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);
CREATE INDEX IF NOT EXISTS idx_session_expiresAt ON "session"(expiresAt);
CREATE INDEX IF NOT EXISTS idx_account_userId ON "account"(userId);
CREATE INDEX IF NOT EXISTS idx_account_providerId_accountId ON "account"(providerId, accountId);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier);
CREATE INDEX IF NOT EXISTS idx_verification_expiresAt ON "verification"(expiresAt);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- Automatic timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all tables (Better Auth compatible)
DROP TRIGGER IF EXISTS update_user_updated_at ON "user";
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_updated_at ON "session";
CREATE TRIGGER update_session_updated_at
    BEFORE UPDATE ON "session"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_account_updated_at ON "account";
CREATE TRIGGER update_account_updated_at
    BEFORE UPDATE ON "account"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verification_updated_at ON "verification";
CREATE TRIGGER update_verification_updated_at
    BEFORE UPDATE ON "verification"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Add comments for documentation
COMMENT ON TABLE "user" IS 'Better Auth core user table with additional fields for Baby Feeding Timer app';
COMMENT ON TABLE "session" IS 'Better Auth session storage with database-only caching (cookie caching disabled)';
COMMENT ON TABLE "account" IS 'Better Auth account linking table for OAuth providers like Google';
COMMENT ON TABLE "verification" IS 'Better Auth verification table for email verification and password resets';