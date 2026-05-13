import { supabase } from "./supabase";

export async function fetchRegistrations() {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// Paginated fetch to bypass PostgREST max_rows limit — used for exports
export async function fetchAllRegistrations() {
  const PAGE_SIZE = 50;
  const all = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
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
