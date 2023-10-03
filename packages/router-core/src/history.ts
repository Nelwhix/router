// While the public API was clearly inspired by the "history" npm package,
// This implementation attempts to be more lightweight by
// making assumptions about the way TanStack Router works

export interface RouterHistory {
  location: HistoryLocation
  subscribe: (cb: () => void) => () => void
  push: (path: string, state?: any) => void
  replace: (path: string, state?: any) => void
  go: (index: number) => void
  back: () => void
  forward: () => void
  createHref: (href: string) => string
  block: (blockerFn: BlockerFn) => () => void
}

export interface HistoryLocation extends ParsedPath {
  state: HistoryState
}

export interface ParsedPath {
  href: string
  pathname: string
  search: string
  hash: string
}

export interface HistoryState {
  key: string
  __tempLocation?: HistoryLocation
  __tempKey?: string
}

type BlockerFn = (retry: () => void, cancel: () => void) => void

const pushStateEvent = 'pushstate'
const popStateEvent = 'popstate'
const beforeUnloadEvent = 'beforeunload'

const beforeUnloadListener = (event: Event) => {
  event.preventDefault()
  // @ts-ignore
  return (event.returnValue = '')
}

const stopBlocking = () => {
  removeEventListener(beforeUnloadEvent, beforeUnloadListener, {
    capture: true,
  })
}

function createHistory(opts: {
  getLocation: () => HistoryLocation
  subscriber: false | ((onUpdate: () => void) => () => void)
  pushState: (path: string, state: any) => void
  replaceState: (path: string, state: any) => void
  go: (n: number) => void
  back: () => void
  forward: () => void
  createHref: (path: string) => string
}): RouterHistory {
  let location = opts.getLocation()
  let unsub = () => {}
  let subscribers = new Set<() => void>()
  let blockers: BlockerFn[] = []
  let queue: (() => void)[] = []

  const tryFlush = () => {
    if (blockers.length) {
      blockers[0]?.(tryFlush, () => {
        blockers = []
        stopBlocking()
      })
      return
    }

    while (queue.length) {
      queue.shift()?.()
    }

    if (!opts.subscriber) {
      onUpdate()
    }
  }

  const queueTask = (task: () => void) => {
    queue.push(task)
    tryFlush()
  }

  const onUpdate = () => {
    location = opts.getLocation()
    subscribers.forEach((subscriber) => subscriber())
  }

  return {
    get location() {
      return location
    },
    subscribe: (cb: () => void) => {
      if (subscribers.size === 0) {
        unsub =
          typeof opts.subscriber === 'function'
            ? opts.subscriber(onUpdate)
            : () => {}
      }
      subscribers.add(cb)

      return () => {
        subscribers.delete(cb)
        if (subscribers.size === 0) {
          unsub()
        }
      }
    },
    push: (path: string, state: any) => {
      assignKey(state)
      queueTask(() => {
        opts.pushState(path, state)
      })
    },
    replace: (path: string, state: any) => {
      assignKey(state)
      queueTask(() => {
        opts.replaceState(path, state)
      })
    },
    go: (index) => {
      queueTask(() => {
        opts.go(index)
      })
    },
    back: () => {
      queueTask(() => {
        opts.back()
      })
    },
    forward: () => {
      queueTask(() => {
        opts.forward()
      })
    },
    createHref: (str) => opts.createHref(str),
    block: (cb) => {
      blockers.push(cb)

      if (blockers.length === 1) {
        addEventListener(beforeUnloadEvent, beforeUnloadListener, {
          capture: true,
        })
      }

      return () => {
        blockers = blockers.filter((b) => b !== cb)

        if (!blockers.length) {
          stopBlocking()
        }
      }
    },
  }
}

function assignKey(state: HistoryState) {
  state.key = createRandomKey()
  // if (state.__actualLocation) {
  //   state.__actualLocation.state = {
  //     ...state.__actualLocation.state,
  //     key,
  //   }
  // }
}

export function createBrowserHistory(opts?: {
  getHref?: () => string
  createHref?: (path: string) => string
}): RouterHistory {
  const getHref =
    opts?.getHref ??
    (() =>
      `${window.location.pathname}${window.location.search}${window.location.hash}`)

  const createHref = opts?.createHref ?? ((path) => path)

  const getLocation = () => parseLocation(getHref(), window.history.state)

  return createHistory({
    getLocation,
    subscriber: (onUpdate) => {
      window.addEventListener(pushStateEvent, onUpdate)
      window.addEventListener(popStateEvent, onUpdate)

      var pushState = window.history.pushState
      window.history.pushState = function () {
        let res = pushState.apply(history, arguments as any)
        onUpdate()
        return res
      }
      var replaceState = window.history.replaceState
      window.history.replaceState = function () {
        let res = replaceState.apply(history, arguments as any)
        onUpdate()
        return res
      }

      return () => {
        window.history.pushState = pushState
        window.history.replaceState = replaceState
        window.removeEventListener(pushStateEvent, onUpdate)
        window.removeEventListener(popStateEvent, onUpdate)
      }
    },
    pushState: (path, state) => {
      window.history.pushState(state, '', createHref(path))
    },
    replaceState: (path, state) => {
      window.history.replaceState(state, '', createHref(path))
    },
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    go: (n) => window.history.go(n),
    createHref: (path) => createHref(path),
  })
}

export function createHashHistory(): RouterHistory {
  return createBrowserHistory({
    getHref: () => window.location.hash.substring(1),
    createHref: (path) => `#${path}`,
  })
}

export function createMemoryHistory(
  opts: {
    initialEntries: string[]
    initialIndex?: number
  } = {
    initialEntries: ['/'],
  },
): RouterHistory {
  const entries = opts.initialEntries
  let index = opts.initialIndex ?? entries.length - 1
  let currentState = {
    key: createRandomKey(),
  } as HistoryState

  const getLocation = () => parseLocation(entries[index]!, currentState)

  return createHistory({
    getLocation,
    subscriber: false,
    pushState: (path, state) => {
      currentState = state
      entries.push(path)
      index++
    },
    replaceState: (path, state) => {
      currentState = state
      entries[index] = path
    },
    back: () => {
      index--
    },
    forward: () => {
      index = Math.min(index + 1, entries.length - 1)
    },
    go: (n) => window.history.go(n),
    createHref: (path) => path,
  })
}

function parseLocation(href: string, state: HistoryState): HistoryLocation {
  let hashIndex = href.indexOf('#')
  let searchIndex = href.indexOf('?')

  return {
    href,
    pathname: href.substring(
      0,
      hashIndex > 0
        ? searchIndex > 0
          ? Math.min(hashIndex, searchIndex)
          : hashIndex
        : searchIndex > 0
        ? searchIndex
        : href.length,
    ),
    hash: hashIndex > -1 ? href.substring(hashIndex) : '',
    search:
      searchIndex > -1
        ? href.slice(searchIndex, hashIndex === -1 ? undefined : hashIndex)
        : '',
    state: state || {},
  }
}

// Thanks co-pilot!
function createRandomKey() {
  return (Math.random() + 1).toString(36).substring(7)
}
