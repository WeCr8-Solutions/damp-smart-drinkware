declare module '@/lib/supabase' {
  export const supabase: any;
}

declare module 'supabase' {
  export const createClient: any;
  export default createClient;
}

export {};
