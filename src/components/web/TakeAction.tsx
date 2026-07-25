"use client";

import { useEffect, useRef, useState } from "react";
import { Quicksand } from "next/font/google";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["600", "700"] });

interface FeatureRowProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  reverse?: boolean;
}

export default function TakeAction() {
 

  return (
    <div
      /*ref={ref}*/
      className={`flex flex-col mx-auto max-w-5xl items-center text-center gap-5 rounded-3xl p-8 md:p-12 transition-shadow duration-700`}
      style={{
        border: "1px solid #2A2D33",
        backgroundColor: "#15181D",
        boxShadow: "0 0 30px -10px rgba(47,221,121,0.35)"
      }}
    >
     <h2 className="text-spring text-2xl">Ready to Start Your <br></br>Journey?</h2>
      <p className="text-spring-pale">Speculo let you feel the sensation of a real interview 
        with an expertise senior developer, who will ask you questions
         and give you feedback on your answers.
      </p>

        <a
          href="/auth/sign-up"
          className="bg-green-700 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-xl transition-colors duration-300"
        >
          Start Now
        </a>
      </div>
    
  );
}