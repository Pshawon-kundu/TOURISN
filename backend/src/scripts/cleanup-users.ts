#!/usr/bin/env node
/**
 * Cleanup old test users from Supabase
 * These users don't have auth_id values and can't be used with the new system
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupOldUsers() {
  try {
    console.log("📋 Fetching users without auth_id...");

    // Find all users where auth_id is NULL
    const { data: usersWithoutAuthId, error: selectError } = await supabase
      .from("users")
      .select("id, email, auth_id")
      .is("auth_id", null);

    if (selectError) {
      console.error("❌ Query error:", selectError);
      process.exit(1);
    }

    if (!usersWithoutAuthId || usersWithoutAuthId.length === 0) {
      console.log("✅ No users without auth_id found - database is clean!");
      return;
    }

    console.log(
      `\n⚠️  Found ${usersWithoutAuthId.length} users without auth_id:`
    );
    usersWithoutAuthId.forEach((user) => {
      console.log(`   - ${user.email} (id: ${user.id})`);
    });

    console.log(
      "\n❌ These users will cause UNIQUE constraint violations on auth_id."
    );
    console.log("📝 To delete them manually in Supabase SQL Editor:");
    console.log(
      "   DELETE FROM users WHERE auth_id IS NULL OR auth_id = '';\\n"
    );

    console.log(
      "   Or from guides table first if guides reference these users."
    );
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

cleanupOldUsers();
