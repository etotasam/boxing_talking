import '@testing-library/jest-dom'
import { render } from "@testing-library/react"
import { RecoilRoot } from 'recoil';

const customRender = (ui: React.ReactElement, options?: any) =>
  render(ui, { wrapper: RecoilRoot, ...options });

export * from '@testing-library/react';
export { customRender as render };