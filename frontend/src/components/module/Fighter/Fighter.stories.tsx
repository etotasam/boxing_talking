// Button.stories.tsx

import { Fighter, FighterProps } from "./Fighter";
import { Story, Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";

export default {
  title: "Common/Fighter",
  component: Fighter,
} as Meta<typeof Fighter>;

const Template: Story<typeof Fighter> = (args: any) => <Fighter {...args} />;
export const Default = Template.bind({});
const fighter = {
  id: 1,
  name: "なまえ",
  country: "Japan",
  birth: "1981/06/18",
  height: 169,
  stance: "othdx",
  ko: 1,
  win: 1,
  lose: 1,
  draw: 1,
};
Default.args = {
  fighter: fighter,
  // bgColorClassName?: string;
  windowWidth: 900,
  // recordTextColor?: string;
  // isReverse?: boolean;
} as any;
