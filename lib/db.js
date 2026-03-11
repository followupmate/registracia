import { supabase } from "./supabase";

export async function fetchRegistrations() {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addRegistration({ name, email, activities, teamSports, note }) {
  const { data, error } = await supabase
    .from("registrations")
    .insert({
      name,
      email: email.toLowerCase(),
      activities,
      team_sports: teamSports,
      note,
    })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("DUPLICATE_EMAIL");
    }
    throw error;
  }
  return data;
}

export async function updateRegistration(email, { name, activities, teamSports, note }) {
  const { data, error } = await supabase
    .from("registrations")
    .update({
      name,
      activities,
      team_sports: teamSports,
      note,
    })
    .eq("email", email.toLowerCase())
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRegistration(id) {
  const { error } = await supabase
    .from("registrations")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAllRegistrations() {
  const { error } = await supabase
    .from("registrations")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows
  if (error) throw error;
}

export async function checkDuplicateEmail(email) {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data; // null if not found
}
