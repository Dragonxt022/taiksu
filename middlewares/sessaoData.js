const authService = require('../services/authService');

async function sessaoData(req, res, next) {
    try {
        const userData = await authService.fetchCurrentUser(req.session.token);

        Object.assign(res.locals, authService.mapUserToLocals(userData));
        res.locals.userToken = req.session.token || null;

        next();
    } catch (err) {
        return res.redirect('https://login.taiksu.com.br');
    }
};

module.exports = sessaoData;
