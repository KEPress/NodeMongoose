module.exports = (request, response, next) => {
    if (!request.session.isOnline) return response.redirect('/login')
    next()
}