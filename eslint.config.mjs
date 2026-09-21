import {defineConfig,globalIgnores} from 'eslint/config';
import next from 'eslint-config-next/core-web-vitals';
export default defineConfig([...next,globalIgnores(['.next/**','test-results/**','playwright-report/**']),{rules:{'react-hooks/set-state-in-effect':'off'}}]);
