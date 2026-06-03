export function AuthHero() {
  return (
    <section className="relative overflow-hidden px-8 py-10 md:px-12 lg:px-16 lg:py-16">
      <div className="absolute right-[10%] bottom-[8%] hidden aspect-square w-[min(22vw,16rem)] rounded-full border border-[rgba(139,92,52,0.14)] bg-gradient-to-br from-white/55 to-white/0 backdrop-blur-sm lg:block" />

      <div className="relative flex flex-col gap-6">
        <div className="w-fit rounded-full border border-[#7b4e2f]/16 bg-[#6a4c35]/8 px-3.5 py-2 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#7b4e2f]">
          Little Minds
        </div>
        <h1 className="max-w-full text-[clamp(3rem,6vw,5.7rem)] leading-[0.94] font-semibold tracking-[-0.06em] text-[#42210b] lg:max-w-[11ch]">
          Um ponto de entrada acolhedor para familias e especialistas.
        </h1>
        <p className="max-w-[34rem] text-[1.06rem] leading-7 text-[#42210bcc]">
          Acesse sua conta para conversar com a IA, acompanhar discussoes e manter o
          cuidado infantil em um fluxo simples e seguro.
        </p>


      </div>
    </section>
  )
}
