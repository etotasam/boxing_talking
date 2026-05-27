import { Outlet } from 'react-router-dom';

const LayoutDefault = () => {
  return (
    <div className={``}>
      {/* <Header /> */}
      {/* //! HeaderはContainer */}
      <main className={``}>
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutDefault;
