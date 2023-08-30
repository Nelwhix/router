import { inject, InjectionKey, ref, h } from 'vue'
import { RegisteredRouter, pick } from "@tanstack/router-core"
import warning from 'tiny-warning'
import invariant from 'tiny-invariant'
import { useStore } from '@tanstack/react-store'


const matchIdsContext = Symbol() as InjectionKey<string[]>
const routerContext = Symbol() as InjectionKey<RegisteredRouter>

export function useRouter(): RegisteredRouter {
    const value = inject(routerContext)!

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
    const show = ref(process.env.NODE_ENV !== 'production')
  
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
            onClick={() => show.value = !show.value}
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

  export function useRouterState<TSelected = RegisteredRouter['state']>(opts?: {
    select: (state: RegisteredRouter['state']) => TSelected
  }): TSelected {
    const router = useRouter()
    return useStore(router.__store, opts?.select)
  }

  function MatchInner({
    matchId,
    PendingComponent,
  }: {
    matchId: string
    PendingComponent: any
  }): any {
    const router = useRouter()
  
    const match = useRouterState({
      select: (d) => {
        const match = d.matchesById[matchId]
        return pick(match!, ['status', 'loadPromise', 'routeId', 'error'])
      },
    })
  
    const route = router.getRoute(match.routeId)
  
    if (match.status === 'error') {
      throw match.error
    }
  
    if (match.status === 'pending') {
      return h(PendingComponent, {
        useLoader: route.useLoader,
        useMatch: route.useMatch,
        useContext: route.useContext,
        useRouteContext: route.useRouteContext,
        useSearch: route.useSearch,
        useParams: route.useParams,
      })
    }
  
    if (match.status === 'success') {
      let comp = route.options.component ?? router.options.defaultComponent
  
      if (comp) {
        return h(comp, {
          useLoader: route.useLoader,
          useMatch: route.useMatch,
          useContext: route.useContext as any,
          useRouteContext: route.useRouteContext as any,
          useSearch: route.useSearch,
          useParams: route.useParams as any,
        } as any)
      }
  
      return <Outlet />
    }
  
    invariant(
      false,
      'Idle routeMatch status encountered during rendering! You should never see this. File an issue!',
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
  
    return (
        <MatchInner matchId={matchId} PendingComponent={PendingComponent} />
    )
  }