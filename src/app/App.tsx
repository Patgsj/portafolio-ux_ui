import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowUp, ArrowUpRight, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

// ─── Scroll utility ──────────────────────────────────────────────────────────
const scrollTo = (id: string, behavior: ScrollBehavior = "smooth") => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : behavior });
};

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
const NAV_ITEMS: [string, string][] = [["Proyectos", "work"], ["Diseño UI", "design"], ["Sobre mí", "about"], ["Experiencia", "experience"]];

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
          className="font-['Syne'] font-800 text-[22px] uppercase tracking-[-0.01em] text-foreground leading-none"
        >
          Patgsj<span className="text-muted-foreground">.</span>
        </button>

        <div className="hidden md:flex items-center gap-10">
          <nav className="flex items-center gap-10">
            {NAV_ITEMS.map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                aria-current={active === id ? "page" : undefined}
                className={`font-['Manrope'] font-400 text-[11px] tracking-[0.14em] uppercase hover:text-foreground transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground ${
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
            aria-current={active === "contact" ? "page" : undefined}
            className={`inline-flex items-center gap-2 font-['Manrope'] font-600 text-[11px] tracking-[0.12em] uppercase px-5 py-2.5 border border-foreground hover:opacity-80 transition-[background-color,color] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
              active === "contact" ? "bg-transparent text-foreground" : "bg-foreground text-background"
            }`}
          >
            Contáctame
          </button>
        </div>

        <button
          className="md:hidden font-['Manrope'] font-600 text-[11px] tracking-widest uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
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
                  aria-current={active === id ? "page" : undefined}
                  className={`flex items-center justify-end gap-3 font-['Syne'] font-800 text-4xl uppercase w-full text-right transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground ${
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
                aria-current={active === "contact" ? "page" : undefined}
                className={`inline-flex items-center gap-2 mt-4 font-['Manrope'] text-xs uppercase tracking-widest border border-foreground px-5 py-3 transition-[background-color,color] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                  active === "contact" ? "bg-transparent text-foreground" : "bg-foreground text-background"
                }`}
              >
                Contáctame
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
        <span className="font-['Manrope'] font-300 text-[11px] tracking-[0.16em] uppercase text-muted-foreground text-right">
          <span className="md:hidden">Disponibilidad — 2026</span>
          <span className="hidden md:inline">Disponible para oportunidades UX/UI</span>
        </span>
      </div>

      {/* Main headline */}
      <div className="relative z-10 flex-1 flex items-center">
        <div
          ref={ref}
          className="max-w-[1400px] mx-auto w-full px-7 md:px-14 py-16 md:py-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-12">
            {/* Big type */}
            <div>
              <h1
                className={`font-['Syne'] font-800 uppercase leading-[0.86] tracking-[-0.02em] text-foreground text-[clamp(4rem,15vw,12.5rem)] whitespace-nowrap transition-[opacity,transform] duration-[900ms] ease-[ease] ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[30px]"
                }`}
              >
                Patgsj<span className="text-muted-foreground">.</span>
                <span className="sr-only"> — Patricio Soto</span>
              </h1>
              <p
                className={`font-['Manrope'] font-500 text-[13px] md:text-base uppercase tracking-[0.2em] text-muted-foreground mt-3 md:mt-5 transition-[opacity,transform] duration-[900ms] delay-[120ms] motion-reduce:delay-0 ease-[ease] ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[30px]"
                }`}
              >
                Diseñador UX/UI con trayectoria en comunicación visual
              </p>
            </div>

            {/* Descriptor */}
            <div
              className={`space-y-7 md:pb-4 max-w-xs md:max-w-sm transition-[opacity,transform] duration-[900ms] delay-[220ms] motion-reduce:delay-0 ease-[ease] ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[30px]"
              }`}
            >
              <div className="space-y-4">
                <p className="font-['Manrope'] font-300 text-[15px] md:text-base leading-[1.75] text-muted-foreground">
                  Diseño interfaces digitales a partir de necesidades reales de negocio, organizándolas en flujos, jerarquías de información y prototipos claros.
                </p>
                <p className="font-['Manrope'] font-300 text-[15px] md:text-base leading-[1.75] text-muted-foreground">
                  Aporto más de diez años de experiencia en comunicación visual y, desde 2023, estoy desarrollando mi práctica profesional en UX/UI junto con estudios de Ingeniería en Informática.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <button
                  onClick={() => scrollTo("work")}
                  className="group inline-flex items-center gap-2 font-['Manrope'] font-500 text-[11px] uppercase tracking-[0.14em] text-foreground py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                >
                  <span className="w-14 h-[1px] bg-foreground inline-block origin-left scale-x-[0.571] group-hover:scale-x-100 transition-transform duration-300" />
                  Ver caso de estudio
                </button>
                <button
                  onClick={() => scrollTo("experience")}
                  className="font-['Manrope'] font-500 text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors duration-200 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                >
                  Conocer mi experiencia
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Work ─────────────────────────────────────────────────────────────────────
function PillarCell({ n, title, desc, why }: { n: string; title: string; desc: string; why?: string }) {
  return (
    <div className="border-t border-l border-border px-8 py-10 [&:nth-child(2n)]:border-r [&:nth-child(-n+2)]:md:border-t-0">
      <p className="font-['DM_Mono'] text-[10px] text-muted-foreground mb-5">{n}</p>
      <h4 className="font-['Syne'] font-700 text-2xl md:text-3xl uppercase tracking-tight text-foreground mb-3">{title}</h4>
      <p className="font-['Manrope'] font-300 text-[13px] leading-[1.7] text-muted-foreground">{desc}</p>
      {why && (
        <div className="mt-5 pt-5 border-t border-border">
          <p className="font-['Manrope'] font-500 text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5">Por qué</p>
          <p className="font-['Manrope'] font-300 text-[13px] leading-[1.7] text-foreground">{why}</p>
        </div>
      )}
    </div>
  );
}

const CASE_SHOTS = [
  {
    img: "/case-ferreteria/catalogo.webp",
    title: "Catálogo público",
    desc: "Vitrina de productos con búsqueda por nombre, código de barras o código corto, y carrito de compra — accesible sin login.",
  },
  {
    img: "/case-ferreteria/dashboard.webp",
    title: "Dashboard de negocio",
    desc: "Panel administrativo con ventas y utilidad del día, valor de inventario y alertas de stock bajo, pensado para que el dueño revise el estado del negocio de un vistazo.",
  },
  {
    img: "/case-ferreteria/pos.webp",
    title: "Registro de venta",
    desc: "Pantalla de venta pensada para velocidad de mesón: búsqueda de producto, cantidad y método de pago en una misma vista.",
  },
  {
    img: "/case-ferreteria/inventario.webp",
    title: "Gestión de inventario",
    desc: "Búsqueda de productos, edición en línea y control de stock por categoría. Las acciones de fila usan iconos circulares para una lectura más rápida de ver, editar y eliminar.",
  },
  {
    img: "/case-ferreteria/historial.webp",
    title: "Historial de ventas",
    desc: "Registro de ventas con búsqueda por folio y método de pago, pensado como apoyo para que el dueño lleve el control mensual del negocio.",
  },
  {
    img: "/case-ferreteria/login.webp",
    title: "Acceso restringido",
    desc: "El panel de administración queda detrás de un inicio de sesión; el catálogo permanece público y accesible sin cuenta.",
  },
  {
    img: "/case-ferreteria/catalogo-oscuro.webp",
    title: "Catálogo en modo oscuro",
    desc: "Versión en modo oscuro del catálogo, cuidando la misma jerarquía y contraste que la versión en modo claro.",
  },
  {
    img: "/case-ferreteria/dashboard-movil.webp",
    title: "Dashboard en móvil",
    desc: "El panel administrativo se reorganiza en una sola columna en pantallas angostas, manteniendo accesibles las métricas clave del día.",
  },
  {
    img: "/case-ferreteria/movil-menu.webp",
    title: "Menú móvil",
    desc: "En pantallas angostas la navegación se colapsa en un menú lateral con cambio de tema claro/oscuro y acceso al panel administrativo.",
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
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
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
                <div className="absolute inset-0 bg-foreground opacity-0 group-hover:opacity-90 group-focus-visible:opacity-90 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
                  <p className="font-['Syne'] font-700 text-4xl md:text-5xl uppercase tracking-tight text-background leading-none">{s.title}</p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        aria-label="Proyecto anterior"
        onClick={() => emblaApi?.scrollPrev()}
        className="hidden md:flex absolute left-[-56px] top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-foreground hover:opacity-60 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <ChevronLeft size={44} strokeWidth={1.5} />
      </button>
      <button
        aria-label="Proyecto siguiente"
        onClick={() => emblaApi?.scrollNext()}
        className="hidden md:flex absolute right-[-56px] top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-foreground hover:opacity-60 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
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
  const closeBtnRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    return () => { previouslyFocused?.focus(); };
  }, []);

  const shot = shots[index];

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={shot.title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <button
        ref={closeBtnRef}
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-6 right-6 md:top-10 md:right-10 w-11 h-11 flex items-center justify-center bg-background text-foreground hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
      >
        <X size={18} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNav(-1); }}
        aria-label="Proyecto anterior"
        className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-background text-foreground hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
      >
        <ArrowLeft size={18} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNav(1); }}
        aria-label="Proyecto siguiente"
        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-background text-foreground hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
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
            alt={shot.desc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="max-w-full h-auto object-contain bg-muted mx-auto block"
          />
        </AnimatePresence>
        <div className="mt-6 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="font-['DM_Mono'] text-[10px] text-background/50 mb-2">
              {String(index + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
            </p>
            <h4 className={`font-['Syne'] font-700 text-2xl uppercase tracking-tight text-background ${showDesc ? "mb-2" : ""}`}>{shot.title}</h4>
            {showDesc && (
              <p className="font-['Manrope'] font-300 text-sm leading-[1.7] text-background/70 max-w-xl">{shot.desc}</p>
            )}
          </div>
          {shot.href && (
            <a
              href={shot.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 font-['Manrope'] font-500 text-[11px] uppercase tracking-[0.12em] text-background/70 hover:text-background transition-colors shrink-0"
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

const USER_TASKS = [
  {
    title: "Personal de mesón",
    tasks: [
      "Buscar productos rápidamente.",
      "Consultar precio y disponibilidad.",
      "Añadir productos a una venta.",
      "Cerrar una operación sin pasos innecesarios.",
    ],
  },
  {
    title: "Administración",
    tasks: [
      "Crear y actualizar productos.",
      "Controlar stock.",
      "Revisar ventas y método de pago.",
      "Gestionar información operativa básica del negocio.",
    ],
  },
];

const PROBLEMS_DATA = [
  { n: "01", title: "Autoservicio sin fricción", desc: "En un tótem, una persona debe encontrar un producto y comprender su nombre, precio y disponibilidad sin ayuda ni navegación compleja." },
  { n: "02", title: "Búsqueda y atención rápida", desc: "La operación de mesón exige encontrar productos, confirmar disponibilidad y avanzar a la venta sin pasos innecesarios." },
  { n: "03", title: "Información centralizada", desc: "Catálogo, inventario y ventas deben mantenerse conectados para reducir errores y tareas duplicadas entre pantallas." },
];

const DESIGN_GOALS = [
  "Reducir pasos durante la atención de mesón.",
  "Facilitar la búsqueda y el reconocimiento de productos.",
  "Mantener acciones y estados visualmente consistentes.",
  "Dar visibilidad inmediata al stock.",
  "Evitar que funciones críticas dependan de navegación compleja.",
  "Diseñar componentes reutilizables para facilitar futuras iteraciones.",
  "Preparar una base responsive para el catálogo y el panel.",
  "Considerar accesibilidad desde la jerarquía, el contraste y la interacción.",
];

const FLOWS_DATA = [
  { title: "Flujo de venta", steps: ["Buscar producto", "Revisar precio y stock", "Añadir a la venta", "Confirmar operación"] },
  { title: "Flujo administrativo", steps: ["Iniciar sesión", "Gestionar productos", "Actualizar precio o stock", "Guardar cambios", "Verificar actualización"] },
];

const UX_DECISIONS = [
  {
    n: "01",
    title: "Reducir errores de selección táctil",
    desc: "El catálogo se usa principalmente desde un tótem, sin teclado ni mouse, así que diseñé tarjetas de producto grandes con buena separación entre ellas.",
    why: "La hipótesis es que esto reduce errores de selección y facilita el reconocimiento visual rápido del producto.",
  },
  {
    n: "02",
    title: "Acelerar la comparación entre productos",
    desc: "Abrir el detalle de cada producto agrega pasos innecesarios en un flujo de autoservicio, así que mostré nombre y precio directamente en la tarjeta.",
    why: "La hipótesis de diseño es que esto acelera la comparación sin obligar a entrar a cada ficha.",
  },
  {
    n: "03",
    title: "Priorizar la búsqueda sobre la navegación",
    desc: "Con muchos productos por categoría, obligar a navegar por menús agrega fricción, así que ubiqué el buscador como el elemento más visible de la pantalla.",
    why: "Busca reducir la dependencia de la navegación por categorías cuando la persona ya sabe qué busca.",
  },
  {
    n: "04",
    title: "Eliminar la ambigüedad sobre el siguiente paso",
    desc: "El flujo de autoservicio necesita una acción evidente para avanzar, así que definí un botón de \"agregar\" con alto contraste y tamaño táctil generoso en cada tarjeta.",
    why: "Busca reducir la duda sobre cómo continuar la compra en un contexto sin asistencia presencial.",
  },
  {
    n: "05",
    title: "Reducir la carga cognitiva entre catálogo y panel",
    desc: "Mezclar catálogo, inventario y ventas en una misma lógica visual puede saturar la interfaz, así que limité cada pantalla a una tarea principal con jerarquía clara entre título, precio y estado.",
    why: "Busca que tanto el catálogo público como el panel administrativo se lean sin esfuerzo adicional.",
  },
  {
    n: "06",
    title: "Facilitar cambios futuros sin rehacer pantallas",
    desc: "El catálogo y el panel de administración comparten patrones — tarjetas, botones, estados de stock — así que reutilicé los mismos componentes visuales en ambos.",
    why: "Se validará con la iteración con el cliente; la hipótesis es que reduce el costo de futuros cambios.",
  },
];

const ITERATION_STEPS = [
  "Revisión de requerimientos.",
  "Presentación de propuestas.",
  "Ajustes de flujo e interfaz.",
  "Implementación.",
  "Nueva revisión con el cliente.",
];

const ACCESSIBILITY_COMMITMENTS = [
  "Jerarquía de encabezados.",
  "Contraste suficiente entre texto y fondo.",
  "Tamaños legibles.",
  "Estados de foco visibles.",
  "Etiquetas claras.",
  "Áreas táctiles adecuadas para un tótem.",
  "Mensajes de error comprensibles.",
  "Navegación mediante teclado, cuando corresponde.",
  "No depender exclusivamente del color.",
];

const VALIDATION_TASKS = [
  "Buscar un producto específico en el catálogo.",
  "Revisar su disponibilidad.",
  "Agregarlo al carro.",
  "Completar una compra simulada.",
];

const VALIDATION_OBSERVATIONS = [
  "Éxito o fracaso de la tarea.",
  "Tiempo aproximado.",
  "Errores de navegación.",
  "Dudas o comentarios.",
  "Elementos que no fueron comprendidos.",
  "Pasos innecesarios.",
  "Problemas de legibilidad o interacción con el tótem.",
];

const NEXT_STEPS = [
  "Completar las pantallas pendientes en Figma.",
  "Consolidar componentes y estados.",
  "Realizar pruebas con usuarios.",
  "Documentar hallazgos.",
  "Iterar los flujos principales.",
  "Preparar especificaciones para desarrollo.",
  "Revisar accesibilidad y comportamiento responsive.",
];

function SectionKicker({ index, title }: { index?: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-border">
      {index && <span className="font-['DM_Mono'] text-[10px] text-muted-foreground">{index}</span>}
      <h3 className="font-['Syne'] font-800 text-xl md:text-2xl uppercase tracking-tight text-foreground">{title}</h3>
    </div>
  );
}

const PROJECT_PHASES = ["Problema", "Levantamiento", "Arquitectura de información", "Wireframes", "Diseño de interfaz", "Prototipo", "Iteración"];
const CURRENT_PHASE_INDEX = 6;

function PhaseStepper() {
  return (
    <div role="list" aria-label={`Fase actual del proyecto: ${PROJECT_PHASES[CURRENT_PHASE_INDEX]}`} className="flex items-center mb-12 overflow-x-auto">
      {PROJECT_PHASES.map((phase, i) => (
        <div key={phase} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2 shrink-0">
            <span aria-hidden className={`w-2 h-2 shrink-0 ${i <= CURRENT_PHASE_INDEX ? "bg-foreground" : "bg-border"}`} />
            <span
              aria-label={i === CURRENT_PHASE_INDEX ? `${phase} — fase actual` : undefined}
              className={`font-['Manrope'] font-500 text-[10px] uppercase tracking-[0.12em] whitespace-nowrap ${
                i === CURRENT_PHASE_INDEX ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {phase}
            </span>
          </div>
          {i < PROJECT_PHASES.length - 1 && <span aria-hidden className="flex-1 h-px bg-border mx-3 min-w-4" />}
        </div>
      ))}
    </div>
  );
}

const CASE_TABS = ["El negocio", "Usuarios y problema", "Decisiones de diseño", "Pantallas y accesibilidad", "Estado, validación e IA"];

function CaseTabs({ active, onChange }: { active: number; onChange: (i: number) => void }) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") onChange((active + 1) % CASE_TABS.length);
    if (e.key === "ArrowLeft") onChange((active - 1 + CASE_TABS.length) % CASE_TABS.length);
  };

  return (
    <div role="tablist" aria-label="Secciones del caso de estudio" onKeyDown={onKeyDown} className="flex flex-wrap gap-2 mb-12">
      {CASE_TABS.map((t, i) => (
        <button
          key={t}
          role="tab"
          id={`case-tab-${i}`}
          aria-selected={active === i}
          aria-controls={`case-panel-${i}`}
          tabIndex={active === i ? 0 : -1}
          onClick={() => onChange(i)}
          className={`font-['Manrope'] font-500 text-[11px] uppercase tracking-[0.12em] px-4 py-2.5 border transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
            active === i
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function TabPanel({ index, active, children }: { index: number; active: number; children: ReactNode }) {
  if (active !== index) return null;
  return (
    <div role="tabpanel" id={`case-panel-${index}`} aria-labelledby={`case-tab-${index}`} className="space-y-14">
      {children}
    </div>
  );
}

function InfoCell({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <div className="border-r border-b border-border px-8 py-10">
      <p className="font-['DM_Mono'] text-[10px] text-muted-foreground mb-5">{kicker}</p>
      <h4 className="font-['Syne'] font-700 text-2xl md:text-3xl uppercase tracking-tight text-foreground mb-3">{title}</h4>
      <div className="font-['Manrope'] font-300 text-[13px] leading-[1.7] text-muted-foreground">{children}</div>
    </div>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className="font-['Manrope'] font-300 text-[13px] text-muted-foreground border border-border px-3 py-2">
            {s}
          </span>
          {i < steps.length - 1 && <ArrowRight aria-hidden size={14} className="text-muted-foreground shrink-0" />}
        </li>
      ))}
    </ol>
  );
}

function Work() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);
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
        {/* Resumen del proyecto */}
        <div className="mb-10">
          <p className="font-['Manrope'] font-500 text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-4">
            Caso de estudio 01 — Proyecto real en desarrollo
          </p>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-8 md:gap-12">
            <h2 className="font-['Syne'] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-foreground text-[clamp(2.5rem,7vw,5.5rem)]">
              Catálogo y sistema de gestión para una ferretería
            </h2>
            <div className="max-w-xs md:max-w-sm md:pb-2">
              <p className="font-['Syne'] font-700 text-base uppercase tracking-tight text-muted-foreground mb-3">
                Ferretería CTM
              </p>
              <p className="font-['Manrope'] font-300 text-[14px] leading-[1.8] text-muted-foreground">
                Busca centralizar la consulta de productos y parte de la operación de un negocio que recién comienza: catálogo autoservicio pensado para un tótem, gestión de productos y stock, y apoyo al registro de ventas, ganancias y métodos de pago.
              </p>
            </div>
          </div>
        </div>

        {/* Demo en vivo — CTA destacada, primero para que se vea de inmediato */}
        <a
          href="https://ferreteria-ctm-demo.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 bg-foreground text-background px-7 py-6 md:px-10 md:py-7 hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <div className="flex items-center gap-4">
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
              <span className="absolute inset-0 bg-background animate-ping opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 bg-background" />
            </span>
            <div>
              <p className="font-['Manrope'] font-600 text-[10px] uppercase tracking-[0.16em] text-background/60 mb-1">
                Prototipo funcional
              </p>
              <p className="font-['Syne'] font-800 uppercase text-2xl md:text-3xl tracking-tight leading-none">
                Prueba el demo en vivo
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 font-['Manrope'] font-600 text-[12px] uppercase tracking-[0.14em] shrink-0 pl-[38px] md:pl-0">
            Ver demo
            <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </a>

        {/* Estado actual y limitaciones — siempre visible, no vive dentro de un tab */}
        <div className="mb-12 max-w-2xl bg-[#f9f9f7] border border-border px-6 py-6 md:px-8 md:py-7">
          <p className="font-['Manrope'] font-600 text-[11px] uppercase tracking-[0.16em] text-foreground mb-3">
            Estado actual y limitaciones
          </p>
          <p className="font-['Manrope'] font-300 text-[13px] leading-[1.8] text-muted-foreground">
            El proyecto continúa en desarrollo. Parte de las pantallas está documentada en Figma y también existe un prototipo funcional desplegado para facilitar la conversación con el cliente. Aún no se han realizado pruebas con usuarios finales, por lo que las decisiones actuales deben considerarse hipótesis de diseño pendientes de validación.
          </p>
        </div>

        <PhaseStepper />
        <CaseTabs active={activeTab} onChange={setActiveTab} />

        {/* Tab 0 — El negocio */}
        <TabPanel index={0} active={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border">
            <InfoCell kicker="Contexto" title="Un negocio que recién comienza">
              La ferretería está comenzando y actualmente depende principalmente de la atención directa en mesón. El proyecto busca complementar esa atención con un catálogo autoservicio para consultar productos, precios y disponibilidad sin depender siempre de una persona. Además, contempla herramientas iniciales para gestionar productos, controlar stock y apoyar el registro de ventas, ganancias y métodos de pago.
            </InfoCell>
            <InfoCell kicker="Alcance" title="Catálogo y gestión, no un sistema completo">
              El proyecto cubre catálogo público, panel de administración de productos e inventario, y una pantalla de registro de venta. No incluye facturación electrónica, funcionamiento sin conexión garantizado ni gestión de múltiples sucursales.
            </InfoCell>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border">
            <div className="border-r border-b border-border px-8 py-10">
              <p className="font-['DM_Mono'] text-[10px] text-muted-foreground mb-5">Rol</p>
              <h4 className="font-['Syne'] font-700 text-2xl md:text-3xl uppercase tracking-tight text-foreground mb-3">Diseño UX/UI</h4>
              <p className="font-['Manrope'] font-300 text-[13px] leading-[1.7] text-muted-foreground mb-4">
                Mi responsabilidad fue conversar directamente con el dueño para comprender la operación, ordenar los requerimientos, definir flujos iniciales, diseñar la jerarquía de información y construir las interfaces del catálogo y del sistema de gestión.
              </p>
              <ul className="space-y-2 mb-4">
                {[
                  "Levantamiento de necesidades con el cliente.",
                  "Organización de requerimientos.",
                  "Flujos de usuario iniciales.",
                  "Arquitectura de información.",
                  "Wireframes e interfaz visual.",
                  "Componentes reutilizables.",
                  "Prototipo funcional para revisar decisiones con el cliente.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 font-['Manrope'] font-300 text-[13px] leading-[1.6] text-muted-foreground">
                    <span aria-hidden className="w-1 h-1 mt-2 bg-foreground/50 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <span className="inline-block font-['Manrope'] font-500 text-[10px] uppercase tracking-[0.14em] border border-border px-3 py-1.5 text-muted-foreground">Proyecto independiente</span>
            </div>
            <InfoCell kicker="Cómo trabajamos" title="Conversación con el cliente, no investigación con usuarios">
              Las conversaciones con el dueño permitieron levantar requerimientos, ordenar prioridades y revisar decisiones de diseño. Esta instancia no reemplaza la validación con usuarios finales.
            </InfoCell>
          </div>
        </TabPanel>

        {/* Tab 1 — Usuarios y problema */}
        <TabPanel index={1} active={activeTab}>
          <div>
            <SectionKicker title="Usuarios y tareas principales" />
            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border">
              {USER_TASKS.map((u) => (
                <div key={u.title} className="border-r border-b border-border px-8 py-10">
                  <h4 className="font-['Syne'] font-700 text-xl uppercase tracking-tight text-foreground mb-4">{u.title}</h4>
                  <ul className="space-y-2.5">
                    {u.tasks.map((t) => (
                      <li key={t} className="flex items-start gap-3 font-['Manrope'] font-300 text-[13px] leading-[1.6] text-muted-foreground">
                        <span aria-hidden className="w-1 h-1 mt-2 bg-foreground/50 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionKicker title="Problemas que el proyecto debía resolver" />
            <div className="grid grid-cols-1 md:grid-cols-2 border-r border-b border-border">
              {PROBLEMS_DATA.map((p) => (
                <PillarCell key={p.n} {...p} />
              ))}
            </div>
          </div>

          <div className="max-w-2xl border-l-2 border-foreground pl-6">
            <p className="font-['Manrope'] font-300 text-[15px] md:text-base leading-[1.8] text-foreground italic">
              “El catálogo debía permitir que una persona encontrara productos y comprendiera rápidamente su nombre, precio y disponibilidad, evitando una navegación compleja en un contexto de autoservicio.”
            </p>
          </div>

          <div>
            <SectionKicker title="Objetivos de diseño" />
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
              {DESIGN_GOALS.map((g) => (
                <li key={g} className="flex items-start gap-3 font-['Manrope'] font-300 text-[14px] leading-[1.6] text-muted-foreground">
                  <span aria-hidden className="w-1.5 h-1.5 mt-1.5 bg-foreground shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </TabPanel>

        {/* Tab 2 — Decisiones de diseño */}
        <TabPanel index={2} active={activeTab}>
          <div>
            <SectionKicker title="Flujos principales" />
            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border">
              {FLOWS_DATA.map((f, i) => (
                <div
                  key={f.title}
                  className={`border-r border-b border-border px-8 py-10 ${i === FLOWS_DATA.length - 1 ? "md:col-span-2" : ""}`}
                >
                  <p className="font-['Manrope'] font-500 text-[11px] uppercase tracking-[0.14em] text-foreground mb-4">{f.title}</p>
                  <StepList steps={f.steps} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border">
            <InfoCell kicker="Wireframes y prototipado" title="De la estructura a la interfaz">
              <p className="mb-4">
                Las primeras decisiones se concentraron en organizar las tareas críticas de catálogo, inventario y venta. El proyecto ha evolucionado mediante conversaciones periódicas con el cliente, ajustando jerarquías, acciones y estados de acuerdo con las necesidades reales de operación.
              </p>
              <p className="text-[11px] uppercase tracking-[0.12em] border border-dashed border-border px-4 py-3">
                Espacio reservado para incorporar capturas de iteraciones anteriores.
              </p>
            </InfoCell>
            <InfoCell kicker="Conversación con el cliente" title="Cómo se ajustaron las decisiones">
              <p className="mb-5">
                El proyecto avanzó mediante conversaciones periódicas con el dueño del negocio. Estas conversaciones permitieron ajustar flujos, prioridades, terminología y comportamiento de las pantallas según la operación real de la ferretería.
              </p>
              <StepList steps={ITERATION_STEPS} />
            </InfoCell>
          </div>

          <div>
            <SectionKicker title="Decisiones de diseño" />
            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border">
              {UX_DECISIONS.map((d) => (
                <PillarCell key={d.n} {...d} />
              ))}
            </div>
          </div>
        </TabPanel>

        {/* Tab 3 — Pantallas y accesibilidad */}
        <TabPanel index={3} active={activeTab}>
          <div>
            <SectionKicker title="Pantallas" />
            <p className="font-['Manrope'] font-300 text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-4">
              Capturas reales — haz clic para ampliar
            </p>
            <CaseCarousel onSelect={setLightboxIndex} />
            {lightboxIndex !== null && (
              <Lightbox shots={CASE_SHOTS} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNav={navLightbox} />
            )}
          </div>

          <div>
            <SectionKicker title="Consideraciones de accesibilidad" />
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 mb-6">
              {ACCESSIBILITY_COMMITMENTS.map((a) => (
                <li key={a} className="flex items-start gap-3 font-['Manrope'] font-300 text-[14px] leading-[1.6] text-muted-foreground">
                  <span aria-hidden className="w-1.5 h-1.5 mt-1.5 bg-foreground shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
            <p className="font-['Manrope'] font-300 text-[13px] leading-[1.7] text-muted-foreground max-w-xl border-t border-border pt-5">
              Estas consideraciones forman parte del diseño actual, pero todavía deben verificarse mediante una revisión de accesibilidad y pruebas de uso.
            </p>
          </div>
        </TabPanel>

        {/* Tab 4 — Estado, validación e IA */}
        <TabPanel index={4} active={activeTab}>
          <div>
            <SectionKicker title="Cómo validaría la solución" />
            <p className="font-['Manrope'] font-300 text-[15px] leading-[1.8] text-muted-foreground max-w-xl mb-6">
              La siguiente etapa consiste en realizar pruebas moderadas con entre tres y cinco personas cercanas al público objetivo. Las tareas principales serían buscar un producto específico, revisar su disponibilidad, agregarlo al carro y completar una compra simulada.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="font-['Manrope'] font-500 text-[11px] uppercase tracking-[0.14em] text-foreground mb-4">Tareas de la prueba</p>
                <StepList steps={VALIDATION_TASKS} />
              </div>
              <div>
                <p className="font-['Manrope'] font-500 text-[11px] uppercase tracking-[0.14em] text-foreground mb-4">Qué registraría</p>
                <ul className="space-y-2">
                  {VALIDATION_OBSERVATIONS.map((o) => (
                    <li key={o} className="flex items-start gap-2.5 font-['Manrope'] font-300 text-[13px] leading-[1.6] text-muted-foreground">
                      <span aria-hidden className="w-1 h-1 mt-2 bg-foreground/50 shrink-0" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <SectionKicker title="Uso de inteligencia artificial" />
            <div className="space-y-4 max-w-xl">
              <p className="font-['Manrope'] font-300 text-[15px] leading-[1.8] text-muted-foreground">
                Utilizo herramientas de desarrollo asistido por inteligencia artificial para acelerar la construcción de demostraciones funcionales. Los requerimientos, los flujos, la jerarquía de información y las decisiones de interfaz permanecen bajo mi responsabilidad.
              </p>
              <p className="font-['Manrope'] font-300 text-[15px] leading-[1.8] text-muted-foreground">
                La implementación definitiva puede requerir la participación de un ingeniero o equipo de desarrollo.
              </p>
            </div>
          </div>

          <div>
            <SectionKicker title="Próximos pasos" />
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
              {NEXT_STEPS.map((s) => (
                <li key={s} className="flex items-start gap-3 font-['Manrope'] font-300 text-[14px] leading-[1.6] text-muted-foreground">
                  <span aria-hidden className="w-1.5 h-1.5 mt-1.5 bg-foreground shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </TabPanel>

        {/* Cierre — estado del proyecto como información, no como métricas */}
        <div className="mt-16 bg-foreground text-background px-8 py-10 md:px-10 md:py-12">
          <p className="font-['Manrope'] font-300 text-[11px] uppercase tracking-[0.18em] text-background/50 mb-6">Estado del proyecto</p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 max-w-2xl">
            {[
              { k: "Documentación en Figma", v: "Parcial" },
              { k: "Prototipo funcional", v: "Disponible" },
              { k: "Pruebas con usuarios", v: "Pendientes" },
              { k: "Etapa actual", v: "Revisión e iteración con el cliente" },
            ].map(({ k, v }) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-background/10 pb-3">
                <dt className="font-['Manrope'] font-300 text-[13px] text-background/60">{k}</dt>
                <dd className="font-['Manrope'] font-500 text-[13px] text-background text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

// ─── Design ───────────────────────────────────────────────────────────────────
// Ordenados con los destacados primero: dashboards, analítica, transaccional,
// ubicación, reservas, onboarding y mensajería al frente; el resto queda
// disponible detrás de "Ver más ejercicios".
const DRIBBBLE_SHOTS: LightboxShot[] = [
  {
    img: "https://cdn.dribbble.com/userupload/13093471/file/original-95ddb6674818e7f0f3b2be3fb28849ab.jpg",
    title: "Daily UI 021 — Home Monitoring",
    desc: "Dashboard de monitoreo para smart home, con control circular de temperatura y accesos rápidos por habitación.",
    href: "https://dribbble.com/shots/23656753-Daily-UI-021-Home-Monitoring-Dashboard",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12686920/file/original-deaa0fbe6bdb6dd69529e465719dc647.jpg",
    title: "Daily UI 018 — Analytics Chart",
    desc: "Panel de analítica con gráficos de barra y de tendencia, priorizando la lectura rápida de métricas clave.",
    href: "https://dribbble.com/shots/23516410-Daily-UI-018-Analytics-Chart",
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
    img: "https://cdn.dribbble.com/userupload/12246714/file/original-6b94e09236ef6e5dd62f0b7e04d40d9f.jpg",
    title: "Daily UI 017 — Purchase Receipt",
    desc: "Boleta de compra digital con desglose de ítems, totales y confirmación de pago.",
    href: "https://dribbble.com/shots/23360851-Reto-UI-de-100-di-as-DailyUI-017-PURCHASE-RECEIPT",
  },
  {
    img: "https://cdn.dribbble.com/userupload/11944881/file/original-987d7527000349a7dd6558030e55d755.jpg",
    title: "Daily UI 012 — E-commerce Shop",
    desc: "Catálogo de tienda online con grilla de productos y filtros.",
    href: "https://dribbble.com/shots/23252077-Reto-UI-de-100-d-as-DailyUI-012-E-commerce-Shop",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12883246/file/original-a44c2142aaa5511f2d33729e775f678a.jpg",
    title: "Daily UI 020 — Location Tracker",
    desc: "Interfaz de rastreo de ubicación en tiempo real sobre un mapa, con tarjeta de estado flotante.",
    href: "https://dribbble.com/shots/23584148-DailyUI-020-Location-Tracker",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12948966/file/original-16a3f6838fd5382721e55729f9c9ea59.jpg",
    title: "App Ticket Cine",
    desc: "App de compra de entradas de cine, con selección de asientos, horarios y confirmación de reserva.",
    href: "https://dribbble.com/shots/23607309-App-Ticket-Cine",
  },
  {
    img: "https://cdn.dribbble.com/userupload/13902756/file/original-a58b51d3e797d69ac72f43f68b99e10e.png",
    title: "Daily UI 023 — Onboarding",
    desc: "Flujo de onboarding para una app de fitness: carrusel de tarjetas con imagen a página completa y CTA claro en cada paso.",
    href: "https://dribbble.com/shots/23938922-Daily-UI-023-Onboarding",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12027216/file/original-269490e535af57b8a04a787073acd148.jpg",
    title: "Daily UI 013 — Direct Message",
    desc: "Bandeja de mensajería directa con lista de conversaciones y vista de chat activo.",
    href: "https://dribbble.com/shots/23282244-Reto-UI-de-100-d-as-DailyUI-013-Direct-Message",
  },
  {
    img: "https://cdn.dribbble.com/userupload/13186247/file/original-8fbe1eccf4ef8102bc5799bf6b892350.jpg",
    title: "Daily UI 022 — Search",
    desc: "Pantalla de búsqueda con foco en el estado del input y sugerencias contextuales sobre un fondo ilustrado.",
    href: "https://dribbble.com/shots/23688627--DailyUI-022-Search",
  },
  {
    img: "https://cdn.dribbble.com/userupload/12859002/file/original-e759d7b10e19c78b41ab3c984c7b496e.jpg",
    title: "Daily UI 019 — Leaderboard",
    desc: "Tabla de posiciones gamificada, con ranking, avatares y puntaje destacado para el primer lugar.",
    href: "https://dribbble.com/shots/23575917-Daily-UI-019-LEADERBOARD",
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
    img: "https://cdn.dribbble.com/userupload/11429428/file/original-6c2efb888e82276173d0e1a40a4ee414.jpg",
    title: "Daily UI 001 — Sign Up",
    desc: "Modal de registro de usuario, primer ejercicio del reto de 100 días de UI.",
    href: "https://dribbble.com/shots/23064380-My-sign-up-modal-example-for-Daily-UI-001uichallenge-dailyui",
  },
];

const FEATURED_SHOTS_COUNT = 6;

function Design() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const navLightbox = useCallback((dir: 1 | -1) => {
    setLightboxIndex((cur) => (cur === null ? cur : (cur + dir + DRIBBBLE_SHOTS.length) % DRIBBBLE_SHOTS.length));
  }, []);
  const { ref, visible } = useInView(0.1);
  const visibleShots = expanded ? DRIBBBLE_SHOTS : DRIBBBLE_SHOTS.slice(0, FEATURED_SHOTS_COUNT);

  return (
    <section id="design" className="border-t border-border py-20 md:py-32">
      <div
        ref={ref}
        className={`max-w-[1400px] mx-auto px-7 md:px-14 transition-[opacity,transform] duration-[800ms] ease-[ease] ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[24px]"
        }`}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between mb-8">
          <div>
            <h2 className="font-['Syne'] font-800 uppercase leading-[0.88] tracking-[-0.02em] text-foreground text-[clamp(3rem,9vw,7rem)]">
              Diseño UI
            </h2>
            <p className="font-['Manrope'] font-300 text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
              <span className="font-['DM_Mono'] normal-case tracking-normal text-muted-foreground/60 mr-2">02</span>
              Exploraciones visuales
            </p>
          </div>
          <a
            href="https://dribbble.com/PatGsj"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-['Manrope'] font-300 text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Perfil en Dribbble <ArrowUpRight size={13} />
          </a>
        </div>

        <p className="font-['Manrope'] font-300 text-[15px] leading-[1.8] text-muted-foreground max-w-xl mb-2">
          Ejercicios visuales desarrollados para practicar composición, jerarquía, componentes y patrones de interacción. Haz clic en cualquiera para verla más grande.
        </p>
        <p className="font-['Manrope'] font-300 text-[13px] leading-[1.7] text-muted-foreground/80 max-w-xl mb-10">
          No corresponden a productos validados ni a proyectos implementados para clientes.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {visibleShots.map((s, i) => (
            <motion.button
              key={s.img}
              onClick={() => setLightboxIndex(i)}
              initial={i >= FEATURED_SHOTS_COUNT ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(Math.max(i - FEATURED_SHOTS_COUNT, 0) * 0.05, 0.4), ease: [0.25, 0.1, 0.25, 1] }}
              className={`group relative overflow-hidden bg-muted border border-border cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"
              }`}
            >
              <img
                src={s.img}
                alt={s.title}
                loading="lazy"
                decoding="async"
                width={600}
                height={600}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-foreground opacity-0 group-hover:opacity-90 group-focus-visible:opacity-90 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center px-4 text-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
                <p className={`font-['Syne'] font-700 uppercase tracking-tight text-background leading-none ${
                  i === 0 ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"
                }`}>{s.title}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {!expanded && DRIBBBLE_SHOTS.length > FEATURED_SHOTS_COUNT && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setExpanded(true)}
              className="group inline-flex items-center gap-2 font-['Manrope'] font-500 text-[11px] uppercase tracking-[0.14em] text-foreground py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              <span className="w-14 h-[1px] bg-foreground inline-block origin-left scale-x-[0.571] group-hover:scale-x-100 transition-transform duration-300" />
              Ver más ejercicios
            </button>
          </div>
        )}

        {lightboxIndex !== null && (
          <Lightbox shots={visibleShots} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNav={navLightbox} showDesc={false} />
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
  { cat: "Uso habitual", items: ["Figma", "Auto Layout", "Componentes y variantes", "Prototipos interactivos", "Wireframes", "Illustrator", "Photoshop", "HTML y CSS"] },
  { cat: "Conocimientos aplicados o en desarrollo", items: ["JavaScript", "Tailwind CSS", "React", "TypeScript", "Python", "Supabase", "PostgreSQL"] },
  { cat: "UX/UI y producto", items: ["Flujos de usuario", "Arquitectura de información", "Diseño responsive", "Fundamentos de sistemas de diseño", "Componentes reutilizables", "Handoff a desarrollo", "Principios de usabilidad", "Fundamentos de accesibilidad"] },
  { cat: "Comunicación visual", items: ["Branding", "Diseño editorial", "Comunicación gráfica", "Producción audiovisual"] },
  { cat: "IA y productividad", items: ["Desarrollo asistido por IA", "Automatización de tareas", "Documentación y exploración técnica"] },
];

function About() {
  const { ref, visible } = useInView(0.1);
  const { ref: formacionRef, visible: formacionVisible } = useInView(0.1);

  return (
    <section id="about" className="border-t border-border py-20 md:py-32">
      <div className="max-w-[1400px] mx-auto px-7 md:px-14">
        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-16 md:gap-24 items-center transition-[opacity,transform] duration-[800ms] ease-[ease] ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[24px]"
          }`}
        >
          {/* Left */}
          <div className="relative">
            <span aria-hidden className="absolute -top-2.5 -left-2.5 w-5 h-5 border-t border-l border-foreground/40" />
            <span aria-hidden className="absolute -top-2.5 -right-2.5 w-5 h-5 border-t border-r border-foreground/40" />
            <span aria-hidden className="absolute -bottom-2.5 -left-2.5 w-5 h-5 border-b border-l border-foreground/40" />
            <span aria-hidden className="absolute -bottom-2.5 -right-2.5 w-5 h-5 border-b border-r border-foreground/40" />
            <img
              src="/yo.webp"
              alt="Patricio Soto (Patgsj), diseñador UX/UI — retrato"
              loading="lazy"
              decoding="async"
              className="w-full object-cover aspect-[5/6] object-top"
            />
            {/* floating label */}
            <div className="absolute bottom-6 left-6 bg-background px-4 py-3">
              <p className="font-['Syne'] font-700 text-base uppercase tracking-tight text-foreground">Patgsj<span className="text-muted-foreground">.</span></p>
              <p className="font-['Manrope'] font-300 text-[10px] uppercase tracking-widest text-muted-foreground">San Carlos, Ñuble</p>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="font-['Manrope'] font-300 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className="font-['DM_Mono'] normal-case tracking-normal text-muted-foreground/60 mr-2">03</span>
                Sobre mí
              </p>
              <h2
                className="font-['Syne'] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-foreground text-[clamp(3rem,7vw,5.75rem)]"
              >
                Diseño de interfaces<br />
                orientado a producto<span className="text-muted-foreground">.</span>
              </h2>
              <p className="font-['Syne'] font-700 text-lg uppercase tracking-tight text-muted-foreground">Patricio Gustavo Soto Jofré</p>
            </div>

            <div className="space-y-5 max-w-md">
              <p className="font-['Manrope'] font-300 text-[15px] leading-[1.9] text-foreground">
                Soy diseñador gráfico con más de diez años de experiencia en comunicación visual y desde 2023 estoy orientando mi carrera profesional hacia UX/UI.
              </p>
              <p className="font-['Manrope'] font-300 text-[15px] leading-[1.9] text-muted-foreground">
                Mi fortaleza está en organizar información, construir jerarquías visuales y traducir necesidades de negocio en flujos, interfaces y prototipos. Actualmente complemento mi experiencia con formación en diseño de productos digitales y estudios de Ingeniería en Informática, mientras profundizo en validación con usuarios, accesibilidad y sistemas de diseño.
              </p>
            </div>

            <div>
              <p className="font-['Manrope'] font-300 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Mi aporte a un equipo de producto
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 max-w-md">
                {[
                  "Criterio visual y atención al detalle.",
                  "Diseño de interfaces y prototipos.",
                  "Fundamentos de sistemas de diseño.",
                  "Construcción de componentes reutilizables.",
                  "Comunicación con perfiles técnicos.",
                  "Organización de requerimientos y flujos.",
                  "Preparación de entregables para handoff.",
                  "Aprendizaje continuo y adaptación.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 font-['Manrope'] font-300 text-[13px] leading-[1.6] text-muted-foreground">
                    <span aria-hidden className="w-1 h-1 mt-2 bg-foreground/50 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {["Figma", "Prototipado", "Arquitectura de información", "Fundamentos de sistemas de diseño", "Comunicación visual"].map((t) => (
                <span
                  key={t}
                  className="font-['Manrope'] font-300 text-[10px] uppercase tracking-[0.14em] border border-border px-3 py-2 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-200"
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
          <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between mb-12">
            <h3 className="font-['Syne'] font-800 uppercase leading-none tracking-[-0.02em] text-foreground text-[clamp(2.75rem,6.5vw,5.5rem)]">
              Formación
            </h3>
            <p className="font-['Manrope'] font-300 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Certificaciones y herramientas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-16 md:gap-20">
            {/* Certifications */}
            <div>
              <p className="font-['Manrope'] font-300 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6 pb-4 border-b border-border">
                Certificaciones y estudios
              </p>
              <div className="divide-y divide-border">
                {CERTIFICATIONS_DATA.map((c) => (
                  <div key={c.title} className="py-4 flex items-baseline justify-between gap-4">
                    <div>
                      <p className="font-['Syne'] font-700 text-base uppercase tracking-tight text-foreground leading-snug">{c.title}</p>
                      <p className="font-['Manrope'] font-300 text-[12px] text-muted-foreground mt-0.5">{c.org}</p>
                    </div>
                    <span className="font-['DM_Mono'] text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{c.period}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div>
              <p className="font-['Manrope'] font-300 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6 pb-4 border-b border-border">
                Herramientas
              </p>
              <div className="space-y-8">
                {TOOLS_DATA.map(({ cat, items }) => (
                  <div key={cat}>
                    <p className="font-['Manrope'] font-300 text-[10px] uppercase tracking-widest text-muted-foreground mb-3">{cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((t) => (
                        <span
                          key={t}
                          className="font-['Manrope'] font-300 text-[10px] uppercase tracking-[0.1em] border border-border px-3 py-2 text-muted-foreground"
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
  { n: "01", role: "Diseñador UX/UI independiente", company: "Proyecto con cliente y exploraciones propias", period: "2024 — Presente", type: "Independiente", desc: "Participación en un proyecto con cliente y en exploraciones propias, realizando levantamiento de necesidades, definición de flujos, diseño de interfaces, prototipado y construcción de demostraciones funcionales." },
  { n: "02", role: "Diseñador Gráfico y Comunicador Visual", company: "Branding y comunicación visual", period: "Trayectoria profesional", type: "Freelance", desc: "Más de diez años trabajando con jerarquía visual, tipografía, composición y consistencia de marca en distintos contextos. Esta trayectoria constituye la base visual que actualmente aplico al diseño de interfaces." },
  { n: "03", role: "Comunicación visual para seguridad industrial", company: "Teck Quebrada Blanca", period: "Colaboración puntual", type: "Habilidad transferible", desc: "Trabajé con profesionales de seguridad para transformar información técnica sobre incidentes y prevención en piezas visuales claras, alineadas con lineamientos corporativos. Por confidencialidad no puedo publicar esas piezas; la experiencia fortaleció mi capacidad para comprender información compleja, colaborar con especialistas y comunicarla de forma visual y precisa." },
  { n: "04", role: "Técnico Topógrafo", company: "Medición y datos territoriales", period: "2015 — 2017", type: "Complementario", desc: "Experiencia en medición, representación de información territorial y trabajo con datos de precisión, fortaleciendo una metodología rigurosa y atención al detalle." },
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
            className="font-['Syne'] font-800 uppercase leading-none tracking-[-0.01em] text-background text-[clamp(3rem,8vw,7rem)]"
          >
            Experiencia
          </h2>
          <span className="font-['Manrope'] font-300 text-[11px] uppercase tracking-[0.16em] text-background/50">
            <span className="font-['DM_Mono'] normal-case tracking-normal text-background/40 mr-2">04</span>
            Enfoque UX/UI desde 2023
          </span>
        </div>

        {/* Entries */}
        <div className="space-y-0 divide-y divide-background/10">
          {EXP_DATA.map(({ n, role, company, period, type, desc }, i) => (
            <div
              key={n}
              className={`grid grid-cols-1 md:grid-cols-[60px_1fr_1fr_180px] gap-4 group hover:translate-x-2 transition-transform duration-300 ${
                i === 0 ? "py-14" : "py-10"
              }`}
            >
              <span className="font-['DM_Mono'] text-[10px] text-background/50 pt-1">{n}</span>
              <div>
                <h3
                  className={`font-['Syne'] font-700 uppercase tracking-tight text-background leading-tight ${
                    i === 0 ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"
                  }`}
                >
                  {role}
                </h3>
                <p className="font-['Manrope'] font-300 text-[13px] text-background/50 mt-1">{company}</p>
              </div>
              <p className="font-['Manrope'] font-300 text-[13px] leading-[1.9] text-background/55 max-w-sm">{desc}</p>
              <div className="flex md:flex-col md:items-end gap-3 md:gap-2">
                <span className="font-['DM_Mono'] text-[10px] text-background/50 tracking-wide">{period}</span>
                <span
                  className={`font-['DM_Mono'] text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 ${
                    i === 0 ? "bg-background text-foreground" : "border border-background/30 text-background/50"
                  }`}
                >
                  {type}
                </span>
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
            <p className="font-['Manrope'] font-300 text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-8">
              <span className="font-['DM_Mono'] normal-case tracking-normal text-muted-foreground/60 mr-2">05</span>
              Disponible para oportunidades UX/UI
            </p>
            <h2
              className="font-['Syne'] font-800 uppercase leading-[0.94] tracking-[-0.01em] text-foreground text-[clamp(1.9rem,8vw,7.5rem)] max-w-3xl"
            >
              Conversemos<br />sobre cómo puedo<br />
              <em className="not-italic text-muted-foreground">aportar a tu equipo.</em>
            </h2>
          </div>

          <div className="space-y-7 md:pb-4 max-w-xs">
            <p className="font-['Manrope'] font-300 text-[15px] leading-[1.9] text-muted-foreground">
              Busco integrarme a un equipo de producto donde pueda aportar mi experiencia visual, mi capacidad para organizar información y mi formación en UX/UI, mientras continúo creciendo en validación, accesibilidad y sistemas de diseño.
            </p>
            <a
              href="https://wa.me/56966640562"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 font-['Manrope'] font-600 text-[13px] uppercase tracking-[0.12em] border border-foreground bg-foreground text-background px-7 py-4 hover:bg-transparent hover:text-foreground transition-[background-color,color] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              Contactarme <ArrowUpRight size={14} className="transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="flex gap-6 pt-1">
              {[
                { label: "Ver LinkedIn", href: "https://www.linkedin.com/in/patgsj/" },
                { label: "GitHub", href: "https://github.com/Patgsj" },
                { label: "Dribbble", href: "https://dribbble.com/PatGsj" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  className="font-['Manrope'] font-300 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
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
          className="font-['Syne'] font-800 uppercase leading-none tracking-[-0.02em] text-background select-none text-[clamp(2.5rem,7vw,6.5rem)]"
        >
          Patgsj<span className="text-background/40">.</span>
        </div>
      </div>

      {/* Navigation + contact */}
      <div className="border-t border-background/10 max-w-[1400px] mx-auto px-7 md:px-14 py-14 grid grid-cols-2 gap-10">
        <div>
          <p className="font-['Manrope'] font-300 text-[10px] uppercase tracking-[0.2em] text-background/50 mb-4">Navegación</p>
          <div className="flex flex-col items-start gap-2.5">
            {NAV_ITEMS.map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="font-['Manrope'] font-300 text-[13px] text-background/70 hover:text-background transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-['Manrope'] font-300 text-[10px] uppercase tracking-[0.2em] text-background/50 mb-4">Contacto</p>
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
                className="font-['Manrope'] font-300 text-[13px] text-background/70 hover:text-background transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10 max-w-[1400px] mx-auto px-7 md:px-14 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="font-['Manrope'] font-300 text-[10px] uppercase tracking-[0.16em] text-background/50">
          © 2026 Patricio Soto. Diseño y desarrollo propio.
        </p>
        <p className="font-['Manrope'] font-300 text-[10px] uppercase tracking-[0.16em] text-background/50">
          San Carlos, Ñuble, Chile
        </p>
        <button
          onClick={() => scrollTo("hero")}
          className="inline-flex items-center gap-1 font-['Manrope'] font-300 text-[10px] uppercase tracking-[0.16em] text-background/50 hover:text-background transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
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
        <div aria-hidden className="grain-overlay" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] font-['Manrope'] font-600 text-[11px] uppercase tracking-[0.12em] bg-foreground text-background px-5 py-3"
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
