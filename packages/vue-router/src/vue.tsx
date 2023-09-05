import { inject, InjectionKey, ref, h, DefineComponent, ComponentOptionsMixin, ExtractPropTypes } from 'vue'
import warning from 'tiny-warning'
import invariant from 'tiny-invariant'
import { useStore } from '@tanstack/react-store'
import {
    functionalUpdate,
    last,
    pick,
    MatchRouteOptions,
    RegisteredRouter,
    RouterOptions,
    Router,
    RouteMatch,
    RouteByPath,
    AnyRoute,
    AnyRouteProps,
    LinkOptions,
    ToOptions,
    ResolveRelativePath,
    NavigateOptions,
    ResolveFullPath,
    ResolveId,
    AnySearchSchema,
    ParsePathParams,
    MergeParamsFromParent,
    RouteContext,
    AnyContext,
    UseLoaderResult,
    ResolveFullSearchSchema,
    Route,
    RouteConstraints,
    RoutePaths,
    RoutesById,
    RouteIds,
    RouteById,
    ParseRoute,
    AllParams,
    rootRouteId,
    AnyPathParams,
  } from '@tanstack/router-core'


declare module '@tanstack/router-core' {
    interface RegisterRouteComponent{
        RouteComponent: DefineComponent
    }
  
    interface RegisterErrorRouteComponent<
      TFullSearchSchema extends AnySearchSchema = AnySearchSchema,
      TAllParams extends AnyPathParams = AnyPathParams,
      TRouteContext extends AnyContext = AnyContext,
      TAllContext extends AnyContext = AnyContext,
    > {
      ErrorRouteComponent: RouteComponent<
        ErrorRouteProps<TFullSearchSchema, TAllParams, TRouteContext, TAllContext>
      >
    }
  
    interface RegisterPendingRouteComponent<
      TFullSearchSchema extends AnySearchSchema = AnySearchSchema,
      TAllParams extends AnyPathParams = AnyPathParams,
      TRouteContext extends AnyContext = AnyContext,
      TAllContext extends AnyContext = AnyContext,
    > {
      PendingRouteComponent: RouteComponent<
        PendingRouteProps<
          TFullSearchSchema,
          TAllParams,
          TRouteContext,
          TAllContext
        >
      >
    }
  
    interface Route<
      TParentRoute extends RouteConstraints['TParentRoute'] = AnyRoute,
      TPath extends RouteConstraints['TPath'] = '/',
      TFullPath extends RouteConstraints['TFullPath'] = ResolveFullPath<
        TParentRoute,
        TPath
      >,
      TCustomId extends RouteConstraints['TCustomId'] = string,
      TId extends RouteConstraints['TId'] = ResolveId<
        TParentRoute,
        TCustomId,
        TPath
      >,
      TLoader = unknown,
      TSearchSchema extends RouteConstraints['TSearchSchema'] = {},
      TFullSearchSchema extends RouteConstraints['TFullSearchSchema'] = ResolveFullSearchSchema<
        TParentRoute,
        TSearchSchema
      >,
      TParams extends RouteConstraints['TParams'] = Record<
        ParsePathParams<TPath>,
        string
      >,
      TAllParams extends RouteConstraints['TAllParams'] = MergeParamsFromParent<
        TParentRoute['types']['allParams'],
        TParams
      >,
      TParentContext extends RouteConstraints['TParentContext'] = TParentRoute['types']['routeContext'],
      TAllParentContext extends RouteConstraints['TAllParentContext'] = TParentRoute['types']['context'],
      TRouteContext extends RouteConstraints['TRouteContext'] = RouteContext,
      TAllContext extends RouteConstraints['TAllContext'] = MergeParamsFromParent<
        TParentRoute['types']['context'],
        TRouteContext
      >,
      TRouterContext extends RouteConstraints['TRouterContext'] = AnyContext,
      TChildren extends RouteConstraints['TChildren'] = unknown,
      TRouteTree extends RouteConstraints['TRouteTree'] = AnyRoute,
    > {
      useMatch: <TSelected = TAllContext>(opts?: {
        select?: (search: TAllContext) => TSelected
      }) => TSelected
      useLoader: <TSelected = TLoader>(opts?: {
        select?: (search: TLoader) => TSelected
      }) => UseLoaderResult<TSelected>
      useContext: <TSelected = TAllContext>(opts?: {
        select?: (search: TAllContext) => TSelected
      }) => TSelected
      useRouteContext: <TSelected = TRouteContext>(opts?: {
        select?: (search: TRouteContext) => TSelected
      }) => TSelected
      useSearch: <TSelected = TFullSearchSchema>(opts?: {
        select?: (search: TFullSearchSchema) => TSelected
      }) => TSelected
      useParams: <TSelected = TAllParams>(opts?: {
        select?: (search: TAllParams) => TSelected
      }) => TSelected
    }
  
