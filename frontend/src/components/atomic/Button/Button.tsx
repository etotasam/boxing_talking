import React from 'react';
import clsx from 'clsx';

type CustomButtonType = React.ComponentProps<'button'> & {
  styleName?: StyleNamesType;
};

type ButtonType = Omit<CustomButtonType, 'className'>;

const commonStyle = 'duration-300 text-white text-md rounded-sm';

//? スタイルを定義
const styleNames = {
  default: {
    className: clsx(commonStyle, 'px-6 py-2 bg-stone-700 hover:bg-stone-600'),
  },
  matchResultRegister: {
    className: clsx(
      commonStyle,
      'w-full py-2 bg-blue-900 hover:bg-blue-700 tracking-[0.3em]'
    ),
  },
  onForm: {
    className: clsx(
      commonStyle,
      'w-full py-2 bg-stone-600 hover:bg-stone-700 tracking-[0.3em]'
    ),
  },
  delete: {
    className: clsx(
      commonStyle,
      'bg-red-700 hover:bg-red-600 py-2 px-10 tracking-[0.3em]'
    ),
  },
  login: {
    className: clsx(commonStyle, 'py-1 w-full bg-green-700 hover:bg-green-600'),
  },
  guestLogin: {
    className: clsx(commonStyle, 'py-1 w-full bg-stone-600 hover:bg-stone-700'),
    type: 'button',
  },
  custom: {},
} as const;

type StyleNamesType = keyof typeof styleNames;

//? スタイルを取得する関数
const getStyle = (styleName: StyleNamesType) => {
  return styleNames[styleName];
};

export const Button = (props: ButtonType) => {
  const { styleName, children, ...restProps } = props;

  return (
    <button {...getStyle(styleName ?? 'default')} {...restProps}>
      {children}
    </button>
  );
};

export const CustomButton = (props: CustomButtonType) => {
  const { className, children, ...restProps } = props;
  return (
    <button className={clsx(commonStyle, className)} {...restProps}>
      {children}
    </button>
  );
};
