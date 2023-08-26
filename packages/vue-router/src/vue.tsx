import { inject, InjectionKey } from 'vue'

const matchIdsContext = Symbol() as InjectionKey<string[]>

export function Outlet() {
    const matchIds = inject(matchIdsContext)!.slice(1)

    if (!matchIds[0]) {
        return null
    }

  return <Match matchIds={matchIds} />
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