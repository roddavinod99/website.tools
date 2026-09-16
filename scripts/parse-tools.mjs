import { readTools } from './lib/audit-helpers.mjs';

console.log(JSON.stringify(await readTools(), null, 2));
