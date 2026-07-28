"use client";

import { useActionState } from "react";
import { subscribeToNewsletter } from "@/actions/newsletter";

interface NewsletterFormProps {
  dark?: boolean;
}

export default function NewsletterForm({ dark }: NewsletterFormProps) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, null);

  const inputBg = dark ? "bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40" : "bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-gray-400";
  const btnBg = dark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800";

  return (
    <>
      <form action={formAction} className="flex max-w-lg mx-auto md:mx-0">
        <input
          type="email"
          name="email"
          placeholder="Votre adresse e-mail"
          className={`flex-1 px-5 py-3 text-sm focus:outline-none transition-colors ${inputBg} ${dark ? "md:w-72" : ""}`}
          required
        />
        <button
          type="submit"
          disabled={pending}
          className={`px-8 py-3 text-xs tracking-[0.2em] font-semibold transition-colors whitespace-nowrap disabled:opacity-60 ${btnBg}`}
        >
          {pending ? "Patientez..." : "S'INSCRIRE"}
        </button>
      </form>
      {state && (
        <p
          className={`text-sm mt-3 text-center md:text-left ${
            state.success ? "text-green-400" : "text-red-400"
          }`}
        >
          {state.message}
        </p>
      )}
    </>
  );
}
