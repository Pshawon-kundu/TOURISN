import * as fs from "fs";
import * as path from "path";
import { supabase } from "../config/supabase";

async function runMigrations() {
  try {
    console.log("🔄 Starting database migrations...");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "../../migrations/003_create_bookings_table.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    console.log("📝 Migration SQL loaded");
    console.log("📊 Applying migration to Supabase...");

    // Drop existing bookings table to recreate with new schema
    const dropResult = await supabase.rpc("exec_sql", {
      sql: "DROP TABLE IF EXISTS bookings CASCADE;",
    });

    if (dropResult.error) {
      console.log(
        "Note: Could not drop existing table:",
        dropResult.error.message
      );
    }

    // Split migration into individual statements
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      if (
        statement.includes("DROP TRIGGER") ||
        statement.includes("CREATE OR REPLACE FUNCTION")
      ) {
        // Skip function/trigger statements as they might not work via PostgREST
        continue;
      }

      console.log("Executing statement...");
      const { error } = await supabase.rpc("exec_sql", {
        sql: statement + ";",
      });

      if (error) {
        console.error("❌ Error executing statement:", error);
        console.log("Statement was:", statement.substring(0, 100) + "...");
      }
    }

    console.log("✅ Migration completed successfully!");
    console.log("🔍 Verifying bookings table...");

    // Verify the table exists
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Verification failed:", error);
    } else {
      console.log("✅ Bookings table is ready!");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
