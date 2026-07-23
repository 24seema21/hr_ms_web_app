import { Container } from '@/shared/components/layout/Container'
import { ButtonLink } from '@/shared/components/ui/ButtonLink'
import { ROUTES } from '@/shared/constants/routes'

const STATS = [
  { id: 'teams', value: '1,200+', label: 'teams onboarded' },
  { id: 'accuracy', value: '99.9%', label: 'payroll accuracy' },
  { id: 'setup', value: '15 min', label: 'to first payslip' },
] as const

export function Hero() {
  return (
    <section className="bg-linear-to-b from-brand-50 to-white py-20 sm:py-28">
      <Container>
        {/*
          The one and only <h1> on this page. A page with several <h1>s (or
          none) leaves screen-reader users without a reliable "what is this
          page?" anchor, and search engines guessing.
        */}
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold tracking-wide text-brand-700 uppercase">
            HR, payroll & people ops
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-balance text-ink-900 sm:text-5xl lg:text-6xl">
            Run your whole HR team from one place
          </h1>

          <p className="mt-6 text-lg text-pretty text-ink-600">
            HarkHR replaces the spreadsheets, the email approvals and the
            end-of-month payroll scramble with a single system your people
            actually enjoy using.
          </p>

          {/*
            `flex-col` first, `sm:flex-row` after — mobile-first. We describe
            the small screen as the default and only add complexity as the
            viewport grows, which is why nothing overflows at 375px.
          */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to={ROUTES.LOGIN} size="lg">
              Sign in to your workspace
            </ButtonLink>
            <ButtonLink to="#features" variant="secondary" size="lg">
              Explore the modules
            </ButtonLink>
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-1 gap-8 border-t border-ink-200 pt-10 sm:grid-cols-3">
          {STATS.map((stat) => (
            /*
              <dl>/<dt>/<dd> is a description list: each value is genuinely
              *described by* its label, and the markup says so.
            */
            <div key={stat.id}>
              <dt className="order-2 text-sm text-ink-500">{stat.label}</dt>
              <dd className="text-3xl font-semibold text-ink-900">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
