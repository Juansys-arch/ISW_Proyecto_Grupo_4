import { AppDataSource } from "../config/configDb.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

const userRepository = AppDataSource.getRepository("User");

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function hasRoleAccess(userRole, requiredRole) {
  const currentRole = normalizeRole(userRole);
  const targetRole = normalizeRole(requiredRole);

  if (!currentRole || !targetRole) return false;
  if (currentRole === targetRole) return true;
  if (currentRole === "super_admin" && targetRole === "super_admin") return true;
  if (currentRole === "super_admin" && targetRole === "super_admin") return false;
  return false;
}

export async function isAdmin(req, res, next) {
  try {
    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos"
      );
    }

    if (!hasRoleAccess(userFound.rol, "super_admin")) {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere un rol de administrador(super_admin) para realizar esta acción."
      );
    }
    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function isCoordinator(req, res, next) {
  try {
    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos"
      );
    }

    if (!hasRoleAccess(userFound.rol, "coordinador")) {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere un rol de coordinador para realizar esta acción."
      );
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function isAdminOrCoordinator(req, res, next) {
  try {
    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos"
      );
    }

    const canAccess = hasRoleAccess(userFound.rol, "super_admin") || hasRoleAccess(userFound.rol, "coordinador");

    if (!canAccess) {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere rol de administrador(super_admin) o coordinador para realizar esta acción."
      );
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function isAdminOrCoordinatorOrVolunteer(req, res, next) {
  try {
    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos"
      );
    }

    if (
      !hasRoleAccess(userFound.rol, "super_admin") &&
      !hasRoleAccess(userFound.rol, "coordinador") &&
      !hasRoleAccess(userFound.rol, "voluntario")
    ) {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "No tienes permisos para ver la lista de regiones."
      );
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export function isAuthorized(roles = []) {
  return async (req, res, next) => {
    try {
      const userFound = await userRepository.findOneBy({ email: req.user.email });

      if (!userFound) {
        return handleErrorClient(
          res,
          404,
          "Usuario no encontrado en la base de datos"
        );
      }

      const hasPermission = roles.some((role) => hasRoleAccess(userFound.rol, role));

      if (!hasPermission) {
        return handleErrorClient(
          res,
          403,
          "Error al acceder al recurso",
          "No tienes permisos para realizar esta acción."
        );
      }

      next();
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  };
}

export async function isAdminOrJefeCuadrilla(req, res, next) {
  try {
    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos"
      );
    }

    const canAccess = hasRoleAccess(userFound.rol, "super_admin") || hasRoleAccess(userFound.rol, "jefe_cuadrilla");

    if (!canAccess) {
      return handleErrorClient(
        res,
        403,
        "Acceso denegado",
        "Solo administradores(super_admin) y jefes de cuadrilla pueden realizar esta acción."
      );
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}