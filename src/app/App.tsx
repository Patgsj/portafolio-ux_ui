import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowUp, ArrowUpRight, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

// ─── Scroll utility ──────────────────────────────────────────────────────────
const scrollTo = (id: string, behavior: ScrollBehavior = "smooth") =>
  document.getElementById(id)?.scrollIntoView({ behavior });

// ─── useInView ───────────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS: [string, string][] = [["Trabajo", "work"], ["Diseño UI", "design"], ["Sobre mí", "about"], ["Experiencia", "experience"]];

function Nav() {
  const [pinned, setPinned] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = [...NAV_ITEMS.map(([, id]) => id), "contact"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const NAV_EYE_LINE = 160; // px from top of viewport used to pick the "current" section

    const h = () => {
      setPinned(window.scrollY > 80);

      let current = "";
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= NAV_EYE_LINE && rect.bottom > NAV_EYE_LINE) {
          current = el.id;
          break;
        }
      }
      setActive(current);
    };

    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-[background-color,backdrop-filter,border-color] duration-[400ms] ${
        pinned
          ? "bg-white/[0.97] backdrop-blur-[20px] border-[rgba(13,13,13,0.07)]"
          : "bg-transparent backdrop-blur-none border-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-7 md:px-14 h-[60px] flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-['Barlow_Condensed'] font-900 text-[22px] uppercase tracking-[-0.01em] text-foreground leading-none"
        >
          Patgsj<span className="text-muted-foreground">.</span>
        </button>

        <div className="hidden md:flex items-center gap-10">
          <nav className="flex items-center gap-10">
            {NAV_ITEMS.map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`font-['Barlow'] font-400 text-[11px] tracking-[0.14em] uppercase hover:text-foreground transition-colors duration-200 ${
                  active === id ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
                <span
                  aria-hidden
                  className={`inline-block w-[5px] h-[5px] bg-foreground ml-1.5 align-middle transition-opacity duration-600 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                    active === id ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </nav>

          <button
            onClick={() => scrollTo("contact")}
            className={`inline-flex items-center gap-2 font-['Barlow'] font-600 text-[11px] tracking-[0.12em] uppercase px-5 py-2.5 border border-foreground hover:opacity-80 transition-[background-color,color] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
              active === "contact" ? "bg-transparent text-foreground" : "bg-foreground text-background"
            }`}
          >
            Contactame
          </button>
        </div>

        <button
          className="md:hidden font-['Barlow'] font-600 text-[11px] tracking-widest uppercase"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? "✕" : "Menu"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden overflow-hidden bg-background border-t border-border"
          >
            <div className="px-7 pb-10 pt-6 space-y-5 flex flex-col items-end">
              {NAV_ITEMS.map(([label, id], i) => (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + i * 0.04, ease: "easeOut" }}
                  onClick={() => { scrollTo(id, "auto"); setOpen(false); }}
                  className={`flex items-center justify-end gap-3 font-['Barlow_Condensed'] font-800 text-4xl uppercase w-full text-right transition-colors duration-200 ${
                    active === id ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                  <span
                    aria-hidden
                    className={`inline-block w-2 h-2 bg-foreground transition-opacity duration-600 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                      active === id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + NAV_ITEMS.length * 0.04, ease: "easeOut" }}
                onClick={() => { scrollTo("contact", "auto"); setOpen(false); }}
                className={`inline-flex items-center gap-2 mt-4 font-['Barlow'] text-xs uppercase tracking-widest border border-foreground px-5 py-3 transition-[background-color,color] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                  active === "contact" ? "bg-transparent text-foreground" : "bg-foreground text-background"
                }`}
              >
                Contactame
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
const HERO_GRID_PARALLAX_FACTOR = 0.35;

function Hero() {
  const { ref, visible } = useInView(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [gridOffset, setGridOffset] = useState(0);

  useEffect(() => {
    const h = () => setGridOffset(window.scrollY * HERO_GRID_PARALLAX_FACTOR);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <section ref={sectionRef} id="hero" className="relative min-h-screen flex flex-col pt-[60px] overflow-hidden">
      {/* Background precision grid */}
      <div
        aria-hidden
        style={{ transform: `translateY(${gridOffset}px)` }}
        className="absolute inset-0 pointer-events-none will-change-transform"
      >
        <div
          style={{
            WebkitMaskImage: "linear-gradient(to right, black 0%, black 12%, transparent 32%, transparent 68%, black 88%, black 100%)",
            maskImage: "linear-gradient(to right, black 0%, black 12%, transparent 32%, transparent 68%, black 88%, black 100%)",
          }}
          className="absolute inset-[-10%] animate-[hero-grid-drift_46s_linear_infinite] [background-image:radial-gradient(circle,rgba(13,13,13,0.3)_2px,transparent_2.5px),linear-gradient(to_right,rgba(13,13,13,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,13,13,0.05)_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <span className="absolute top-[24%] right-[16%] w-4 h-4 animate-[hero-grid-pulse_5s_ease-in-out_infinite]">
          <span className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-foreground/30" />
          <span className="absolute top-1/2 left-0 -translate-y-1/2 h-px w-full bg-foreground/30" />
        </span>
      </div>

      {/* Top stripe */}
      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-7 md:px-14 flex items-center justify-end py-5">
        <span className="font-['Barlow'] font-300 text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
          Disponible — 2026
        </span>
      </div>

      {/* Main headline */}
      <div className="relative z-10 flex-1 flex items-center">
        <div
          ref={ref}
          className={`max-w-[1400px] mx-auto w-full px-7 md:px-14 py-16 md:py-20 transition-[opacity,transform] duration-[900ms] ease-[ease] ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[30px]"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-12">
            {/* Big type */}
            <div>
              <h1
                className="font-['Barlow_Condensed'] font-900 uppercase leading-[0.86] tracking-[-0.02em] text-foreground text-[clamp(4.5rem,20vw,18rem)] whitespace-nowrap"
              >
                Patgsj<span className="text-muted-foreground">.</span>
                <span className="sr-only"> — Patricio Soto</span>
              </h1>
              <p className="font-['Barlow'] font-500 text-[13px] md:text-base uppercase tracking-[0.2em] text-muted-foreground mt-3 md:mt-5">
                Patricio Soto — Diseñador Gráfico &amp; UX/UI
              </p>
            </div>

            {/* Descriptor */}
            <div className="space-y-7 md:pb-4 max-w-xs">
              <div className="space-y-4">
                <p className="font-['Barlow'] font-300 text-sm leading-[1.8] text-muted-foreground">
                  Diseño interfaces que funcionan de verdad — y después las llevo a código yo mismo.
                </p>
                <p className="font-['Barlow'] font-300 text-sm leading-[1.8] text-muted-foreground">
                  Vengo del Diseño Gráfico, estudié UX/UI y ahora curso Ingeniería en Informática. Esa mezcla es la que uso para resolver problemas de negocio reales, no solo para que la pantalla se vea bien.
                </p>
              </div>
              <button
                onClick={() => scrollTo("work")}
                className="group inline-flex items-center gap-2 font-['Barlow'] font-500 text-[11px] uppercase tracking-[0.14em] text-foreground"
              >
                <span className="w-8 h-[1px] bg-foreground inline-block group-hover:w-14 transition-all duration-300" />
                Ver trabajo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Work ─────────────────────────────────────────────────────────────────────
const PILLARS_DATA = [
  {
    n: "01",
    title: "Stack eficiente, costo $0 al inicio",
    desc: "Uso estratégico de Supabase (Postgres + Auth + Realtime) y Vercel Functions en sus capas gratuitas para garantizar costo de operación $0 al inicio.",
    why: "El cliente venía de pagar suscripciones mensuales elevadas; en la etapa de despegue del negocio, cada peso de costo fijo importa.",
  },
  {
    n: "02",
    title: "Aislamiento de datos a nivel de base & arquitectura lista para multi-sucursal",
    desc: "Row Level Security (RLS) en Postgres ejecutado vía RPC (set_config) a nivel de contexto de sesión. En lugar de confiar solo en la capa de la aplicación, el aislamiento se garantiza directamente en la base de datos.",
    why: "Máxima seguridad de los datos ante manipulaciones en el cliente y escalabilidad garantizada: si la ferretería decide abrir una segunda sucursal o expandir su operación, el sistema está listo para separar inventarios y cajas sin necesidad de reescribir la base de datos ni la arquitectura.",
  },
  {
    n: "03",
    title: "Cumplimiento tributario seguro",
    desc: "Integración con OpenFactura/Haulmer para DTEs (Boleta 39 / Factura 33), ejecutados vía Vercel Serverless.",
    why: "Es un requisito legal, no un extra: mantener el token de API fuera del navegador evita que quede expuesto y comprometa la cuenta ante el SII.",
  },
  {
    n: "04",
    title: "Resiliencia operativa",
    desc: "Cola de reintentos con backoff creciente para facturación fallida, y Service Worker PWA para ventas offline.",
    why: "En un negocio de mesón la conexión no siempre es estable. La caja no puede depender de que internet funcione para cerrar una venta.",
  },
];

function PillarCell({ n, title, desc, why }: { n: string; title: string; desc: string; why: string }) {
  return (
    <div className="border-t border-l border-border px-8 py-10 [&:nth-child(2n)]:border-r [&:nth-child(-n+2)]:md:border-t-0">
      <p className="font-['DM_Mono'] text-[10px] text-muted-foreground mb-5">{n}</p>
      <h4 className="font-['Barlow_Condensed'] font-700 text-xl uppercase tracking-tight text-foreground mb-3">{title}</h4>
      <p className="font-['Barlow'] font-300 text-[13px] leading-[1.7] text-muted-foreground">{desc}</p>
      <div className="mt-5 pt-5 border-t border-border">
        <p className="font-['Barlow'] font-500 text-[10px] uppercase tracking-[0.14em] text-foreground/50 mb-1.5">Por qué</p>
        <p className="font-['Barlow'] font-300 text-[13px] leading-[1.7] text-foreground">{why}</p>
      </div>
    </div>
  );
}

const CASE_SHOTS = [
  {
    img: "/case-ferreteria/dashboard.webp",
    title: "Dashboard de negocio",
    desc: "Ventas y utilidad del día, valor total de inventario, alertas de stock, tendencia de 7 días y emisión de documentos (boletas vs. facturas).",
  },
  {
    img: "/case-ferreteria/pos.webp",
    title: "Punto de venta (POS)",
    desc: "Flujo de caja optimizado para velocidad: escaneo de código de barras, atajo cantidad*código, boleta o factura y método de pago en la misma pantalla.",
  },
  {
    img: "/case-ferreteria/catalogo.webp",
    title: "Catálogo público",
    desc: "Vitrina de productos con búsqueda por nombre, código de barras o código corto, y carrito de compra — accesible sin login.",
  },
  {
    img: "/case-ferreteria/inventario.webp",
    title: "Gestión de inventario",
    desc: "Búsqueda instantánea, edición en línea, control de stock crítico y categorías de producto — sincronizado en tiempo real entre dispositivos.",
  },
  {
    img: "/case-ferreteria/historial.webp",
    title: "Historial de ventas",
    desc: "Registro completo desde Supabase con búsqueda por folio, método de pago u origen, y exportación de reporte mensual para el contador.",
  },
  {
    img: "/case-ferreteria/login.webp",
    title: "Acceso restringido",
    desc: "El panel de administración vive detrás de autenticación Supabase; el catálogo permanece público.",
  },
];

function CaseCarousel({ onSelect }: { onSelect: (index: number) => void }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(() => {
      if (!paused) emblaApi.scrollNext();
    }, 3200);
    return () => clearInterval(id);
  }, [emblaApi, paused]);

  return (
    <div
      className="relative mb-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-5">
          {CASE_SHOTS.map((s, i) => (
            <div key={s.img} className="flex-[0_0_85%] sm:flex-[0_0_55%] md:flex-[0_0_38%] pl-5">
              <button
                onClick={() => onSelect(i)}
                className="group relative w-full aspect-[8/5] overflow-hidden bg-muted border border-border cursor-pointer text-left"
              >
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground opacity-0 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-['Barlow_Condensed'] font-700 text-4xl md:text-5xl uppercase tracking-tight text-background leading-none">{s.title}</p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        aria-label="Anterior"
        onClick={() => emblaApi?.scrollPrev()}
        className="hidden md:flex absolute left-[-56px] top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-foreground hover:opacity-60 transition-opacity"
      >
        <ChevronLeft size={44} strokeWidth={1.5} />
      </button>
      <button
        aria-label="Siguiente"
        onClick={() => emblaApi?.scrollNext()}
        className="hidden md:flex absolute right-[-56px] top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-foreground hover:opacity-60 transition-opacity"
      >
        <ChevronRight size={44} strokeWidth={1.5} />
      </button>
    </div>
  );
}

type LightboxShot = { img: string; title: string; desc: string; href?: string };

function Lightbox({
  shots, index, onClose, onNav, showDesc = true,
}: {
  shots: LightboxShot[]; index: number; onClose: () => void; onNav: (dir: 1 | -1) => void; showDesc?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNav]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const shot = shots[index];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-6 right-6 md:top-10 md:right-10 w-11 h-11 flex items-center justify-center bg-background text-foreground hover:opacity-80 transition-opacity"
      >
        <X size={18} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNav(-1); }}
        aria-label="Anterior"
        className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-background text-foreground hover:opacity-80 transition-opacity"
      >
        <ArrowLeft size={18} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNav(1); }}
        aria-label="Siguiente"
        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-background text-foreground hover:opacity-80 transition-opacity"
      >
        <ArrowRight size={18} />
      </button>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="max-w-6xl w-full max-h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={shot.img}
            src={shot.img}
            alt={shot.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full h-auto object-contain bg-muted"
          />
        </AnimatePresence>
        <div className="mt-6 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="font-['DM_Mono'] text-[10px] text-background/50 mb-2">
              {String(index + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
            </p>
            <h4 className={`font-['Barlow_Condensed'] font-700 text-2xl uppercase tracking-tight text-background ${showDesc ? "mb-2" : ""}`}>{shot.title}</h4>
            {showDesc && (
              <p className="font-['Barlow'] font-300 text-sm leading-[1.7] text-background/70 max-w-xl">{shot.desc}</p>
            )}
          </div>
          {shot.href && (
            <a
              href={shot.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 font-['Barlow'] font-500 text-[11px] uppercase tracking-[0.12em] text-background/70 hover:text-background transition-colors shrink-0"
            >
              Ver en Dribbble <ArrowUpRight size={13} />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function Work() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const navLightbox = useCallback((dir: 1 | -1) => {
    setLightboxIndex((cur) => (cur === null ? cur : (cur + dir + CASE_SHOTS.length) % CASE_SHOTS.length));
  }, []);
  const { ref, visible } = useInView(0.1);

  return (
    <section id="work" className="border-t border-border py-20 md:py-32">
      <div
        ref={ref}
        className={`max-w-[1400px] mx-auto px-7 md:px-14 transition-[opacity,transform] duration-[800ms] ease-[ease] ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[24px]"
        }`}
      >
        {/* Case intro */}
        <div className="mb-10 max-w-2xl">
          <p className="font-['Barlow'] font-500 text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-4">
            Caso de estudio 01 — Software a medida, en construcción
          </p>
          <h2 className="font-['Barlow_Condensed'] font-900 uppercase leading-[0.92] tracking-[-0.01em] text-foreground mb-4 text-[clamp(2.2rem,5vw,4rem)]">
            Ferretería CTM
          </h2>
          <p className="inline-flex items-center gap-2 font-['Barlow'] font-500 text-[11px] uppercase tracking-[0.14em] text-foreground mb-5">
            <span aria-hidden className="w-1.5 h-1.5 bg-foreground inline-block animate-pulse" />
            En desarrollo activo — iteración constante junto al cliente
          </p>
          <p className="font-['Barlow'] font-300 text-[15px] leading-[1.8] text-muted-foreground max-w-xl">
            SaaS de punto de venta y facturación electrónica ante el SII, construido de punta a punta para que un negocio real se independice de suscripciones externas: catálogo público, caja, inventario y cumplimiento tributario chileno — sin atajos.
          </p>
        </div>

        {/* Screenshot carousel */}
        <p className="font-['Barlow'] font-300 text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-4">
          Capturas reales — hacé clic para ampliar
        </p>
        <CaseCarousel onSelect={setLightboxIndex} />
        {lightboxIndex !== null && (
          <Lightbox shots={CASE_SHOTS} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNav={navLightbox} />
        )}

        {/* Role / Scope */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border mb-14">
          <div className="border-r border-b border-border px-8 py-10">
            <p className="font-['DM_Mono'] text-[10px] text-muted-foreground mb-5">Rol</p>
            <h4 className="font-['Barlow_Condensed'] font-700 text-xl uppercase tracking-tight text-foreground mb-3">Desarrollo full-stack, en solitario</h4>
            <p className="font-['Barlow'] font-300 text-[13px] leading-[1.7] text-muted-foreground">Arquitectura, base de datos y RLS, frontend e integración con el SII — de punta a punta.</p>
          </div>
          <div className="border-r border-b border-border px-8 py-10">
            <p className="font-['DM_Mono'] text-[10px] text-muted-foreground mb-5">Alcance</p>
            <h4 className="font-['Barlow_Condensed'] font-700 text-xl uppercase tracking-tight text-foreground mb-3">4 apps, 1 negocio real</h4>
            <p className="font-['Barlow'] font-300 text-[13px] leading-[1.7] text-muted-foreground">Catálogo público, panel administrativo, dashboard y login — para un negocio real, no una maqueta.</p>
          </div>
        </div>

        {/* Business problem & UX strategy */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border mb-14">
          <div className="border-r border-b border-border px-8 py-10">
            <p className="font-['DM_Mono'] text-[10px] text-muted-foreground mb-5">Justificación de negocio</p>
            <h4 className="font-['Barlow_Condensed'] font-700 text-xl uppercase tracking-tight text-foreground mb-3">Independencia de suscripciones mensuales</h4>
            <p className="font-['Barlow'] font-300 text-[13px] leading-[1.7] text-muted-foreground">El cliente venía pagando de más cada mes por softwares genéricos y quería cortar con eso. Un negocio recién despegando no puede cargar con cuotas fijas de infraestructura, así que la salida fue un sistema propio, de pago único.</p>
          </div>
          <div className="border-r border-b border-border px-8 py-10">
            <p className="font-['DM_Mono'] text-[10px] text-muted-foreground mb-5">Estrategia de diseño/UX</p>
            <h4 className="font-['Barlow_Condensed'] font-700 text-xl uppercase tracking-tight text-foreground mb-3">Velocidad de atención en mesón</h4>
            <p className="font-['Barlow'] font-300 text-[13px] leading-[1.7] text-muted-foreground">Interfaz de venta rápida con soporte para escáner QR, atajos de teclado, navegación fluida y resiliencia ante cortes de internet (operación offline-first).</p>
          </div>
        </div>

        {/* Problem pillars */}
        <div className="mb-14">
          <p className="font-['Barlow'] font-300 text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-8">
            Decisiones de arquitectura — costo $0 y escalabilidad real
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 border-r border-b border-border">
            {PILLARS_DATA.map((p) => (
              <PillarCell key={p.n} {...p} />
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="flex flex-wrap gap-2 mb-14">
          {["Vite 6", "JavaScript (ES Modules)", "Tailwind CSS 4", "Supabase (Postgres, Auth, Realtime, RLS)", "RPCs (set_config)", "Vercel (hosting + serverless + cron)", "OpenFactura / Haulmer API", "Chart.js", "jsPDF", "html5-qrcode", "Vitest"].map((t) => (
            <span
              key={t}
              className="font-['Barlow'] font-300 text-[10px] uppercase tracking-[0.1em] border border-border px-3 py-2 text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Case study outcome bar */}
        <div className="bg-foreground text-background grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-px bg-white/10 overflow-hidden">
          <div className="bg-foreground px-8 py-10">
            <p className="font-['Barlow'] font-300 text-[11px] uppercase tracking-[0.18em] text-background/50 mb-4">Caso de estudio — Ferretería CTM</p>
            <p className="font-['Barlow'] font-300 text-sm leading-relaxed text-background/70 max-w-sm">
              La venta se cierra al instante; el documento tributario (boleta o factura) se emite después, en segundo plano, vía función serverless — el token de API nunca toca el navegador. Todo corriendo sobre las capas gratuitas de Supabase y Vercel.
            </p>
          </div>
          {[
            { n: "$0", l: "Costo de operación al inicio" },
            { n: "RLS", l: "Multi-tenant, aislado por organización" },
            { n: "SII", l: "Boletas y facturas reales" },
            { n: "PWA", l: "Instalable y funciona offline" },
          ].map(({ n, l }) => (
            <div key={l} className="bg-foreground px-8 py-10 flex flex-col justify-end">
              <p className="font-['Barlow_Condensed'] font-900 tracking-tight text-background text-[clamp(2rem,4vw,3rem)]">{n}</p>
              <p className="font-['Barlow'] font-300 text-[10px] uppercase tracking-[0.18em] text-background/50 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Design ───────────────────────────────────────────────────────────────────
const DRIBBBLE_SHOTS: LightboxShot[] = [
  {
    img: "https://cdn.dribbble.com/userupload/13902756/file/original-a58b51d3e797d69ac72f43f68b99e10e.png",
    title: "Daily UI 023 — Onboarding",
    desc: "Flujo de onboarding para una app de fitness: carrusel de tarjetas con imagen a página completa y CTA claro en cada paso.",
    href: "https://dribbble.com/shots/23938922-Daily-UI-023-Onboarding",
  },
  {
    img: "https://cdn.dribbble.com/userupload/13186247/file/original-8fbe1eccf4ef8102bc5799bf6b892350.jpg",
    title: "Daily UI 022 — Search",
    desc: "Pantalla de búsqueda con foco en el estado del input y sugerencias contextuales sobre un fondo ilustrado.",
    href: "https://dribbble.com/shots/23688627--DailyUI-022-Search",
  },
  {
    img: "https://cdn.dribbble.com/userupload/13093471/file/original-95ddb6674818e7f0f3b2be3fb28849ab.jpg",
    title: "Daily UI 021 — Home Monitoring",
    desc: "Dashboard de monitoreo para smart home, con control circular de temperatura y accesos rápidos por habitación.",
    href: "https://dribbble.com/shots/23656753-Daily-UI-021-Home-Monitoring-Dashboard",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12948966/file/original-16a3f6838fd5382721e55729f9c9ea59.jpg",
    title: "App Ticket Cine",
    desc: "App de compra de entradas de cine, con selección de asientos, horarios y confirmación de reserva.",
    href: "https://dribbble.com/shots/23607309-App-Ticket-Cine",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12883246/file/original-a44c2142aaa5511f2d33729e775f678a.jpg",
    title: "Daily UI 020 — Location Tracker",
    desc: "Interfaz de rastreo de ubicación en tiempo real sobre un mapa, con tarjeta de estado flotante.",
    href: "https://dribbble.com/shots/23584148-DailyUI-020-Location-Tracker",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12859002/file/original-e759d7b10e19c78b41ab3c984c7b496e.jpg",
    title: "Daily UI 019 — Leaderboard",
    desc: "Tabla de posiciones gamificada, con ranking, avatares y puntaje destacado para el primer lugar.",
    href: "https://dribbble.com/shots/23575917-Daily-UI-019-LEADERBOARD",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12686920/file/original-deaa0fbe6bdb6dd69529e465719dc647.jpg",
    title: "Daily UI 018 — Analytics Chart",
    desc: "Panel de analítica con gráficos de barra y de tendencia, priorizando la lectura rápida de métricas clave.",
    href: "https://dribbble.com/shots/23516410-Daily-UI-018-Analytics-Chart",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12246714/file/original-6b94e09236ef6e5dd62f0b7e04d40d9f.jpg",
    title: "Daily UI 017 — Purchase Receipt",
    desc: "Boleta de compra digital con desglose de ítems, totales y confirmación de pago.",
    href: "https://dribbble.com/shots/23360851-Reto-UI-de-100-di-as-DailyUI-017-PURCHASE-RECEIPT",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12161792/file/original-b98536159473c787d89b50539a9691ce.jpg",
    title: "Daily UI 016 — Pop-Up Overlay",
    desc: "Overlay de anuncio de nueva versión, con imagen ilustrada y CTA de descarga.",
    href: "https://dribbble.com/shots/23330436-Reto-UI-de-100-di-as-DailyUI-016-Pop-Up-Overlay",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12100270/file/original-4e69d11ee821f02f2574598766954e32.jpg",
    title: "Daily UI 015 — On/Off Switch",
    desc: "Exploración de un control switch en sus dos estados, encendido y apagado.",
    href: "https://dribbble.com/shots/23308779-Reto-UI-de-100-di-as-DailyUI-015-On-Off-Switch",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12088683/file/original-b0d1cbd3e58efe9aa50ed5e932be8317.jpg",
    title: "Daily UI 014 — Countdown Timer",
    desc: "Temporizador de cuenta regresiva sobre una interfaz mobile de estilo oscuro.",
    href: "https://dribbble.com/shots/23304450-Reto-UI-de-100-d-as-DailyUI-014-Countdown-Timer",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12027216/file/original-269490e535af57b8a04a787073acd148.jpg",
    title: "Daily UI 013 — Direct Message",
    desc: "Bandeja de mensajería directa con lista de conversaciones y vista de chat activo.",
    href: "https://dribbble.com/shots/23282244-Reto-UI-de-100-d-as-DailyUI-013-Direct-Message",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11944881/file/original-987d7527000349a7dd6558030e55d755.jpg",
    title: "Daily UI 012 — E-commerce Shop",
    desc: "Catálogo de tienda online con grilla de productos y filtros.",
    href: "https://dribbble.com/shots/23252077-Reto-UI-de-100-d-as-DailyUI-012-E-commerce-Shop",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11902113/file/original-03ae52debb14defd79bc7f83fd9e87df.jpg",
    title: "Daily UI 011 — Flash Message",
    desc: "Sistema de notificaciones flash para estados de éxito, error y advertencia.",
    href: "https://dribbble.com/shots/23236392-Reto-UI-de-100-d-as-DailyUI-011-Flash-Message",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11885778/file/original-0f94cfd4c7301ddb337ea853c82fd45d.jpg",
    title: "Daily UI 010",
    desc: "Ejercicio de interfaz dentro del reto Daily UI de 100 días.",
    href: "https://dribbble.com/shots/23230180-Reto-de-Interfaz-de-Usuario-UI-de-100-d-as-DailyUI-010",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11837185/file/original-1e324e1e6c0990bf1794594c7f84f6a0.jpg",
    title: "Daily UI 009 — Music Player",
    desc: "Reproductor de música con portada de álbum, controles y línea de progreso.",
    href: "https://dribbble.com/shots/23212883-Reto-de-Interfaz-de-Usuario-009-Music-player-DayliUI",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11820075/file/original-ee8c1541415d59e6715bca6b070bd545.jpg",
    title: "Daily UI 008 — 404",
    desc: "Pantalla de error 404 con ilustración y camino de vuelta claro para el usuario.",
    href: "https://dribbble.com/shots/23206415-Reto-de-Interfaz-de-Usuario-UI-de-100-d-as-Daily-UI-008-404",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11814841/file/original-2be9d366c39567145c8be34c85278d15.jpg",
    title: "Daily UI 007",
    desc: "Ejercicio de interfaz dentro del reto Daily UI de 100 días.",
    href: "https://dribbble.com/shots/23204514-Reto-de-Interfaz-de-Usuario-UI-de-100-d-as-Daily-UI-007",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11564475/file/original-25e535d76392b44480981c1b13a0a4b8.jpg",
    title: "Daily UI 006 — User Profile",
    desc: "Perfil de usuario con foto, datos y estadísticas de actividad.",
    href: "https://dribbble.com/shots/23113292-UI-006-User-Profile-UI-UX-Figma-Designer-DailyUI",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11563606/file/original-866388b26568509d7479bf0669a5c489.jpg",
    title: "Daily UI 004 — Calculadora (v2)",
    desc: "Segunda exploración de la calculadora del reto, con otra paleta y disposición de teclas.",
    href: "https://dribbble.com/shots/23112967-UI-004-Calculadora-UI-UX-Figma-Designer-DailyUI",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11521159/file/original-16932c07c409dc5748f14fa8d3e941cf.jpg",
    title: "Daily UI 004 — Calculadora",
    desc: "Interfaz de calculadora con teclado numérico y visor de resultado.",
    href: "https://dribbble.com/shots/23097648-Calculadora-Daily-UI-004",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11519616/file/original-ca0b34287992efd36891f778353a8d38.jpg",
    title: "Daily UI 003 — Safe Bank",
    desc: "Landing page de banca online, con hero de gran formato y llamado a abrir cuenta.",
    href: "https://dribbble.com/shots/23097117-Landing-page-Daily-UI-003-100uichallenge-dailyui",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11431967/file/original-20563c9839f90343bda0eb8e96b42af0.jpg",
    title: "Credit Card Checkout",
    desc: "Pantalla de checkout con formulario de tarjeta y tarjeta visual del producto.",
    href: "https://dribbble.com/shots/23065326-Credit-Card-Checkoutor-Daily-UI-100uichallenge-dailyui",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11429428/file/original-6c2efb888e82276173d0e1a40a4ee414.jpg",
    title: "Daily UI 001 — Sign Up",
    desc: "Modal de registro de usuario, primer ejercicio del reto de 100 días de UI.",
    href: "https://dribbble.com/shots/23064380-My-sign-up-modal-example-for-Daily-UI-001uichallenge-dailyui",
  },
];

function Design() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const navLightbox = useCallback((dir: 1 | -1) => {
    setLightboxIndex((cur) => (cur === null ? cur : (cur + dir + DRIBBBLE_SHOTS.length) % DRIBBBLE_SHOTS.length));
  }, []);
  const { ref, visible } = useInView(0.1);

  return (
    <section id="design" className="border-t border-border py-20 md:py-32">
      <div
        ref={ref}
        className={`max-w-[1400px] mx-auto px-7 md:px-14 transition-[opacity,transform] duration-[800ms] ease-[ease] ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[24px]"
        }`}
      >
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-['Barlow_Condensed'] font-900 uppercase leading-[0.92] tracking-[-0.01em] text-foreground text-[clamp(2.2rem,5vw,4rem)]">
            Diseño UI
          </h2>
          <a
            href="https://dribbble.com/PatGsj"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-['Barlow'] font-300 text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Perfil en Dribbble <ArrowUpRight size={13} />
          </a>
        </div>

        <p className="font-['Barlow'] font-300 text-[15px] leading-[1.8] text-muted-foreground max-w-xl mb-10">
          Esto es lo que hago fuera de los proyectos de cliente, sobre todo con el reto Daily UI — una forma de seguir practicando patrones de interfaz sin la presión de un brief real. Hacé clic en cualquiera para verla más grande.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {DRIBBBLE_SHOTS.map((s, i) => (
            <button
              key={s.img}
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-square overflow-hidden bg-muted border border-border cursor-pointer text-left"
            >
              <img
                src={s.img}
                alt={s.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-foreground opacity-0 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center px-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-['Barlow_Condensed'] font-700 text-2xl md:text-3xl uppercase tracking-tight text-background leading-none">{s.title}</p>
              </div>
            </button>
          ))}
        </div>

        {lightboxIndex !== null && (
          <Lightbox shots={DRIBBBLE_SHOTS} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNav={navLightbox} showDesc={false} />
        )}
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
const CERTIFICATIONS_DATA = [
  { title: "Diseño Gráfico", org: "Universidad del Bío-Bío", period: "2005 – 2010" },
  { title: "Técnico Topógrafo", org: "Duoc UC", period: "2015 – 2017" },
  { title: "Diplomado en Diseño de Productos UX/UI", org: "AIEP", period: "2023" },
  { title: "Ingeniería en Informática", org: "IPLACEX", period: "En curso desde 2025" },
];

const TOOLS_DATA = [
  { cat: "Diseño", items: ["Figma", "Photoshop", "Illustrator", "InDesign"] },
  { cat: "Audiovisual", items: ["Premiere Pro", "After Effects", "Audition"] },
  { cat: "Desarrollo", items: ["HTML / CSS", "React (en formación)", "Python (en formación)"] },
  { cat: "IA & Productividad", items: ["Claude Code (AI-Assisted Dev)", "Prompt Engineering", "Figma", "Tailwind CSS", "JavaScript/React", "Supabase"] },
];

function About() {
  const { ref, visible } = useInView(0.1);
  const { ref: formacionRef, visible: formacionVisible } = useInView(0.1);

  return (
    <section id="about" className="border-t border-border py-20 md:py-32">
      <div className="max-w-[1400px] mx-auto px-7 md:px-14">
        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center transition-[opacity,transform] duration-[800ms] ease-[ease] ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[24px]"
          }`}
        >
          {/* Left */}
          <div className="relative">
            <img
              src="/yo.webp"
              alt="Patricio Soto (Patgsj), diseñador UX/UI — retrato"
              loading="lazy"
              decoding="async"
              className="w-full object-cover aspect-[5/6] object-top"
            />
            {/* floating label */}
            <div className="absolute bottom-6 left-6 bg-background px-4 py-3">
              <p className="font-['Barlow_Condensed'] font-700 text-base uppercase tracking-tight text-foreground">Patgsj<span className="text-muted-foreground">.</span></p>
              <p className="font-['Barlow'] font-300 text-[10px] uppercase tracking-widest text-muted-foreground">San Carlos, Ñuble</p>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-10">
            <h2
              className="font-['Barlow_Condensed'] font-900 uppercase leading-[0.88] tracking-[-0.01em] text-foreground text-[clamp(3.5rem,7vw,6.5rem)]"
            >
              Diseño UX/UI<br />
              orientado a<br />
              producto<span className="text-muted-foreground">.</span>
            </h2>

            <p className="font-['Barlow'] font-300 text-[11px] uppercase tracking-[0.18em] text-muted-foreground -mt-6">Sobre mí</p>
            <p className="font-['Barlow_Condensed'] font-700 text-xl uppercase tracking-tight text-foreground -mt-6">Patricio Gustavo Soto Jofré</p>

            <div className="space-y-5 max-w-md">
              <p className="font-['Barlow'] font-300 text-[15px] leading-[1.9] text-foreground">
                Soy Patgsj (Patricio Soto). Diseño interfaces, no solo las dibujo: formación en UX/UI (AIEP) y más de 10 años en comunicación visual, hoy aplicados a resolver problemas reales de producto.
              </p>
              <p className="font-['Barlow'] font-300 text-[15px] leading-[1.9] text-muted-foreground">
                Estudio Ingeniería en Informática, lo que me da algo poco común en diseño: pensamiento lógico y estructurado. Ese orden también viene de la topografía, donde trabajé antes — ahí aprendí que un error de medición se paga caro, y ese mismo rigor lo aplico hoy a cada flujo, cada estado de un componente, cada detalle de una interfaz.
              </p>
              <p className="font-['Barlow'] font-300 text-[15px] leading-[1.9] text-muted-foreground">
                No me quedo en Figma: uso Figma Make y flujos de desarrollo asistido por IA (Claude Code) para llevar mis diseños a código real — React, Tailwind, TypeScript — y probarlos como productos funcionales, no como maquetas estáticas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {["Figma", "Figma Make", "React", "Tailwind CSS", "TypeScript", "Comunicación Visual", "Claude Code (AI-Assisted Dev)"].map((t) => (
                <span
                  key={t}
                  className="font-['Barlow'] font-300 text-[10px] uppercase tracking-[0.14em] border border-border px-3 py-2 text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Formación — fusionado bajo Sobre mí */}
        <div
          ref={formacionRef}
          className={`mt-24 md:mt-32 pt-16 md:pt-20 border-t border-border transition-[opacity,transform] duration-[800ms] ease-[ease] ${
            formacionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[24px]"
          }`}
        >
          <div className="flex items-baseline justify-between mb-12">
            <h3 className="font-['Barlow_Condensed'] font-900 uppercase leading-none tracking-[-0.01em] text-foreground text-[clamp(2.2rem,5vw,4rem)]">
              Formación
            </h3>
            <p className="font-['Barlow'] font-300 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Certificaciones y herramientas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
            {/* Certifications */}
            <div>
              <p className="font-['Barlow'] font-300 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6 pb-4 border-b border-border">
                Certificaciones y estudios
              </p>
              <div className="divide-y divide-border">
                {CERTIFICATIONS_DATA.map((c) => (
                  <div key={c.title} className="py-4 flex items-baseline justify-between gap-4">
                    <div>
                      <p className="font-['Barlow_Condensed'] font-700 text-base uppercase tracking-tight text-foreground leading-snug">{c.title}</p>
                      <p className="font-['Barlow'] font-300 text-[12px] text-muted-foreground mt-0.5">{c.org}</p>
                    </div>
                    <span className="font-['DM_Mono'] text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{c.period}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div>
              <p className="font-['Barlow'] font-300 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6 pb-4 border-b border-border">
                Herramientas
              </p>
              <div className="space-y-8">
                {TOOLS_DATA.map(({ cat, items }) => (
                  <div key={cat}>
                    <p className="font-['Barlow'] font-300 text-[10px] uppercase tracking-widest text-muted-foreground mb-3">{cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((t) => (
                        <span
                          key={t}
                          className="font-['Barlow'] font-300 text-[10px] uppercase tracking-[0.1em] border border-border px-3 py-2 text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────
const EXP_DATA = [
  { n: "01", role: "Diseñador UX/UI & Desarrollador Full-Stack Independiente", company: "Proyectos propios", period: "2024–Presente", type: "Independiente", desc: "Investigación, diseño de interfaz y desarrollo end-to-end de aplicaciones web y PWAs para clientes reales. Proyecto estrella: Ferretería CTM — SaaS POS con arquitectura multi-tenant, emisión de DTEs ante el SII y modo offline." },
  { n: "02", role: "Diplomado en Diseño de Productos UX/UI", company: "AIEP", period: "2023", type: "Formación", desc: "Formación especializada en investigación con usuarios, diseño de interacción, arquitectura de información, alineamiento de negocio e interfaces interactivas en Figma." },
  { n: "03", role: "Comunicación Visual, Diseño Gráfico & Precisión", company: "Branding & dirección de arte", period: "Trayectoria técnica y visual", type: "Freelance", desc: "Más de 10 años aplicando diseño de comunicación visual, branding y dirección de arte. Rigor metodológico y manejo de datos de alta precisión heredados del ejercicio técnico e ingeniería." },
];

function Experience() {
  const { ref, visible } = useInView(0.1);

  return (
    <section id="experience" className="border-t border-border bg-foreground text-background py-20 md:py-32">
      <div
        ref={ref}
        className={`max-w-[1400px] mx-auto px-7 md:px-14 transition-[opacity,transform] duration-[800ms] ease-[ease] ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[24px]"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between mb-16">
          <h2
            className="font-['Barlow_Condensed'] font-900 uppercase leading-none tracking-[-0.01em] text-background text-[clamp(3rem,8vw,7rem)]"
          >
            Experiencia
          </h2>
          <span className="font-['Barlow'] font-300 text-[11px] uppercase tracking-[0.16em] text-background/50">Enfoque UX/UI desde 2023</span>
        </div>

        {/* Entries */}
        <div className="space-y-0 divide-y divide-background/10">
          {EXP_DATA.map(({ n, role, company, period, type, desc }) => (
            <div key={n} className="grid grid-cols-1 md:grid-cols-[60px_1fr_1fr_180px] gap-4 py-10 group hover:pl-2 transition-all duration-300">
              <span className="font-['DM_Mono'] text-[10px] text-background/50 pt-1">{n}</span>
              <div>
                <h3 className="font-['Barlow_Condensed'] font-700 text-2xl md:text-3xl uppercase tracking-tight text-background leading-tight">{role}</h3>
                <p className="font-['Barlow'] font-300 text-[13px] text-background/50 mt-1">{company}</p>
              </div>
              <p className="font-['Barlow'] font-300 text-[13px] leading-[1.9] text-background/55 max-w-sm">{desc}</p>
              <div className="flex md:flex-col md:items-end gap-3 md:gap-2">
                <span className="font-['DM_Mono'] text-[10px] text-background/50 tracking-wide">{period}</span>
                <span className="font-['DM_Mono'] text-[9px] uppercase tracking-[0.15em] border border-background/30 px-2.5 py-1 text-background/50">{type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  const { ref, visible } = useInView(0.1);

  return (
    <section id="contact" className="border-t border-border py-24 md:py-36">
      <div
        ref={ref}
        className={`max-w-[1400px] mx-auto px-7 md:px-14 transition-[opacity,transform] duration-[800ms] ease-[ease] ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[24px]"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-12">
          <div>
            <p className="font-['Barlow'] font-300 text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-8">Disponible para proyectos</p>
            <h2
              className="font-['Barlow_Condensed'] font-900 uppercase leading-[0.86] tracking-[-0.02em] text-foreground text-[clamp(4rem,14vw,13rem)]"
            >
              Hagamos<br />algo<br />
              <em className="not-italic text-muted-foreground">grande.</em>
            </h2>
          </div>

          <div className="space-y-7 md:pb-4 max-w-xs">
            <p className="font-['Barlow'] font-300 text-[15px] leading-[1.9] text-muted-foreground">
              ¿Tienes una idea o un problema que resolver? Conversemos. Estoy disponible para proyectos de diseño UX/UI y desarrollo frontend, y me gusta meterme desde el primer boceto hasta el producto que la gente termina usando.
            </p>
            <a
              href="https://wa.me/56966640562"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 font-['Barlow'] font-600 text-[13px] uppercase tracking-[0.12em] border border-foreground bg-foreground text-background px-7 py-4 hover:bg-transparent hover:text-foreground transition-[background-color,color] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            >
              Escribime <ArrowUpRight size={14} className="transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="flex gap-6 pt-1">
              {[
                { label: "LinkedIn", href: "https://www.linkedin.com/in/patgsj/" },
                { label: "GitHub", href: "https://github.com/Patgsj" },
                { label: "Dribbble", href: "https://dribbble.com/PatGsj" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  className="font-['Barlow'] font-300 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const { ref, visible } = useInView(0.1);

  return (
    <footer
      ref={ref}
      className={`border-t border-border bg-foreground text-background transition-[opacity,transform] duration-[800ms] ease-[ease] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[24px]"
      }`}
    >
      {/* Big name */}
      <div className="max-w-[1400px] mx-auto px-7 md:px-14 py-10">
        <div
          className="font-['Barlow_Condensed'] font-900 uppercase leading-none tracking-[-0.02em] text-background select-none text-[clamp(3rem,10vw,9rem)]"
        >
          Patgsj<span className="text-background/40">.</span>
        </div>
      </div>

      {/* Navigation + contact */}
      <div className="border-t border-background/10 max-w-[1400px] mx-auto px-7 md:px-14 py-14 grid grid-cols-2 gap-10">
        <div>
          <p className="font-['Barlow'] font-300 text-[10px] uppercase tracking-[0.2em] text-background/50 mb-4">Navegación</p>
          <div className="flex flex-col items-start gap-2.5">
            {NAV_ITEMS.map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="font-['Barlow'] font-300 text-[13px] text-background/70 hover:text-background transition-colors duration-200"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-['Barlow'] font-300 text-[10px] uppercase tracking-[0.2em] text-background/50 mb-4">Contacto</p>
          <div className="flex flex-col items-start gap-2.5">
            {[
              { label: "WhatsApp", href: "https://wa.me/56966640562" },
              { label: "Email", href: "https://mail.google.com/mail/?view=cm&fs=1&to=patricio.gsj@gmail.com" },
              { label: "LinkedIn", href: "https://www.linkedin.com/in/patgsj/" },
              { label: "GitHub", href: "https://github.com/Patgsj" },
              { label: "Dribbble", href: "https://dribbble.com/PatGsj" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="font-['Barlow'] font-300 text-[13px] text-background/70 hover:text-background transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10 max-w-[1400px] mx-auto px-7 md:px-14 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="font-['Barlow'] font-300 text-[10px] uppercase tracking-[0.16em] text-background/50">
          © 2026 Patgsj.
        </p>
        <p className="font-['Barlow'] font-300 text-[10px] uppercase tracking-[0.16em] text-background/50">
          San Carlos, Ñuble, Chile
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-1 font-['Barlow'] font-300 text-[10px] uppercase tracking-[0.16em] text-background/50 hover:text-background transition-colors"
        >
          <ArrowUp size={12} /> Inicio
        </button>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] font-['Barlow'] font-600 text-[11px] uppercase tracking-[0.12em] bg-foreground text-background px-5 py-3"
        >
          Saltar al contenido
        </a>
        <Nav />
        <main id="main">
          <Hero />
          <Work />
          <Design />
          <About />
          <Experience />
          <CTA />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
