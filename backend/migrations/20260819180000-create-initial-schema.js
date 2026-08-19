'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /*
     * CREATE ENUM TYPES SAFELY (PostgreSQL specific)
     */
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_users_role" AS ENUM ('admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_price_reports_fuelType" AS ENUM ('petrol', 'diesel', 'kerosene', 'gas');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    /*
     * USERS TABLE
     */
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "passwordHash" VARCHAR(255) NOT NULL,
        "role" "enum_users_role" NOT NULL DEFAULT 'admin',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    /*
     * STATIONS TABLE (Includes 'state' column)
     */
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "stations" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "brand" VARCHAR(255),
        "state" VARCHAR(255),
        "address" VARCHAR(255),
        "lat" DOUBLE PRECISION NOT NULL,
        "lng" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    /*
     * PRICE REPORTS TABLE
     */
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "price_reports" (
        "id" SERIAL PRIMARY KEY,
        "stationId" INTEGER NOT NULL REFERENCES "stations" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
        "fuelType" "enum_price_reports_fuelType" NOT NULL DEFAULT 'petrol',
        "price" DOUBLE PRECISION NOT NULL,
        "reportedBy" VARCHAR(255) DEFAULT 'anonymous',
        "fuelAvailable" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    /*
     * INDEXES (Safe with IF NOT EXISTS)
     */
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "price_reports_station_id_idx" ON "price_reports" ("stationId");
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "stations_lat_lng_idx" ON "stations" ("lat", "lng");
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "stations_brand_idx" ON "stations" ("brand");
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "stations_state_idx" ON "stations" ("state");
    `);
  },

  async down(queryInterface) {
    /*
     * Drop dependent tables first, then ENUM types.
     */
    await queryInterface.dropTable('price_reports');
    await queryInterface.dropTable('stations');
    await queryInterface.dropTable('users');

    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_price_reports_fuelType";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_users_role";`);
  },
};
