"use client";

import { useLanguage } from "@/components/web/LanguageProvider";


export default function TakeAction() {
 const { t } = useLanguage();

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
     <h2 className="text-spring text-2xl text-wrap">{t("TakeAction.readyToStart")}</h2>
      <p className="text-spring-pale">
        {t("TakeAction.description")}
      </p>

        <a
          href="/auth/sign-up"
          className="bg-green-700 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-xl transition-colors duration-300"
        >
         {t("TakeAction.readMore")}
        </a>
      </div>
    
  );
}