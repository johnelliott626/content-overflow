import { defineEcConfig } from '@astrojs/starlight/expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

export default defineEcConfig({
  // Line numbers are opt-in per block. The sync turns them on for code
  // embedded from a GitHub permalink, where the original line numbers
  // are the whole point of the reference.
  plugins: [pluginLineNumbers()],
  defaultProps: { showLineNumbers: false },
});