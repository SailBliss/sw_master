import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { profilesService } from '@src/features/profiles/services/profiles.service'
import PreviewCard from '@/components/directorio/PreviewCard'

export const metadata: Metadata = {
  title: 'SW Mujeres — Directorio de emprendedoras',
  description:
    'Descubre productos y servicios de emprendedoras verificadas de la comunidad SW Mujeres. Más de 13.500 mujeres en Medellín y Colombia.',
  openGraph: {
    title: 'SW Mujeres — Directorio de emprendedoras',
    description:
      'Descubre productos y servicios de emprendedoras verificadas de la comunidad SW Mujeres.',
    url: '/',
  },
}

/* ── Site header (shared) ───────────────────────────────────────── */
function SiteHeader({ dark = false }: { dark?: boolean }) {
  const fg = dark ? 'var(--fg-on-dark)' : 'var(--fg)'
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 64px', color: fg,
      borderBottom: dark ? '1px solid rgba(247,239,233,0.08)' : '1px solid var(--sw-line)',
    }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', color: 'inherit' }}>
        <Image
          src="/logo-sw-4.svg"
          width={120} height={120} alt="SW Mujeres"
          style={{ filter: dark ? 'brightness(0) invert(1)' : 'none' }}
        />
      </Link>
      <nav style={{ display: 'flex', gap: 36 }}>
        {[
          { href: '/directorio', label: 'Directorio' },
          { href: '/inscripcion', label: 'Inscríbete' },
        ].map((n) => (
          <Link key={n.href} href={n.href} style={{
            fontSize: 12, fontWeight: 500, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'inherit', opacity: 0.85,
          }}>{n.label}</Link>
        ))}
      </nav>
    </header>
  )
}

