async function sessaoData(req, res, next) {
    res.locals.userFoto = req.session.foto || null;
    res.locals.userNome = req.session.name || null;
    res.locals.userGrupo = req.session.grupo_id || null;
    res.locals.userCidade = req.session.cidade || null;
    res.locals.user_id = req.session.id_user || null;
    res.locals.userToken = req.session.token || null;
    res.locals.unidade_id = req.session.unidade_id || null;
    res.locals.userPin = req.session.pin || null;

    const response = await fetch("https://login.taiksu.com.br/api/user/me", {
      headers: { "Authorization": `Bearer ${req.session.token}`, "Accept": "application/json" }
    });

    if (!response.ok) {
      return res.redirect('https://login.taiksu.com.br');
    }


    next();
};

module.exports = sessaoData;