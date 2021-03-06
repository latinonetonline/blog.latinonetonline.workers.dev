/**
 * Helper functions that when passed a request will return a
 * boolean indicating if the request uses that HTTP method,
 * header, host or referrer.
 */
const Method = method => req =>
    req.method.toLowerCase() === method.toLowerCase()
const Connect = Method('connect')
const Delete = Method('delete')
const Get = Method('get')
const Head = Method('head')
const Options = Method('options')
const Patch = Method('patch')
const Post = Method('post')
const Put = Method('put')
const Trace = Method('trace')

const Header = (header, val) => req => req.headers.get(header) === val
const Host = host => Header('host', host.toLowerCase())
const Referrer = host => Header('referrer', host.toLowerCase())

const Path = regExp => req => {
    const url = new URL(req.url)
    const path = url.pathname
    const match = path.match(regExp) || []
    return match[0] === path
}

// We support the GET, POST, HEAD, and OPTIONS methods from any origin,
// and accept the Content-Type header on requests. These headers must be
// present on all responses to all CORS requests. In practice, this means
// all responses to OPTIONS or POST requests.
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


/**
 * The Router handles determines which handler is matched given the
 * conditions present for each request.
 */
class Router {
    constructor() {
        this.routes = []
    }

    handle(conditions, handler) {
        this.routes.push({
            conditions,
            handler,
        })
        return this
    }

    connect(url, handler) {
        return this.handle([Connect, Path(url)], handler)
    }

    delete(url, handler) {
        return this.handle([Delete, Path(url)], handler)
    }

    get(url, handler) {
        return this.handle([Get, Path(url)], handler)
    }

    head(url, handler) {
        return this.handle([Head, Path(url)], handler)
    }

    options(url, handler) {
        return this.handle([Options, Path(url)], handler)
    }

    patch(url, handler) {
        return this.handle([Patch, Path(url)], handler)
    }

    post(url, handler) {
        return this.handle([Post, Path(url)], handler)
    }

    put(url, handler) {
        return this.handle([Put, Path(url)], handler)
    }

    trace(url, handler) {
        return this.handle([Trace, Path(url)], handler)
    }

    all(handler) {
        return this.handle([], handler)
    }

    route(req) {

        if (req.method === "OPTIONS") {
            return handleOptions(req)
        }

        const route = this.resolve(req)

        if (route) {
            const bodyResponse = route.handler(req)
            const init = {
                headers: { 'content-type': 'application/json', ...corsHeaders },
            }
            const body = JSON.stringify(bodyResponse)
            return new Response(body, init)
        }

        return new Response('resource not found', {
            status: 404,
            statusText: 'not found',
            headers: {
                'content-type': 'text/plain',
            },
        })
    }

    /**
     * resolve returns the matching route for a request that returns
     * true for all conditions (if any).
     */
    resolve(req) {
        return this.routes.find(r => {
            if (!r.conditions || (Array.isArray(r) && !r.conditions.length)) {
                return true
            }

            if (typeof r.conditions === 'function') {
                return r.conditions(req)
            }

            return r.conditions.every(c => c(req))
        })
    }

    handleOptions(request) {
        if (request.headers.get("Origin") !== null &&
            request.headers.get("Access-Control-Request-Method") !== null &&
            request.headers.get("Access-Control-Request-Headers") !== null) {
            // Handle CORS pre-flight request.
            return new Response(null, {
                headers: corsHeaders
            })
        } else {
            // Handle standard OPTIONS request.
            return new Response(null, {
                headers: {
                    "Allow": "GET, HEAD, POST, OPTIONS",
                }
            })
        }
    }
}

module.exports = Router
