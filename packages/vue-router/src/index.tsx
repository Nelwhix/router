import { Router } from '@tanstack/router-core'
import { App } from 'vue'
import { routerContextKey, } from './vue'

export * from '@tanstack/router-core'
export * from './vue'

export default {
    install: (app: App, options: Router) => {
        options.mount()
        app.provide(routerContextKey, options)
    }
}