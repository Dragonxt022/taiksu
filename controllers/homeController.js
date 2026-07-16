const profileService = require('../services/profileService');

// Mesmas regras dos seletores da página de perfil do SSO.
const UNIDADE_ROLES = ['Desenvolvedor', 'Franqueadora', 'Recursos Humanos'];
const CARGO_ROLES = ['Desenvolvedor'];
const ACESSO_ROLES = ['Desenvolvedor', 'Franqueadora', 'Franqueado', 'Gerente'];

const getExpressVersion = () => {
  try {
    const pkg = require('express/package.json');
    return pkg.version;
  } catch {
    return 'unknown';
  }
};

async function index(req, res) {
  const cargo = res.locals.userCargo;
  const podeTrocarUnidade = UNIDADE_ROLES.includes(cargo);
  const podeTrocarCargo = CARGO_ROLES.includes(cargo);

  // Carrega as listas em paralelo; se falhar, o campo vira somente leitura.
  const [unidades, cargos] = await Promise.all([
    podeTrocarUnidade ? profileService.getUnidades(req.session).catch(() => null) : null,
    podeTrocarCargo ? profileService.getRoles(req.session).catch(() => null) : null,
  ]);

  res.render('index', {
    title: 'Taiksu - Perfil',
    expressVersion: getExpressVersion(),
    unidades: Array.isArray(unidades) ? unidades : null,
    cargos: Array.isArray(cargos) ? cargos : null,
  });
}

async function editar(req, res) {
  const cargo = res.locals.userCargo;
  const podeTrocarCargo = CARGO_ROLES.includes(cargo);
  const podeGerenciarAcesso = ACESSO_ROLES.includes(cargo);

  // Catálogo de permissões gerenciáveis: se o SSO negar (403) ou falhar,
  // a página cai no modo somente leitura (exibe só as permissões atuais).
  const [permissoes, cargos] = await Promise.all([
    profileService.getPermissions(req.session).catch(() => null),
    podeTrocarCargo ? profileService.getRoles(req.session).catch(() => null) : null,
  ]);

  res.render('editar', {
    title: 'Taiksu - Editar Perfil',
    podeGerenciarAcesso,
    permissoes: Array.isArray(permissoes) ? permissoes : null,
    cargos: Array.isArray(cargos) ? cargos : null,
  });
}

module.exports = { index, editar };
