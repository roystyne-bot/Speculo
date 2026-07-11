
import { Metadata } from "next";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/web/navbar";
/*import { AppSidebar } from "../web/Appsidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";*/

export const metadata: Metadata = {
  title: "Home",
  description: "Chat in real time with friends and contacts.",
};

export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <>
     <Navbar />
     <Toaster />
       <main className="flex-1 flex flex-col">
        {children}
      </main>
    </>
     
  );
}