    interface RegisterRouteProps<
      TLoader = unknown,
      TFullSearchSchema extends AnySearchSchema = AnySearchSchema,
      TAllParams extends AnyPathParams = AnyPathParams,
      TRouteContext extends AnyContext = AnyContext,
      TAllContext extends AnyContext = AnyContext,
    > {
      RouteProps: RouteProps<
        TLoader,
        TFullSearchSchema,
        TAllParams,
        TRouteContext,
        TAllContext
      >
    }
  
    interface RegisterPendingRouteProps<
      TFullSearchSchema extends AnySearchSchema = AnySearchSchema,
      TAllParams extends AnyPathParams = AnyPathParams,
      TRouteContext extends AnyContext = AnyContext,
      TAllContext extends AnyContext = AnyContext,
    > {
      PendingRouteProps: PendingRouteProps<
        TFullSearchSchema,
        TAllParams,
        TRouteContext,
        TAllContext
      >
    }
  
    interface RegisterErrorRouteProps<
      TFullSearchSchema extends AnySearchSchema = AnySearchSchema,
      TAllParams extends AnyPathParams = AnyPathParams,
      TRouteContext extends AnyContext = AnyContext,
      TAllContext extends AnyContext = AnyContext,
    > {
      ErrorRouteProps: ErrorRouteProps
    }
  }

  export type ErrorRouteProps<
  TFullSearchSchema extends AnySearchSchema = AnySearchSchema,
  TAllParams extends AnyPathParams = AnyPathParams,
  TRouteContext extends AnyContext = AnyContext,
  TAllContext extends AnyContext = AnyContext,
> = {
  error: unknown
  info: { componentStack: string }
} & Omit<
  RouteProps<
    unknown,
    TFullSearchSchema,
    TAllParams,
    TRouteContext,
    TAllContext
  >,
  'useLoader'
>

export type PendingRouteProps<
  TFullSearchSchema extends AnySearchSchema = AnySearchSchema,
  TAllParams extends AnyPathParams = AnyPathParams,
  TRouteContext extends AnyContext = AnyContext,
  TAllContext extends AnyContext = AnyContext,
> = Omit<
  RouteProps<
    unknown,
    TFullSearchSchema,
    TAllParams,
    TRouteContext,
    TAllContext
  >,
  'useLoader'
>

export type RouteComponent<TProps> = AsyncRouteComponent<TProps>

export type AsyncRouteComponent<TProps> = SyncRouteComponent<TProps> & {
    preload?: () => Promise<void>
  }

  export type SyncRouteComponent<TProps> =
  | ((props: TProps) => HTMLElement)

export const RouterProvider = Symbol() as InjectionKey<RegisteredRouter>
export const testing = "Nelson is a nice guy"
const matchIdsContext = Symbol() as InjectionKey<string[]>

export function useRouter(): RegisteredRouter {
    const value = inject(RouterProvider)!

    warning(value, 'useRouter must be used inside a <Router> component!')
    return value
}

export type RouteProps<
  TLoader = unknown,
  TFullSearchSchema extends AnySearchSchema = AnySearchSchema,
  TAllParams extends AnyPathParams = AnyPathParams,
  TRouteContext extends AnyContext = AnyContext,
  TAllContext extends AnyContext = AnyContext,
> = {
  useLoader: <TSelected = TLoader>(opts?: {
    select?: (search: TLoader) => TSelected
  }) => UseLoaderResult<TSelected>
  useMatch: <TSelected = TAllContext>(opts?: {
    select?: (search: TAllContext) => TSelected
  }) => TSelected
  useContext: <TSelected = TAllContext>(opts?: {
    select?: (search: TAllContext) => TSelected
  }) => TSelected
  useRouteContext: <TSelected = TRouteContext>(opts?: {
    select?: (search: TRouteContext) => TSelected
  }) => TSelected
  useSearch: <TSelected = TFullSearchSchema>(opts?: {
    select?: (search: TFullSearchSchema) => TSelected
  }) => TSelected
  useParams: <TSelected = TAllParams>(opts?: {
    select?: (search: TAllParams) => TSelected
  }) => TSelected
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
    return useStore(router.__store, opts?.select as any)
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
        useMatch: route.useMatch as any,
        useContext: route.useContext as any,
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