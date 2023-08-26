import { inject, InjectionKey, ref } from 'vue'
import { RegisteredRouter } from "@tanstack/router-core"
import warning from 'tiny-warning'

const matchIdsContext = Symbol() as InjectionKey<string[]>
const routerContext = Symbol() as InjectionKey<RegisteredRouter>

export function useRouter(): RegisteredRouter {
    const value = inject(routerContext)

    warning(value, 'useRouter must be used inside a <Router> component!')
    return value
  }

export function Outlet() {
    const matchIds = inject(matchIdsContext)!.slice(1)

    if (!matchIds[0]) {
        return null
    }

  return <Match matchIds={matchIds} />
}

const defaultPending = () => null

export function ErrorComponent({ error }: { error: any }) {
    const [show, setShow] = ref(process.env.NODE_ENV !== 'production')
  
    return (
      <div style={{ padding: '.5rem', maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <strong style={{ fontSize: '1rem' }}>Something went wrong!</strong>
          <button
            style={{
              appearance: 'none',
              fontSize: '.6em',
              border: '1px solid currentColor',
              padding: '.1rem .2rem',
              fontWeight: 'bold',
              borderRadius: '.25rem',
            }}
            onClick={() => setShow((d) => !d)}
          >
            {show ? 'Hide Error' : 'Show Error'}
          </button>
        </div>
        <div style={{ height: '.25rem' }} />
        {show ? (
          <div>
            <pre
              style={{
                fontSize: '.7em',
                border: '1px solid red',
                borderRadius: '.25rem',
                padding: '.3rem',
                color: 'red',
                overflow: 'auto',
              }}
            >
              {error.message ? <code>{error.message}</code> : null}
            </pre>
          </div>
        ) : null}
      </div>
    )
  }

function Match({ matchIds }: { matchIds: string[] }) {
    const router = useRouter()
    const matchId = matchIds[0]!
    const routeId = router.getRouteMatch(matchId)!.routeId
    const route = router.getRoute(routeId)
  
    const PendingComponent = (route.options.pendingComponent ??
      router.options.defaultPendingComponent ??
      defaultPending) as any
  
    const errorComponent =
      route.options.errorComponent ??
      router.options.defaultErrorComponent ??
      ErrorComponent
  
    const ResolvedSuspenseBoundary =
      route.options.wrapInSuspense ?? !route.isRoot
        ? React.Suspense
        : SafeFragment
  
    const ResolvedCatchBoundary = !!errorComponent ? CatchBoundary : SafeFragment
  
    return (
      <matchIdsContext.Provider value={matchIds}>
        <ResolvedSuspenseBoundary
          fallback={React.createElement(PendingComponent, {
            useMatch: route.useMatch,
            useContext: route.useContext,
            useRouteContext: route.useRouteContext,
            useSearch: route.useSearch,
            useParams: route.useParams,
          })}
        >
          <ResolvedCatchBoundary
            key={route.id}
            errorComponent={errorComponent}
            route={route}
            onCatch={() => {
              warning(false, `Error in route match: ${matchId}`)
            }}
          >
            <MatchInner matchId={matchId} PendingComponent={PendingComponent} />
          </ResolvedCatchBoundary>
        </ResolvedSuspenseBoundary>
      </matchIdsContext.Provider>
    )
  }