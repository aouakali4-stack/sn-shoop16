export default function TrackingPage() {
  const sections = [
    {
      title: "1. Processus d'expédition",
      text: "Une fois votre commande passée sur notre site, notre équipe vous appellera pour confirmer les détails. Après confirmation, votre colis sera remis à notre partenaire de livraison.",
    },
    {
      title: "2. Comment suivre mon colis ?",
      text: "Pour connaître l'état d'avancement de votre livraison en temps réel, il vous suffit de nous envoyer un message sur WhatsApp au +213 549 31 98 69.",
    },
    {
      title: "3. Informations requises",
      text: "Veuillez mentionner votre numéro de commande ou le numéro de téléphone utilisé lors de l'achat dans votre message. Notre équipe vous répondra rapidement avec toutes les informations concernant votre expédition.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
      <h1
        className="text-3xl sm:text-4xl font-light text-center text-gray-900 mb-8 sm:mb-12"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        Suivi de votre commande
      </h1>

      <div className="bg-[#F5F1EC] rounded-2xl px-6 sm:px-8 py-8 sm:py-10 space-y-6">
        {sections.map((section, i) => (
          <div key={i}>
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1.5">
              {section.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {section.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
