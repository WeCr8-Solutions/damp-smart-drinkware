// Allow Buffer.from to accept string | null in tests where characteristic.value may be null
declare namespace NodeJS {
  interface Global { }
}

declare module 'buffer' {
  export function from(value: string | null, encoding?: string): Buffer;
}
