export type JsonValue = string | number | boolean | null | Array<JsonValue> | { [x: string]: JsonValue };

export type JsonObj = { [x: string]: JsonValue };
