export default function ReturnPolicyPage() {
  const sections = [
    {
      title: "1. Délai de réclamation",
      text: "Vous disposez d'un délai de 48 heures après la réception de votre commande pour signaler un problème (défaut de fabrication ou erreur de taille) et demander un échange.",
    },
    {
      title: "2. Conditions d'acceptation",
      text: "Pour que l'échange soit accepté, les articles doivent être retournés dans leur état d'origine. Ils ne doivent être ni portés, ni lavés, ni endommagés, et doivent conserver toutes leurs étiquettes et emballages d'origine.",
    },
    {
      title: "3. Frais de retour",
      text: "Si l'erreur provient de notre part (article défectueux ou mauvaise taille), Sn Shop16 prendra en charge les frais de retour. Dans le cas contraire, les frais de livraison pour l'échange seront à la charge du client.",
    },
    {
      title: "4. Procédure d'échange",
      text: "Pour initier un retour, veuillez nous contacter directement sur WhatsApp au +213 549 31 98 69 en fournissant votre numéro de commande ainsi que des photos claires de l'article concerné.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
      <h1
        className="text-3xl sm:text-4xl font-light text-center text-gray-900 mb-8 sm:mb-12"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        Politique de retour et d&apos;échange
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
