const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const userService = require('../services/userService');

/** GET /api/users — admin: list all users. */
const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  return success(res, { message: 'Users fetched', data: { users } });
});

/** PUT /api/users/:id — admin: update a user's details/status. */
const updateUser = asyncHandler(async (req, res) => {
  const { name, phone, roleId, status } = req.body;
  const user = await userService.updateUser(req.params.id, { name, phone, roleId, status });
  return success(res, { message: 'User updated', data: { user } });
});

/** DELETE /api/users/:id — admin: remove a user. */
const deleteUser = asyncHandler(async (req, res) => {
  // Don't let an admin delete their own account from here.
  if (String(req.user.id) === String(req.params.id)) {
    return error(res, { statusCode: 400, message: 'You cannot delete your own account' });
  }
  await userService.deleteUser(req.params.id);
  return success(res, { message: 'User deleted' });
});

module.exports = { getUsers, updateUser, deleteUser };
