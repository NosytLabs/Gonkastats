import {it} from 'vitest';
import {auditCases} from './audit-cases';
for(const [name,run] of Object.entries(auditCases))it(name,run);