/* ── Site footer (shared) ───────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer style={{ background: 'var(--bg-dark)', color: 'var(--fg-on-dark)', padding: '56px 64px 36px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 48 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <Image src="/logo-symbol-circle-dark.svg" width={40} height={40} alt="SW" style={{ filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.22em' }}>MUJERES</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--fg-on-dark-2)', maxWidth: 360, margin: 0 }}>
            Directorio de negocios liderados por mujeres en Medellín. Confianza verificada, sin intermediarios.
          </p>
          <div style={{ marginTop: 22, fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', color: 'var(--accent-soft)' }}>
            CONECTA · IMPULSA · VISIBILIZA
          </div>
        </div>
        {[
          { t: 'Directorio', l: ['Belleza', 'Moda', 'Bienestar', 'Hogar', 'Comida'] },
          { t: 'Comunidad', l: ['Quiénes somos', 'Inscríbete', 'Verificación', 'Recursos'] },
          { t: 'Contacto', l: ['hola@swmujeres.co', 'Instagram', 'WhatsApp', 'Medellín, CO'] },
        ].map((c) => (
          <div key={c.t}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-on-dark-2)', marginBottom: 18 }}>{c.t}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {c.l.map((x) => <li key={x} style={{ fontSize: 13, color: 'var(--fg-on-dark)' }}>{x}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{
        paddingTop: 24, borderTop: '1px solid rgba(247,239,233,0.12)',
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-on-dark-3)',
      }}>
        <span>© 2026 SW Mujeres · Medellín</span>
        <span>Confianza verificada</span>
      </div>
    </footer>
  )
}

/* ── Landing page ───────────────────────────────────────────────── */
export default async function LandingPage() {
  const profiles = await profilesService.findAll()
  const previewProfiles = profiles.slice(0, 4)
  const heroImageProfiles = profiles.filter((profile) => profile.directory_image_path).slice(0, 3)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--font-body)' }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div style={{
        background:
          'radial-gradient(circle at 72% 28%, rgba(130,22,65,0.38), transparent 36%), radial-gradient(circle at 28% 8%, rgba(230,182,198,0.10), transparent 30%), var(--bg-dark)',
      }}>
        <SiteHeader dark />
        <section style={{ padding: '52px 64px 86px', color: 'var(--fg-on-dark)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 70, alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontStyle: 'normal', fontWeight: 500,
                fontSize: 58, lineHeight: 1.02, letterSpacing: '-0.025em',
                margin: 0, color: 'var(--sw-cream)',
                textShadow: '0 1px 0 rgba(247,239,233,0.18)',
              }}>
                Directorio de<br />negocios liderados<br />por <span style={{
                  position: 'relative',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: 'var(--sw-rose-pale)',
                }}>mujeres</span>.
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.55, color: 'rgba(247,239,233,0.84)', maxWidth: 380, margin: '22px 0 0' }}>
                Descubre, conecta y apoya negocios creados por mujeres en Medellín.
              </p>

              {/* Search pill */}
              <form method="get" action="/directorio" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 7px 7px 18px',
                background: 'var(--sw-cream)', borderRadius: 999, maxWidth: 380, marginTop: 30,
                boxShadow: '0 14px 34px rgba(20,5,13,0.22)',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8E6571" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input name="q" placeholder="Buscar negocio, categoría o palabra clave…" style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 12, color: 'var(--fg)',
                }} />
                <button type="submit" style={{
                  width: 38, height: 38, borderRadius: 999, background: 'var(--sw-rose-pale)',
                  border: 'none', color: 'var(--accent)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24 }}>
                <div style={{ display: 'flex' }}>
                  {['#F7EFE9', '#C7A89C', '#E6B6C6', '#A98072', '#E7B1A5', '#8E6B5F'].map((c, i) => (
                    <div key={i} style={{
                      width: 26, height: 26, borderRadius: '50%', marginLeft: i ? -8 : 0,
                      border: '2px solid var(--bg-dark)', background: c,
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(247,239,233,0.78)' }}>+250 negocios activos</span>
              </div>
            </div>

            {/* Hero image grid */}
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.24fr 0.9fr', gridTemplateRows: '1.08fr 1fr', gap: 10, height: 420 }}>
              <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg,#D8C1B5,#6B2A45)', borderRadius: 18, boxShadow: '0 20px 45px rgba(20,5,13,0.24)' }}>
                {heroImageProfiles[0]?.directory_image_path && (
                  <Image src={heroImageProfiles[0].directory_image_path} alt={heroImageProfiles[0].business_name} fill sizes="(max-width: 768px) 100vw, 34vw" style={{ objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg,#B99386,#5F1F3C)', borderRadius: 18 }}>
                {heroImageProfiles[1]?.directory_image_path && (
                  <Image src={heroImageProfiles[1].directory_image_path} alt={heroImageProfiles[1].business_name} fill sizes="(max-width: 768px) 100vw, 22vw" style={{ objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg,#C7A89C,#391125)', borderRadius: 18 }}>
                {heroImageProfiles[2]?.directory_image_path && (
                  <Image src={heroImageProfiles[2].directory_image_path} alt={heroImageProfiles[2].business_name} fill sizes="(max-width: 768px) 100vw, 34vw" style={{ objectFit: 'cover' }} />
                )}
              </div>
              <div style={{
                position: 'relative', overflow: 'hidden',
                background: 'radial-gradient(circle at 35% 25%, rgba(230,182,198,0.45), transparent 32%), linear-gradient(145deg,#9B4968,#4A1830)',
                borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Image src="/logo-symbol-minimal.svg" width={104} height={104} alt="SW" style={{ filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
                <span style={{ position: 'absolute', top: '33%', right: '38%', color: 'var(--sw-cream)', fontSize: 18, lineHeight: 1 }}>+</span>
              </div>
              <div style={{
                position: 'absolute', left: '43%', top: '45%', transform: 'translate(-50%, -50%)',
                width: 104, height: 104, borderRadius: '50%',
                background: 'rgba(57,17,37,0.62)', border: '1px solid rgba(247,239,233,0.38)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 14px 34px rgba(20,5,13,0.25)', backdropFilter: 'blur(2px)',
              }}>
                <Image src="/logo-symbol-circle-dark.svg" width={92} height={92} alt="SW Mujeres" style={{ filter: 'brightness(0) invert(1)', opacity: 0.92 }} />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-alt)', padding: '56px 64px', borderBottom: '1px solid var(--sw-line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 36 }}>
          {[
            { n: '13.500', l: 'Mujeres en la comunidad' },
            { n: '6 años', l: 'Construyendo confianza' },
            { n: '75%', l: 'En Medellín metropolitana' },
            { n: profiles.length > 0 ? `${profiles.length}` : '—', l: 'Negocios verificados' },
          ].map((m) => (
            <div key={m.l}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 48, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.01em' }}>{m.n}</div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', color: 'var(--fg-2)', textTransform: 'uppercase', marginTop: 14 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quiénes somos ────────────────────────────────────────── */}
      <section style={{ padding: '100px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'center' }}>
          <div>
            <span className="sw-eyebrow">Quiénes somos</span>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400,
              fontSize: 44, lineHeight: 1.1, margin: '16px 0 22px', letterSpacing: '-0.01em',
            }}>
              Aquí encuentras<br />negocios <span style={{ color: 'var(--accent)' }}>verificados.</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--fg-2)', maxWidth: 480 }}>
              Cada perfil pasa por una revisión manual — una por una. Rechazamos el 46% de las solicitudes. Por eso lo que ves, importa.
            </p>
            <div style={{ marginTop: 28 }}>
              <span style={{ width: 60, height: 1, background: 'var(--accent)', display: 'inline-block' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { icon: '🛡️', t: 'Verificación manual', d: 'Cada negocio revisado, una por una.' },
              { icon: '❤️', t: 'Hecho por mujeres', d: 'Comunidad de 13.500 emprendedoras.' },
              { icon: '📍', t: 'Apoya local', d: 'Fortalecemos el talento de Medellín.' },
              { icon: '🤝', t: 'Sin intermediarios', d: 'Conectas directo con la empresaria.' },
            ].map((i) => (
              <div key={i.t} style={{ background: 'var(--sw-paper)', border: '1px solid var(--sw-line)', borderRadius: 10, padding: 24 }}>
                <div style={{ fontSize: 22 }}>{i.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginTop: 12 }}>{i.t}</div>
                <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55, marginTop: 6 }}>{i.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preview directorio ───────────────────────────────────── */}
      <section style={{ padding: '0 64px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <span className="sw-eyebrow">Negocios destacados</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: 38, margin: '10px 0 0', letterSpacing: '-0.005em' }}>
              Recién verificados
            </h2>
          </div>
          <Link href="/directorio" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>
            Ver todo el directorio →
          </Link>
        </div>

        {previewProfiles.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
            {previewProfiles.map((profile, idx) => (
              <PreviewCard key={profile.id} profile={profile} idx={idx} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--fg-3)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24 }}>El directorio se está armando.</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Pronto habrá emprendimientos aquí.</p>
          </div>
        )}
      </section>

      {/* ── Para empresarias ─────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-dark)', color: 'var(--fg-on-dark)', padding: '100px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <span className="sw-eyebrow" style={{ color: 'var(--accent-soft)' }}>Para empresarias</span>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400,
              fontSize: 52, lineHeight: 1.05, margin: '16px 0 22px', letterSpacing: '-0.01em',
              color: 'var(--sw-cream)',
            }}>
              ¿Tienes un negocio?<br />
              <span style={{ color: 'var(--sw-rose-pale)' }}>Inscríbelo aquí.</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--fg-on-dark-2)', maxWidth: 460 }}>
              90 días gratis. Datos reales. Después, decidimos juntas. Proceso manual de 5 días hábiles.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <Link href="/inscripcion" style={{
                padding: '13px 26px', borderRadius: 6,
                background: 'var(--accent)', color: 'var(--sw-cream)', border: 'none',
                fontSize: 13, fontWeight: 500, letterSpacing: '0.04em',
                boxShadow: '0 1px 2px rgba(57,17,37,0.20)',
              }}>
                Inscribir mi negocio →
              </Link>
              <Link href="/directorio" style={{
                padding: '13px 26px', borderRadius: 6, background: 'transparent',
                color: 'var(--fg-on-dark)', border: '1px solid rgba(247,239,233,0.4)',
                fontSize: 13, fontWeight: 500,
              }}>
                Ver el directorio
              </Link>
            </div>
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { n: '01', t: 'Cuéntanos sobre ti', d: 'Datos personales, cédula, Facebook.' },
              { n: '02', t: 'Cuéntanos sobre tu negocio', d: 'Nombre, descripción, categoría, redes.' },
              { n: '03', t: 'Confirmamos en 5 días', d: 'Revisamos manualmente. Te avisamos.' },
            ].map((s) => (
              <li key={s.n} style={{ display: 'flex', gap: 22, padding: '20px 0', borderTop: '1px solid rgba(247,239,233,0.12)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32, color: 'var(--accent-soft)', minWidth: 60 }}>{s.n}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--sw-cream)' }}>{s.t}</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-on-dark-2)', marginTop: 4 }}>{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
