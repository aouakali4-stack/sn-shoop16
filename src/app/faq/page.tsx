"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Quelles sont les zones de livraison ?",
    answer: "Nous livrons dans les 58 wilayas d'Algérie, avec des options de livraison à domicile ou en point relais (Stop Desk) selon votre préférence.",
  },
  {
    question: "Quel est le délai de livraison ?",
    answer: "La livraison prend généralement entre 2 et 5 jours ouvrés, selon votre wilaya de résidence et l'option de livraison choisie.",
  },
  {
    question: "Quels sont les modes de paiement ?",
    answer: "Nous acceptons le paiement à la livraison (Cash on Delivery). Vous payez le montant de votre commande en espèces directement au livreur lors de la réception de votre colis.",
  },
  {
    question: "Comment puis-je contacter le service client ?",
    answer: "Notre service client est à votre disposition. Vous pouvez nous joindre via WhatsApp ou par téléphone au +213 549 31 98 69, du Samedi au Jeudi, de 9h à 18h.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
      <h1
        className="text-3xl sm:text-4xl font-light text-center text-gray-900 mb-2"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        Questions Fréquentes
      </h1>
      <p className="text-center text-sm text-gray-400 mb-8 sm:mb-12">
        Tout ce que vous devez savoir avant de commander
      </p>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right hover:bg-[#F5F1EC]/50 transition-colors"
              >
                <span className="text-sm sm:text-base font-medium text-gray-800">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
