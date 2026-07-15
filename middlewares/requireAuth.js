// Exige sessão autenticada para rotas de API; responde JSON no formato de erro padrão.
function requireAuth(req, res, next) {
    if (!req.session || !req.session.token) {
        return res.status(401).json({
            error: {
                code: 'UNAUTHENTICATED',
                message: 'Sessão expirada ou usuário não autenticado.',
            },
        });
    }
    next();
}

module.exports = requireAuth;
