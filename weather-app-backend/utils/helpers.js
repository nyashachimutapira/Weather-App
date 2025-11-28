function success(res, data, message = 'OK') {
  return res.json({ message, data });
}

function fail(res, message = 'Error', status = 400) {
  return res.status(status).json({ message });
}

module.exports = { success, fail };
