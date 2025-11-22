const { PERMISSIONS, USER_ROLES } = require('../config/constants');

const authorize = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.userRole || USER_ROLES.USER;
    const rolePermissions = PERMISSIONS[userRole];

    if (!rolePermissions || !rolePermissions[requiredPermission]) {
      return res.status(403).json({
        message: 'Insufficient permissions to perform this action',
        requiredRole: userRole,
      });
    }

    next();
  };
};

const requireRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.userRole || USER_ROLES.USER;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: 'Insufficient permissions - required role not found',
        requiredRoles: roles,
        userRole,
      });
    }

    next();
  };
};

module.exports = { authorize, requireRole };
