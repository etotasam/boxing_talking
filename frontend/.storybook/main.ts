import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  stories: ["../src/components/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  // Storybook 7と同じ型解析で、既存の選択式Controlsを維持する。
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};
export default config;
