const Router = require('./router')
const ArticleController = require("./controllers/articleController")

/**
 * Example of how router can be used in an application
 *  */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const r = new Router()
    const controller = new ArticleController()
    // Replace with the approriate paths and handlers
    r.get('.*/articles', request => controller.getArticles(request))
    r.get('.*/countArticles', request => controller.getlength(request))
    r.get('.*/articles/getBySlug', request => controller.getBySlug(request))

    const resp = await r.route(request)
    return resp
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
