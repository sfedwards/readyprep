declare module '*.jpg' {
  let _: string;
  export = _
}

declare module '*.png' {
  let _: string;
  export = _
}

declare module '*.svg' {
  let _: string;
  export = _
}

declare module 'string-score' {
  let _: ( target: string, query: string, fuzziness: number ) => number;
  export = _
}