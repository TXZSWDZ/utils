import w from '@wthe/eslint-config'

export default w(
  {
    jsonc: true,
    yaml: true,
    overrides: {
      typescript: {
        'ts/no-unsafe-function-type': 'off',
      },
    },
  },
  {
    ignores: ['**/*.{test,spec}'],
    rules: {
      'antfu/no-top-level-await': 'off',
    },
  },
)
