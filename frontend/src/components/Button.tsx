type Props = {
  children: string;
  onClick?: Function;
  className?: string;
};

const Button = ({ onClick, children }: Props) => {
  const click = () => {
    if (!onClick) return;
    onClick();
  };
  return (
    <button
      onClick={click}
      className={
        "bg-green-400 hover:bg-green-600 duration-200 text-white rounded px-2 py-1"
      }
    >
      {children}
    </button>
  );
};

export default Button;
