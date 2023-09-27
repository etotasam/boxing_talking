import { Outlet } from "react-router-dom";
// import { Header } from "@/components/module/Header";

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
