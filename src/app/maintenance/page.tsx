export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F1EC] px-6 text-center">
      <h1
        className="text-4xl sm:text-5xl md:text-6xl tracking-[0.2em] font-light text-black mb-4 animate-text delay-1"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        SN SHOP
      </h1>
      <h2 className="text-lg sm:text-xl text-gray-700 mb-6 animate-text delay-2">
        Site en Maintenance
      </h2>
      <p className="text-sm sm:text-base text-gray-500 max-w-md leading-relaxed animate-text delay-3">
        Nous mettons actuellement à jour notre boutique pour vous offrir une meilleure expérience de magasinage.
        <br />
        <br />
        Nous serons de retour très bientôt !
      </p>
    </div>
  );
}
