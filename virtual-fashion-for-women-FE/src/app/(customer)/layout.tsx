import FooterComponent from "@/components/Footer/Footer";
import HeaderComponent from "@/components/Header/Header";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {

   return (
      <>
         <div className="flex flex-col min-h-screen">
            <HeaderComponent />

            <main className="flex-1">
               {children}
            </main>

            <FooterComponent />
         </div>
      </>
   )
}