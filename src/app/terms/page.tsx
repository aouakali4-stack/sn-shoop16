export default function TermsPage() {
  const sections = [
    {
      title: "1. Introduction",
      text: "Bienvenue sur Sn Shop16. Les présentes conditions générales régissent l'utilisation de notre site internet et l'achat de nos articles de prêt-à-porter pour femmes en Algérie.",
    },
    {
      title: "2. Prix et Taxes",
      text: "Tous nos prix sont affichés en Dinars Algériens (DZD). Les frais de livraison ne sont pas inclus dans le prix des articles ; ils sont calculés et ajoutés lors de la confirmation de la commande selon votre wilaya de destination.",
    },
    {
      title: "3. Validation des commandes",
      text: "Toute commande passée sur notre site fera l'objet d'un appel téléphonique de vérification de la part de notre équipe. Les commandes qui ne sont pas confirmées par téléphone ne seront pas expédiées.",
    },
    {
      title: "4. Modalités de paiement",
      text: "Le règlement s'effectue exclusivement en espèces à la livraison (Cash on Delivery). Le client s'engage à préparer le montant exact de sa commande lors du passage du représentant de la société de livraison.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
      <h1
        className="text-3xl sm:text-4xl font-light text-center text-gray-900 mb-8 sm:mb-12"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        Conditions Générales de Vente
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
