import FooterComponent from "@/components/Footer/Footer";
import HeaderComponent from "@/components/Header/Header";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {

   return (
      <>
         <HeaderComponent />
         {children}
         <FooterComponent />
      </>
   )
}