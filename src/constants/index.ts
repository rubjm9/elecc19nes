// Base de datos inicial
export const initialDb = {
  admins: {},
  sessions: {},
  votes: {}
};

// Estados de elección
export const ELECTION_STATUSES = {
  PREVISTA: 'Prevista',
  ABIERTA: 'Abierta',
  CERRADA: 'Cerrada'
} as const;

// Estados de miembro
export const MEMBER_STATUSES = {
  INVITADO: 'Invitado',
  PRESENTE: 'Presente'
} as const;

// Roles de administrador
export const ADMIN_ROLES = {
  MANAGER: 'manager',
  SUPERADMIN: 'superadmin'
} as const;

// Configuración de la aplicación
export const APP_CONFIG = {
  VOTER_KEY_LENGTH: 5,
  DEFAULT_ELECTION_POSITIONS: 1,
  MAX_SESSION_NAME_LENGTH: 100,
  MAX_MEMBER_NAME_LENGTH: 50
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  INVALID_VOTER_KEY: 'Clave de acceso no válida.',
  NOT_ACCREDITED: 'Aún no has sido acreditado. Acércate al punto de registro.',
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos.',
  SESSION_CREATION_ERROR: 'Error al crear la sesión',
  ELECTION_CREATION_ERROR: 'Error al crear la elección',
  VOTE_ERROR: 'Error al emitir el voto',
  ADMIN_CREATION_ERROR: 'Error al crear administrador',
  ADMIN_DELETION_ERROR: 'Error al eliminar administrador',
  MEMBER_ACCREDITATION_ERROR: 'Error al acreditar al miembro',
  ELIGIBILITY_UPDATE_ERROR: 'Error al actualizar la elegibilidad',
  ELECTION_STATUS_UPDATE_ERROR: 'Error al actualizar el estado de la elección'
} as const;

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  SESSION_CREATED: 'Sesión creada exitosamente',
  ELECTION_CREATED: 'Elección creada exitosamente',
  VOTE_CAST: 'Voto emitido exitosamente',
  ADMIN_CREATED: 'Administrador creado exitosamente',
  ADMIN_DELETED: 'Administrador eliminado exitosamente',
  MEMBER_ACCREDITED: 'Miembro acreditado exitosamente',
  ELIGIBILITY_UPDATED: 'Elegibilidad actualizada exitosamente',
  ELECTION_STATUS_UPDATED: 'Estado de elección actualizado exitosamente'
} as const;
