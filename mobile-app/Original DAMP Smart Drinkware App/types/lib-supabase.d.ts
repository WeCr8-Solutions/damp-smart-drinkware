declare module '@/lib/supabase' {
  // Minimal permissive supabase client stub used in tests and app code.
  const supabase: any;
  export default supabase;
  export function createSupabaseClient(...args: any[]): any;
}
