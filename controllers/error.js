exports.getErrorPage = (request, response, next) => {
    response.status(404).render('error', { 
        pageTitle: 'Error Page', 
        path:' ', 
       
    })
}