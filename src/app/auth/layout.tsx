import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create an Account and Log in",
  description: "Sign up and Log in to start chatting on Texting App.",
};


export default function AuthLayout({ children }: {children: React.ReactNode}) {
  return (
    <div className="min-h-screen bg-foreground flex items-center justify-center">
        
        <div className="absolute top-5 left-5">
           <Link href="/"
            className={buttonVariants({ variant: 'secondary' })}
            >
            <ArrowLeft className="size-4"/>
            Back
           </Link>
        </div>

        
        <div className="w-full max-w-md mx-auto">
            {children}
        </div>
      
    </div>
  );
}