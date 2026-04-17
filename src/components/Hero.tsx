export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0A0A0A] py-16 md:py-24 border-b border-white/5">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7C3AED]/15 via-[#0A0A0A] to-[#0A0A0A] pointer-events-none"></div>
      
      <div className="container relative mx-auto px-4 z-10 flex flex-col items-center text-center">
        <h2 className="font-heading text-5xl md:text-7xl text-white mb-4 tracking-wide uppercase drop-shadow-lg">
          O verdadeiro <span className="text-[#A78BFA]">sabor</span><br /> da madrugada
        </h2>
        <p className="text-[#A1A1AA] text-sm md:text-base max-w-md mx-auto">
          Artesanais, suculentos e feitos no capricho. Escolha seu burger favorito e nós entregamos para você.
        </p>
      </div>
    </section>
  );
}
