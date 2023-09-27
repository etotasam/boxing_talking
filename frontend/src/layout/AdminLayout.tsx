import { ReactNode } from 'react';

// ! components
import { AdministratorPageLinks } from '@/components/module/AdministratorPageLinks';
// components
// import { EditHeader } from "@/components/module/EditHeader";

const AdminLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      <Header />
      <main className="mt-[100px]">{children}</main>
    </>
  );
};
export default AdminLayout;

const Header = () => {
  return (
    <header className="fixed top-0 left-0 h-[100px] w-full bg-white z-10 after:w-full after:absolute after:bottom-[-5px] after:left-0 after:h-[5px] after:bg-red-500">
      <AdministratorPageLinks />
    </header>
  );
};
