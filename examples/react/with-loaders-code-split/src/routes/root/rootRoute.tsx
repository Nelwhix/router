import { lazyRouteComponent, RouterContext } from '@tanstack/react-router'
import { loaderClient } from '../../loaderClient'
import { Root } from './Root'

const routerContext = new RouterContext<{
  loaderClient: typeof loaderClient
}>()

export const rootRoute = routerContext.createRootRoute({
  component: Root,
})
