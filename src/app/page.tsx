"use client";

import Navbar from "@/components/web/navbar"
import useTransition, { useState } from "react"

export default function App() {
  //const [isPending, startTransition] = useTransition();
  
  return (
    <div className="flex flex-col relative items-center justify-center min-h-screen bg-[#0F1115] text-white px-6">
      
      <div className="fixed top-0 w-full flex justify-center">
        <Navbar />
      </div>

     
      <h4 className="flex items-center justify-center sm:gap-2 gap-1 text-lg sm:text-3xl font-bold tracking-tight text-center">
        <div className="relative h-2.5 w-2.5 sm:h-3 sm:w-3 z-1 bg-spring animate-spin shrink-0"></div>
        <span className="text-spring">AI Mocked Interviews</span>
      </h4>

      
      <h1 className="text-3xl sm:text-5xl font-bold mt-4 font-mono text-center leading-tight">
        Practice like the job{" "}
        <br className="hidden sm:block" />
        depends on it.{" "}
        <span className="text-spring">It does.</span>
      </h1>

      
      <p className="mt-4 text-base sm:text-lg text-center text-gray-400 max-w-md leading-relaxed">
        Speculo puts you in front of a relentless AI interviewer.{" "}
        <span className="block sm:inline mt-1 sm:mt-0">
          Get scored, get a debrief, get hired.
        </span>
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        
         <a href="/auth/sign-up"
          className="w-full sm:w-auto text-center px-6 py-3 bg-spring rounded-lg
                     hover:bg-spring-pale transition-colors text-onyx-light
                     font-semibold text-[15px]"
         >
          Get Started
        </a>
        
         <a href="/auth/login"
          className="w-full sm:w-auto text-center px-6 py-3 border border-gray-700
                     rounded-lg hover:bg-gray-800 transition-colors text-[15px]"
         >
          Sign In
        </a>
      </div>

    </div>
  )
}