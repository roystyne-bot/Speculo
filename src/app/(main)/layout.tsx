
import { Metadata } from "next";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/web/navbar";
/*import { AppSidebar } from "../web/Appsidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";*/
import { Quicksand } from "next/font/google";


export const metadata: Metadata = {
  title: "Home",
  description: "Chat in real time with friends and contacts.",
};

const quicksand = Quicksand({ subsets: ["latin"], weight: ["600", "700"] });


export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`min-h-screen bg-onyx-light ${quicksand.className}`}>
    <div className="relative top-1"><Navbar /></div>
     
     <Toaster />
       <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
     
  );
}